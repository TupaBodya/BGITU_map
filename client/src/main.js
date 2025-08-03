import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// Настройка базового URL для API
axios.defaults.baseURL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'http://localhost:3001';

const app = createApp(App);

app.config.globalProperties.$http = axios;

app.use(router);
app.mount('#app');