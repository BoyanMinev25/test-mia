"use client";

import React, { createContext, useEffect, useState, useRef } from "react";
import { 
  User,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithRedirect
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const initialAuthChecked = useRef(false);

  // Handle auth state and navigation
  useEffect(() => {
    let mounted = true;

    const handleAuthStateChange = async (user: User | null) => {
      if (!mounted) return;

      try {
        if (user) {
          setUser(user);
          const idToken = await user.getIdToken();
          document.cookie = `__session=${idToken}; path=/; max-age=3600; SameSite=Lax`;

          // Only redirect if we're on the login page
          if (pathname === '/login') {
            console.log('Authenticated user detected, navigating to dashboard');
            await router.replace('/dashboard');
          }
        } else {
          setUser(null);
          document.cookie = '__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

          // Only redirect to login if not already there and not on auth pages
          if (pathname !== '/login' && !pathname.startsWith('/auth/')) {
            console.log('Unauthenticated user detected, navigating to login');
            await router.replace('/login');
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        if (mounted) {
          // Always set loading to false after auth state is handled
          setLoading(false);
        }
      }
    };

    // Set up auth listener
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [pathname, router]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Email sign-in successful');
      // Don't wait for the redirect, let handleAuthStateChange handle it
      router.replace('/dashboard');
    } catch (error) {
      console.error('Sign-in error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log('Google sign-in successful');
      // Don't wait for the redirect, let handleAuthStateChange handle it
      router.replace('/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      console.log('Sign-out successful');
    } catch (error) {
      console.error('Sign-out error:', error);
      setLoading(false);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Bot className="w-12 h-12 text-primary-500" />
        </motion.div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut }}>{children}</AuthContext.Provider>;
}
