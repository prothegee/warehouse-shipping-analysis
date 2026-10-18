/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_USE_MOCK_AI?: string;
  readonly VITE_LLAMA_URL?: string;
  readonly VITE_LLAMA_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
