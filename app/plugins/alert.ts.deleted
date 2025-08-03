import { App } from 'vue';
import { useAlert } from '../composables/useAlert';

export default {
  install(app: App) {
    // 전역 프로퍼티로 alert 추가
    app.config.globalProperties.$alert = useAlert();
    
    // provide/inject 패턴도 지원
    app.provide('alert', useAlert());
  }
};
