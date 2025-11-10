/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOG_SERVER_URL?: string
  readonly VITE_LOG_SYNC_INTERVAL?: string
  readonly VITE_LOG_SYNC_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
