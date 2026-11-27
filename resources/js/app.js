import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

// Errors inside components are logged rather than left to stop the page.
app.config.errorHandler = (error, instance, info) => {
  console.error(`Component error (${info}):`, error);
};

app.mount('#app');
