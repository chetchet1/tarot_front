# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# 디버깅 정보 보존 (Play Console 크래시 리포트용)
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*

# Capacitor 관련
-keep class com.getcapacitor.** { *; }
-keep class com.ionicframework.** { *; }
-keepclassmembers class com.getcapacitor.Bridge { *; }
-keepclassmembers class com.getcapacitor.PluginCall { *; }
-keepclassmembers class com.getcapacitor.Plugin { *; }

# 웹뷰 JavaScript 인터페이스
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface

# RevenueCat 관련
-keep class com.revenuecat.purchases.** { *; }
-keep interface com.revenuecat.purchases.** { *; }

# AdMob 관련
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }
-dontwarn com.google.android.gms.ads.**

# Capacitor 플러그인들
-keep class com.capacitorjs.plugins.** { *; }

# 앱 패키지
-keep class com.tarotgarden.app.** { *; }

# JSON 파싱 관련
-keepattributes Signature
-keep class com.google.gson.** { *; }

# Native 메소드 보존
-keepclasseswithmembernames class * {
    native <methods>;
}

# 경고 무시
-dontwarn org.apache.http.**
-dontwarn android.net.http.AndroidHttpClient
