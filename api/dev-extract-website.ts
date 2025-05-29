// Development version - simpler extraction for testing
interface RequestBody {
  url: string;
}

interface ApiRequest {
  method: string;
  body: RequestBody;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: any) => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // For development, we'll use a simpler approach with fetch and jsdom
    // This won't work for SPAs but is easier to set up for testing
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Simple parsing without a full DOM parser
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    const descMatch = html.match(/<meta[^>]*name=['""]description['""][^>]*content=['""]([^'"]*)['""][^>]*>/i);
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Extract text content (very basic)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 4000);

    return res.status(200).json({
      success: true,
      data: {
        title,
        description,
        content: textContent,
        logoUrl: '',
        url: url
      }
    });

  } catch (error: any) {
    console.error('Extraction error:', error);
    return res.status(500).json({ 
      error: 'Failed to extract website content', 
      details: error.message 
    });
  }
} 