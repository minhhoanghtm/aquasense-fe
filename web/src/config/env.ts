import {
  EnvConfigError,
  resolveFrontendEnv,
  type AppEnvironment,
  type FrontendEnvConfig,
} from './envSchema';

export { EnvConfigError, resolveFrontendEnv };
export type { AppEnvironment, FrontendEnvConfig };

let cachedEnv: FrontendEnvConfig | null = null;

/**
 * Returns the validated frontend environment configuration from `import.meta.env`.
 * Throws `EnvConfigError` on missing required endpoints or invalid values.
 */
export const getEnv = (): FrontendEnvConfig => {
  if (!cachedEnv) {
    cachedEnv = resolveFrontendEnv(
      import.meta.env as unknown as Record<string, string | boolean | undefined>,
      import.meta.env.MODE,
    );
  }
  return cachedEnv;
};

export const resetEnvCacheForTesting = (): void => {
  cachedEnv = null;
};
