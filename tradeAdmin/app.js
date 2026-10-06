(() => {
  const config = window.ADMIN_CONFIG;
  const data = window.ADMIN_DATA;
  const pageRoot = document.getElementById('page-content');
  const modalRoot = document.getElementById('modal-root');
  const toastRoot = document.getElementById('toast-region');
  const pageTitles = {
    dashboard: 'Overview',
    users: 'User management',
    kyc: 'KYC verification',
    transactions: 'Transactions',
    staking: 'Staking plans',
    binary: 'Binary trading',
    settings: 'System settings'
  };
  let currentPage = 'dashboard';
  let transactionFilter = 'All';
  let userQuery = '';
  let selectedKycUid = null;
  let toastTimer;

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const money = (value, digits = 2) => Number(value).toLocaleString('en-US', {
    minimumFractionDigits: digits, maximumFractionDigits: digits
  });
  const cash = (value, currency = config.CURRENCY) => `${currency} ${money(value)}`;
  const initialsAvatar = (initials, color = 'blue', extra = '') =>
    `<span class="avatar avatar-${escapeHtml(color)} ${extra}">${escapeHtml(initials)}</span>`;
  const statusBadge = (status) => {
    const key = status.toLowerCase().replace(/\s+/g, '-');
    return `<span class="status-badge status-${escapeHtml(key)}"><i></i>${escapeHtml(status)}</span>`;
  };
  const statCard = (label, value, change, icon, tone, footnote = 'vs. last month') => `
    <article class="stat-card">
      <div class="stat-top"><span>${label}</span><span class="stat-icon ${tone}">${icon}</span></div>
      <div class="stat-value">${value}</div>
      <div class="stat-foot"><span class="trend-up">↗ ${change}</span><span>${footnote}</span></div>
    </article>`;
  const pageHeading = (title, description, actions = '') => `
    <div class="page-heading"><div><p class="eyebrow">${escapeHtml(config.SITE_NAME)} <span>/</span> ADMIN</p>
    <h1>${title}</h1><p class="page-description">${description}</p></div><div class="heading-actions">${actions}</div></div>`;

  function setBrand() {
    const name = config.SITE_NAME || 'TradeXPro';
    document.title = `${name} Admin`;
    document.getElementById('brand-name').textContent = name;
    const brandMark = document.getElementById('brand-mark');
    const previewMark = document.getElementById('preview-mark');
    [brandMark, previewMark].filter(Boolean).forEach((element) => {
      element.replaceChildren();
      const logoUrl = config.LOGO_URL ? safeLogoUrl(config.LOGO_URL) : '';
      if (logoUrl) {
        const logo = document.createElement('img');
        logo.src = logoUrl;
        logo.alt = `${name} logo`;
        logo.onerror = () => {
          element.textContent = name.trim().charAt(0).toUpperCase() || 'A';
        };
        element.append(logo);
      } else {
        element.textContent = name.trim().charAt(0).toUpperCase() || 'A';
      }
    });
    if (previewMark) {
      document.getElementById('preview-name').textContent = name;
    }
    document.getElementById('footer-brand').textContent = `${name} Admin Console`;
  }

  function render() {
    currentPage = document.body.dataset.page || 'dashboard';
    if (!pageTitles[currentPage]) currentPage = 'dashboard';
    document.querySelectorAll('.nav-link').forEach((link) => {
      const active = link.dataset.page === currentPage;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.getElementById('breadcrumb-current').textContent = pageTitles[currentPage];
    const renderers = {
      dashboard: renderDashboard,
      users: renderUsers,
      kyc: renderKyc,
      transactions: renderTransactions,
      staking: renderStaking,
      binary: renderBinary,
      settings: renderSettings
    };
    pageRoot.innerHTML = renderers[currentPage]();
    setBrand();
    bindPageEvents();
    document.getElementById('sidebar').classList.remove('sidebar-open');
    document.getElementById('sidebar-backdrop').classList.remove('visible');
  }

  function renderDashboard() {
    const totalBalance = data.users.reduce((total, user) => total + user.balance, 0);
    const deposits = data.transactions.filter((tx) => tx.type === 'Deposit').reduce((total, tx) => total + tx.amount, 0);
    const recent = data.transactions.slice(0, 5);
    const bars = [35, 49, 42, 61, 53, 72, 64, 82, 68, 92, 74, 100, 80, 96, 78, 88, 70, 98, 81, 91, 69, 84, 73, 95, 82, 100, 77, 90, 70, 85];
    return `
      ${pageHeading('Good morning, Admin <span class="wave">✦</span>', 'Here’s what’s happening across your exchange today.',
        '<button class="button button-quiet" data-action="refresh">⟳ <span>Refresh</span></button><button class="button button-primary" data-page-link="transactions">＋ <span>Review transactions</span></button>')}
      <section class="stat-grid">
        ${statCard('Total user balances', cash(totalBalance), '12.8%', '◈', 'gold')}
        ${statCard('Total users', '2,486', '8.2%', '♙', 'blue')}
        ${statCard('Deposits today', cash(deposits), '18.4%', '↓', 'green')}
        ${statCard('Withdrawals today', cash(84620), '4.6%', '↑', 'purple')}
      </section>
      <section class="dashboard-grid">
        <article class="panel volume-panel">
          <div class="panel-header"><div><h2>Platform activity</h2><p>Transaction volume across the platform</p></div><select class="select-control" aria-label="Chart date range"><option>Last 30 days</option><option>Last 7 days</option><option>Today</option></select></div>
          <div class="chart-summary"><strong>$842,904.28</strong><span class="trend-up">↗ 14.6%</span></div>
          <div class="chart-legend"><span><i class="legend-dot deposits-dot"></i>Deposits</span><span><i class="legend-dot withdrawals-dot"></i>Withdrawals</span></div>
          <div class="chart-area" aria-label="Activity chart, illustrative preview">
            <div class="chart-y-labels"><span>$100k</span><span>$75k</span><span>$50k</span><span>$25k</span><span>$0</span></div>
            <div class="chart-plot"><div class="chart-gridlines"><i></i><i></i><i></i><i></i><i></i></div>
              <div class="chart-bars">${bars.map((height, index) => `<div class="bar-group"><i class="bar-deposit" style="height:${height}%"></i><i class="bar-withdrawal" style="height:${Math.round(height * (0.48 + (index % 4) * 0.06))}%"></i></div>`).join('')}</div>
              <div class="chart-x-labels"><span>Sep 07</span><span>Sep 14</span><span>Sep 21</span><span>Sep 28</span><span>Oct 06</span></div>
            </div>
          </div>
        </article>
        <article class="panel system-panel">
          <div class="panel-header"><div><h2>System health</h2><p>Current service status</p></div><span class="health-pill"><i></i> All systems normal</span></div>
          <div class="health-row"><span><i class="service-icon">⇄</i>Trading engine</span><strong><i></i>Operational</strong></div>
          <div class="health-row"><span><i class="service-icon">◈</i>Wallet services</span><strong><i></i>Operational</strong></div>
          <div class="health-row"><span><i class="service-icon">▣</i>KYC provider</span><strong><i></i>Operational</strong></div>
          <div class="health-row"><span><i class="service-icon">⌁</i>API response</span><strong class="health-latency">124 ms</strong></div>
          <div class="uptime-box"><div><span>Uptime this month</span><strong>99.98%</strong></div><div class="uptime-track"><i></i></div></div>
        </article>
      </section>
      <section class="panel table-panel">
        <div class="panel-header panel-header-wide"><div><h2>Recent transactions</h2><p>Latest activity requiring attention</p></div><button class="text-button" data-page-link="transactions">View all transactions <span>→</span></button></div>
        ${transactionTable(recent, { compact: true })}
      </section>
      <section class="quick-stats">
        <article class="mini-card"><span class="mini-icon mini-gold">◈</span><div><span>Active trades</span><strong>1,284 <small>+5.2%</small></strong></div><span class="mini-sparkline">▁▃▂▅▄▆▅▇</span></article>
        <article class="mini-card"><span class="mini-icon mini-purple">⌁</span><div><span>Active staking</span><strong>${cash(1842500)} <small>+2.8%</small></strong></div><span class="mini-sparkline">▂▃▅▄▆▅▇▆</span></article>
        <article class="mini-card"><span class="mini-icon mini-blue">▣</span><div><span>Pending KYC</span><strong>${data.kyc.length} <small class="neutral-small">Needs review</small></strong></div><button class="mini-action" data-page-link="kyc">Review →</button></article>
      </section>`;
  }

  function transactionTable(rows, options = {}) {
    const compact = options.compact ? ' compact-table' : '';
    return `<div class="table-wrap${compact}"><table><thead><tr><th>Transaction</th><th>User</th><th>Type</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th>${options.actions ? '<th>Action</th>' : ''}</tr></thead>
      <tbody>${rows.length ? rows.map((tx) => `<tr>
        <td><span class="table-primary">${escapeHtml(tx.id)}</span></td>
        <td><span class="user-cell">${initialsAvatar(tx.user.split(' ').map((s) => s[0]).join(''), 'blue', 'avatar-xs')}<span><strong>${escapeHtml(tx.user)}</strong><small>${escapeHtml(tx.uid)}</small></span></span></td>
        <td><span class="type-cell ${tx.type === 'Deposit' ? 'type-deposit' : 'type-withdrawal'}">${tx.type === 'Deposit' ? '↓' : '↑'} ${escapeHtml(tx.type)}</span></td>
        <td><strong>${money(tx.amount)} <small class="asset-label">${escapeHtml(tx.asset)}</small></strong></td>
        <td>${escapeHtml(tx.method)}</td><td>${escapeHtml(tx.date)}</td><td>${statusBadge(tx.status)}</td>
        ${options.actions ? `<td>${tx.status === 'Pending' ? `<button class="row-action" data-tx-action="process" data-id="${escapeHtml(tx.id)}">Review</button>` : '<span class="muted">—</span>'}</td>` : ''}
      </tr>`).join('') : `<tr><td colspan="${options.actions ? 8 : 7}" class="empty-cell">No transactions match this filter.</td></tr>`}</tbody></table></div>`;
  }

  function renderUsers() {
    const filtered = data.users.filter((user) => `${user.name} ${user.email} ${user.uid}`.toLowerCase().includes(userQuery.toLowerCase()));
    const rows = filtered.map((user) => `<tr>
      <td><span class="user-cell">${initialsAvatar(user.initials, user.color)}<span><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email)}</small></span></span></td>
      <td><span class="table-primary">${escapeHtml(user.uid)}</span></td><td>${escapeHtml(user.country)}</td>
      <td><strong>${cash(user.balance)}</strong></td><td>${statusBadge(user.status)}</td><td>${statusBadge(user.kyc)}</td>
      <td>${escapeHtml(user.joined)}</td><td><button class="icon-button row-menu" aria-label="View ${escapeHtml(user.name)}" data-user-wallet="${escapeHtml(user.uid)}">•••</button></td>
    </tr>`).join('');
    return `${pageHeading('User management', 'Search accounts, review status, and inspect user wallet summaries.',
      '<button class="button button-quiet" data-action="export-users">⇩ <span>Export</span></button><button class="button button-primary" data-action="invite-user">＋ <span>Add user</span></button>')}
      <section class="stat-grid stat-grid-small">
        ${statCard('Total accounts', '2,486', '8.2%', '♙', 'blue')}
        ${statCard('Active this month', '1,902', '6.4%', '◉', 'green')}
        ${statCard('Restricted', '12', '2 new', '⊘', 'amber', 'this week')}
        ${statCard('KYC verified', '84.6%', '3.1%', '▣', 'purple')}
      </section>
      <section class="panel table-panel">
        <div class="panel-header panel-header-wide users-tools"><div><h2>All users <span class="count-chip">${filtered.length}</span></h2><p>Manage account access and wallet balances</p></div>
          <div class="table-tools"><label class="search-box"><span>⌕</span><input id="user-search" type="search" placeholder="Search UID, name or email" value="${escapeHtml(userQuery)}"></label><select class="select-control" id="user-status-filter"><option>All statuses</option><option>Active</option><option>Restricted</option></select></div>
        </div>
        <div class="table-wrap"><table><thead><tr><th>User</th><th>UID</th><th>Country</th><th>Balance</th><th>Account</th><th>KYC</th><th>Joined</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="8" class="empty-cell">No users found. Try a different search.</td></tr>'}</tbody></table></div>
        <div class="table-pagination"><span>Showing <strong>${filtered.length ? 1 : 0}–${filtered.length}</strong> of <strong>${filtered.length}</strong> users</span><div><button disabled>← Previous</button><button class="page-number">1</button><button disabled>Next →</button></div></div>
      </section>`;
  }

  function renderKyc() {
    const selectedUser = data.kyc.find((item) => item.uid === selectedKycUid) || data.kyc[0];
    if (selectedUser) selectedKycUid = selectedUser.uid;
    return `${pageHeading('KYC verification', 'Review identity submissions and keep your platform compliant.',
      '<button class="button button-quiet" data-action="export-kyc">⇩ <span>Export queue</span></button>')}
      <section class="stat-grid stat-grid-small">
        ${statCard('Awaiting review', String(data.kyc.length).padStart(2, '0'), '3 new', '◷', 'amber', 'in the last hour')}
        ${statCard('Approved today', '42', '12.5%', '✓', 'green')}
        ${statCard('Rejected today', '06', '2 cases', '×', 'pink', 'need follow-up')}
        ${statCard('Average review time', '18 min', '−4 min', '◷', 'blue')}
      </section>
      <section class="kyc-layout"><div class="kyc-list-column"><div class="section-heading"><div><h2>Pending submissions <span class="count-chip">${data.kyc.length}</span></h2><p>Oldest submissions are shown first</p></div><select class="select-control"><option>All document types</option><option>Passport</option><option>National ID</option></select></div>
      <div class="kyc-submissions table-wrap"><table><thead><tr><th>Applicant</th><th>Document</th><th>Submitted</th><th></th></tr></thead><tbody>${data.kyc.length ? data.kyc.map((item) => `<tr class="${item.uid === selectedKycUid ? 'kyc-row-selected' : ''}">
        <td><button class="kyc-select-button" data-kyc-select="${escapeHtml(item.uid)}">${initialsAvatar(item.initials, item.color, 'avatar-xs')}<span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.uid)} · ${escapeHtml(item.country)}</small></span></button></td>
        <td>${escapeHtml(item.document)}</td><td>${escapeHtml(item.submitted)}</td><td><button class="text-button" data-kyc-select="${escapeHtml(item.uid)}">Review →</button></td></tr>`).join('') : '<tr><td colspan="4" class="empty-cell">No pending identity submissions.</td></tr>'}</tbody></table></div>
      </div><article class="panel kyc-review-panel">${selectedUser ? `<div class="review-panel-header"><div><span class="review-label">SUBMISSION REVIEW</span><span class="review-pending">PENDING</span></div><button class="icon-button" aria-label="More options">•••</button></div>
        <div class="review-user">${initialsAvatar(selectedUser.initials, selectedUser.color, 'review-avatar')}<div><h3>${escapeHtml(selectedUser.name)}</h3><p>${escapeHtml(selectedUser.uid)} · ${escapeHtml(selectedUser.country)}</p></div></div>
        <div class="review-meta-grid"><div><span>Document type</span><strong>${escapeHtml(selectedUser.document)}</strong></div><div><span>Submitted</span><strong>${escapeHtml(selectedUser.submitted)}</strong></div><div><span>Document number</span><strong>•••• •••• ${escapeHtml(selectedUser.uid.slice(-4))}</strong></div><div><span>Expiry date</span><strong>Aug 14, 2030</strong></div></div>
        <div class="document-heading"><h4>Uploaded documents</h4><button class="text-button" data-action="view-document">View all</button></div>
        <button class="document-preview" data-action="view-document" aria-label="Open identity document preview"><div class="document-art"><span class="doc-watermark">${escapeHtml(selectedUser.document.toUpperCase())}</span><div class="doc-photo">${escapeHtml(selectedUser.initials)}</div><div class="doc-lines"><i></i><i></i><i></i><i></i></div><span class="doc-emblem">✦</span></div><span class="doc-caption"><span>${escapeHtml(selectedUser.document.toLowerCase().replace(/\s+/g, '_'))}_front.jpg<small>JPEG · 2.4 MB</small></span><b>↗</b></span></button>
        <div class="review-actions"><button class="button button-danger-quiet" data-kyc-action="reject" data-id="${escapeHtml(selectedUser.uid)}">✕ <span>Reject</span></button><button class="button button-primary" data-kyc-action="approve" data-id="${escapeHtml(selectedUser.uid)}">✓ <span>Approve identity</span></button></div>` : '<div class="empty-cell">Select a submission to review.</div>'}
      </article></section>`;
  }

  function renderTransactions() {
    const rows = data.transactions.filter((tx) => transactionFilter === 'All' || tx.type === transactionFilter || tx.status === transactionFilter);
    const pendingCount = data.transactions.filter((tx) => tx.status === 'Pending').length;
    return `${pageHeading('Deposits & withdrawals', 'Review, approve, and track customer fund movements.',
      '<button class="button button-quiet" data-action="export-transactions">⇩ <span>Export report</span></button>')}
      <section class="stat-grid stat-grid-small">
        ${statCard('Pending review', String(pendingCount).padStart(2, '0'), 'Needs attention', '◷', 'amber', 'across all gateways')}
        ${statCard('Deposited today', cash(847250), '18.4%', '↓', 'green')}
        ${statCard('Withdrawn today', cash(264180), '4.6%', '↑', 'purple')}
        ${statCard('Avg. processing', '4.2 min', '−12%', '⚡', 'blue')}
      </section>
      <section class="panel table-panel">
        <div class="panel-header panel-header-wide"><div><h2>Transaction log</h2><p>Monitor incoming deposits and outgoing withdrawals</p></div><label class="search-box transaction-search"><span>⌕</span><input id="transaction-search" type="search" placeholder="Search transaction ID"></label></div>
        <div class="filter-tabs" role="tablist" aria-label="Transaction filters">${['All', 'Deposit', 'Withdrawal', 'Pending', 'Approved'].map((filter) => `<button role="tab" aria-selected="${transactionFilter === filter}" class="${transactionFilter === filter ? 'active' : ''}" data-tx-filter="${filter}">${filter}${filter === 'Pending' ? `<span>${pendingCount}</span>` : ''}</button>`).join('')}</div>
        <div id="transaction-table">${transactionTable(rows, { actions: true })}</div>
        <div class="table-pagination"><span>Showing <strong>${rows.length ? 1 : 0}–${rows.length}</strong> of <strong>${rows.length}</strong> transactions</span><div><button disabled>← Previous</button><button class="page-number">1</button><button disabled>Next →</button></div></div>
      </section>`;
  }

  function renderStaking() {
    const totalLocked = data.plans.reduce((total, plan) => total + (plan.subscribers * plan.min * 2.5), 0);
    return `${pageHeading('Staking & earn plans', 'Configure yield products, lock durations, and subscription limits.',
      '<button class="button button-quiet" data-action="export-plans">⇩ <span>Export</span></button><button class="button button-primary" data-plan-create>＋ <span>Create plan</span></button>')}
      <section class="stat-grid stat-grid-small">
        ${statCard('Total value locked', cash(totalLocked), '12.4%', '◈', 'gold')}
        ${statCard('Active subscribers', '1,940', '9.2%', '♙', 'blue')}
        ${statCard('Average APY', '8.7%', '0.6%', '↗', 'green')}
        ${statCard('Active plans', String(data.plans.filter((p) => p.state === 'Active').length).padStart(2, '0'), 'of 4 total', '▤', 'purple')}
      </section>
      <div class="section-heading plans-heading"><div><h2>Your investment plans</h2><p>Manage returns, lock periods, and user eligibility</p></div><div class="table-tools"><select class="select-control"><option>All assets</option><option>USDT</option><option>BTC</option><option>ETH</option></select><select class="select-control"><option>All statuses</option><option>Active</option><option>Paused</option></select></div></div>
      <section class="plan-grid">${data.plans.map((plan) => `<article class="plan-card">
        <div class="plan-card-top"><span class="coin-icon coin-${plan.tone}">${plan.asset === 'BTC' ? '₿' : plan.asset === 'ETH' ? '◆' : '₮'}</span><button class="icon-button row-menu" aria-label="Plan options" data-plan-edit="${plan.id}">•••</button></div>
        <div class="plan-title-row"><div><h3>${escapeHtml(plan.name)}</h3><p>${escapeHtml(plan.asset)} · ${escapeHtml(plan.duration)}</p></div>${statusBadge(plan.state)}</div>
        <div class="apy-block"><strong>${plan.apy.toFixed(1)}<small>%</small></strong><span>Annual percentage yield</span></div>
        <div class="plan-details"><div><span>Minimum stake</span><strong>${escapeHtml(String(plan.min))} ${escapeHtml(plan.asset)}</strong></div><div><span>Maximum stake</span><strong>${escapeHtml(String(plan.max))} ${escapeHtml(plan.asset)}</strong></div><div><span>Subscribers</span><strong>${plan.subscribers.toLocaleString()}</strong></div></div>
        <div class="plan-card-actions"><button class="button button-quiet" data-plan-edit="${plan.id}">Edit plan</button><button class="button ${plan.state === 'Active' ? 'button-warning-quiet' : 'button-success-quiet'}" data-plan-toggle="${plan.id}">${plan.state === 'Active' ? 'Pause' : 'Activate'}</button></div>
      </article>`).join('')}</section>`;
  }

  function renderBinary() {
    return `${pageHeading('Binary trading configuration', 'Control prediction pairs, payout rates, and trade risk limits.',
      '<button class="button button-quiet" data-action="reset-binary">↺ <span>Reset defaults</span></button><button class="button button-primary" data-pair-create>＋ <span>Add pair</span></button>')}
      <section class="stat-grid stat-grid-small">
        ${statCard('Enabled pairs', String(data.pairs.filter((p) => p.state === 'Enabled').length).padStart(2, '0'), 'of 4 total', '⌁', 'green')}
        ${statCard('Active positions', '1,284', '5.2%', '⇄', 'blue')}
        ${statCard('Platform exposure', cash(184520), 'Within limits', '◈', 'amber')}
        ${statCard('Avg. payout rate', '80.0%', '−1.2%', '％', 'purple')}
      </section>
      <section class="panel table-panel"><div class="panel-header panel-header-wide"><div><h2>Trading pairs</h2><p>Set pair availability, expiration, and payout per winning position</p></div><span class="last-saved">● Changes save when applied</span></div>
        <div class="table-wrap"><table><thead><tr><th>Trading pair</th><th>Expiry options</th><th>Payout rate</th><th>Min. stake</th><th>Max. stake</th><th>Availability</th><th></th></tr></thead><tbody>
        ${data.pairs.map((pair) => `<tr><td><strong class="pair-name">${escapeHtml(pair.pair)}</strong></td><td>${escapeHtml(pair.duration)}</td><td><strong class="payout-value">${pair.payout}%</strong></td><td>${cash(pair.min)}</td><td>${cash(pair.max)}</td><td>${statusBadge(pair.state)}</td><td><button class="icon-button row-menu" aria-label="Edit ${escapeHtml(pair.pair)}" data-pair-edit="${escapeHtml(pair.pair)}">•••</button></td></tr>`).join('')}
        </tbody></table></div></section>
      <section class="config-grid"><article class="panel config-card"><div class="panel-header"><div><h2>Global trade parameters</h2><p>Applies to all enabled pairs</p></div><span class="settings-icon">⚙</span></div>
        <form id="binary-settings-form" class="settings-form compact-form">
          <label class="field-label">Default trade duration<select name="duration" class="select-control"><option>1 minute</option><option selected>3 minutes</option><option>5 minutes</option><option>15 minutes</option></select></label>
          <label class="field-label">Maximum payout rate<input name="maxPayout" type="number" min="1" max="100" value="95"><small>Percentage of stake returned on a correct prediction.</small></label>
          <label class="field-label">Maximum open positions<input name="maxPositions" type="number" min="1" value="5000"></label>
          <label class="switch-row"><span><strong>Auto-settle expired trades</strong><small>Settle positions automatically at expiry</small></span><input type="checkbox" name="autoSettle" checked><i></i></label>
          <label class="switch-row"><span><strong>Trading system</strong><small>Allow users to open new positions</small></span><input type="checkbox" name="tradingEnabled" checked><i></i></label>
          <div class="form-actions"><span class="save-note">Changes apply to new trades</span><button class="button button-primary" type="submit">Save parameters</button></div>
        </form></article>
        <article class="panel exposure-card"><div class="panel-header"><div><h2>Risk overview</h2><p>Live platform exposure snapshot</p></div></div><div class="risk-total"><span>Net exposure</span><strong>${cash(184520)}</strong><small class="trend-up">Within configured risk limits</small></div><div class="risk-track"><i></i></div><div class="risk-legend"><span>Current exposure</span><strong>46% of ${cash(400000)}</strong></div><div class="risk-breakdown"><div><span>Open positions</span><strong>1,284</strong></div><div><span>Potential payout</span><strong>${cash(338400)}</strong></div><div><span>Settlement queue</span><strong>26 trades</strong></div></div></article></section>`;
  }

  function renderSettings() {
    const siteName = config.SITE_NAME || 'TradeXPro';
    return `${pageHeading('System & brand settings', 'Manage platform identity, global preferences, and operational controls.',
      '<span class="last-saved"><i></i> Settings are stored in this browser</span>')}
      <section class="settings-layout"><div class="settings-tabs"><button class="settings-tab active" data-settings-tab="brand">◈ <span>Brand identity</span><b>›</b></button><button class="settings-tab" data-settings-tab="general">⚙ <span>General</span><b>›</b></button><button class="settings-tab" data-settings-tab="security">♙ <span>Security</span><b>›</b></button></div>
      <article class="panel settings-panel"><form id="brand-settings-form" class="settings-form">
        <div class="settings-section-head"><div><h2>Brand identity</h2><p>Update how your platform appears to customers and administrators.</p></div><span class="settings-icon">✦</span></div>
        <div class="brand-preview"><span class="brand-preview-mark" id="preview-mark">${escapeHtml(siteName.charAt(0).toUpperCase())}</span><div><strong id="preview-name">${escapeHtml(siteName)}</strong><small>Platform brand preview</small></div><span class="preview-tag">LIVE PREVIEW</span></div>
        <label class="field-label">Platform name <span class="required-mark">*</span><input id="site-name-input" name="siteName" type="text" maxlength="40" value="${escapeHtml(siteName)}" placeholder="Enter platform name" required><small>This name is used dynamically across the admin console.</small></label>
        <label class="field-label">Logo URL <input name="logoUrl" type="url" value="${escapeHtml(localStorageSafeGet('tradeAdmin.logoUrl'))}" placeholder="https://example.com/logo.svg"><small>Optional. Leave blank to use the generated brand mark.</small></label>
        <div class="form-two-col"><label class="field-label">Default currency<select name="currency" class="select-control"><option ${config.CURRENCY === 'USD' ? 'selected' : ''}>USD</option><option ${config.CURRENCY === 'EUR' ? 'selected' : ''}>EUR</option><option ${config.CURRENCY === 'INR' ? 'selected' : ''}>INR</option></select></label>
          <label class="field-label">Timezone<select name="timezone" class="select-control"><option ${config.TIMEZONE === 'UTC' ? 'selected' : ''}>UTC</option><option ${config.TIMEZONE === 'Asia/Kolkata' ? 'selected' : ''}>Asia/Kolkata</option><option ${config.TIMEZONE === 'Asia/Singapore' ? 'selected' : ''}>Asia/Singapore</option><option ${config.TIMEZONE === 'Europe/London' ? 'selected' : ''}>Europe/London</option></select></label></div>
        <div class="form-divider"></div><div class="settings-section-head variables-head"><div><h2>Global system variables</h2><p>Default limits applied across the platform.</p></div></div>
        <div class="form-two-col"><label class="field-label">Minimum deposit<input name="minDeposit" type="number" min="0" step="0.01" value="${escapeHtml(String(config.MIN_DEPOSIT))}"></label><label class="field-label">Minimum withdrawal<input name="minWithdrawal" type="number" min="0" step="0.01" value="${escapeHtml(String(config.MIN_WITHDRAWAL))}"></label>
          <label class="field-label">Default transaction fee (%)<input name="txFee" type="number" min="0" max="100" step="0.1" value="${escapeHtml(String(config.TRANSACTION_FEE))}"></label><label class="field-label">Session timeout (minutes)<input name="sessionTimeout" type="number" min="1" value="${escapeHtml(String(config.SESSION_TIMEOUT))}"></label></div>
        <label class="switch-row maintenance-row"><span><strong>Maintenance mode</strong><small>Temporarily prevent customers from accessing the platform</small></span><input type="checkbox" name="maintenance" ${config.MAINTENANCE_MODE ? 'checked' : ''}><i></i></label>
        <div class="form-actions"><span class="save-note" id="settings-status">Unsaved changes</span><button class="button button-quiet" type="reset">Discard</button><button class="button button-primary" type="submit">Save changes</button></div>
      </form></article></section>`;
  }

  function localStorageSafeGet(key) {
    try { return localStorage.getItem(key) || ''; } catch (error) { return ''; }
  }

  function safeLogoUrl(value) {
    try {
      const url = new URL(value, window.location.href);
      return ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : '';
    } catch (error) {
      return '';
    }
  }

  function showToast(message, type = 'success') {
    clearTimeout(toastTimer);
    toastRoot.innerHTML = `<div class="toast toast-${type}" role="status"><span>${type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}</span>${escapeHtml(message)}<button aria-label="Dismiss notification">×</button></div>`;
    toastRoot.querySelector('button').addEventListener('click', () => { toastRoot.innerHTML = ''; });
    toastTimer = setTimeout(() => { toastRoot.innerHTML = ''; }, 4000);
  }

  function showModal(content) {
    modalRoot.innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true">${content}</section></div>`;
    modalRoot.querySelector('.modal-backdrop').addEventListener('click', (event) => {
      if (event.target.classList.contains('modal-backdrop')) closeModal();
    });
    modalRoot.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', closeModal));
    modalRoot.querySelector('input, select, button')?.focus();
  }

  function closeModal() {
    modalRoot.innerHTML = '';
  }

  function openUserWallet(uid) {
    const user = data.users.find((item) => item.uid === uid);
    if (!user) return showToast('Unable to find that user account.', 'error');
    showModal(`<div class="modal-header"><div><span class="eyebrow">ACCOUNT DETAILS</span><h2>User wallet overview</h2></div><button class="modal-close" data-modal-close aria-label="Close">×</button></div>
      <div class="modal-user">${initialsAvatar(user.initials, user.color, 'review-avatar')}<div><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.uid)} · ${escapeHtml(user.email)}</small></div>${statusBadge(user.status)}</div>
      <div class="wallet-total-card"><span>Total wallet balance</span><strong>${cash(user.balance)}</strong><small>Last updated just now</small></div>
      <div class="wallet-asset-row"><span class="coin-icon coin-gold">₮</span><span><strong>USDT</strong><small>Tether USD</small></span><b>${money(user.balance * 0.72, 4)} USDT</b></div>
      <div class="wallet-asset-row"><span class="coin-icon coin-orange">₿</span><span><strong>BTC</strong><small>Bitcoin</small></span><b>${(user.balance * 0.0000035).toFixed(6)} BTC</b></div>
      <div class="wallet-asset-row"><span class="coin-icon coin-blue">◆</span><span><strong>ETH</strong><small>Ethereum</small></span><b>${(user.balance * 0.00012).toFixed(5)} ETH</b></div>
      <div class="modal-actions"><button class="button button-quiet" data-modal-close>Close</button><button class="button button-primary" data-modal-close>Open account</button></div>`);
  }

  function openPlanForm(id = null) {
    const plan = data.plans.find((item) => item.id === Number(id));
    const editing = Boolean(plan);
    showModal(`<div class="modal-header"><div><span class="eyebrow">${editing ? 'PLAN CONFIGURATION' : 'NEW PRODUCT'}</span><h2>${editing ? 'Edit staking plan' : 'Create staking plan'}</h2></div><button class="modal-close" data-modal-close aria-label="Close">×</button></div>
      <form id="plan-form" class="settings-form modal-form">
        <label class="field-label">Plan name<input name="name" maxlength="40" value="${escapeHtml(plan?.name || '')}" placeholder="e.g. Flexible USDT Earn" required></label>
        <div class="form-two-col"><label class="field-label">Asset<select name="asset" class="select-control">${['USDT', 'BTC', 'ETH', 'SOL'].map((asset) => `<option ${plan?.asset === asset ? 'selected' : ''}>${asset}</option>`).join('')}</select></label><label class="field-label">Annual yield (APY %)<input name="apy" type="number" min="0.1" max="100" step="0.1" value="${plan?.apy ?? ''}" required></label></div>
        <div class="form-two-col"><label class="field-label">Lock duration<input name="duration" value="${escapeHtml(plan?.duration || '')}" placeholder="Flexible / 30 days" required></label><label class="field-label">Status<select name="state" class="select-control"><option ${plan?.state !== 'Paused' ? 'selected' : ''}>Active</option><option ${plan?.state === 'Paused' ? 'selected' : ''}>Paused</option></select></label></div>
        <div class="form-two-col"><label class="field-label">Minimum stake<input name="min" type="number" min="0" step="any" value="${plan?.min ?? ''}" required></label><label class="field-label">Maximum stake<input name="max" type="number" min="0" step="any" value="${plan?.max ?? ''}" required></label></div>
        <div class="modal-actions"><button type="button" class="button button-quiet" data-modal-close>Cancel</button><button type="submit" class="button button-primary">${editing ? 'Save plan' : 'Create plan'}</button></div>
      </form>`);
    const form = document.getElementById('plan-form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = new FormData(form);
      const min = Number(fields.get('min'));
      const max = Number(fields.get('max'));
      const apy = Number(fields.get('apy'));
      if (min >= max || !Number.isFinite(apy) || apy <= 0) {
        showToast('Check the APY and ensure maximum stake is above minimum.', 'error');
        return;
      }
      const values = {
        name: fields.get('name').trim(), asset: fields.get('asset'), apy,
        duration: fields.get('duration').trim(), min, max, state: fields.get('state')
      };
      if (editing) Object.assign(plan, values);
      else data.plans.unshift({ ...values, id: Date.now(), subscribers: 0, tone: 'gold' });
      closeModal();
      render();
      showToast(editing ? 'Staking plan updated.' : 'Staking plan created.');
    });
  }

  function openPairForm(pairName = null) {
    const pair = data.pairs.find((item) => item.pair === pairName);
    const editing = Boolean(pair);
    showModal(`<div class="modal-header"><div><span class="eyebrow">TRADING PAIR</span><h2>${editing ? 'Edit pair settings' : 'Add trading pair'}</h2></div><button class="modal-close" data-modal-close aria-label="Close">×</button></div>
      <form id="pair-form" class="settings-form modal-form">
        <label class="field-label">Pair symbol<input name="pair" maxlength="20" value="${escapeHtml(pair?.pair || '')}" placeholder="e.g. BTC / USDT" ${editing ? 'readonly' : ''} required></label>
        <div class="form-two-col"><label class="field-label">Expiry options<input name="duration" value="${escapeHtml(pair?.duration || '1 – 5 min')}" required></label><label class="field-label">Payout rate (%)<input name="payout" type="number" min="1" max="100" value="${pair?.payout ?? 80}" required></label></div>
        <div class="form-two-col"><label class="field-label">Minimum stake<input name="min" type="number" min="0" step="any" value="${pair?.min ?? 1}" required></label><label class="field-label">Maximum stake<input name="max" type="number" min="0" step="any" value="${pair?.max ?? 1000}" required></label></div>
        <label class="field-label">Availability<select class="select-control" name="state"><option ${pair?.state !== 'Disabled' ? 'selected' : ''}>Enabled</option><option ${pair?.state === 'Disabled' ? 'selected' : ''}>Disabled</option></select></label>
        <div class="modal-actions"><button type="button" class="button button-quiet" data-modal-close>Cancel</button><button type="submit" class="button button-primary">${editing ? 'Save pair' : 'Add pair'}</button></div>
      </form>`);
    document.getElementById('pair-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      const min = Number(fields.get('min'));
      const max = Number(fields.get('max'));
      if (min >= max) return showToast('Maximum stake must be higher than minimum stake.', 'error');
      const values = { pair: fields.get('pair').trim().toUpperCase(), duration: fields.get('duration').trim(), payout: Number(fields.get('payout')), min, max, state: fields.get('state') };
      if (!editing && data.pairs.some((item) => item.pair === values.pair)) return showToast('That trading pair already exists.', 'error');
      if (editing) Object.assign(pair, values);
      else data.pairs.push(values);
      closeModal();
      render();
      showToast(editing ? 'Trading pair updated.' : 'Trading pair added.');
    });
  }

  function openTransactionReview(id) {
    const tx = data.transactions.find((item) => item.id === id);
    if (!tx) return showToast('Transaction not found.', 'error');
    const approve = tx.type === 'Deposit' ? 'Approve deposit' : 'Mark as processing';
    showModal(`<div class="modal-header"><div><span class="eyebrow">MANUAL PROCESSING</span><h2>Review transaction</h2></div><button class="modal-close" data-modal-close aria-label="Close">×</button></div>
      <div class="review-transaction"><div><span>Transaction ID</span><strong>${escapeHtml(tx.id)}</strong></div><div><span>Customer</span><strong>${escapeHtml(tx.user)} · ${escapeHtml(tx.uid)}</strong></div><div><span>Type & gateway</span><strong>${escapeHtml(tx.type)} via ${escapeHtml(tx.method)}</strong></div><div><span>Amount</span><strong>${money(tx.amount)} ${escapeHtml(tx.asset)}</strong></div><div><span>Submitted</span><strong>${escapeHtml(tx.date)}</strong></div></div>
      <div class="callout-warning">Confirm the transaction details in your payment provider before approving. This frontend preview does not move funds.</div>
      <div class="modal-actions"><button class="button button-danger-quiet" data-tx-decision="Rejected" data-id="${escapeHtml(tx.id)}">Reject</button><button class="button button-primary" data-tx-decision="${tx.type === 'Deposit' ? 'Approved' : 'Processing'}" data-id="${escapeHtml(tx.id)}">${approve}</button></div>`);
  }

  function bindPageEvents() {
    const userSearch = document.getElementById('user-search');
    if (userSearch) userSearch.addEventListener('input', () => {
      const position = userSearch.selectionStart;
      userQuery = userSearch.value;
      render();
      const next = document.getElementById('user-search');
      next.focus();
      next.setSelectionRange(position, position);
    });
    document.getElementById('user-status-filter')?.addEventListener('change', (event) => {
      const selected = event.target.value;
      document.querySelectorAll('.table-wrap tbody tr').forEach((row) => {
        row.hidden = selected !== 'All statuses' && !row.textContent.includes(selected);
      });
    });
    document.getElementById('transaction-search')?.addEventListener('input', (event) => {
      const query = event.target.value.toLowerCase();
      document.querySelectorAll('#transaction-table tbody tr').forEach((row) => {
        row.hidden = !row.textContent.toLowerCase().includes(query);
      });
    });
    document.querySelectorAll('[data-tx-filter]').forEach((button) => button.addEventListener('click', () => {
      transactionFilter = button.dataset.txFilter;
      render();
    }));
    document.getElementById('brand-settings-form')?.addEventListener('submit', saveSettings);
    document.getElementById('brand-settings-form')?.addEventListener('reset', () => setTimeout(() => {
      document.getElementById('settings-status').textContent = 'Unsaved changes';
    }, 0));
    document.getElementById('site-name-input')?.addEventListener('input', (event) => {
      const name = event.target.value.trim() || 'Your platform';
      document.getElementById('preview-name').textContent = name;
      if (!config.LOGO_URL) document.getElementById('preview-mark').textContent = name.charAt(0).toUpperCase();
    });
    document.querySelector('#brand-settings-form [name="logoUrl"]')?.addEventListener('input', (event) => {
      const mark = document.getElementById('preview-mark');
      const name = document.getElementById('site-name-input').value.trim() || 'Your platform';
      const logoUrl = safeLogoUrl(event.target.value.trim());
      mark.replaceChildren();
      if (logoUrl) {
        const logo = document.createElement('img');
        logo.src = logoUrl;
        logo.alt = '';
        logo.onerror = () => { mark.textContent = name.charAt(0).toUpperCase(); };
        mark.append(logo);
      } else {
        mark.textContent = name.charAt(0).toUpperCase();
      }
    });
    document.getElementById('binary-settings-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const payout = Number(form.elements.maxPayout.value);
      if (payout < 1 || payout > 100) return showToast('Maximum payout must be between 1% and 100%.', 'error');
      showToast('Binary trading parameters saved.');
    });
  }

  function saveSettings(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const siteName = form.elements.siteName.value.trim();
    const logoUrl = form.elements.logoUrl.value.trim();
    if (!siteName) return showToast('Platform name cannot be empty.', 'error');
    if (logoUrl && !safeLogoUrl(logoUrl)) return showToast('Logo URL must use HTTP, HTTPS, or a local file URL.', 'error');
    const systemValues = {
      minDeposit: Number(form.elements.minDeposit.value),
      minWithdrawal: Number(form.elements.minWithdrawal.value),
      txFee: Number(form.elements.txFee.value),
      sessionTimeout: Number(form.elements.sessionTimeout.value)
    };
    if (Object.values(systemValues).some((value) => !Number.isFinite(value) || value < 0) ||
        systemValues.txFee > 100 || systemValues.sessionTimeout < 1) {
      return showToast('Check system values: fee must be 0–100%, timeout at least 1 minute, and limits non-negative.', 'error');
    }
    try {
      localStorage.setItem('tradeAdmin.siteName', siteName);
      localStorage.setItem('tradeAdmin.logoUrl', logoUrl);
      localStorage.setItem('tradeAdmin.currency', form.elements.currency.value);
      localStorage.setItem('tradeAdmin.timezone', form.elements.timezone.value);
      localStorage.setItem('tradeAdmin.minDeposit', String(systemValues.minDeposit));
      localStorage.setItem('tradeAdmin.minWithdrawal', String(systemValues.minWithdrawal));
      localStorage.setItem('tradeAdmin.txFee', String(systemValues.txFee));
      localStorage.setItem('tradeAdmin.sessionTimeout', String(systemValues.sessionTimeout));
      localStorage.setItem('tradeAdmin.maintenance', String(form.elements.maintenance.checked));
      config.SITE_NAME = siteName;
      config.LOGO_URL = logoUrl;
      config.CURRENCY = form.elements.currency.value;
      config.TIMEZONE = form.elements.timezone.value;
      config.MIN_DEPOSIT = systemValues.minDeposit;
      config.MIN_WITHDRAWAL = systemValues.minWithdrawal;
      config.TRANSACTION_FEE = systemValues.txFee;
      config.SESSION_TIMEOUT = systemValues.sessionTimeout;
      config.MAINTENANCE_MODE = form.elements.maintenance.checked;
      document.getElementById('settings-status').textContent = 'Saved just now';
      setBrand();
      showToast('Brand and system settings saved in this browser.');
    } catch (error) {
      showToast('Could not save settings. Check browser storage permissions.', 'error');
    }
  }

  document.getElementById('page-content').addEventListener('click', (event) => {
    const link = event.target.closest('[data-page-link]');
    if (link) {
      const pageFiles = {
        dashboard: 'index.html', users: 'users.html', kyc: 'kyc.html',
        transactions: 'transactions.html', staking: 'staking.html',
        binary: 'trading-config.html', settings: 'settings.html'
      };
      location.href = pageFiles[link.dataset.pageLink] || 'index.html';
    }
    const kycSelection = event.target.closest('[data-kyc-select]');
    if (kycSelection) {
      selectedKycUid = kycSelection.dataset.kycSelect;
      render();
    }
    const wallet = event.target.closest('[data-user-wallet]');
    if (wallet) openUserWallet(wallet.dataset.userWallet);
    const createPlan = event.target.closest('[data-plan-create]');
    if (createPlan) openPlanForm();
    const editPlan = event.target.closest('[data-plan-edit]');
    if (editPlan) openPlanForm(editPlan.dataset.planEdit);
    const togglePlan = event.target.closest('[data-plan-toggle]');
    if (togglePlan) {
      const plan = data.plans.find((item) => item.id === Number(togglePlan.dataset.planToggle));
      if (plan) {
        plan.state = plan.state === 'Active' ? 'Paused' : 'Active';
        render();
        showToast(`${plan.name} ${plan.state.toLowerCase()}.`);
      }
    }
    const createPair = event.target.closest('[data-pair-create]');
    if (createPair) openPairForm();
    const editPair = event.target.closest('[data-pair-edit]');
    if (editPair) openPairForm(editPair.dataset.pairEdit);
    const review = event.target.closest('[data-tx-action="process"]');
    if (review) openTransactionReview(review.dataset.id);
    const decision = event.target.closest('[data-kyc-action]');
    if (decision) {
      const action = decision.dataset.kycAction;
      const user = data.kyc.find((item) => item.uid === decision.dataset.id);
      if (!user) return showToast('KYC submission not found.', 'error');
      showModal(`<div class="modal-header"><div><span class="eyebrow">KYC DECISION</span><h2>${action === 'approve' ? 'Approve identity?' : 'Reject identity?'}</h2></div><button class="modal-close" data-modal-close aria-label="Close">×</button></div><p class="modal-description">${action === 'approve' ? `Confirm ${escapeHtml(user.name)}’s identity documents are valid.` : `Reject ${escapeHtml(user.name)}’s submission? This decision will be recorded in the demo.`}</p><div class="modal-actions"><button class="button button-quiet" data-modal-close>Cancel</button><button class="button ${action === 'approve' ? 'button-primary' : 'button-danger-quiet'}" data-kyc-decision="${action}" data-id="${escapeHtml(user.uid)}">Confirm ${action}</button></div>`);
    }
    const documentPreview = event.target.closest('[data-action="view-document"]');
    if (documentPreview) {
      const user = data.kyc.find((item) => item.uid === selectedKycUid);
      if (user) showModal(`<div class="modal-header"><div><span class="eyebrow">IDENTITY DOCUMENT</span><h2>${escapeHtml(user.document)} · ${escapeHtml(user.name)}</h2></div><button class="modal-close" data-modal-close aria-label="Close">×</button></div><div class="document-preview-large"><div class="document-art"><span class="doc-watermark">${escapeHtml(user.document.toUpperCase())}</span><div class="doc-photo">${escapeHtml(user.initials)}</div><div class="doc-lines"><i></i><i></i><i></i><i></i></div><span class="doc-emblem">✦</span></div></div><p class="modal-hint">Preview document image · JPEG · 2.4 MB. Connect a secure KYC provider to load real documents.</p>`);
    }
    const settingsTab = event.target.closest('[data-settings-tab]');
    if (settingsTab && settingsTab.dataset.settingsTab !== 'brand') showToast(`${settingsTab.dataset.settingsTab} settings are not available in this preview.`, 'info');
    const action = event.target.closest('[data-action]');
    if (action) handleSimpleAction(action.dataset.action);
  });
  document.getElementById('modal-root').addEventListener('click', (event) => {
    const kycDecision = event.target.closest('[data-kyc-decision]');
    if (kycDecision) {
      const user = data.kyc.find((item) => item.uid === kycDecision.dataset.id);
      if (!user) return showToast('KYC submission not found.', 'error');
      const decision = kycDecision.dataset.kycDecision;
      data.kyc = data.kyc.filter((item) => item.uid !== user.uid);
      const account = data.users.find((item) => item.uid === user.uid);
      if (account) account.kyc = decision === 'approve' ? 'Verified' : 'Rejected';
      closeModal();
      render();
      showToast(`${user.name}'s identity was ${decision === 'approve' ? 'approved' : 'rejected'}.`);
      return;
    }
    const decision = event.target.closest('[data-tx-decision]');
    if (!decision) return;
    const tx = data.transactions.find((item) => item.id === decision.dataset.id);
    if (!tx) return showToast('Transaction not found.', 'error');
    tx.status = decision.dataset.txDecision;
    closeModal();
    render();
    showToast(`Transaction ${tx.id} marked ${tx.status.toLowerCase()}.`);
  });

  function handleSimpleAction(action) {
    if (action === 'refresh') {
      pageRoot.classList.add('page-loading');
      setTimeout(() => {
        pageRoot.classList.remove('page-loading');
        render();
        showToast('Dashboard data refreshed.');
      }, 450);
    } else if (action === 'view-document') {
      showToast('Document preview opened.', 'info');
    } else if (action.startsWith('export-')) {
      showToast('Report export is a frontend preview. Connect an API to download data.', 'info');
    } else if (action === 'invite-user') {
      showModal(`<div class="modal-header"><div><span class="eyebrow">ACCOUNT MANAGEMENT</span><h2>Add a user</h2></div><button class="modal-close" data-modal-close aria-label="Close">×</button></div><form id="invite-form" class="settings-form modal-form"><label class="field-label">Email address<input type="email" name="email" placeholder="name@example.com" required></label><p class="modal-hint">Invitations are unavailable until account services are connected.</p><div class="modal-actions"><button type="button" class="button button-quiet" data-modal-close>Cancel</button><button class="button button-primary" type="submit">Send invitation</button></div></form>`);
      document.getElementById('invite-form').addEventListener('submit', (event) => {
        event.preventDefault();
        showToast('Connect the user API to send invitations.', 'info');
        closeModal();
      });
    } else if (action === 'reset-binary') {
      showModal(`<div class="modal-header"><div><span class="eyebrow">CONFIRM ACTION</span><h2>Reset trading configuration?</h2></div><button class="modal-close" data-modal-close aria-label="Close">×</button></div><p class="modal-description">Trading pairs and global parameters will return to their default preview values.</p><div class="modal-actions"><button class="button button-quiet" data-modal-close>Cancel</button><button class="button button-primary" id="confirm-reset">Reset defaults</button></div>`);
      document.getElementById('confirm-reset').addEventListener('click', () => {
        data.pairs = [
          { pair: 'BTC / USDT', duration: '1 – 5 min', payout: 85, min: 1, max: 5000, state: 'Enabled' },
          { pair: 'ETH / USDT', duration: '1 – 5 min', payout: 82, min: 1, max: 2500, state: 'Enabled' },
          { pair: 'SOL / USDT', duration: '1 – 3 min', payout: 78, min: 5, max: 1000, state: 'Enabled' },
          { pair: 'XRP / USDT', duration: '1 – 5 min', payout: 75, min: 1, max: 1000, state: 'Disabled' }
        ];
        closeModal(); render(); showToast('Trading configuration reset.');
      });
    }
  }

  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('sidebar-open');
    document.getElementById('sidebar-backdrop').classList.toggle('visible');
  });
  document.getElementById('sidebar-backdrop').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('sidebar-open');
    document.getElementById('sidebar-backdrop').classList.remove('visible');
  });
  document.getElementById('refresh-button').addEventListener('click', () => handleSimpleAction('refresh'));
  document.querySelector('.notification-trigger').addEventListener('click', () => showToast('You’re all caught up. No new notifications.', 'info'));
  render();
})();
