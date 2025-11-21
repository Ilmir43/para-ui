const normalize = (value: string | undefined) => value?.trim() ?? "";

const toHttpReadablePath = (value: string) => {
  const normalized = normalize(value);
  if (!normalized) return "";

  if (/^https?:\/\//i.test(normalized)) {
    return normalized.replace(/\/$/, "");
  }

  // Vite dev server can expose absolute paths through the special /@fs prefix.
  // We also encode spaces so fetch() does not fail on directories like "Mobile Documents".
  const base = normalized.replace(/\/$/, "");
  const encoded = encodeURI(base);
  return base.startsWith("/@fs") ? encoded : `/@fs${encoded}`;
};

export const envPaths = {
  projectsDir: normalize(import.meta.env.VITE_PROJECTS_DIR),
  areasDir: normalize(import.meta.env.VITE_AREAS_DIR),
  dailyDir: normalize(import.meta.env.VITE_DAILY_DIR),
};

export const envHttpPaths = {
  projectsDir: toHttpReadablePath(envPaths.projectsDir),
  areasDir: toHttpReadablePath(envPaths.areasDir),
  dailyDir: toHttpReadablePath(envPaths.dailyDir),
};

export const hasEnvPath = (value: string | undefined) => Boolean(normalize(value));
