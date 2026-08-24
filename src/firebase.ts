/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App instance singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Firestore Database
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' 
  ? firebaseConfig.firestoreDatabaseId 
  : undefined
);

// Google Auth Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle() {
  try {
    const authPromise = signInWithPopup(auth, googleProvider);
    const timeoutPromise = new Promise<{ user: null; error: string }>((_, reject) => 
      setTimeout(() => reject(new Error("GOOGLE_SIGNIN_TIMEOUT")), 60000)
    );
    const result: any = await Promise.race([authPromise, timeoutPromise]);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('[Firebase Auth] Google Sign-In error:', error);
    if (error?.message === 'GOOGLE_SIGNIN_TIMEOUT') {
      return { user: null, error: 'Google Sign-In timed out. Please try again.' };
    }
    return { user: null, error: error?.message || 'Failed to sign in with Google' };
  }
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string) {
  try {
    const loginPromise = signInWithEmailAndPassword(auth, email.trim(), pass);
    const timeoutPromise = new Promise<{ user: null; error: string }>((_, reject) => 
      setTimeout(() => reject(new Error("AUTH_TIMEOUT")), 6000)
    );
    const result: any = await Promise.race([loginPromise, timeoutPromise]);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('[Firebase Auth] Email login error:', error);
    if (error?.message === 'AUTH_TIMEOUT') {
      return { user: null, error: 'Authentication request timed out. Please verify your internet connection.' };
    }
    let msg = 'Failed to sign in with email and password.';
    if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password') {
      msg = 'Invalid email or password. Please check your credentials or create a new account.';
    } else if (error?.code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.';
    } else if (error?.code === 'auth/too-many-requests') {
      msg = 'Too many failed login attempts. Please reset your password or try again later.';
    } else if (error?.code === 'auth/operation-not-allowed') {
      msg = 'Email/password authentication is not enabled. Please sign in with Google or continue in demo mode.';
    }
    return { user: null, error: msg };
  }
}

/**
 * Register a new user with Email and Password
 */
export async function registerWithEmail(email: string, pass: string, displayName: string) {
  try {
    const registerPromise = createUserWithEmailAndPassword(auth, email.trim(), pass);
    const timeoutPromise = new Promise<{ user: null; error: string }>((_, reject) => 
      setTimeout(() => reject(new Error("AUTH_TIMEOUT")), 5000)
    );
    const result: any = await Promise.race([registerPromise, timeoutPromise]);
    if (result?.user && displayName.trim()) {
      try {
        await updateProfile(result.user, {
          displayName: displayName.trim(),
          photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(displayName.trim())}`
        });
      } catch (profileErr) {
        console.warn('[Firebase Auth] Could not update profile display name:', profileErr);
      }
    }
    return { user: result?.user || null, error: null };
  } catch (error: any) {
    console.error('[Firebase Auth] Registration error:', error);
    if (error?.message === 'AUTH_TIMEOUT') {
      // Non-blocking timeout allows seamless local creation
      return { user: null, error: null, timeout: true };
    }
    let msg = 'Failed to create account.';
    if (error?.code === 'auth/email-already-in-use') {
      msg = 'An account with this email already exists. Please sign in instead.';
      return { user: null, error: msg };
    } else if (error?.code === 'auth/weak-password') {
      msg = 'Password is too weak. Please use at least 6 characters.';
      return { user: null, error: msg };
    } else if (error?.code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.';
      return { user: null, error: msg };
    } else if (error?.code === 'auth/operation-not-allowed' || error?.code === 'auth/admin-restricted-operation') {
      // Fallback mode if Firebase Email Auth is not enabled on the project
      return { user: null, error: null, fallbackMode: true };
    }
    return { user: null, error: msg };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  try {
    const resetPromise = sendPasswordResetEmail(auth, email.trim());
    const timeoutPromise = new Promise<{ success: boolean; error: string }>((_, reject) => 
      setTimeout(() => reject(new Error("AUTH_TIMEOUT")), 6000)
    );
    await Promise.race([resetPromise, timeoutPromise]);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('[Firebase Auth] Password reset error:', error);
    if (error?.message === 'AUTH_TIMEOUT') {
      return { success: false, error: 'Password reset request timed out. Please try again.' };
    }
    return { success: false, error: error?.message || 'Failed to send password reset email' };
  }
}

/**
 * Sign out current user
 */
export async function logOutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('[Firebase Auth] Sign out error:', error);
    return { success: false };
  }
}

/**
 * Get current Auth ID token for verified server-side calls
 */
export async function getCurrentIdToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch (e) {
    return null;
  }
}
