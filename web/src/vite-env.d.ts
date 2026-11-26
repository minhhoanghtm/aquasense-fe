/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production' | 'test';
  readonly VITE_HOST?: string;
  readonly VITE_PORT?: string;
  readonly VITE_STRICT_PORT?: string;
  readonly VITE_PREVIEW_PORT?: string;
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_SOCKET_URL?: string;
  readonly VITE_WS_PATH?: string;
  readonly VITE_WS_NAMESPACE?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
