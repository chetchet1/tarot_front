<template>
  <div class="auth-confirm-page">
    <div class="card">
      <h1 class="title">링크 확인 중…</h1>
      <p class="desc" v-if="status === 'loading'">잠시만 기다려주세요.</p>
      <p class="desc error" v-else-if="status === 'error'">{{ message }}</p>
      <p class="desc" v-else>완료되었습니다. 이동 중…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../services/supabase';

type Status = 'loading' | 'success' | 'error';
const status = ref<Status>('loading');
const message = ref('');

const route = useRoute();
const router = useRouter();

const getQueryValue = (key: string) => {
  const v = (route.query as Record<string, unknown>)[key];
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return null;
};

const tryOpenAppOnMobileWeb = (tokenHash: string, type: string, next?: string | null) => {
  const isMobileWeb =
    !Capacitor.isNativePlatform() && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobileWeb) return;

  const triedKey = 'tarot_auth_confirm_deeplink_tried';
  const alreadyTried = sessionStorage.getItem(triedKey) === '1';
  if (alreadyTried) return;
  sessionStorage.setItem(triedKey, '1');

  const qs = new URLSearchParams();
  qs.set('token_hash', tokenHash);
  qs.set('type', type);
  if (next) qs.set('next', next);
  const deepLink = `com.tarotgarden.app://auth/confirm?${qs.toString()}`;
  console.log('📱 모바일 웹 - 앱 딥링크 시도:', deepLink);
  window.location.href = deepLink;
};

onMounted(async () => {
  const token_hash = getQueryValue('token_hash') || getQueryValue('tokenHash');
  const type = (getQueryValue('type') || '').toLowerCase();
  const next = getQueryValue('next');

  if (!token_hash || !type) {
    status.value = 'error';
    message.value = '링크가 올바르지 않습니다. (token_hash/type 누락)';
    return;
  }

  // PC에서는 그대로 웹에서 진행. 모바일 웹은 앱을 우선 시도(미설치면 웹에서 계속 진행).
  tryOpenAppOnMobileWeb(token_hash, type, next);

  // If the deep-link succeeds, the browser will lose focus.
  await new Promise((r) => setTimeout(r, 800));
  if (!document.hasFocus()) return;

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      // Supabase supports values like: recovery, email, signup, magiclink, invite, email_change
      type: type as any
    });
    if (error) throw error;

    status.value = 'success';

    // After verifyOtp, session should be established for recovery flows.
    if (type === 'recovery') {
      await router.replace({ name: 'PasswordReset', query: { type: 'recovery' } });
      return;
    }
    if (type === 'email' || type === 'signup') {
      await router.replace({ name: 'EmailVerified', query: { type: 'signup' } });
      return;
    }

    // Fallback
    await router.replace(next || '/');
  } catch (e: any) {
    status.value = 'error';
    message.value = e?.message || '링크 확인 중 오류가 발생했습니다.';
  }
});
</script>

<style scoped>
.auth-confirm-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
}
.card {
  width: 100%;
  max-width: 520px;
  border-radius: 18px;
  padding: 28px 22px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}
.title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}
.desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}
.error {
  color: #b91c1c;
}
</style>

