package com.tarotgarden.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // SharePluginPatch를 먼저 등록하여 BroadcastReceiver 문제 방지
        registerPlugin(SharePluginPatch.class);
        
        super.onCreate(savedInstanceState);
        
        // WebView 캐시 비활성화 (개발/디버깅용)
        WebView webView = getBridge().getWebView();
        WebSettings webSettings = webView.getSettings();
        webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        // setAppCacheEnabled는 API 33부터 제거됨 (Android 13+)
        
        // 디버깅용 - 항상 최신 컨텐츠 로드
        webView.clearCache(true);
        webView.clearHistory();
    }
}