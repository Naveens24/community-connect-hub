import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  skills: string[];
  helpsGiven: number;
  activeCity?: string;
  createdAt: any;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserProfile = async (user: User, name?: string) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const newProfile: Omit<UserProfile, 'createdAt'> & { createdAt: any } = {
        uid: user.uid,
        name: name || user.displayName || 'Anonymous User',
        email: user.email || '',
        photoURL: user.photoURL || '',
        skills: [],
        helpsGiven: 0,
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, newProfile);
      return { ...newProfile, createdAt: new Date() } as UserProfile;
    }
    return userSnap.data() as UserProfile;
  };

  const fetchUserProfile = async (user: User) => {
    const profile = await createUserProfile(user);
    setUserProfile(profile);
  };

  const refreshUserProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  };

  // Handle redirect result on app load
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('Checking for redirect result...');
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('Redirect sign-in successful:', result.user.email);
          const profile = await createUserProfile(result.user);
          setUserProfile(profile);
          setCurrentUser(result.user);
          
          // Check if profile is incomplete (no activeCity) and redirect to complete-profile
          if (!profile.activeCity) {
            console.log('Profile incomplete, redirecting to complete-profile');
            window.location.href = '/complete-profile';
          } else {
            console.log('Profile complete, user is ready');
          }
        } else {
          console.log('No redirect result found');
        }
      } catch (error: any) {
        console.error('Redirect sign-in error:', error.code, error.message);
      }
    };

    handleRedirectResult();
  }, []);

  // Global auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      try {
        if (user) {
          // Ensure a Firestore user document exists for ALL auth methods
          await fetchUserProfile(user);
        } else {
          setUserProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Google Sign-In using redirect method
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      await signInWithRedirect(auth, provider);
      // Note: The redirect will navigate away from the page
      // The result is handled by getRedirectResult on page load
    } catch (error: any) {
      console.error('Google sign-in redirect error:', error.code, error.message);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = await createUserProfile(result.user);
    setUserProfile(profile);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const profile = await createUserProfile(result.user, name);
    setUserProfile(profile);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
