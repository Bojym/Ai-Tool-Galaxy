
export interface User {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  isAdmin: boolean;
  favorites: string[]; // Array of tool IDs
}

export interface ToolCategory {
  id: string;
  name: string;
  icon?: React.ReactNode | string; // Allow string for emojis
  description: string;
}

export interface ToolComment {
  id: string;
  toolId: string;
  userId: string;
  username: string; // denormalized for display
  avatarUrl?: string; // denormalized for display
  text: string;
  upvotes: number;
  createdAt: Date;
}

export type PricingTier = 'Free' | 'Freemium' | 'Paid' | 'Contact Us';
export type SourceType = 'Open Source' | 'Closed Source';

export interface Tool {
  id:string;
  name: string;
  logoUrl: string;
  shortDescription: string;
  fullDescription: string;
  websiteUrl: string;
  screenshots: string[]; // URLs or base64 strings
  features: string[];
  useCases: string[]; // New field
  upvotes: number;
  categories: string[]; // Changed from category: string
  tags: string[];
  pricing: PricingTier;
  source: SourceType;
  publicGuide?: string;
  comments: ToolComment[];
  submittedBy?: string; // userId
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  userId: string;
  username: string; // denormalized
  avatarUrl?: string; // denormalized
  upvotes: number;
  createdAt: Date;
  commentCount: number; // To display on ThreadCard
  tags?: string[];
}

export interface ForumComment {
  id: string;
  threadId: string;
  userId: string;
  username: string; // denormalized
  avatarUrl?: string; // denormalized
  text: string;
  upvotes: number;
  createdAt: Date;
}

export interface NewsletterIssue {
  id: string;
  title: string;
  content: string; // HTML content
  sentAt: Date;
  summary?: string;
}

// For AI Search
export interface AISearchSuggestion {
  categories: string[]; // Category names or IDs
  keywords: string[];
}

// For AI tool details generation
export interface AIGeneratedToolDetails {
  name?: string;
  shortDescription?: string;
  fullDescription?: string;
  features?: string[];
  categories?: string[]; // Changed from category: string (category name or ID from AI)
  useCases?: string[]; // New field
  tags?: string[];
  logoUrl?: string; 
  pricing?: PricingTier;
  source?: SourceType;
}