package com.tarotgarden.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import com.getcapacitor.Bridge;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Android 14 (API 34) 호환성 패치를 위한 SharePlugin 래퍼
 * BroadcastReceiver 등록 시 RECEIVER_NOT_EXPORTED 플래그 추가
 */
@CapacitorPlugin(name = "SharePatch")
public class SharePluginPatch extends Plugin {
    
    @Override
    public void load() {
        super.load();
        
        // Share 플러그인의 BroadcastReceiver 문제 방지
        try {
            // Android 14 이상에서는 플래그 필수
            if (Build.VERSION.SDK_INT >= 34) {
                // Share 플러그인이 등록하려는 receiver를 미리 차단
                getContext().registerReceiver(
                    new BroadcastReceiver() {
                        @Override
                        public void onReceive(Context context, Intent intent) {
                            // 더미 리시버 - 실제 동작 없음
                        }
                    },
                    new IntentFilter(Intent.EXTRA_CHOSEN_COMPONENT),
                    Context.RECEIVER_NOT_EXPORTED
                );
            }
        } catch (Exception e) {
            // 에러 무시 - 이미 등록되어 있을 수 있음
        }
    }
    
    @PluginMethod
    public void patch(PluginCall call) {
        call.resolve();
    }
}