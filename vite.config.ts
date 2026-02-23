import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isPagesBuild = process.env.GITHUB_ACTIONS === 'true';

  return {
    base: env.VITE_BASE_PATH || (isPagesBuild ? '/BusullaChatBot/' : '/'),
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
diff --git a/vite.config.ts b/vite.config.ts
index ee5fb8d2dfb261530fb407cb2f28599d50fcae26..7565b5db55fb183e059210a9db9faa97d29a3a28 100644
--- a/vite.config.ts
+++ b/vite.config.ts
@@ -1,23 +1,26 @@
 import path from 'path';
 import { defineConfig, loadEnv } from 'vite';
 import react from '@vitejs/plugin-react';
 
 export default defineConfig(({ mode }) => {
-    const env = loadEnv(mode, '.', '');
-    return {
-      server: {
-        port: 3000,
-        host: '0.0.0.0',
-      },
-      plugins: [react()],
-      define: {
-        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
-        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
+  const env = loadEnv(mode, '.', '');
+  const isPagesBuild = process.env.GITHUB_ACTIONS === 'true';
+
+  return {
+    base: env.VITE_BASE_PATH || (isPagesBuild ? '/BusullaChatBot/' : '/'),
+    server: {
+      port: 3000,
+      host: '0.0.0.0',
+    },
+    plugins: [react()],
+    define: {
+      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
+      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
+    },
+    resolve: {
+      alias: {
+        '@': path.resolve(__dirname, '.'),
       },
-      resolve: {
-        alias: {
-          '@': path.resolve(__dirname, '.'),
-        }
-      }
-    };
+    },
+  };
 });
