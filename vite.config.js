import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5000,
        // HMR 웹소켓 활성화
        hmr: true,
        fs: {
            strict: false,
        },
        cors: true,
        // SPA 새로고침 문제 해결을 위한 historyApiFallback 설정
        historyApiFallback: true,
        // Proxy API requests to backend server
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
        },
        // Explicitly allowing the Replit domain
        allowedHosts: [
            '241da12e-4d7a-4547-a7a3-91484fa5e3ff-00-3bp3i4bs64oqr.spock.replit.dev',
            '.replit.dev',
            '.repl.co',
            'replit.dev',
            'repl.co',
            'replit.com',
            'repl.it',
            '*',
        ],
    },
    // 빌드 및 미리보기 모드에서도 historyApiFallback 적용
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
    preview: {
        port: 5000,
        // SPA 라우팅을 위한 historyApiFallback 설정
        historyApiFallback: true,
    },
});
