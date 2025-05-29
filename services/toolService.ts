import React from 'react'; // Added import for React
import { Tool, ToolCategory, ToolComment, AIGeneratedToolDetails, PricingTier, SourceType } from '../types';
import { MOCK_API_DELAY, PLACEHOLDER_IMAGE_URL } from '../constants';
import { getSupabaseTools, getSupabaseToolById } from './supabaseToolService';
import { supabase } from './supabaseClient';

export const PRICING_OPTIONS: PricingTier[] = ['Free', 'Freemium', 'Paid', 'Contact Us'];
export const SOURCE_OPTIONS: SourceType[] = ['Open Source', 'Closed Source'];

export const MOCK_CATEGORIES: ToolCategory[] = [
  { id: 'image-generation', name: 'Image Gen', description: 'Create stunning visuals from text or other images.', icon: '🎨' },
  { id: 'text-generation', name: 'Text Gen', description: 'Write, summarize, and translate text with AI.', icon: '✍️' },
  { id: 'video-editing', name: 'Video AI', description: 'Automate and enhance your video creation process.', icon: '🎬' },
  { id: 'productivity', name: 'Productivity', description: 'Boost your efficiency with AI-powered assistants.', icon: '🚀' },
  { id: 'code-assistant', name: 'Code Assistant', description: 'Get help with writing, debugging, and understanding code.', icon: '💻' },
  { id: 'audio-ai', name: 'Audio AI', description: 'Generate and manipulate audio with AI.', icon: '🎧' },
  { id: 'research', name: 'Research', description: 'AI tools for research and data analysis.', icon: '🔬'},
  { id: 'analytics', name: 'Analytics', description: 'Gain insights from data using AI.', icon: '📊' },
  { id: 'coding', name: 'Coding', description: 'Tools specifically for aiding in software development.', icon: '💡' },
  { id: 'design', name: 'Design', description: 'AI tools for design tasks.', icon: '🖌️' },
  { id: 'marketing', name: 'Marketing', description: 'AI tools for marketing strategies.', icon: '📈' },
  { id: 'education', name: 'Education', description: 'AI tools for learning and teaching.', icon: '🎓' },
  { id: 'business', name: 'Business', description: 'AI tools for business operations.', icon: '💼' },
  { id: 'automation', name: 'Automation', description: 'Tools for automating tasks.', icon: '🤖' },
  { id: 'no-code', name: 'No-Code', description: 'Build applications without coding.', icon: '🧩' },
  { id: 'video-creation', name: 'Video Creation', description: 'Create videos with AI assistance.', icon: '📹' },
  { id: 'chatbot', name: 'Chatbot', description: 'Develop and deploy chatbots.', icon: '💬' },
  { id: 'other', name: 'Other', description: 'Miscellaneous AI tools.', icon: '⚙️' },
];

let MOCK_TOOLS: Tool[] = [
  {
    id: '1',
    name: 'ChatGPT', 
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png', 
    shortDescription: 'Advanced conversational AI that can understand context and generate human-like text.',
    fullDescription: 'ChatGPT by OpenAI is a large language model trained to understand and generate text in a conversational manner. It can answer questions, write essays, generate code, summarize text, and much more. Its versatility makes it useful for a wide range of applications from content creation to customer support.',
    websiteUrl: 'https://chat.openai.com/',
    screenshots: [PLACEHOLDER_IMAGE_URL(600,400,'chatgpt1'), PLACEHOLDER_IMAGE_URL(600,400,'chatgpt2')],
    features: ['Conversational AI', 'Text generation', 'Code generation', 'Summarization', 'Translation'],
    useCases: ['Content writing', 'Customer support automation', 'Educational assistance', 'Brainstorming ideas'],
    upvotes: 2850,
    categories: ['text-generation', 'chatbot'], 
    tags: ['Chatbot', 'NLP', 'OpenAI', 'Text Generation', 'Conversational AI'],
    pricing: 'Freemium',
    source: 'Closed Source',
    publicGuide: 'Getting Started: 1. Visit chat.openai.com. 2. Sign up or log in. 3. Start typing your prompts in the message box. 4. Experiment with different types of questions and requests.',
    comments: [
      { id: 'c1', toolId: '1', userId: 'user1', username: 'AIEnthusiast', avatarUrl: PLACEHOLDER_IMAGE_URL(40,40,'user1'), text: 'Incredibly powerful and versatile!', upvotes: 35, createdAt: new Date(Date.now() - 86400000 * 2) },
      { id: 'c2', toolId: '1', userId: 'admin1', username: 'DevRel', avatarUrl: PLACEHOLDER_IMAGE_URL(40,40,'admin1'), text: 'We are constantly improving its capabilities. Thanks for the feedback!', upvotes: 18, createdAt: new Date(Date.now() - 86400000) },
    ],
    submittedBy: 'admin1',
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: '2',
    name: 'GitHub Copilot', 
    logoUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 
    shortDescription: 'AI pair programmer that suggests code completions in real-time as you type.',
    fullDescription: 'GitHub Copilot, powered by OpenAI Codex, provides autocomplete-style suggestions as you code. You can get suggestions for whole lines or entire functions right inside your editor. It helps you write code faster, learn new languages, and reduce boilerplate.',
    websiteUrl: 'https://copilot.github.com/',
    screenshots: [PLACEHOLDER_IMAGE_URL(600,400,'copilot1'), PLACEHOLDER_IMAGE_URL(600,400,'copilot2')],
    features: ['AI code completion', 'Multi-language support', 'IDE integration', 'Context-aware suggestions', 'Boilerplate reduction'],
    useCases: ['Faster coding', 'Learning new programming languages', 'Reducing repetitive coding tasks'],
    upvotes: 2100,
    categories: ['code-assistant', 'productivity'], 
    tags: ['Code Assistant', 'Productivity', 'Developer Tools', 'AI Programming'], 
    pricing: 'Paid',
    source: 'Closed Source',
    comments: [
      { id: 'c3', toolId: '2', userId: 'user1', username: 'CodeNinja', avatarUrl: PLACEHOLDER_IMAGE_URL(40,40,'user1'), text: 'Speeds up my development workflow significantly!', upvotes: 22, createdAt: new Date(Date.now() - 86400000 * 5) },
    ],
    submittedBy: 'admin1',
    createdAt: new Date(Date.now() - 86400000 * 5), 
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: '3',
    name: 'DALL·E 3', 
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/DALL%C2%B7E_logo.svg/1200px-DALL%C2%B7E_logo.svg.png', 
    shortDescription: 'Advanced AI image generator that created highly detailed visuals from text descriptions.',
    fullDescription: 'DALL·E 3 by OpenAI can create original, realistic images and art from a text description. It can combine concepts, attributes, and styles. It represents a significant leap in AI\'s ability to generate novel imagery based on natural language.',
    websiteUrl: 'https://openai.com/dall-e-3',
    screenshots: [PLACEHOLDER_IMAGE_URL(600,400,'dalle1'), PLACEHOLDER_IMAGE_URL(600,400,'dalle2')],
    features: ['Text-to-image generation', 'Artistic style variations', 'Image editing (inpainting/outpainting via API)', 'High-resolution output', 'Concept combination'],
    useCases: ['Creating art and illustrations', 'Visualizing concepts', 'Marketing material generation'],
    upvotes: 1850,
    categories: ['image-generation', 'design'], 
    tags: ['Image Generation', 'Design', 'AI Art', 'OpenAI'], 
    pricing: 'Paid', 
    source: 'Closed Source',
    publicGuide: 'Tips for DALL·E: Be specific in your prompts. Combine unusual concepts. Specify artistic styles (e.g., "in the style of Van Gogh"). Iterate and refine your prompts for best results.',
    comments: [],
    submittedBy: 'user1',
    createdAt: new Date(Date.now() - 86400000 * 60),
    updatedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: '4',
    name: 'Midjourney', 
    logoUrl: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de162_icon_clyde_blurple_RGB.png', 
    shortDescription: 'AI text-to-image generator known for highly artistic and detailed image creation.',
    fullDescription: 'Midjourney is an independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species. Their primary tool is an AI that generates images from textual descriptions, often praised for its artistic and aesthetic quality.',
    websiteUrl: 'https://www.midjourney.com/',
    screenshots: [PLACEHOLDER_IMAGE_URL(600,400,'midjourney1'), PLACEHOLDER_IMAGE_URL(600,400,'midjourney2')],
    features: ['Artistic image generation', 'Discord bot interface', 'Parameter tuning', 'Image upscaling', 'Community showcase'],
    useCases: ['Concept art for games/movies', 'Unique artistic pieces', 'Inspiration for designers'],
    upvotes: 2400,
    categories: ['image-generation', 'design'], 
    tags: ['Image Generation', 'Design', 'AI Art', 'Artistic'], 
    pricing: 'Paid',
    source: 'Closed Source',
    comments: [
       { id: 'c4', toolId: '4', userId: 'user1', username: 'ArtDirector', avatarUrl: PLACEHOLDER_IMAGE_URL(40,40,'user1'), text: 'The artistic output is unparalleled!', upvotes: 40, createdAt: new Date(Date.now() - 86400000 * 1) },
    ],
    submittedBy: 'admin1',
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 0.5),
  },
  {
    id: '5',
    name: 'Stable Diffusion',
    logoUrl: PLACEHOLDER_IMAGE_URL(100,100,'stablediff'),
    shortDescription: 'Powerful open-source text-to-image model for creating diverse and high-quality images.',
    fullDescription: 'Stable Diffusion is a deep learning, text-to-image model released by Stability AI. It is primarily used to generate detailed images conditioned on text descriptions, though it can also be applied to other tasks such as inpainting, outpainting, and generating image-to-image translations guided by a text prompt. Being open-source, it has a vibrant community and numerous custom models and UIs.',
    websiteUrl: 'https://stability.ai/stablediffusion',
    screenshots: [PLACEHOLDER_IMAGE_URL(600,400,'sd1'), PLACEHOLDER_IMAGE_URL(600,400,'sd2')],
    features: ['Open-source model', 'Text-to-image generation', 'Image-to-image translation', 'Inpainting/Outpainting', 'Large community support', 'Custom model fine-tuning'],
    useCases: ['Custom AI art projects', 'Research in image generation', 'Running models locally'],
    upvotes: 3200,
    categories: ['image-generation'],
    tags: ['Open Source', 'Image Generation', 'AI Art', 'Stability AI'],
    pricing: 'Free', 
    source: 'Open Source',
    comments: [],
    submittedBy: 'user1',
    createdAt: new Date(Date.now() - 86400000 * 20),
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: '6',
    name: 'Jasper AI',
    logoUrl: 'https://www.jasper.ai/wp-content/uploads/2022/08/jasper-logo.svg',
    shortDescription: 'AI writing assistant that helps create high-quality marketing content, blog posts, and copy.',
    fullDescription: 'Jasper AI is an AI-powered writing assistant designed specifically for marketing teams and content creators. It can generate blog posts, social media content, ad copy, email campaigns, and more. With its understanding of marketing frameworks and brand voice, Jasper helps businesses scale their content creation while maintaining quality and consistency.',
    websiteUrl: 'https://www.jasper.ai/',
    screenshots: [PLACEHOLDER_IMAGE_URL(600,400,'jasper1'), PLACEHOLDER_IMAGE_URL(600,400,'jasper2')],
    features: ['AI copywriting', 'Brand voice training', 'Marketing templates', 'SEO optimization', 'Team collaboration', 'Multi-language support'],
    useCases: ['Blog post creation', 'Social media content', 'Email marketing campaigns', 'Ad copy generation', 'Product descriptions'],
    upvotes: 1800,
    categories: ['marketing', 'text-generation'],
    tags: ['Marketing', 'Copywriting', 'Content Creation', 'AI Writing', 'SEO'],
    pricing: 'Paid',
    source: 'Closed Source',
    comments: [
      { id: 'c5', toolId: '6', userId: 'user1', username: 'MarketingPro', avatarUrl: PLACEHOLDER_IMAGE_URL(40,40,'user1'), text: 'Game-changer for our content marketing strategy!', upvotes: 28, createdAt: new Date(Date.now() - 86400000 * 3) },
    ],
    submittedBy: 'admin1',
    createdAt: new Date(Date.now() - 86400000 * 25),
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: '7',
    name: 'Copy.ai',
    logoUrl: 'https://www.copy.ai/static/images/logo.svg',
    shortDescription: 'AI-powered copywriting tool that generates marketing copy, product descriptions, and social media content.',
    fullDescription: 'Copy.ai is an AI writing tool that helps marketers, entrepreneurs, and content creators generate high-converting copy in seconds. From social media posts to product descriptions, email subject lines to blog outlines, Copy.ai uses advanced AI to help you create content that drives results.',
    websiteUrl: 'https://www.copy.ai/',
    screenshots: [PLACEHOLDER_IMAGE_URL(600,400,'copyai1'), PLACEHOLDER_IMAGE_URL(600,400,'copyai2')],
    features: ['AI copywriting', 'Marketing templates', 'Social media content', 'Product descriptions', 'Email subject lines', 'Blog post ideas'],
    useCases: ['Social media marketing', 'E-commerce product descriptions', 'Email marketing', 'Content ideation', 'Ad copy creation'],
    upvotes: 1650,
    categories: ['marketing', 'text-generation'],
    tags: ['Marketing', 'Copywriting', 'AI Writing', 'Social Media', 'E-commerce'],
    pricing: 'Freemium',
    source: 'Closed Source',
    comments: [
      { id: 'c6', toolId: '7', userId: 'user1', username: 'ContentCreator', avatarUrl: PLACEHOLDER_IMAGE_URL(40,40,'user1'), text: 'Perfect for quick social media content!', upvotes: 22, createdAt: new Date(Date.now() - 86400000 * 2) },
    ],
    submittedBy: 'admin1',
    createdAt: new Date(Date.now() - 86400000 * 20),
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: '8',
    name: 'Runway Gen-2',
    logoUrl: PLACEHOLDER_IMAGE_URL(100,100,'runway'),
    shortDescription: 'AI model for generating novel videos from text, images, or video clips.',
    fullDescription: 'Runway Gen-2 is a multi-modal AI system that can generate novel videos with text, images or video clips. It\'s part of Runway\'s suite of AI magic tools aimed at filmmakers, artists, and designers, enabling new forms of storytelling and visual creation.',
    websiteUrl: 'https://runwayml.com/ai-magic-tools/gen-2/',
    screenshots: [PLACEHOLDER_IMAGE_URL(600,400,'gen2_1'), PLACEHOLDER_IMAGE_URL(600,400,'gen2_2')],
    features: ['Text-to-video', 'Image-to-video', 'Video-to-video', 'Stylization', 'Storyboarding assistance'],
    useCases: ['Short video clips for social media', 'Animating static images', 'Creating visualizers for music'],
    upvotes: 1500,
    categories: ['video-editing', 'video-creation'],
    tags: ['Video Generation', 'AI Video', 'RunwayML', 'Creative Tools'],
    pricing: 'Freemium',
    source: 'Closed Source',
    comments: [],
    submittedBy: 'admin1',
    createdAt: new Date(Date.now() - 86400000 * 15),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
];

export const getTools = async (
  filters?: {
    category?: string; // This is a single category ID for filtering
    searchTerm?: string;
    tags?: string[];
    pricing?: PricingTier[];
    source?: SourceType[];
  },
  sortBy: 'upvotes' | 'createdAt' | 'name' = 'upvotes',
  sortOrder: 'asc' | 'desc' = 'desc',
  limit?: number
): Promise<Tool[]> => {
  try {
    // Fetch both mock tools and Supabase tools
    const [supabaseTools] = await Promise.all([
      getSupabaseTools()
    ]);
    
    // Combine both sources
    let allTools = [...MOCK_TOOLS, ...supabaseTools];
    console.log(`Loaded ${MOCK_TOOLS.length} mock tools and ${supabaseTools.length} Supabase tools`);
    
    let filteredTools = allTools;

      if (filters) {
        if (filters.category && filters.category !== 'all') {
          // Tool.categories is an array, check if it includes the filter.category
          filteredTools = filteredTools.filter(tool => tool.categories.includes(filters.category!));
        }

        if (filters.searchTerm) {
          const lowerSearchTerm = filters.searchTerm.toLowerCase();
          filteredTools = filteredTools.filter(tool =>
            tool.name.toLowerCase().includes(lowerSearchTerm) ||
            tool.shortDescription.toLowerCase().includes(lowerSearchTerm) ||
            tool.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
          );
        }
        
        if (filters.tags && filters.tags.length > 0) {
          filteredTools = filteredTools.filter(tool => 
            filters.tags!.every(filterTag => tool.tags.map(t => t.toLowerCase()).includes(filterTag.toLowerCase()))
          );
        }

        if (filters.pricing && filters.pricing.length > 0) {
          filteredTools = filteredTools.filter(tool => filters.pricing!.includes(tool.pricing));
        }

        if (filters.source && filters.source.length > 0) {
          filteredTools = filteredTools.filter(tool => filters.source!.includes(tool.source));
        }
      }

      filteredTools.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'upvotes') comparison = b.upvotes - a.upvotes; 
        else if (sortBy === 'createdAt') comparison = b.createdAt.getTime() - a.createdAt.getTime(); 
        else if (sortBy === 'name') comparison = a.name.localeCompare(b.name);

        return sortOrder === 'desc' ? comparison * -1 : comparison;
      });
      
      // Default sort for name is asc, for upvotes/createdAt is desc
      // The previous logic was a bit complex, simplifying:
      if (sortBy === 'name' && sortOrder === 'desc') filteredTools.reverse();
      if ((sortBy === 'upvotes' || sortBy === 'createdAt') && sortOrder === 'asc') filteredTools.reverse();


      if (limit) {
        return filteredTools.slice(0, limit);
      } else {
        return filteredTools;
      }
    } catch (error) {
      console.error('Error in getTools:', error);
      // Fallback to mock tools only
      return MOCK_TOOLS;
    }
};

export const getToolById = async (id: string): Promise<Tool | undefined> => {
  try {
    // First check mock tools
    const mockTool = MOCK_TOOLS.find(tool => tool.id === id);
    if (mockTool) {
      return mockTool;
    }
    
    // Then check Supabase tools
    const supabaseTool = await getSupabaseToolById(id);
    return supabaseTool || undefined;
  } catch (error) {
    console.error('Error in getToolById:', error);
    return MOCK_TOOLS.find(tool => tool.id === id);
  }
};

export const getCategories = async (): Promise<ToolCategory[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_CATEGORIES);
    }, MOCK_API_DELAY / 4);
  });
};

export const upvoteTool = async (id: string): Promise<Tool | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const toolIndex = MOCK_TOOLS.findIndex(t => t.id === id);
            if (toolIndex !== -1) {
                MOCK_TOOLS[toolIndex].upvotes += 1;
                resolve(MOCK_TOOLS[toolIndex]);
            } else {
                resolve(undefined);
            }
        }, MOCK_API_DELAY / 5);
    });
};

export const addCommentToTool = async (toolId: string, comment: Omit<ToolComment, 'id' | 'toolId' | 'createdAt'>): Promise<ToolComment | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const tool = MOCK_TOOLS.find(t => t.id === toolId);
            if (tool) {
                const newComment: ToolComment = {
                    ...comment,
                    id: `c${Date.now()}`,
                    toolId,
                    createdAt: new Date(),
                };
                tool.comments.push(newComment);
                resolve(newComment);
            } else {
                resolve(undefined);
            }
        }, MOCK_API_DELAY / 3);
    });
};

export const submitTool = async (toolData: Omit<Tool, 'id' | 'upvotes' | 'comments' | 'createdAt' | 'updatedAt'>): Promise<Tool> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTool: Tool = {
        ...toolData,
        id: `tool-${Date.now()}`, // Ensure this is unique
        upvotes: 0,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_TOOLS.unshift(newTool); 
      resolve(newTool);
    }, MOCK_API_DELAY);
  });
};

export const adminAddTool = async (toolDetails: AIGeneratedToolDetails, websiteUrl: string, logoUrlProp?: string): Promise<Tool> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTool: Tool = {
        id: `tool-${Date.now()}`,
        name: toolDetails.name || 'Untitled Tool',
        logoUrl: logoUrlProp || toolDetails.logoUrl || PLACEHOLDER_IMAGE_URL(100,100, toolDetails.name || 'newtool'),
        shortDescription: toolDetails.shortDescription || 'No description provided.',
        fullDescription: toolDetails.fullDescription || 'No detailed description provided.',
        websiteUrl: websiteUrl,
        screenshots: [PLACEHOLDER_IMAGE_URL(600,400,`${toolDetails.name || 'newtool'}1`), PLACEHOLDER_IMAGE_URL(600,400,`${toolDetails.name || 'newtool'}2`)],
        features: toolDetails.features || [],
        useCases: toolDetails.useCases || [], // New field
        upvotes: 0,
        categories: toolDetails.categories?.length ? toolDetails.categories : [MOCK_CATEGORIES[0].id], // Default to first category ID if none provided
        tags: toolDetails.tags || [],
        pricing: toolDetails.pricing || 'Freemium',
        source: toolDetails.source || 'Closed Source',
        comments: [],
        submittedBy: 'admin1', // Assuming admin ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_TOOLS.unshift(newTool);
      resolve(newTool);
    }, MOCK_API_DELAY);
  });
};

export const updateToolDetails = async (toolId: string, updates: Partial<Tool>): Promise<Tool | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const toolIndex = MOCK_TOOLS.findIndex(t => t.id === toolId);
      if (toolIndex !== -1) {
        MOCK_TOOLS[toolIndex] = { ...MOCK_TOOLS[toolIndex], ...updates, updatedAt: new Date() };
        resolve(MOCK_TOOLS[toolIndex]);
      } else {
        resolve(undefined);
      }
    }, MOCK_API_DELAY / 2);
  });
};

export const deleteTool = async (toolId: string): Promise<boolean> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      // Check if it's a Supabase tool (prefixed with 'supabase-')
      if (toolId.startsWith('supabase-')) {
        try {
          const supabaseId = toolId.replace('supabase-', '');
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', supabaseId);
          
          if (error) {
            console.error('Error deleting Supabase tool:', error);
            resolve(false);
          } else {
            resolve(true);
          }
        } catch (error) {
          console.error('Error in deleteTool for Supabase:', error);
          resolve(false);
        }
      } else {
        // It's a mock tool
        const toolIndex = MOCK_TOOLS.findIndex(t => t.id === toolId);
        if (toolIndex !== -1) {
          MOCK_TOOLS.splice(toolIndex, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }
    }, MOCK_API_DELAY / 2);
  });
};

// Functions for homepage sections
export const getTrendingTools = async (limit: number = 4): Promise<Tool[]> => {
    const trendingIds = ['1', '2', '3', '4']; 
    const tools = await Promise.all(trendingIds.map(id => getToolById(id)));
    const validTools = tools.filter((tool): tool is Tool => tool !== undefined);
    
    if (validTools.length >= limit) {
      // Ensure categories are arrays for ToolCard compatibility
      return validTools.slice(0, limit).map(t => ({...t, categories: Array.isArray(t.categories) ? t.categories : [t.categories as unknown as string] }));
    }
    const fallbackTools = await getTools(undefined, 'upvotes', 'desc', limit);
    return fallbackTools.map(t => ({...t, categories: Array.isArray(t.categories) ? t.categories : [t.categories as unknown as string]}));
};

export const getTopProductsToday = async (limit: number = 4): Promise<Tool[]> => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tools = MOCK_TOOLS.filter(t => t.updatedAt >= today || t.createdAt >= today)
                           .sort((a,b) => b.upvotes - a.upvotes)
                           .slice(0, limit);
    return new Promise(resolve => setTimeout(() => resolve(tools), MOCK_API_DELAY / 3));
};

export const getLastWeeksTopTools = async (limit: number = 4): Promise<Tool[]> => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const tools = MOCK_TOOLS.filter(t => t.createdAt >= oneWeekAgo)
                           .sort((a,b) => b.upvotes - a.upvotes)
                           .slice(0, limit);
    return new Promise(resolve => setTimeout(() => resolve(tools), MOCK_API_DELAY / 3));
};

export const getLastMonthsTopTools = async (limit: number = 4): Promise<Tool[]> => {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const tools = MOCK_TOOLS.filter(t => t.createdAt >= oneMonthAgo)
                           .sort((a,b) => b.upvotes - a.upvotes)
                           .slice(0, limit);
    return new Promise(resolve => setTimeout(() => resolve(tools), MOCK_API_DELAY / 3));
};