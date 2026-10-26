import{defineConfig}from 'vite';import react from '@vitejs/plugin-react';
// In development, /api requests are forwarded to the Node/SQLite server (npm run server).
export default defineConfig({plugins:[react()],server:{proxy:{'/api':'http://localhost:3000'}}});
