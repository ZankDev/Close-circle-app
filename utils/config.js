import Constants from 'expo-constants';

const resolveExtra = () => {
  if (Constants?.expoConfig?.extra) {
    return Constants.expoConfig.extra;
  }

  if (Constants?.manifest?.extra) {
    return Constants.manifest.extra;
  }

  if (Constants?.manifest2?.extra) {
    return Constants.manifest2.extra;
  }

  return {};
};

const extra = resolveExtra();
const processEnv = (typeof process !== 'undefined' && process?.env) ? process.env : {};

const readConfigValue = (keys, fallback) => {
  for (const key of keys) {
    const envValue = processEnv[key];
    if (typeof envValue === 'string' && envValue.length > 0) {
      return envValue;
    }

    const extraValue = extra[key];
    if (typeof extraValue === 'string' && extraValue.length > 0) {
      return extraValue;
    }
  }

  return fallback;
};

const sanitizeBaseUrl = (value, fallback) => {
  const normalized = typeof value === 'string' && value.length > 0 ? value : fallback;
  if (typeof normalized !== 'string') {
    return fallback;
  }
  return normalized.replace(/\/+$/, '');
};

const DEFAULT_API_BASE_URL = 'https://feisty-playfulness-production.up.railway.app';

const apiBaseUrl = sanitizeBaseUrl(
  readConfigValue(['EXPO_PUBLIC_API_BASE_URL', 'API_BASE_URL', 'apiBaseUrl'], DEFAULT_API_BASE_URL),
  DEFAULT_API_BASE_URL
);

const smsApiBaseUrl = sanitizeBaseUrl(
  readConfigValue(['EXPO_PUBLIC_SMS_API_BASE_URL', 'SMS_API_BASE_URL', 'smsApiBaseUrl'], apiBaseUrl),
  apiBaseUrl
);

const environment = readConfigValue(
  ['EXPO_PUBLIC_ENVIRONMENT', 'ENVIRONMENT', 'environment', 'NODE_ENV'],
  'development'
);

const parseBoolean = (value, defaultValue) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
  }

  return defaultValue;
};

const remoteApiEnabled = parseBoolean(
  readConfigValue(
    ['EXPO_PUBLIC_ENABLE_REMOTE_API', 'ENABLE_REMOTE_API', 'remoteApiEnabled'],
    'true'
  ),
  true
);

const buildUrl = (base, path = '') => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  if (!path) {
    return normalizedBase;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

export const config = {
  environment,
  apiBaseUrl,
  smsApiBaseUrl,
  remoteApiEnabled,
  apiUrl: (path = '') => buildUrl(apiBaseUrl, path),
  smsUrl: (path = '') => buildUrl(smsApiBaseUrl, path),
};
