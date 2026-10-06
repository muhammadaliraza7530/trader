(() => {
  const readSetting = (key) => {
    try {
      return localStorage.getItem(`tradeAdmin.${key}`);
    } catch (error) {
      return null;
    }
  };
  const savedMaintenance = readSetting('maintenance');

  window.ADMIN_CONFIG = {
    ...window.ADMIN_CONFIG,
    SITE_NAME: readSetting('siteName') || window.ADMIN_CONFIG?.SITE_NAME || 'TradeXPro',
    LOGO_URL: readSetting('logoUrl') || window.ADMIN_CONFIG?.LOGO_URL || '',
    CURRENCY: readSetting('currency') || window.ADMIN_CONFIG?.CURRENCY || 'USD',
    TIMEZONE: readSetting('timezone') || window.ADMIN_CONFIG?.TIMEZONE || 'UTC',
    MIN_DEPOSIT: readSetting('minDeposit') ?? window.ADMIN_CONFIG?.MIN_DEPOSIT ?? 10,
    MIN_WITHDRAWAL: readSetting('minWithdrawal') ?? window.ADMIN_CONFIG?.MIN_WITHDRAWAL ?? 5,
    TRANSACTION_FEE: readSetting('txFee') ?? window.ADMIN_CONFIG?.TRANSACTION_FEE ?? 0.5,
    SESSION_TIMEOUT: readSetting('sessionTimeout') ?? window.ADMIN_CONFIG?.SESSION_TIMEOUT ?? 30,
    MAINTENANCE_MODE: savedMaintenance === null
      ? window.ADMIN_CONFIG?.MAINTENANCE_MODE === true
      : savedMaintenance === 'true'
  };
})();
