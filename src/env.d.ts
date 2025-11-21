/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECTS_DIR?: string;
  readonly VITE_AREAS_DIR?: string;
  readonly VITE_DAILY_DIR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
