package com.tarotgarden.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // SharePluginPatch를 먼저 등록하여 BroadcastReceiver 문제 방지
        registerPlugin(SharePluginPatch.class);
        
        // Android 11 (API 30) 이상에서 Edge-to-Edge 디스플레이 비활성화
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        super.onCreate(savedInstanceState);
    }
}