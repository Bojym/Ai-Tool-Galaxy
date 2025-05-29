import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Production service that calls your backend API
export interface ExtractedProductData {
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  pricing: string;
  logoUrl?: string;
  tags: string[];
}

// Multiple extraction strategies for different types of websites
export async function extractProductDataFromUrl(url: string): Promise<ExtractedProductData> {
  console.log('🚀 Starting multi-method extraction for:', url);
  
  // Try multiple extraction methods in order of reliability
  const extractionMethods = [
    () => extractWithBrowserAPI(url),      // Best for JS-heavy sites
    () => extractWithReadabilityAPI(url),  // Good for content sites
    () => extractWithDirectFetch(url),     // Fallback for simple sites
  ];

  let lastError: any;
  
  for (let i = 0; i < extractionMethods.length; i++) {
    const methodName = ['Browser API', 'Readability API', 'Direct Fetch'][i];
    
    try {
      console.log(`🔄 Trying method ${i + 1}: ${methodName}`);
      const result = await extractionMethods[i]();
      console.log(`✅ ${methodName} successful!`);
      return result;
    } catch (error: any) {
      console.log(`❌ ${methodName} failed:`, error.message);
      lastError = error;
      
      // Continue to next method unless it's the last one
      if (i < extractionMethods.length - 1) {
        console.log(`🔄 Trying next extraction method...`);
        continue;
      }
    }
  }
  
  // If all methods failed, throw the most recent error
  throw new Error(`All extraction methods failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Method 1: Browser-based API (handles JavaScript)
async function extractWithBrowserAPI(url: string): Promise<ExtractedProductData> {
  console.log('🌐 Attempting browser-based extraction...');
  
  // Using ScrapingBee API (free tier available) - handles JavaScript
  // Alternative: You could use Browserless, ScrapingAnt, or similar services
  const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY || 'demo'; // Use 'demo' for testing
  
  try {
    const scrapingUrl = `https://app.scrapingbee.com/api/v1/?api_key=${SCRAPINGBEE_API_KEY}&url=${encodeURIComponent(url)}&render_js=true&premium_proxy=true&country_code=us`;
    
    const response = await fetch(scrapingUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Browser API authentication failed - ScrapingBee API key required for JavaScript sites');
      }
      throw new Error(`Browser API returned ${response.status}`);
    }

    const html = await response.text();
    return await processHTMLWithAI(html, url, 'Browser API');
    
  } catch (error: any) {
    if (error.message.includes('Authentication') || error.message.includes('API key')) {
      // If no API key, suggest manual extraction
      throw new Error('JavaScript website detected. For automatic extraction, set up ScrapingBee API key in your environment variables. For now, please use manual entry.');
    }
    throw error;
  }
}

// Method 2: Readability API (good content extraction)
async function extractWithReadabilityAPI(url: string): Promise<ExtractedProductData> {
  console.log('📖 Attempting Readability API extraction...');
  
  try {
    // Using Mozilla's Readability API via a CORS proxy
    const readabilityUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://readability-api.eu.org/api?url=${encodeURIComponent(url)}&html=true`)}&callback=`;
    
    const response = await fetch(readabilityUrl);
    if (!response.ok) {
      throw new Error(`Readability API returned ${response.status}`);
    }
    
    const data = await response.json();
    const readabilityResult = JSON.parse(data.contents);
    
    if (!readabilityResult.content) {
      throw new Error('No content extracted by Readability API');
    }

    // Process the cleaned content
    const websiteData = {
      title: readabilityResult.title || '',
      description: readabilityResult.excerpt || '',
      content: readabilityResult.textContent?.substring(0, 4000) || readabilityResult.content?.substring(0, 4000) || '',
      url: url
    };

    return await processWebsiteDataWithAI(websiteData, 'Readability API');
    
  } catch (error: any) {
    throw new Error(`Readability extraction failed: ${error.message}`);
  }
}

// Method 3: Direct fetch (fallback)
async function extractWithDirectFetch(url: string): Promise<ExtractedProductData> {
  console.log('📄 Attempting direct fetch extraction...');
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  
  // Check if it's likely a SPA (common indicators)
  const isSPA = html.includes('window.__INITIAL_STATE__') || 
                html.includes('window.__APOLLO_STATE__') ||
                html.includes('id="root"') ||
                html.includes('id="app"') ||
                html.includes('ng-app') ||
                html.match(/<script[^>]*src[^>]*app[^>]*\.js/i) ||
                html.match(/<script[^>]*src[^>]*bundle[^>]*\.js/i);
  
  if (isSPA && html.trim().length < 5000) {
    throw new Error('This appears to be a JavaScript-heavy Single Page Application. The page content is minimal without JavaScript execution.');
  }

  return await processHTMLWithAI(html, url, 'Direct Fetch');
}

// Process raw HTML with AI
async function processHTMLWithAI(html: string, url: string, method: string): Promise<ExtractedProductData> {
  // Extract basic metadata from HTML
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  const descMatch = html.match(/<meta[^>]*name=['""]description['""][^>]*content=['""]([^'"]*)['""][^>]*>/i) ||
                   html.match(/<meta[^>]*property=['""]og:description['""][^>]*content=['""]([^'"]*)['""][^>]*>/i);
  const description = descMatch ? descMatch[1].trim() : '';
  
  // Extract logo
  const logoMatch = html.match(/<meta[^>]*property=['""]og:image['""][^>]*content=['""]([^'"]*)['""][^>]*>/i) ||
                   html.match(/<link[^>]*rel=['""]icon['""][^>]*href=['""]([^'"]*)['""][^>]*>/i) ||
                   html.match(/<link[^>]*rel=['""]apple-touch-icon['""][^>]*href=['""]([^'"]*)['""][^>]*>/i);
  const logoUrl = logoMatch ? logoMatch[1].trim() : '';
  
  // Extract and clean text content
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const websiteData = {
    title,
    description,
    content: textContent.substring(0, 4000),
    logoUrl,
    url
  };
  
  console.log(`📊 ${method} extracted:`, {
    title: websiteData.title,
    contentLength: websiteData.content?.length || 0,
    hasLogo: !!websiteData.logoUrl
  });

  return await processWebsiteDataWithAI(websiteData, method);
}

// Process extracted website data with OpenAI
async function processWebsiteDataWithAI(websiteData: any, method: string): Promise<ExtractedProductData> {
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
- Determine pricing model from content (look for pricing, subscription, free trial mentions)
- Add 3-5 relevant tags for categorization
- If information is limited, make reasonable inferences based on context

WEBSITE DATA (extracted via ${method}):
Title: ${websiteData.title}
Meta Description: ${websiteData.description}
Content: ${websiteData.content}
URL: ${websiteData.url}

Extract real information from the content above. Return ONLY the JSON object, no additional text.`;

  console.log('🤖 Sending to OpenAI for processing...');
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1000
  });

  const extractedText = completion.choices[0]?.message?.content?.trim();
  
  if (!extractedText) {
    throw new Error('No response from OpenAI');
  }

  // Parse and validate the JSON response
  let extractedData: ExtractedProductData;
  try {
    extractedData = JSON.parse(extractedText);
    
    // Validate and add fallbacks
    if (!extractedData.name || extractedData.name.trim() === '') {
      extractedData.name = websiteData.title || 'Unknown Product';
    }
    
    if (!extractedData.description || extractedData.description.trim() === '') {
      extractedData.description = websiteData.description || 'No description available';
    }
    
    // Ensure arrays are not empty
    extractedData.features = Array.isArray(extractedData.features) && extractedData.features.length > 0 
      ? extractedData.features 
      : ['Feature information not available'];
      
    extractedData.useCases = Array.isArray(extractedData.useCases) && extractedData.useCases.length > 0 
      ? extractedData.useCases 
      : ['Use case information not available'];
      
    extractedData.tags = Array.isArray(extractedData.tags) && extractedData.tags.length > 0 
      ? extractedData.tags 
      : ['general'];
    
  } catch (e) {
    console.error('JSON parsing failed. Raw response was:', extractedText);
    throw new Error('Failed to parse AI response as JSON');
  }

  // Add logo URL if found
  if (websiteData.logoUrl) {
    try {
      extractedData.logoUrl = websiteData.logoUrl.startsWith('http') 
        ? websiteData.logoUrl 
        : new URL(websiteData.logoUrl, websiteData.url).href;
    } catch {
      // Invalid URL, skip logo
    }
  }

  console.log('✅ Final extracted data:', extractedData);
  return extractedData;
}

// Enhanced logo detection for manual cases
export async function findWebsiteLogo(url: string): Promise<string | null> {
  try {
    // Try multiple methods to find a logo
    const logoMethods = [
      `${new URL(url).origin}/logo.png`,
      `${new URL(url).origin}/logo.svg`,
      `${new URL(url).origin}/favicon.ico`,
      `${new URL(url).origin}/assets/logo.png`,
      `${new URL(url).origin}/static/logo.png`,
      `${new URL(url).origin}/images/logo.png`,
    ];

    for (const logoUrl of logoMethods) {
      try {
        const response = await fetch(logoUrl, { method: 'HEAD' });
        if (response.ok) {
          return logoUrl;
        }
      } catch {
        continue;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

// Fallback to current method for development
export async function extractProductDataFromUrlFallback(url: string): Promise<ExtractedProductData> {
  throw new Error('Please use the main extraction method');
} 