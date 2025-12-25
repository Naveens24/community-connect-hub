import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential
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
  hasPassword?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isNewUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  linkPassword: (password: string) => Promise<void>;
  clearNewUserFlag: () => void;
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
  const [isNewUser, setIsNewUser] = useState(false);
  const [redirectHandled, setRedirectHandled] = useState(false);

  // Check if user document exists (returns null if not)
  const checkUserExists = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  };

  // Create user profile document
  const createUserProfile = async (user: User, name?: string): Promise<UserProfile> => {
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
        hasPassword: false,
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, newProfile);
      return { ...newProfile, createdAt: new Date() } as UserProfile;
    }
    return userSnap.data() as UserProfile;
  };

  const fetchUserProfile = async (user: User): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const profile = userSnap.data() as UserProfile;
      setUserProfile(profile);
      return profile;
    }
    return null;
  };

  const refreshUserProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  };

  const clearNewUserFlag = () => {
    setIsNewUser(false);
  };

  // Handle redirect result FIRST, before onAuthStateChanged processes
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('Checking for redirect result...');
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          console.log('Redirect sign-in successful:', result.user.email);
          
          // Check if user document already exists
          const existingProfile = await checkUserExists(result.user.uid);
          
          if (!existingProfile) {
            // First-time user - create profile and set flag
            console.log('First-time user detected, creating profile...');
            const profile = await createUserProfile(result.user);
            setUserProfile(profile);
            setCurrentUser(result.user);
            setIsNewUser(true);
          } else if (!existingProfile.activeCity) {
            // User exists but hasn't completed profile
            console.log('Incomplete profile detected');
            setUserProfile(existingProfile);
            setCurrentUser(result.user);
            setIsNewUser(true);
          } else {
            // Returning user with complete profile
            console.log('Returning user with complete profile');
            setUserProfile(existingProfile);
            setCurrentUser(result.user);
            setIsNewUser(false);
          }
        } else {
          console.log('No redirect result found');
        }
      } catch (error: any) {
        console.error('Redirect sign-in error:', error.code, error.message);
      } finally {
        setRedirectHandled(true);
      }
    };

    handleRedirectResult();
  }, []);

  // Global auth state observer - waits for redirect handling to complete
  useEffect(() => {
    if (!redirectHandled) {
      return; // Wait for redirect handling to complete first
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email || 'No user');
      
      if (user) {
        setCurrentUser(user);
        
        // Only fetch profile if we don't already have it from redirect
        if (!userProfile || userProfile.uid !== user.uid) {
          const existingProfile = await checkUserExists(user.uid);
          
          if (existingProfile) {
            setUserProfile(existingProfile);
            // Check if profile is incomplete
            if (!existingProfile.activeCity) {
              setIsNewUser(true);
            }
          } else {
            // No profile exists - create one
            const profile = await createUserProfile(user);
            setUserProfile(profile);
            setIsNewUser(true);
          }
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setIsNewUser(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [redirectHandled, userProfile]);

  // Google Sign-In using redirect method
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error('Google sign-in redirect error:', error.code, error.message);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = await createUserProfile(result.user);
    setUserProfile(profile);
    
    if (!profile.activeCity) {
      setIsNewUser(true);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const profile = await createUserProfile(result.user, name);
    setUserProfile(profile);
    setIsNewUser(true); // New signup always goes to onboarding
  };

  // Link password to Google account
  const linkPassword = async (password: string) => {
    if (!currentUser || !currentUser.email) {
      throw new Error('No user logged in');
    }

    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await linkWithCredential(currentUser, credential);
    
    // Update profile to indicate password is set
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, { hasPassword: true }, { merge: true });
    
    // Refresh profile
    await refreshUserProfile();
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
    setIsNewUser(false);
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    isNewUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    refreshUserProfile,
    linkPassword,
    clearNewUserFlag
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
