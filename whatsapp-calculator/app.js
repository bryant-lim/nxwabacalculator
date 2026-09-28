// WABA Calculator UI & Reactive Logic

document.addEventListener('DOMContentLoaded', () => {
  let config = getConfig();

  // Mode state: 'estimate' or 'exact'
  let currentMode = 'estimate';

  // Projection elements
  const monthlyCostEl = document.getElementById('monthly-cost');
  const monthlySubvalueEl = document.getElementById('monthly-subvalue');
  const dailyCostEl = document.getElementById('daily-cost');
  const dailySubvalueEl = document.getElementById('daily-subvalue');
  const yearlyCostEl = document.getElementById('yearly-cost');
  const yearlySubvalueEl = document.getElementById('yearly-subvalue');
  const taxSummaryNoteEl = document.getElementById('tax-summary-note');

  // Summary banners
  const totalTemplateCountEl = document.getElementById('total-template-count');
  const summaryReplyMathEl = document.getElementById('summary-reply-math');
  const summaryExactMathEl = document.getElementById('summary-exact-math');

  // Mode buttons & sections
  const btnModeEstimate = document.getElementById('btn-mode-estimate');
  const btnModeExact = document.getElementById('btn-mode-exact');
  const sectionEstimate = document.getElementById('section-estimate');
  const sectionExact = document.getElementById('section-exact');

  // Input & Slider Controls
  const controls = {
    marketing: {
      input: document.getElementById('input-marketing'),
      slider: document.getElementById('slider-marketing'),
      isFloat: false
    },
    utility: {
      input: document.getElementById('input-utility'),
      slider: document.getElementById('slider-utility'),
      isFloat: false
    },
    auth: {
      input: document.getElementById('input-auth'),
      slider: document.getElementById('slider-auth'),
      isFloat: false
    },
    conversations: {
      input: document.getElementById('input-conversations'),
      slider: document.getElementById('slider-conversations'),
      isFloat: false
    },
    replies: {
      input: document.getElementById('input-replies'),
      slider: document.getElementById('slider-replies'),
      isFloat: true
    },
    exactService: {
      input: document.getElementById('input-exact-service'),
      slider: document.getElementById('slider-exact-service'),
      isFloat: false
    }
  };

  // Bind Bidirectional Synchronization for each input + slider
  Object.keys(controls).forEach(key => {
    const item = controls[key];
    if (!item.input || !item.slider) return;

    // Number input -> slider
    item.input.addEventListener('input', (e) => {
      let val = item.isFloat ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
      if (isNaN(val) || val < 0) val = 0;
      const currentMax = parseFloat(item.slider.max);
      if (val > currentMax) {
        item.slider.max = Math.ceil(val * 1.25);
      }
      item.slider.value = val;
      calculate();
    });

    // Slider -> number input
    item.slider.addEventListener('input', (e) => {
      item.input.value = item.isFloat ? parseFloat(e.target.value).toFixed(1) : e.target.value;
      calculate();
    });
  });

  // Mode Switching Handlers
  btnModeEstimate.addEventListener('click', () => {
    currentMode = 'estimate';
    btnModeEstimate.classList.add('active');
    btnModeExact.classList.remove('active');
    sectionEstimate.style.display = 'block';
    sectionExact.style.display = 'none';
    calculate();
  });

  btnModeExact.addEventListener('click', () => {
    currentMode = 'exact';
    btnModeExact.classList.add('active');
    btnModeEstimate.classList.remove('active');
    sectionEstimate.style.display = 'none';
    sectionExact.style.display = 'block';
    calculate();
  });

  function formatUSD(amount) {
    return '$ ' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatMYR(amount) {
    return 'RM ' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatNumber(num) {
    return Math.round(num).toLocaleString('en-US');
  }

  function calculate() {
    config = getConfig(); // Read latest configuration

    // Safe rates
    const marketingRate = config.marketingRate || 0.086;
    const utilityRate = config.utilityRate || 0.014;
    const authRate = config.authRate || 0.014;
    const serviceRate = config.serviceRate || 0.014;
    const freeTier = Number(config.freeServiceTier) >= 0 ? Number(config.freeServiceTier) : 1000;
    const fxRate = (config.fxRate && !isNaN(config.fxRate) && Number(config.fxRate) > 0) ? Number(config.fxRate) : 4.25;
    const whtPercent = Number(config.whtPercent) || 0;
    const sstPercent = Number(config.sstPercent) || 0;

    // Monthly Volumes
    const marketingVol = Math.max(0, parseInt(controls.marketing.input.value, 10) || 0);
    const utilityVol = Math.max(0, parseInt(controls.utility.input.value, 10) || 0);
    const authVol = Math.max(0, parseInt(controls.auth.input.value, 10) || 0);
    const totalTemplates = marketingVol + utilityVol + authVol;

    let serviceVol = 0;
    if (currentMode === 'estimate') {
      const conversations = Math.max(0, parseInt(controls.conversations.input.value, 10) || 0);
      const replies = Math.max(0, parseFloat(controls.replies.input.value) || 0);
      serviceVol = Math.round(conversations * replies);

      // Update Estimate Banner
      summaryReplyMathEl.textContent = `${conversations} × ${replies.toFixed(1)} = ${serviceVol.toLocaleString()}`;
    } else {
      serviceVol = Math.max(0, parseInt(controls.exactService.input.value, 10) || 0);

      // Update Exact Banner
      summaryExactMathEl.textContent = `${serviceVol.toLocaleString()}`;
    }

    // Update Templates Banner
    totalTemplateCountEl.textContent = totalTemplates.toLocaleString();

    // Billable Volumes (Service gets 1,000 free allowance/month under Meta Oct 1 rules)
    const billableServiceVol = Math.max(0, serviceVol - freeTier);

    // Base Costs (USD)
    const baseCostServiceUSD = billableServiceVol * serviceRate;
    const baseCostMarketingUSD = marketingVol * marketingRate;
    const baseCostUtilityUSD = utilityVol * utilityRate;
    const baseCostAuthUSD = authVol * authRate;
    const totalBaseUSD = baseCostServiceUSD + baseCostMarketingUSD + baseCostUtilityUSD + baseCostAuthUSD;

    // Taxes
    const whtAmountUSD = totalBaseUSD * (whtPercent / 100);
    const sstAmountUSD = totalBaseUSD * (sstPercent / 100);
    const totalMonthlyUSD = totalBaseUSD + whtAmountUSD + sstAmountUSD;
    const totalDailyUSD = totalMonthlyUSD / 30;
    const totalYearlyUSD = totalMonthlyUSD * 12;

    // Converted MYR Totals
    const totalMonthlyMYR = totalMonthlyUSD * fxRate;
    const totalDailyMYR = totalDailyUSD * fxRate;
    const totalYearlyMYR = totalYearlyUSD * fxRate;

    // Update Projection Cards
    monthlyCostEl.textContent = formatUSD(totalMonthlyUSD);
    monthlySubvalueEl.textContent = `~ ${formatMYR(totalMonthlyMYR)}`;

    dailyCostEl.textContent = formatUSD(totalDailyUSD);
    dailySubvalueEl.textContent = `~ ${formatMYR(totalDailyMYR)}`;

    yearlyCostEl.textContent = formatUSD(totalYearlyUSD);
    yearlySubvalueEl.textContent = `~ ${formatMYR(totalYearlyMYR)}`;

    // Tax note
    const taxParts = [];
    if (whtPercent > 0) taxParts.push(`WHT ${whtPercent}%`);
    if (sstPercent > 0) taxParts.push(`SST ${sstPercent}%`);
    if (taxParts.length > 0) {
      taxSummaryNoteEl.textContent = `Includes ${taxParts.join(' + ')}`;
    } else {
      taxSummaryNoteEl.textContent = `Excludes Taxes`;
    }

    // Update Breakdown Table
    document.getElementById('td-vol-service').textContent = formatNumber(serviceVol);
    document.getElementById('td-billable-service').textContent = formatNumber(billableServiceVol);
    document.getElementById('td-cost-service').textContent = formatUSD(baseCostServiceUSD);

    document.getElementById('td-vol-marketing').textContent = formatNumber(marketingVol);
    document.getElementById('td-billable-marketing').textContent = formatNumber(marketingVol);
    document.getElementById('td-cost-marketing').textContent = formatUSD(baseCostMarketingUSD);

    document.getElementById('td-vol-utility').textContent = formatNumber(utilityVol);
    document.getElementById('td-billable-utility').textContent = formatNumber(utilityVol);
    document.getElementById('td-cost-utility').textContent = formatUSD(baseCostUtilityUSD);

    document.getElementById('td-vol-auth').textContent = formatNumber(authVol);
    document.getElementById('td-billable-auth').textContent = formatNumber(authVol);
    document.getElementById('td-cost-auth').textContent = formatUSD(baseCostAuthUSD);

    document.getElementById('td-subtotal').textContent = formatUSD(totalBaseUSD);

    const whtRow = document.getElementById('row-wht');
    if (whtPercent > 0) {
      whtRow.style.display = 'table-row';
      document.getElementById('td-wht-label').textContent = `Withholding Tax (${whtPercent}%)`;
      document.getElementById('td-wht-amount').textContent = formatUSD(whtAmountUSD);
    } else {
      whtRow.style.display = 'none';
    }

    const sstRow = document.getElementById('row-sst');
    if (sstPercent > 0) {
      sstRow.style.display = 'table-row';
      document.getElementById('td-sst-label').textContent = `Local SST (${sstPercent}%)`;
      document.getElementById('td-sst-amount').textContent = formatUSD(sstAmountUSD);
    } else {
      sstRow.style.display = 'none';
    }

    document.getElementById('td-grand-total').textContent = `${formatUSD(totalMonthlyUSD)} (~ ${formatMYR(totalMonthlyMYR)})`;
  }

  // Initial Calculation Run
  calculate();
});
