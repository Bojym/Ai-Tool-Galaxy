import { supabase } from './supabaseClient';
import { Tool, PricingTier, SourceType } from '../types';
import { PLACEHOLDER_IMAGE_URL } from '../constants';

// Convert Supabase product to Tool format
export function convertSupabaseProductToTool(product: any): Tool {
  return {
    id: `supabase-${product.id}`, // Prefix to distinguish from mock tools
    name: product.name || 'Untitled Tool',
    logoUrl: product.logo_url || PLACEHOLDER_IMAGE_URL(100, 100, product.name || 'tool'),
    shortDescription: product.description || 'No description available.',
    fullDescription: product.description || 'No detailed description available.',
    websiteUrl: product.website_url || '',
    screenshots: product.screenshots || [
      PLACEHOLDER_IMAGE_URL(600, 400, `${product.name || 'tool'}1`),
      PLACEHOLDER_IMAGE_URL(600, 400, `${product.name || 'tool'}2`)
    ],
    features: product.features || [],
    useCases: product.use_cases || [],
    upvotes: 0, // Supabase products don't have upvotes yet
    categories: ['general'], // Default category for now - we'll improve this later
    tags: product.tags || [],
    pricing: (product.pricing as PricingTier) || 'Free',
    source: (product.source as SourceType) || 'Closed Source',
    publicGuide: '',
    comments: [],
    submittedBy: product.submitted_by || 'admin',
    createdAt: new Date(product.created_at || Date.now()),
    updatedAt: new Date(product.updated_at || Date.now()),
  };
}

export async function getSupabaseTools(): Promise<Tool[]> {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Supabase tools:', error);
      return [];
    }

    return (products || []).map(convertSupabaseProductToTool);
  } catch (error) {
    console.error('Error in getSupabaseTools:', error);
    return [];
  }
}

export async function getSupabaseToolById(id: string): Promise<Tool | null> {
  try {
    // Remove the "supabase-" prefix if present
    const supabaseId = id.startsWith('supabase-') ? id.replace('supabase-', '') : id;
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', supabaseId)
      .single();

    if (error || !product) {
      return null;
    }

    return convertSupabaseProductToTool(product);
  } catch (error) {
    console.error('Error in getSupabaseToolById:', error);
    return null;
  }
} 