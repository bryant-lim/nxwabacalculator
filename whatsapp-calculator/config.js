// WABA Calculator Configuration & State Management

const STORAGE_KEY = 'waba_calculator_config';

const DEFAULT_CONFIG = {
  marketingRate: 0.086,
  utilityRate: 0.014,
  authRate: 0.014,
  serviceRate: 0.014,
  freeServiceTier: 1000,
  currencyName: 'MYR',
  fxRate: 4.25,
  whtPercent: 0,
  sstPercent: 8
};

function getConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(saved);
    const config = { ...DEFAULT_CONFIG, ...parsed };

    // Strict numerical sanity checks
    if (!config.fxRate || isNaN(config.fxRate) || Number(config.fxRate) <= 0) {
      config.fxRate = 4.25;
    }
    config.marketingRate = Number(config.marketingRate) || 0.086;
    config.utilityRate = Number(config.utilityRate) || 0.014;
    config.authRate = Number(config.authRate) || 0.014;
    config.serviceRate = Number(config.serviceRate) || 0.014;
    config.freeServiceTier = Number(config.freeServiceTier) >= 0 ? Number(config.freeServiceTier) : 1000;
    config.whtPercent = Number(config.whtPercent) || 0;
    config.sstPercent = Number(config.sstPercent) || 0;

    return config;
  } catch (e) {
    console.error('Failed to load config from localStorage:', e);
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Failed to save config to localStorage:', e);
    return false;
  }
}

function resetConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { ...DEFAULT_CONFIG };
  } catch (e) {
    console.error('Failed to reset config:', e);
    return { ...DEFAULT_CONFIG };
  }
}
