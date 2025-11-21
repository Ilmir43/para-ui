const normalize = (value: string | undefined) => value?.trim() ?? "";

export const envPaths = {
  projectsDir: normalize(import.meta.env.VITE_PROJECTS_DIR),
  areasDir: normalize(import.meta.env.VITE_AREAS_DIR),
  dailyDir: normalize(import.meta.env.VITE_DAILY_DIR),
};

export const hasEnvPath = (value: string | undefined) => Boolean(normalize(value));
