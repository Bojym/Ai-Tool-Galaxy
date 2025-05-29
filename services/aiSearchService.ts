import { AISearchSuggestion, ToolCategory } from '../types';

// Simple in-memory cache to avoid repeated API calls for the same query
const searchCache = new Map<string, AISearchSuggestion>();

export const analyzeSearchQueryWithAI = async (query: string, availableCategories: ToolCategory[]): Promise<AISearchSuggestion | null> => {
  if (!query.trim()) return null;

  // Check cache first
  const cacheKey = query.toLowerCase().trim();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.warn("OpenAI API Key not found. Returning basic search suggestion.");
    return createBasicSuggestion(query, availableCategories);
  }

  try {
    const categoryNames = availableCategories.map(c => c.name);
    const prompt = `
You are an AI assistant helping users find tools in an AI tool catalog. Analyze this search query and suggest relevant categories and keywords.

User query: "${query}"

Available categories: ${categoryNames.join(', ')}

Provide a JSON response with:
1. "categories": An array of 1-3 most relevant category names from the available categories (exact matches only)
2. "keywords": An array of 3-5 relevant search keywords/terms to help find tools

Rules:
- Categories must be exact matches from the available list
- Keywords should be specific and related to the user's intent
- Focus on functionality, use cases, and tool types
- Return only valid JSON

Example:
{"categories": ["Image Generation", "Design"], "keywords": ["create", "images", "ai art", "graphics", "visual"]}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse JSON response
    let suggestion: AISearchSuggestion;
    try {
      suggestion = JSON.parse(content);
      
      // Validate and filter categories to ensure they exist
      if (suggestion.categories) {
        suggestion.categories = suggestion.categories.filter(cat => 
          categoryNames.includes(cat)
        );
      }
      
      // Ensure we have valid structure
      if (!suggestion.keywords || !Array.isArray(suggestion.keywords)) {
        suggestion.keywords = query.toLowerCase().split(' ').filter(Boolean);
      }
      
      if (!suggestion.categories || !Array.isArray(suggestion.categories)) {
        suggestion.categories = [];
      }

    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      suggestion = createBasicSuggestion(query, availableCategories);
    }

    // Cache the result
    searchCache.set(cacheKey, suggestion);
    
    return suggestion;

  } catch (error) {
    console.error('Error analyzing search query with AI:', error);
    return createBasicSuggestion(query, availableCategories);
  }
};

// Fallback function for when AI fails
const createBasicSuggestion = (query: string, availableCategories: ToolCategory[]): AISearchSuggestion => {
  const lowerQuery = query.toLowerCase();
  const keywords = lowerQuery.split(' ').filter(Boolean);
  
  // Simple keyword-based category matching
  const matchedCategories: string[] = [];
  
  availableCategories.forEach(category => {
    const categoryName = category.name.toLowerCase();
    if (lowerQuery.includes(categoryName.toLowerCase()) || 
        categoryName.split(' ').some(word => lowerQuery.includes(word))) {
      matchedCategories.push(category.name);
    }
  });

  // Add some intelligent keyword mapping
  const keywordCategoryMap: { [key: string]: string[] } = {
    'image': ['Image Gen', 'Design'],
    'photo': ['Image Gen', 'Design'],
    'picture': ['Image Gen', 'Design'],
    'art': ['Image Gen', 'Design'],
    'design': ['Design', 'Image Gen'],
    'write': ['Text Gen', 'Marketing'],
    'text': ['Text Gen', 'Marketing'],
    'content': ['Text Gen', 'Marketing'],
    'code': ['Code Assistant', 'Productivity'],
    'programming': ['Code Assistant', 'Productivity'],
    'chat': ['Chatbot'],
    'talk': ['Chatbot'],
    'conversation': ['Chatbot'],
    'video': ['Video AI', 'Video Creation'],
    'music': ['Audio AI'],
    'audio': ['Audio AI'],
    'data': ['Analytics', 'Research'],
    'analysis': ['Analytics', 'Research'],
    'business': ['Business', 'Productivity'],
    'productivity': ['Productivity'],
    'marketing': ['Marketing', 'Text Gen'],
    'copy': ['Marketing', 'Text Gen'],
    'copywriting': ['Marketing', 'Text Gen'],
    'advertising': ['Marketing'],
    'ads': ['Marketing'],
    'campaign': ['Marketing'],
    'social': ['Marketing'],
    'email': ['Marketing', 'Text Gen'],
    'seo': ['Marketing'],
    'blog': ['Marketing', 'Text Gen'],
    'jasper': ['Marketing', 'Text Gen'],
    'automation': ['Automation'],
    'nocode': ['No-Code'],
    'education': ['Education'],
    'research': ['Research'],
    'coding': ['Coding'],
  };

  keywords.forEach(keyword => {
    const mappedCategories = keywordCategoryMap[keyword];
    if (mappedCategories) {
      mappedCategories.forEach(cat => {
        if (availableCategories.find(c => c.name === cat) && !matchedCategories.includes(cat)) {
          matchedCategories.push(cat);
        }
      });
    }
  });

  return {
    categories: matchedCategories.slice(0, 3), // Limit to 3 categories
    keywords: keywords.slice(0, 5), // Limit to 5 keywords
  };
};

// Clear cache periodically to prevent memory leaks
export const clearSearchCache = () => {
  searchCache.clear();
};

// Get cache size for debugging
export const getSearchCacheSize = () => {
  return searchCache.size;
}; 