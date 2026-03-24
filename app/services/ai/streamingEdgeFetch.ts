/**
 * Edge Function 스트리밍 fetch 헬퍼
 * OpenAI reasoning model(gpt-5-nano) 타임아웃 방지를 위한 공통 모듈
 */
import { supabase } from '../supabase';
import { logger } from '../debugLogger';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yxywzsmggvxxujuplyly.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eXd6c21nZ3Z4eHVqdXBseWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTk2ODUsImV4cCI6MjA2OTEzNTY4NX0.8w3JYOmbmJKdzz9H0_GfgspIfb0SfjjOvkyxPNvFVSM';
const TIMEOUT_MS = 180000; // 3분

/**
 * Edge Function을 스트리밍 방식으로 호출하여 해석 텍스트를 수신합니다.
 * supabase.functions.invoke 대신 직접 fetch를 사용하여 스트리밍 응답을 처리합니다.
 */
export async function fetchInterpretationStream(
  body: Record<string, any>,
  label: string = 'EdgeFunction'
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  logger.log(`[${label}] Edge Function 스트리밍 호출 시작`);

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-interpretation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': SUPABASE_KEY
        },
        body: JSON.stringify(body),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      logger.log(`[${label}] Edge Function HTTP 에러: ${response.status}`);
      throw new Error(`Edge Function 오류: ${response.status}`);
    }

    // 스트리밍 응답 수신
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let interpretation = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const cleanChunk = chunk.replace(/\n?\[DONE\]\n?/g, '');
      if (cleanChunk) {
        interpretation += cleanChunk;
      }
    }

    logger.log(`[${label}] 스트리밍 수신 완료: ${interpretation.length}자`);

    if (!interpretation || interpretation.length === 0) {
      throw new Error('빈 해석 응답');
    }

    return interpretation;
  } catch (error) {
    clearTimeout(timeoutId);
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.log(`[${label}] 스트리밍 fetch 실패: ${errMsg}`);
    throw error;
  }
}
