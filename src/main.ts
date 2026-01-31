import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import './style.css';

console.log('App initializing...', import.meta.env.BASE_URL);

const app = createApp(App);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(createPinia());
app.use(router);
app.use(ElementPlus, {
  locale: zhCn,
});

// 添加错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err, info);
};

try {
  app.mount('#app');
  console.log('App mounted successfully');
} catch (err) {
  console.error('Failed to mount app:', err);
}
