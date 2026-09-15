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
import { getFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import rawConfig from '../firebase-applet-config.json';

// Build environment-aware Firebase Config supporting Vercel and custom env overrides
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};
const firebaseConfig = {
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId || "witty-skyline-9dw25",
  appId: metaEnv.VITE_FIREBASE_APP_ID || rawConfig.appId || "1:424771510171:web:dac4ab2c008c66eacb0b3e",
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || rawConfig.apiKey || "AIzaSyAhtm8DoUlgxDqHDtGQ7ERzqYVarvFwMgI",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain || "witty-skyline-9dw25.firebaseapp.com",
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_FIRESTORE_DATABASE_ID || rawConfig.firestoreDatabaseId || "(default)",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket || "witty-skyline-9dw25.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId || "424771510171",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || rawConfig.measurementId || "",
  oAuthClientId: metaEnv.VITE_FIREBASE_OAUTH_CLIENT_ID || (rawConfig as any).oAuthClientId || ""
};

// Set log level to silent to prevent flooding console with internal retry backoff logs
try {
  setLogLevel('silent');
} catch {}

// Initialize Firebase App instance singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Firestore Database with explicit database ID
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' 
    ? firebaseConfig.firestoreDatabaseId 
    : undefined
);

// Google Auth Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Genuine Sign in with Google via Firebase Auth Popup
 */
export async function signInWithGoogle(): Promise<{ user: any; error: string | null; errorCode?: string; domain?: string }> {
  try {
    const authPromise = signInWithPopup(auth, googleProvider);
    const timeoutPromise = new Promise<{ user: null; error: string }>((_, reject) => 
      setTimeout(() => reject(new Error("GOOGLE_SIGNIN_TIMEOUT")), 45000)
    );
    const result: any = await Promise.race([authPromise, timeoutPromise]);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('[Firebase Auth] Google Sign-In error:', error);
    if (error?.message === 'GOOGLE_SIGNIN_TIMEOUT') {
      return { user: null, error: 'Google Sign-In request timed out. Please try again.', errorCode: 'timeout' };
    }

    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'your deployment domain';

    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('auth/unauthorized-domain')) {
      return {
        user: null,
        error: `Unauthorized Domain (${currentDomain}): Please add "${currentDomain}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`,
        errorCode: 'auth/unauthorized-domain',
        domain: currentDomain
      };
    }

    if (error?.code === 'auth/popup-closed-by-user') {
      return { user: null, error: 'Google sign-in popup was closed before completing authentication.', errorCode: 'auth/popup-closed-by-user' };
    }

    if (error?.code === 'auth/cancelled-popup-request') {
      return { user: null, error: 'Another sign-in popup is already open. Please complete or close the existing window.', errorCode: 'auth/cancelled-popup-request' };
    }

    if (error?.code === 'auth/popup-blocked') {
      return { user: null, error: 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.', errorCode: 'auth/popup-blocked' };
    }

    if (error?.code === 'auth/network-request-failed') {
      return { user: null, error: 'Network request failed. Please check your internet connection.', errorCode: 'auth/network-request-failed' };
    }

    if (error?.code === 'auth/operation-not-allowed') {
      return {
        user: null,
        error: 'Google Sign-In is not enabled in your Firebase Project. Please enable the Google provider in Firebase Console -> Authentication -> Sign-in method.',
        errorCode: 'auth/operation-not-allowed'
      };
    }

    if (error?.code === 'auth/api-key-not-valid' || error?.message?.toLowerCase().includes('api-key-not-valid') || error?.message?.toLowerCase().includes('api_key_invalid')) {
      return {
        user: null,
        error: 'Firebase Auth API key issue detected. In Google Cloud Console, ensure the Identity Toolkit API is enabled and your API key allows browser requests.',
        errorCode: 'auth/api-key-not-valid'
      };
    }

    return { user: null, error: error?.message || 'Failed to sign in with Google.', errorCode: error?.code || 'unknown' };
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
