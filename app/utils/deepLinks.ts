import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../services/supabase';
import router from '../router';

const hasSupabaseTokens = (params: URLSearchParams) => {
  return params.get('access_token') && params.get('refresh_token');
};

const buildHashFragment = (fragment: string) => {
  if (!fragment) return undefined;
  return fragment.startsWith('#') ? fragment : `#${fragment}`;
};

// 모바�?�용 딥링크 처리
export const setupDeepLinks = () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  const handleDeepLink = async (incomingUrl: string) => {
    try {
      console.log('[DeepLink] Received URL:', incomingUrl);
      const parsedUrl = new URL(incomingUrl);
      const fragment = incomingUrl.includes('#')
        ? incomingUrl.split('#')[1]
        : parsedUrl.hash.slice(1);
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      const isPasswordRecovery =
        parsedUrl.pathname.includes('auth/reset-password') || type === 'recovery';
      const isOAuthCallback = parsedUrl.pathname.includes('auth/callback');

      if (!hasSupabaseTokens(params)) {
        console.warn('[DeepLink] Supabase tokens were not found in the URL fragment');
        return;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken!,
        refresh_token: refreshToken!
      });

      if (error || !data.session) {
        console.error('[DeepLink] Failed to restore Supabase session from deep link', error);
        return;
      }

      if (isPasswordRecovery) {
        console.log('[DeepLink] Password recovery deep link detected');
        const target: { path: string; hash?: string } = { path: '/auth/reset-password' };
        const hashFragment = buildHashFragment(fragment);
        if (hashFragment) {
          target.hash = hashFragment;
        }
        await router.push(target);
        return;
      }

      if (isOAuthCallback) {
        console.log('[DeepLink] OAuth callback handled via deep link');
        await router.push('/');
        return;
      }

      console.warn('[DeepLink] No handler matched the incoming URL');
    } catch (error) {
      console.error('[DeepLink] Failed to process deep link:', error);
    }
  };

  App.addListener('appUrlOpen', (event) => {
    handleDeepLink(event.url);
  });

  App.getLaunchUrl().then((launchInfo) => {
    if (launchInfo?.url) {
      console.log('[DeepLink] App launched via URL:', launchInfo.url);
      handleDeepLink(launchInfo.url);
    }
  });
};
