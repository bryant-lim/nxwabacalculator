// Pricing & Settings Page Logic

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pricing-form');
  const btnReset = document.getElementById('btn-reset');
  const toastEl = document.getElementById('toast');

  const fields = {
    serviceRate: document.getElementById('setting-service-rate'),
    freeServiceTier: document.getElementById('setting-free-tier'),
    marketingRate: document.getElementById('setting-marketing-rate'),
    utilityRate: document.getElementById('setting-utility-rate'),
    authRate: document.getElementById('setting-auth-rate'),
    currencyName: document.getElementById('setting-currency-name'),
    fxRate: document.getElementById('setting-fx-rate'),
    whtPercent: document.getElementById('setting-wht-percent'),
    sstPercent: document.getElementById('setting-sst-percent')
  };

  function loadFormValues() {
    const config = getConfig();
    fields.serviceRate.value = config.serviceRate;
    fields.freeServiceTier.value = config.freeServiceTier;
    fields.marketingRate.value = config.marketingRate;
    fields.utilityRate.value = config.utilityRate;
    fields.authRate.value = config.authRate;
    fields.currencyName.value = config.currencyName || 'MYR';
    fields.fxRate.value = config.fxRate;
    fields.whtPercent.value = config.whtPercent;
    fields.sstPercent.value = config.sstPercent;
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2400);
  }

  // Handle Save
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentConfig = getConfig();
    const updatedConfig = {
      ...currentConfig,
      serviceRate: parseFloat(fields.serviceRate.value) || 0,
      freeServiceTier: parseInt(fields.freeServiceTier.value, 10) || 0,
      marketingRate: parseFloat(fields.marketingRate.value) || 0,
      utilityRate: parseFloat(fields.utilityRate.value) || 0,
      authRate: parseFloat(fields.authRate.value) || 0,
      currencyName: (fields.currencyName.value || 'MYR').trim().toUpperCase(),
      fxRate: parseFloat(fields.fxRate.value) || 1,
      whtPercent: parseFloat(fields.whtPercent.value) || 0,
      sstPercent: parseFloat(fields.sstPercent.value) || 0
    };

    saveConfig(updatedConfig);
    showToast('Settings saved successfully');
  });

  // Handle Reset to Defaults
  btnReset.addEventListener('click', () => {
    resetConfig();
    loadFormValues();
    showToast('Reset to default settings');
  });

  // Initial load
  loadFormValues();
});
