import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { 
  getCurrentUser, 
  signIn, 
  signUp, 
  signOut, 
  updateFavorites, 
  onAuthStateChange,
  refreshCurrentUser
} from '../services/supabaseAuthService';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  addFavoriteTool: (toolId: string) => Promise<void>;
  removeFavoriteTool: (toolId: string) => Promise<void>;
  isFavorite: (toolId: string) => boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(setCurrentUser).finally(() => setIsLoading(false));
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    await signIn(email, password);
    setCurrentUser(await getCurrentUser());
    setIsLoading(false);
  };

  const handleSignUp = async (email: string, password: string, username?: string) => {
    setIsLoading(true);
    await signUp(email, password, username);
    setCurrentUser(await getCurrentUser());
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await signOut();
    setCurrentUser(null);
    setIsLoading(false);
  };

  const addFavoriteTool = async (toolId: string) => {
    if (!currentUser) return;
    
    const newFavorites = [...currentUser.favorites, toolId];
    
    // Optimistic update
    setCurrentUser(prevUser => 
      prevUser ? { ...prevUser, favorites: newFavorites } : null
    );
    
    try {
      await updateFavorites(newFavorites);
    } catch (error) {
      console.error("Failed to add favorite:", error);
      // Revert optimistic update
      setCurrentUser(prevUser => 
        prevUser ? { ...prevUser, favorites: currentUser.favorites } : null
      );
      throw error;
    }
  };

  const removeFavoriteTool = async (toolId: string) => {
    if (!currentUser) return;
    
    const newFavorites = currentUser.favorites.filter(id => id !== toolId);
    
    // Optimistic update
    setCurrentUser(prevUser => 
      prevUser ? { ...prevUser, favorites: newFavorites } : null
    );
    
    try {
      await updateFavorites(newFavorites);
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      // Revert optimistic update
      setCurrentUser(prevUser => 
        prevUser ? { ...prevUser, favorites: currentUser.favorites } : null
      );
      throw error;
    }
  };

  const isFavorite = (toolId: string): boolean => {
    return !!currentUser?.favorites.includes(toolId);
  };

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      await refreshCurrentUser();
      // User will be set via onAuthStateChange
    } catch (error) {
      console.error("Failed to refresh user", error);
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoading, 
      signIn: handleSignIn, 
      signUp: handleSignUp, 
      logout, 
      addFavoriteTool, 
      removeFavoriteTool, 
      isFavorite, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
    