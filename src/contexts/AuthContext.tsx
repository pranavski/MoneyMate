import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { setCookie, getCookie, deleteCookie, STAY_SIGNED_IN_COOKIE } from '@/lib/cookies';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, staySignedIn?: boolean) => Promise<{ error: any }>;
  signInWithUsername: (username: string, password: string, staySignedIn?: boolean) => Promise<{ error: any }>;
  signUp: (email: string, password: string, staySignedIn?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  isStaySignedInEnabled: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, staySignedIn: boolean = false) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && staySignedIn) {
      setCookie(STAY_SIGNED_IN_COOKIE, 'true', 30); // 30 days
    }
    
    return { error };
  };

  const signInWithUsername = async (username: string, password: string, staySignedIn: boolean = false) => {
    // Convert username to email format for Supabase auth
    const email = `${username}@moneymate.local`;
    return await signIn(email, password, staySignedIn);
  };

  const signUp = async (email: string, password: string, staySignedIn: boolean = false) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (!error && staySignedIn) {
      setCookie(STAY_SIGNED_IN_COOKIE, 'true', 30); // 30 days
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    deleteCookie(STAY_SIGNED_IN_COOKIE);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const isStaySignedInEnabled = () => {
    return getCookie(STAY_SIGNED_IN_COOKIE) === 'true';
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signInWithUsername,
    signUp,
    signOut,
    resetPassword,
    isStaySignedInEnabled,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
