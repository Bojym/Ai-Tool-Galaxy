export interface LLMExtractedToolData {
  name: string;
  description: string;
  features: string[];
  categories: string[];
  useCases: string[];
  pricing: string;
  logoUrl?: string;
  screenshotUrls?: string[];
  tags: string[];
}

export async function extractToolDataWithCrawl4AI(url: string): Promise<LLMExtractedToolData> {
  const apiUrl = 'https://api.crawl4ai.com/v1/extract'; // Replace with your real Crawl4AI endpoint
  const apiSecret = process.env.CRAWL4AI_SECRET;

  if (!apiSecret) {
    throw new Error('CRAWL4AI_SECRET environment variable is not set');
  }

  const prompt = `
You are an AI assistant. Analyze the website at the following URL and extract the following fields in strict JSON format:

{
  "name": "string",
  "description": "string",
  "features": ["array", "of", "strings"],
  "categories": ["array", "of", "strings"],
  "useCases": ["array", "of", "strings"],
  "pricing": "string",
  "logoUrl": "string",
  "screenshotUrls": ["array", "of", "strings"],
  "tags": ["array", "of", "strings"]
}

Website URL: ${url}

Respond ONLY with a valid JSON object matching the schema above.`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiSecret}`
    },
    body: JSON.stringify({
      prompt,
      url,
      internet_access: true,
      response_json_schema: {
        name: "string",
        description: "string",
        features: ["string"],
        categories: ["string"],
        useCases: ["string"],
        pricing: "string",
        logoUrl: "string",
        screenshotUrls: ["string"],
        tags: ["string"]
      }
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please check your CRAWL4AI_SECRET environment variable');
    }
    throw new Error(`Crawl4AI extraction failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // If the LLM returns the JSON as a string, parse it
  let toolData: LLMExtractedToolData;
  if (typeof data === 'string') {
    toolData = JSON.parse(data);
  } else if (typeof data.result === 'string') {
    toolData = JSON.parse(data.result);
  } else {
    toolData = data;
  }

  return toolData;
} 