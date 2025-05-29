import { supabase } from './supabaseClient';
import { User } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  isAdmin: boolean;
  favorites: string[];
}

// Convert Supabase auth user + profile to our User type
function convertToUser(authUser: any, profile: any): User {
  return {
    id: authUser.id,
    username: profile?.username || authUser.email?.split('@')[0] || 'User',
    email: authUser.email,
    avatarUrl: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.username || authUser.email}&background=6C4DFF&color=fff&size=128`,
    isAdmin: profile?.is_admin || false,
    favorites: profile?.favorites || [],
  };
}

// Sign up with email and password
export async function signUp(email: string, password: string, username?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username: username || email.split('@')[0] } }
  });
  if (error) throw error;
  return data;
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user with profile
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch profile from the profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    username: profile?.username || user.user_metadata?.username || user.email?.split('@')[0] || 'User',
    avatarUrl: profile?.avatar_url || '',
    isAdmin: !!profile?.is_admin,
    favorites: profile?.favorites || [],
  };
}

// Update user profile
export async function updateProfile(updates: Partial<{ username: string; avatar_url: string }>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) throw error;
}

// Add/remove favorites
export async function updateFavorites(favorites: string[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const { error } = await supabase
    .from('profiles')
    .update({ favorites })
    .eq('id', user.id);

  if (error) throw error;
}

// Reset password
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
}

// Update password
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
}

// Force refresh current user (useful after profile updates)
export async function refreshCurrentUser(): Promise<User | null> {
  console.log('Force refreshing current user...');
  
  try {
    // Force refresh the session first
    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
    
    if (sessionError) {
      console.error('Error refreshing session:', sessionError);
    }
    
    // Get fresh user data
    const user = await getCurrentUser();
    console.log('User refreshed:', user?.id, 'isAdmin:', user?.isAdmin);
    return user;
  } catch (error) {
    console.error('Error refreshing user:', error);
    return null;
  }
}

// Emergency reset function for debugging
export function emergencyAuthReset() {
  console.log('🚨 Emergency auth reset triggered');
  
  // Clear any stored auth data
  localStorage.clear();
  sessionStorage.clear();
  
  // Force reload the page
  window.location.reload();
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).emergencyAuthReset = emergencyAuthReset;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state change:', event, session?.user?.id);
    
    try {
      if (session?.user) {
        const user = await getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    } catch (error) {
      console.error('Error in auth state change:', error);
      // Still call callback with null to prevent infinite loading
      callback(null);
    }
  });
} 