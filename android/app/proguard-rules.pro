# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# ========================================
# Google Play 크래시 방지를 위한 강화된 설정
# ========================================

# 디버깅 정보 완전 보존 (Play Console 크래시 리포트용)
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# ========================================
# Capacitor Core - 완전 보호
# ========================================
-keep class com.getcapacitor.** { *; }
-keep class com.ionicframework.** { *; }
-keep interface com.getcapacitor.** { *; }
-keepclassmembers class com.getcapacitor.** { *; }
-keepclasseswithmembers class com.getcapacitor.** { *; }

# Capacitor Bridge 및 Plugin 시스템
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class * implements com.getcapacitor.Plugin { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep @com.getcapacitor.annotation.* class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.annotation.* <methods>;
}

# Capacitor JavaScript 브릿지
-keep class com.getcapacitor.JSObject { *; }
-keep class com.getcapacitor.JSArray { *; }
-keep class com.getcapacitor.JSValue { *; }
-keep class com.getcapacitor.PluginCall { *; }
-keep class com.getcapacitor.PluginResult { *; }
-keep class com.getcapacitor.Bridge { *; }
-keep class com.getcapacitor.BridgeActivity { *; }
-keep class com.getcapacitor.PluginMethodData { *; }

# ========================================
# 웹뷰 관련 - 완전 보호
# ========================================
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-keep class android.webkit.** { *; }
-keep class * extends android.webkit.WebViewClient { *; }
-keep class * extends android.webkit.WebChromeClient { *; }

# ========================================
# Capacitor 플러그인들 - 완전 보호
# ========================================
-keep class com.capacitorjs.plugins.** { *; }
-keepclassmembers class com.capacitorjs.plugins.** { *; }

# Share Plugin 특별 보호
-keep class com.capacitorjs.plugins.share.** { *; }
-keep class com.getcapacitor.community.share.** { *; }

# ========================================
# 앱 패키지 - 완전 보호
# ========================================
-keep class com.tarotgarden.app.** { *; }
-keepclassmembers class com.tarotgarden.app.** { *; }

# MainActivity와 SharePluginPatch 특별 보호
-keep class com.tarotgarden.app.MainActivity { *; }
-keep class com.tarotgarden.app.SharePluginPatch { *; }

# ========================================
# RevenueCat - 완전 보호
# ========================================
-keep class com.revenuecat.purchases.** { *; }
-keep interface com.revenuecat.purchases.** { *; }
-keepclassmembers class com.revenuecat.purchases.** { *; }
-keep class com.android.billingclient.api.** { *; }

# ========================================
# AdMob - 완전 보호
# ========================================
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }
-keep class com.google.android.gms.common.** { *; }
-dontwarn com.google.android.gms.ads.**

# ========================================
# Android 시스템 컴포넌트
# ========================================

# BroadcastReceiver 관련
-keep class * extends android.content.BroadcastReceiver { *; }
-keepclassmembers class * extends android.content.BroadcastReceiver {
    public void onReceive(android.content.Context, android.content.Intent);
}

# Service 관련
-keep class * extends android.app.Service { *; }

# Activity 관련
-keep class * extends android.app.Activity { *; }

# ContentProvider 관련
-keep class * extends android.content.ContentProvider { *; }

# ========================================
# Reflection 및 동적 로딩 보호
# ========================================
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod public *;
}

# 모든 public 메소드 보존 (Capacitor 플러그인용)
-keepclassmembers class com.capacitorjs.plugins.** {
    public <methods>;
}

# ========================================
# JSON 및 Serialization
# ========================================
-keepattributes Signature
-keep class com.google.gson.** { *; }
-keep class org.json.** { *; }

# Serializable 클래스 보호
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ========================================
# Native 메소드
# ========================================
-keepclasseswithmembernames class * {
    native <methods>;
}

# ========================================
# Enum 보호
# ========================================
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ========================================
# 경고 무시
# ========================================
-dontwarn org.apache.http.**
-dontwarn android.net.http.AndroidHttpClient
-dontwarn com.google.android.gms.**
-dontwarn com.android.volley.**
-dontwarn okhttp3.**
-dontwarn okio.**

# ========================================
# 추가 최적화 비활성화 (Play Store 크래시 방지)
# ========================================
-dontoptimize
-dontobfuscate
-verbose
