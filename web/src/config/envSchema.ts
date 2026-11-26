export type AppEnvironment = 'development' | 'staging' | 'production' | 'test';

export interface FrontendEnvConfig {
  appName: string;
  appEnv: AppEnvironment;
  isProduction: boolean;
  host: string;
  port: number;
  strictPort: boolean;
  previewPort: number;
  backendUrl: string;
  apiBaseUrl: string;
  wsUrl: string;
  wsPath: string;
  wsNamespace: string;
  apiTimeout: number;
  proxyTarget: string | null;
}

export interface ViteServerEnvConfig {
  appName: string;
  appEnv: AppEnvironment;
  host: string;
  port: number;
  strictPort: boolean;
  previewPort: number;
  wsPath: string;
  wsNamespace: string;
  apiTimeout: number;
  proxyTarget: string | null;
}

export class EnvConfigError extends Error {
  readonly variable?: string;

  constructor(message: string, variable?: string) {
    super(message);
    this.name = 'EnvConfigError';
    this.variable = variable;
  }
}

export const normalizeTrailingSlash = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed === '/') return '/';
  return trimmed.replace(/\/+$/, '');
};

const readString = (value: string | boolean | undefined): string | undefined => {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value !== 'string') return undefined;
  return value.trim();
};

const readNonEmpty = (value: string | boolean | undefined): string | undefined => {
  const s = readString(value);
  return s && s.length > 0 ? s : undefined;
};

export const isLocalHostname = (hostname: string): boolean => {
  const normalized = hostname.toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '0.0.0.0' ||
    normalized === '::1' ||
    normalized === '[::1]' ||
    normalized.endsWith('.localhost')
  );
};

export const parsePort = (
  raw: string | boolean | undefined,
  varName: string,
  fallback: number,
): number => {
  const str = readString(raw);
  if (str === undefined || str === '') {
    return fallback;
  }
  if (!/^\d+$/.test(str)) {
    throw new EnvConfigError(
      `Biến môi trường ${varName}="${str}" không hợp lệ: port phải là số nguyên từ 1 đến 65535.`,
      varName,
    );
  }
  const parsed = Number(str);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new EnvConfigError(
      `Biến môi trường ${varName}="${str}" không hợp lệ: port phải nằm trong khoảng 1..65535.`,
      varName,
    );
  }
  return parsed;
};

export const parseBoolean = (
  raw: string | boolean | undefined,
  varName: string,
  fallback: boolean,
): boolean => {
  if (typeof raw === 'boolean') return raw;
  const str = readString(raw);
  if (str === undefined || str === '') {
    return fallback;
  }
  const normalized = str.toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  throw new EnvConfigError(
    `Biến môi trường ${varName}="${str}" không hợp lệ: giá trị boolean phải là true/false hoặc 1/0.`,
    varName,
  );
};

export const parsePositiveInt = (
  raw: string | boolean | undefined,
  varName: string,
  fallback: number,
  min = 1,
  max = 600_000,
): number => {
  const str = readString(raw);
  if (str === undefined || str === '') {
    return fallback;
  }
  if (!/^\d+$/.test(str)) {
    throw new EnvConfigError(
      `Biến môi trường ${varName}="${str}" không hợp lệ: phải là số nguyên dương.`,
      varName,
    );
  }
  const parsed = Number(str);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new EnvConfigError(
      `Biến môi trường ${varName}="${str}" không hợp lệ: giá trị phải trong khoảng ${min}..${max}.`,
      varName,
    );
  }
  return parsed;
};

export const validateUrl = (
  raw: string,
  varName: string,
  options: { allowedProtocols: string[]; disallowLocalhost?: boolean },
): string => {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new EnvConfigError(`Thiếu biến môi trường bắt buộc: ${varName}.`, varName);
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new EnvConfigError(
      `Biến môi trường ${varName}="${trimmed}" không phải là URL hợp lệ.`,
      varName,
    );
  }

  if (!options.allowedProtocols.includes(parsed.protocol)) {
    throw new EnvConfigError(
      `Biến môi trường ${varName}="${trimmed}" có giao thức không hợp lệ (${parsed.protocol}). Chỉ chấp nhận: ${options.allowedProtocols.join(', ')}.`,
      varName,
    );
  }

  if (options.disallowLocalhost && isLocalHostname(parsed.hostname)) {
    throw new EnvConfigError(
      `Biến môi trường ${varName}="${trimmed}" không được trỏ tới localhost/127.0.0.1 trong môi trường production.`,
      varName,
    );
  }

  return normalizeTrailingSlash(parsed.toString());
};

export const normalizeWsPath = (
  raw: string | boolean | undefined,
  fallback = '/socket.io',
): string => {
  const str = readString(raw);
  if (str === undefined) return fallback;
  if (str === '') {
    throw new EnvConfigError(
      'Biến môi trường VITE_WS_PATH không được để trống khi đã khai báo.',
      'VITE_WS_PATH',
    );
  }
  if (!str.startsWith('/') || /[\s?#]/.test(str)) {
    throw new EnvConfigError(
      `Biến môi trường VITE_WS_PATH="${str}" không hợp lệ: phải bắt đầu bằng "/" và không chứa khoảng trắng, "?" hoặc "#".`,
      'VITE_WS_PATH',
    );
  }
  return str === '/' ? '/' : normalizeTrailingSlash(str);
};

export const normalizeWsNamespace = (
  raw: string | boolean | undefined,
  fallback = '/telemetry',
): string => {
  const str = readString(raw);
  if (str === undefined) return fallback;
  if (str === '' || !str.startsWith('/') || str.length < 2 || !/^\/[A-Za-z0-9/_-]+$/.test(str)) {
    throw new EnvConfigError(
      `Biến môi trường VITE_WS_NAMESPACE="${str}" không hợp lệ: phải bắt đầu bằng "/" và chỉ chứa ký tự hợp lệ (ví dụ: /telemetry).`,
      'VITE_WS_NAMESPACE',
    );
  }
  const normalized = normalizeTrailingSlash(str);
  if (normalized === '/' || normalized.includes('//')) {
    throw new EnvConfigError(
      `Biến môi trường VITE_WS_NAMESPACE="${str}" không hợp lệ.`,
      'VITE_WS_NAMESPACE',
    );
  }
  return normalized;
};

const resolveAppEnv = (
  rawAppEnv: string | boolean | undefined,
  mode?: string,
  prodFlag?: string | boolean,
): AppEnvironment => {
  const explicit = readNonEmpty(rawAppEnv)?.toLowerCase();
  const candidate = explicit ?? (prodFlag === true || prodFlag === 'true' ? 'production' : mode?.toLowerCase() ?? 'development');

  if (
    candidate === 'development' ||
    candidate === 'staging' ||
    candidate === 'production' ||
    candidate === 'test'
  ) {
    return candidate;
  }

  throw new EnvConfigError(
    `Biến môi trường VITE_APP_ENV="${candidate}" không hợp lệ: chỉ chấp nhận development, staging, production hoặc test.`,
    'VITE_APP_ENV',
  );
};

export const resolveFrontendEnv = (
  rawEnv: Record<string, string | boolean | undefined>,
  modeOverride?: string,
): FrontendEnvConfig => {
  const appEnv = resolveAppEnv(
    rawEnv.VITE_APP_ENV,
    modeOverride ?? readNonEmpty(rawEnv.MODE),
    rawEnv.PROD,
  );
  const isProduction = appEnv === 'production';

  const appName = readNonEmpty(rawEnv.VITE_APP_NAME) ?? 'AquaSense';
  const host = readNonEmpty(rawEnv.VITE_HOST) ?? 'localhost';
  const port = parsePort(rawEnv.VITE_PORT, 'VITE_PORT', 5173);
  const strictPort = parseBoolean(rawEnv.VITE_STRICT_PORT, 'VITE_STRICT_PORT', true);
  const previewPort = parsePort(rawEnv.VITE_PREVIEW_PORT, 'VITE_PREVIEW_PORT', 4173);
  const apiTimeout = parsePositiveInt(rawEnv.VITE_API_TIMEOUT, 'VITE_API_TIMEOUT', 30000);
  const wsPath = normalizeWsPath(rawEnv.VITE_WS_PATH, '/socket.io');
  const wsNamespace = normalizeWsNamespace(rawEnv.VITE_WS_NAMESPACE, '/telemetry');

  const rawBackendUrl = readNonEmpty(rawEnv.VITE_BACKEND_URL);
  const rawApiBaseUrl = readNonEmpty(rawEnv.VITE_API_BASE_URL);
  const rawWsUrl = readNonEmpty(rawEnv.VITE_WS_URL) ?? readNonEmpty(rawEnv.VITE_SOCKET_URL);
  const rawProxyTarget = readNonEmpty(rawEnv.VITE_PROXY_TARGET);

  if (!rawBackendUrl && !rawApiBaseUrl) {
    throw new EnvConfigError(
      isProduction
        ? 'Thiếu cấu hình production bắt buộc: cần thiết lập VITE_BACKEND_URL hoặc VITE_API_BASE_URL (HTTPS) trước khi build.'
        : 'Thiếu biến môi trường bắt buộc: cần cấu hình VITE_BACKEND_URL hoặc VITE_API_BASE_URL trong file .env.',
      'VITE_API_BASE_URL',
    );
  }

  const httpProtocols = isProduction ? ['https:'] : ['http:', 'https:'];
  const wsProtocols = isProduction ? ['https:', 'wss:'] : ['http:', 'https:', 'ws:', 'wss:'];

  const apiBaseUrl = validateUrl(rawApiBaseUrl ?? rawBackendUrl!, rawApiBaseUrl ? 'VITE_API_BASE_URL' : 'VITE_BACKEND_URL', {
    allowedProtocols: httpProtocols,
    disallowLocalhost: isProduction,
  });

  const backendCandidate = rawBackendUrl ?? apiBaseUrl.replace(/\/api$/, '');
  const backendUrl = validateUrl(backendCandidate, 'VITE_BACKEND_URL', {
    allowedProtocols: httpProtocols,
    disallowLocalhost: isProduction,
  });

  const wsCandidate = rawWsUrl ?? backendUrl;
  const wsUrl = validateUrl(wsCandidate, rawWsUrl ? 'VITE_WS_URL' : 'VITE_BACKEND_URL', {
    allowedProtocols: wsProtocols,
    disallowLocalhost: isProduction,
  });

  const proxyTarget = rawProxyTarget
    ? validateUrl(rawProxyTarget, 'VITE_PROXY_TARGET', {
        allowedProtocols: httpProtocols,
        disallowLocalhost: isProduction,
      })
    : null;

  return {
    appName,
    appEnv,
    isProduction,
    host,
    port,
    strictPort,
    previewPort,
    backendUrl,
    apiBaseUrl,
    wsUrl,
    wsPath,
    wsNamespace,
    apiTimeout,
    proxyTarget,
  };
};

export const resolveViteServerEnv = (
  rawEnv: Record<string, string | undefined>,
  mode: string,
): ViteServerEnvConfig => {
  const appEnv = resolveAppEnv(rawEnv.VITE_APP_ENV, mode);
  const isProduction = appEnv === 'production';

  const appName = readNonEmpty(rawEnv.VITE_APP_NAME) ?? 'AquaSense';
  const host = readNonEmpty(rawEnv.VITE_HOST) ?? 'localhost';
  const port = parsePort(rawEnv.VITE_PORT, 'VITE_PORT', 5173);
  const strictPort = parseBoolean(rawEnv.VITE_STRICT_PORT, 'VITE_STRICT_PORT', true);
  const previewPort = parsePort(rawEnv.VITE_PREVIEW_PORT, 'VITE_PREVIEW_PORT', 4173);
  const wsPath = normalizeWsPath(rawEnv.VITE_WS_PATH, '/socket.io');
  const wsNamespace = normalizeWsNamespace(rawEnv.VITE_WS_NAMESPACE, '/telemetry');
  const apiTimeout = parsePositiveInt(rawEnv.VITE_API_TIMEOUT, 'VITE_API_TIMEOUT', 30000);

  const rawProxyTarget = readNonEmpty(rawEnv.VITE_PROXY_TARGET);
  const proxyTarget = rawProxyTarget
    ? validateUrl(rawProxyTarget, 'VITE_PROXY_TARGET', {
        allowedProtocols: ['http:', 'https:'],
        disallowLocalhost: isProduction,
      })
    : null;

  // Validate explicit production endpoint values at build time if supplied.
  if (isProduction) {
    const rawBackendUrl = readNonEmpty(rawEnv.VITE_BACKEND_URL);
    const rawApiBaseUrl = readNonEmpty(rawEnv.VITE_API_BASE_URL);
    const rawWsUrl = readNonEmpty(rawEnv.VITE_WS_URL);

    if (rawBackendUrl) {
      validateUrl(rawBackendUrl, 'VITE_BACKEND_URL', {
        allowedProtocols: ['https:'],
        disallowLocalhost: true,
      });
    }
    if (rawApiBaseUrl) {
      validateUrl(rawApiBaseUrl, 'VITE_API_BASE_URL', {
        allowedProtocols: ['https:'],
        disallowLocalhost: true,
      });
    }
    if (rawWsUrl) {
      validateUrl(rawWsUrl, 'VITE_WS_URL', {
        allowedProtocols: ['https:', 'wss:'],
        disallowLocalhost: true,
      });
    }
  }

  return {
    appName,
    appEnv,
    host,
    port,
    strictPort,
    previewPort,
    wsPath,
    wsNamespace,
    apiTimeout,
    proxyTarget,
  };
};
