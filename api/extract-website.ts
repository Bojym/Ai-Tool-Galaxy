import { VercelRequest, VercelResponse } from '@vercel/node';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Secret token for API authentication
const API_SECRET = process.env.CRAWL4AI_SECRET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Check authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized - Invalid or missing API token' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let browser;
  try {
    // Launch browser with Chromium for Vercel
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the URL
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Extract page data
    const pageData = await page.evaluate(() => {
      // Remove unwanted elements
      const unwantedSelectors = ['script', 'style', 'nav', 'footer', 'header', '.cookie-banner', '.ads'];
      unwantedSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
      
      return {
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || 
                        document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
        headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()).filter(Boolean),
        paragraphs: Array.from(document.querySelectorAll('p')).map(p => p.textContent?.trim()).filter(Boolean).slice(0, 20),
        mainContent: document.querySelector('main')?.textContent?.trim() || 
                    document.querySelector('[role="main"]')?.textContent?.trim() || 
                    document.body.textContent?.trim() || '',
        logoUrl: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || 
                document.querySelector('link[rel="icon"]')?.getAttribute('href') || 
                document.querySelector('img[alt*="logo" i]')?.getAttribute('src') || ''
      };
    });

    await browser.close();

    // Combine all text content
    const allText = [
      pageData.title,
      pageData.metaDescription,
      ...pageData.headings,
      ...pageData.paragraphs.slice(0, 10)
    ].join(' ').substring(0, 4000);

    return res.status(200).json({
      success: true,
      data: {
        title: pageData.title,
        description: pageData.metaDescription,
        content: allText,
        logoUrl: pageData.logoUrl,
        url: url
      }
    });

  } catch (error: any) {
    if (browser) {
      await browser.close();
    }
    
    console.error('Extraction error:', error);
    return res.status(500).json({ 
      error: 'Failed to extract website content', 
      details: error.message 
    });
  }
} 