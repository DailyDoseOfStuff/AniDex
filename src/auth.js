/**
 * Authentication Service
 * Supports: Google, Email/Password, Anonymous
 * Manages auth state and notifies the app on changes.
 */
import { auth } from './firebase.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  linkWithPopup,
  linkWithCredential,
  EmailAuthProvider
} from 'firebase/auth';

// Current user state
let currentUser = null;
const authListeners = new Set();

/**
 * Initialize auth state listener — call once at app startup
 */
export function initAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      const previousUser = currentUser;
      currentUser = user;

      // Notify all listeners
      for (const fn of authListeners) {
        try { fn(user, previousUser); } catch (e) { console.error('Auth listener error:', e); }
      }

      // Dispatch global event for components
      window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));

      resolve(user);
    });
  });
}

/**
 * Subscribe to auth state changes
 * @returns {function} Unsubscribe function
 */
export function onAuthChange(callback) {
  authListeners.add(callback);
  return () => authListeners.delete(callback);
}

/**
 * Get the current user (or null)
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Check if user is logged in (non-anonymous)
 */
export function isLoggedIn() {
  return currentUser !== null && !currentUser.isAnonymous;
}

/**
 * Check if user is anonymous
 */
export function isAnonymous() {
  return currentUser?.isAnonymous === true;
}

// ========== Sign-In Methods ==========

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  // If currently anonymous, link the account instead
  if (currentUser && currentUser.isAnonymous) {
    try {
      const result = await linkWithPopup(currentUser, provider);
      return result.user;
    } catch (e) {
      // If linking fails (e.g. account already exists), sign in normally
      if (e.code === 'auth/credential-already-in-use') {
        const result = await signInWithPopup(auth, provider);
        return result.user;
      }
      throw e;
    }
  }

  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * Sign in with email/password
 */
export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Create account with email/password
 */
export async function signUpWithEmail(email, password) {
  // If currently anonymous, link the account
  if (currentUser && currentUser.isAnonymous) {
    try {
      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(currentUser, credential);
      return result.user;
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        // Fall through to normal sign-in
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
      }
      throw e;
    }
  }

  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Sign in anonymously (guest mode)
 */
export async function signInAsGuest() {
  const result = await signInAnonymously(auth);
  return result.user;
}

/**
 * Sign out
 */
export async function signOut() {
  await firebaseSignOut(auth);
}

/**
 * Get user display info
 */
export function getUserInfo() {
  if (!currentUser) return null;
  return {
    uid: currentUser.uid,
    displayName: currentUser.displayName || (currentUser.isAnonymous ? 'Guest' : 'User'),
    email: currentUser.email,
    photoURL: currentUser.photoURL,
    isAnonymous: currentUser.isAnonymous,
    providerId: currentUser.providerData?.[0]?.providerId || 'anonymous'
  };
}
