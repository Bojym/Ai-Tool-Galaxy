import OpenAI from 'openai';
import * as cheerio from 'cheerio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be a server-side API
});

export interface ExtractedProductData {
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  pricing: string;
  logoUrl?: string;
  tags: string[];
}

export async function extractProductDataFromUrl(url: string): Promise<ExtractedProductData> {
  try {
        // Step 1: Fetch webpage content using CORS proxy (try multiple proxies)
    let html = '';
    
    const corsProxies = [
      {
        name: 'allorigins.win',
        url: (targetUrl: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
        extractHtml: (data: any) => data.contents
      },
      {
        name: 'thingproxy.freeboard.io',
        url: (targetUrl: string) => `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(targetUrl)}`,
        extractHtml: (data: any) => data
      },
      {
        name: 'proxy.cors.sh',
        url: (targetUrl: string) => `https://proxy.cors.sh/${targetUrl}`,
        extractHtml: (data: any) => data
      }
    ];
    
    for (const proxy of corsProxies) {
      try {
        console.log(`Trying CORS proxy: ${proxy.name}`);
        const proxyUrl = proxy.url(url);
        
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          console.log(`Proxy ${proxy.name} failed with status: ${response.status}`);
          continue;
        }
        
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
          html = proxy.extractHtml(data);
        } else {
          html = await response.text();
        }
        
        // Check if we got actual content (not an error page)
        if (html && html.length > 1000 && !html.includes('JavaScript and Cookies Enablement')) {
          console.log(`Success with proxy: ${proxy.name}`);
          break;
        } else {
          console.log(`Proxy ${proxy.name} returned suspicious content, trying next...`);
          html = '';
        }
      } catch (error) {
        console.log(`Proxy ${proxy.name} failed:`, error);
        continue;
      }
    }
    
    // Fallback: Try direct fetch (might work for some sites)
    if (!html) {
      try {
        console.log('All proxies failed, trying direct fetch...');
        const directResponse = await fetch(url);
        if (directResponse.ok) {
          html = await directResponse.text();
          console.log('Direct fetch succeeded!');
        }
      } catch (error) {
        console.log('Direct fetch also failed:', error);
      }
    }
    
    console.log('HTML content length:', html?.length || 0);
    console.log('HTML preview:', html?.substring(0, 200) || 'No HTML content');
    
    if (!html) {
      throw new Error('All CORS proxies and direct fetch failed. The website may be blocking proxy access or requires JavaScript. Try a simpler website like a blog or documentation site.');
    }
    
    if (html.length < 100) {
      console.warn('Very short HTML content received, may indicate CORS proxy issues');
    }
    
    // Additional check for error pages and JavaScript-required sites
    if (html.includes('JavaScript and Cookies Enablement') || 
        html.includes('Enable JavaScript and cookies to continue') ||
        html.includes('JavaScript is required') ||
        html.includes('Please enable JavaScript') ||
        html.includes('Access Denied') || 
        html.includes('403 Forbidden') ||
        html.includes('Rate Limited')) {
      throw new Error('This website requires JavaScript or is blocking access. CORS proxies cannot extract content from Single Page Applications (SPAs) like ChatGPT. Try a simpler website like GitHub, Stack Overflow, or a blog.');
    }
    
    // Step 2: Parse HTML and extract text content
    const $ = cheerio.load(html);
    
    // Remove script and style elements
    $('script, style, nav, footer, header').remove();
    
    // Extract main content
    const title = $('title').text() || $('h1').first().text();
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || '';
    
    // Get main text content from multiple sources
    const mainContent = $('main, .main, #main, [role="main"]').text();
    const headings = $('h1, h2, h3').map((_, el) => $(el).text()).get().join(' ');
    const paragraphs = $('p').map((_, el) => $(el).text()).get().slice(0, 10).join(' ');
    
    // Combine all text sources
    const bodyText = (mainContent || $('body').text())
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 4000);
    
    // Debug: Log the content being extracted
    console.log('Title extracted:', title);
    console.log('Description extracted:', description);
    console.log('Body text length:', bodyText.length);
    console.log('Body text preview:', bodyText.substring(0, 500));
    
    // Try to find logo
    const logoUrl = $('meta[property="og:image"]').attr('content') || 
                   $('link[rel="icon"]').attr('href') || 
                   $('img[alt*="logo" i]').first().attr('src') || '';

    // Step 3: Use OpenAI to extract structured data
    const prompt = `
You are a product data extraction expert. Extract key information from this website content and return ONLY a valid JSON object.

REQUIRED FORMAT (return exactly this structure):
{
  "name": "Product name from title/heading",
  "description": "Clear 2-3 sentence description of what this product/service does",
  "features": ["main feature 1", "main feature 2", "main feature 3"],
  "useCases": ["who would use this", "what problem it solves"],
  "pricing": "Free" | "Freemium" | "Paid" | "Contact Us",
  "tags": ["category", "type", "relevant keywords"]
}

INSTRUCTIONS:
- Extract the actual product name from the title or main heading
- Write a clear description of what the product does
- List 3-5 main features or capabilities
- Identify 2-3 use cases or target audiences
- Determine pricing model from content
- Add 3-5 relevant tags for categorization

WEBSITE DATA:
Title: ${title}
Meta Description: ${description}
Content: ${bodyText}

Extract real information from the content above. If information is missing, make reasonable inferences but don't leave fields empty. Return ONLY the JSON object.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000
    });

    const extractedText = completion.choices[0]?.message?.content?.trim();
    console.log('Raw OpenAI response:', extractedText);
    
    if (!extractedText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let extractedData: ExtractedProductData;
    try {
      extractedData = JSON.parse(extractedText);
      console.log('Parsed extracted data:', extractedData);
      
      // Validate that we got meaningful data
      if (!extractedData.name || extractedData.name.trim() === '') {
        console.warn('Empty name detected, using title as fallback');
        extractedData.name = title || 'Unknown Product';
      }
      
      if (!extractedData.description || extractedData.description.trim() === '') {
        console.warn('Empty description detected, using meta description as fallback');
        extractedData.description = description || 'No description available';
      }
      
      // Ensure arrays are not empty
      if (!extractedData.features || extractedData.features.length === 0) {
        extractedData.features = ['Feature information not available'];
      }
      
      if (!extractedData.useCases || extractedData.useCases.length === 0) {
        extractedData.useCases = ['Use case information not available'];
      }
      
      if (!extractedData.tags || extractedData.tags.length === 0) {
        extractedData.tags = ['general'];
      }
      
    } catch (e) {
      console.error('JSON parsing failed. Raw response was:', extractedText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Add logo URL if found
    if (logoUrl) {
      extractedData.logoUrl = logoUrl.startsWith('http') ? logoUrl : new URL(logoUrl, url).href;
    }

    console.log('Final extracted data with logo:', extractedData);
    return extractedData;

  } catch (error: any) {
    console.error('Error extracting product data:', error);
    throw new Error(`Failed to extract product data: ${error.message}`);
  }
}

// Test function for debugging
export async function testExtraction(url: string) {
  try {
    console.log('Testing extraction for:', url);
    const result = await extractProductDataFromUrl(url);
    console.log('Extraction result:', result);
    return result;
  } catch (error) {
    console.error('Test extraction failed:', error);
    throw error;
  }
} 