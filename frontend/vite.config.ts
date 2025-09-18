import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ""),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ""),
      'process.env.GITHUB_PAT': JSON.stringify(env.GITHUB_PAT || ""),
      'process.env.JIRA_API_TOKEN': JSON.stringify(env.JIRA_API_TOKEN || ""),
      'process.env.JIRA_INSTANCE_URL': JSON.stringify(env.JIRA_INSTANCE_URL || ""),
      'process.env.JIRA_USER_EMAIL': JSON.stringify(env.JIRA_USER_EMAIL || "")
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      }
    }
  };
});
