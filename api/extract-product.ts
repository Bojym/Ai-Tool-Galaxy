// api/extract-product.ts - Vercel Serverless Function
import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Step 1: Fetch webpage content (no CORS issues on server)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProductExtractor/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch webpage: ${response.status}`);
    }

    const html = await response.text();

    // Step 2: Parse HTML and extract text content
    const $ = cheerio.load(html);
    
    // Remove script and style elements
    $('script, style, nav, footer, header').remove();
    
    // Extract main content
    const title = $('title').text() || $('h1').first().text();
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || '';
    
    // Get main text content (limit to avoid token limits)
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 3000);
    
    // Try to find logo
    const logoUrl = $('meta[property="og:image"]').attr('content') || 
                   $('link[rel="icon"]').attr('href') || 
                   $('img[alt*="logo" i]').first().attr('src') || '';

    // Step 3: Use OpenAI to extract structured data
    const prompt = `
Extract product information from this website content. Return ONLY a valid JSON object with the following structure:

{
  "name": "Product name",
  "description": "2-3 sentence description of what the product does",
  "features": ["feature 1", "feature 2", "feature 3"],
  "useCases": ["use case 1", "use case 2"],
  "pricing": "Free" | "Freemium" | "Paid" | "Contact Us",
  "tags": ["relevant", "tags", "for", "categorization"]
}

Website title: ${title}
Meta description: ${description}
Website content: ${bodyText}

Return only the JSON object, no other text.
`;

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

    // Parse the JSON response
    let extractedData;
    try {
      extractedData = JSON.parse(extractedText);
    } catch (e) {
      throw new Error('Failed to parse AI response as JSON');
    }

    // Add logo URL if found
    if (logoUrl) {
      extractedData.logoUrl = logoUrl.startsWith('http') ? logoUrl : new URL(logoUrl, url).href;
    }

    return res.status(200).json(extractedData);

  } catch (error: any) {
    console.error('Error extracting product data:', error);
    return res.status(500).json({ 
      error: 'Failed to extract product data',
      details: error.message 
    });
  }
} 