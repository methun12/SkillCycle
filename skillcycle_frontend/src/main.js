import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router'; // Import the router configuration
import './assets/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router); // <-- THIS LINE ACTIVATES THE ROUTER

app.mount('#app');