const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./web--a7yNW70.js","./index-DydaZsU0.js","./index-s1lkrEkt.css"])))=>i.map(i=>d[i]);
import{B as i,A as n,E as s}from"./index-DydaZsU0.js";const c=i("Share",{web:()=>n(()=>import("./web--a7yNW70.js"),__vite__mapDeps([0,1,2]),import.meta.url).then(a=>new a.ShareWeb)}),l=async()=>{},f=async(a,e,t)=>{try{if(navigator.share)return await navigator.share({title:a,text:e,url:t}),!0;if(s.isNativePlatform())try{return await c.share({title:a,text:e,url:t,dialogTitle:"공유하기"}),!0}catch(o){console.log("⚠️ Capacitor Share 플러그인을 사용할 수 없음:",o)}const r=`${a}

${e}

${t}`;return await navigator.clipboard.writeText(r),!1}catch(r){if(console.error("공유 실패:",r),r instanceof Error&&r.name==="AbortError")return!1;throw r}};export{l as initializeShare,f as shareWithNative};
