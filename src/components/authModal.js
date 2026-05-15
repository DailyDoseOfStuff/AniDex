/**
 * Auth Modal Component
 * Sign-in / Sign-up dialog with Google, Email/Password, and Anonymous options
 */
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest } from '../auth.js';

let currentAuthModal = null;

/**
 * Show the auth modal
 */
export function showAuthModal() {
  closeAuthModal();

  const root = document.getElementById('modal-root');
  let mode = 'signin'; // 'signin' | 'signup'
  let loading = false;
  let error = '';
  let turnstileToken = null;
  let turnstileWidgetId = null;

  // Create backdrop (also serves as flex centering container)
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm backdrop-enter flex items-center justify-center';
  backdrop.id = 'auth-modal-backdrop';
  backdrop.addEventListener('click', closeAuthModal);

  // Create modal (nested inside backdrop for reliable centering)
  const modal = document.createElement('div');
  modal.className = 'bg-surface-container-high border border-white/10 rounded-2xl shadow-2xl w-[90vw] max-w-[420px] popup-enter overflow-hidden';
  modal.id = 'auth-modal';
  modal.addEventListener('click', e => e.stopPropagation());

  function render() {
    const isSignIn = mode === 'signin';
    modal.innerHTML = `
      <div class="p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <span class="text-2xl font-black text-sky-400 tracking-tighter font-['Be_Vietnam_Pro']">AniTrack</span>
          <h2 class="font-headline-md text-headline-md text-on-surface mt-3">${isSignIn ? 'Welcome Back' : 'Create Account'}</h2>
          <p class="text-on-surface-variant font-body-md mt-1">${isSignIn ? 'Sign in to sync your anime list' : 'Join to save your anime list across devices'}</p>
        </div>

        ${error ? `
          <div class="bg-error/10 border border-error/20 text-error rounded-lg px-4 py-3 mb-6 font-body-md text-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">error</span>
            ${error}
          </div>
        ` : ''}

        <!-- Google Sign-In -->
        <button id="auth-google-btn" class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-800 font-label-lg text-label-lg hover:bg-gray-100 transition-colors mb-3 ${loading ? 'opacity-50 pointer-events-none' : ''}">
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-4 my-6">
          <div class="flex-1 h-px bg-white/10"></div>
          <span class="text-on-surface-variant font-label-md text-label-md">or</span>
          <div class="flex-1 h-px bg-white/10"></div>
        </div>

        <!-- Email/Password Form -->
        <form id="auth-email-form" class="space-y-3">
          <input
            id="auth-email"
            type="email"
            placeholder="Email address"
            required
            class="w-full px-4 py-3 rounded-xl bg-surface-container border border-white/10 text-on-surface font-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
          />
          <input
            id="auth-password"
            type="password"
            placeholder="Password"
            required
            minlength="6"
            class="w-full px-4 py-3 rounded-xl bg-surface-container border border-white/10 text-on-surface font-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
          />
          
          <!-- Human Verification (Cloudflare Turnstile) -->
          <div id="turnstile-container" class="flex justify-center min-h-[65px]"></div>
          
          <button type="submit" class="w-full px-4 py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary/90 transition-colors ${loading ? 'opacity-50 pointer-events-none' : ''}">
            ${loading ? `
              <span class="inline-flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                Please wait...
              </span>
            ` : (isSignIn ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <!-- Toggle mode -->
        <p class="text-center text-on-surface-variant font-body-md mt-6">
          ${isSignIn ? "Don't have an account?" : "Already have an account?"}
          <button id="auth-toggle-mode" class="text-primary font-label-lg ml-1 hover:underline">${isSignIn ? 'Sign Up' : 'Sign In'}</button>
        </p>

        <!-- Anonymous -->
        <div class="mt-4 pt-4 border-t border-white/5 text-center pb-2">
          <button id="auth-guest-btn" class="w-full py-3 text-on-surface-variant font-body-md hover:text-on-surface transition-colors rounded-lg hover:bg-white/5 ${loading ? 'opacity-50 pointer-events-none' : ''}">
            <span class="inline-flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">person_off</span>
              Continue as Guest
            </span>
          </button>
        </div>
      </div>
    `;

    // Event listeners
    modal.querySelector('#auth-google-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      loading = true;
      error = '';
      const btn = modal.querySelector('#auth-google-btn');
      if (btn) btn.classList.add('opacity-50', 'pointer-events-none');
      try {
        await signInWithGoogle();
        closeAuthModal();
      } catch (e) {
        error = _friendlyError(e.code);
        loading = false;
        render();
      }
    });

    modal.querySelector('#auth-email-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const email = modal.querySelector('#auth-email').value;
      const password = modal.querySelector('#auth-password').value;
      if (!turnstileToken) {
        error = 'Please complete the human verification.';
        render();
        return;
      }

      loading = true;
      error = '';
      const submitBtn = modal.querySelector('#auth-email-form button[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('opacity-50', 'pointer-events-none');
        submitBtn.innerHTML = '<span class="inline-flex items-center gap-2"><span class="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>Please wait...</span>';
      }
      try {
        if (isSignIn) {
          await signInWithEmail(email, password);
        } else {
          await signUpWithEmail(email, password);
        }
        closeAuthModal();
      } catch (e) {
        error = _friendlyError(e.code);
        loading = false;
        render();
      }
    });

    modal.querySelector('#auth-toggle-mode').addEventListener('click', () => {
      mode = isSignIn ? 'signup' : 'signin';
      error = '';
      turnstileToken = null;
      render();
    });

    modal.querySelector('#auth-guest-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      loading = true;
      error = '';
      // Show loading state without full re-render to preserve async flow
      const btn = modal.querySelector('#auth-guest-btn');
      if (btn) {
        btn.classList.add('opacity-50', 'pointer-events-none');
        btn.innerHTML = '<span class="inline-flex items-center gap-2"><span class="w-4 h-4 border-2 border-on-surface-variant/30 border-t-on-surface-variant rounded-full animate-spin"></span>Signing in...</span>';
      }
      try {
        await signInAsGuest();
        closeAuthModal();
      } catch (e) {
        error = _friendlyError(e.code);
        loading = false;
        render();
      }
    });

    // Render Turnstile
    if (window.turnstile) {
      if (turnstileWidgetId !== null) {
        window.turnstile.remove(turnstileWidgetId);
      }
      try {
        turnstileWidgetId = window.turnstile.render('#turnstile-container', {
          sitekey: '1x00000000000000000000AA', // Cloudflare dummy test key (always passes)
          theme: 'dark',
          callback: function(token) {
            turnstileToken = token;
          },
          'error-callback': function() {
            turnstileToken = null;
          }
        });
      } catch (e) {
        console.error('Turnstile render error:', e);
      }
    }
  }

  render();

  backdrop.appendChild(modal);
  root.appendChild(backdrop);
  currentAuthModal = { backdrop, modal };
}

/**
 * Close the auth modal
 */
export function closeAuthModal() {
  if (currentAuthModal) {
    currentAuthModal.backdrop.remove();
    currentAuthModal.modal.remove();
    currentAuthModal = null;
  }
}

/**
 * Convert Firebase error codes to friendly messages
 */
function _friendlyError(code) {
  const errors = {
    'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups for this site.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  };
  return errors[code] || 'Something went wrong. Please try again.';
}
