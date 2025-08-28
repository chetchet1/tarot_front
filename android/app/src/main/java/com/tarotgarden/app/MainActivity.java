package com.tarotgarden.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // SharePluginPatch를 먼저 등록하여 BroadcastReceiver 문제 방지
        registerPlugin(SharePluginPatch.class);
        
        super.onCreate(savedInstanceState);
    }
}