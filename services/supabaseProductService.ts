import { supabase } from './supabaseClient';

export async function addProduct(product: any) {
  const { data, error } = await supabase.from('products').insert([product]);
  if (error) throw error;
  return data;
}

export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
}

export async function searchProductsAI(query: any) {
  // Placeholder: You will need to call an AI API or use pgvector for semantic search
  // For now, just do a simple text search
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .textSearch('name', query);
  if (error) throw error;
  return data;
} 