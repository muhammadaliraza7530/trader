window.ADMIN_DATA = {
  users: [
    { uid: 'TX-10482', name: 'Aarav Sharma', email: 'aarav.sharma@mail.com', country: 'India', balance: 24850.75, joined: 'Oct 04, 2026', status: 'Active', kyc: 'Verified', initials: 'AS', color: 'violet' },
    { uid: 'TX-10481', name: 'Olivia Chen', email: 'olivia.chen@mail.com', country: 'Singapore', balance: 12740.00, joined: 'Oct 04, 2026', status: 'Active', kyc: 'Pending', initials: 'OC', color: 'blue' },
    { uid: 'TX-10480', name: 'Mohammed Khan', email: 'mkhan@mail.com', country: 'UAE', balance: 8920.50, joined: 'Oct 03, 2026', status: 'Restricted', kyc: 'Pending', initials: 'MK', color: 'amber' },
    { uid: 'TX-10479', name: 'Sofia Rodriguez', email: 'sofia.r@mail.com', country: 'Spain', balance: 6430.25, joined: 'Oct 03, 2026', status: 'Active', kyc: 'Verified', initials: 'SR', color: 'pink' },
    { uid: 'TX-10478', name: 'James Wilson', email: 'j.wilson@mail.com', country: 'United Kingdom', balance: 3215.00, joined: 'Oct 02, 2026', status: 'Active', kyc: 'Unverified', initials: 'JW', color: 'green' },
    { uid: 'TX-10477', name: 'Priya Patel', email: 'priya.p@mail.com', country: 'India', balance: 15600.90, joined: 'Oct 02, 2026', status: 'Active', kyc: 'Verified', initials: 'PP', color: 'blue' }
  ],
  kyc: [
    { uid: 'TX-10481', name: 'Olivia Chen', email: 'olivia.chen@mail.com', document: 'Passport', country: 'Singapore', submitted: '12 min ago', initials: 'OC', color: 'blue' },
    { uid: 'TX-10480', name: 'Mohammed Khan', email: 'mkhan@mail.com', document: 'National ID', country: 'UAE', submitted: '38 min ago', initials: 'MK', color: 'amber' },
    { uid: 'TX-10475', name: 'Daniel Kim', email: 'daniel.k@mail.com', document: 'Driver license', country: 'South Korea', submitted: '1 hr ago', initials: 'DK', color: 'pink' },
    { uid: 'TX-10472', name: 'Emma Thompson', email: 'emma.t@mail.com', document: 'Passport', country: 'Canada', submitted: '3 hrs ago', initials: 'ET', color: 'green' },
    { uid: 'TX-10469', name: 'Lucas Silva', email: 'lucas.s@mail.com', document: 'National ID', country: 'Brazil', submitted: '5 hrs ago', initials: 'LS', color: 'violet' }
  ],
  transactions: [
    { id: 'DEP-90214', user: 'Aarav Sharma', uid: 'TX-10482', type: 'Deposit', amount: 2500, asset: 'USDT', method: 'TRC20', date: 'Oct 06, 2026 · 10:42', status: 'Pending' },
    { id: 'WTH-90213', user: 'Olivia Chen', uid: 'TX-10481', type: 'Withdrawal', amount: 840, asset: 'USDT', method: 'ERC20', date: 'Oct 06, 2026 · 10:18', status: 'Pending' },
    { id: 'DEP-90212', user: 'Sofia Rodriguez', uid: 'TX-10479', type: 'Deposit', amount: 1200, asset: 'BTC', method: 'Bitcoin', date: 'Oct 06, 2026 · 09:56', status: 'Approved' },
    { id: 'WTH-90211', user: 'James Wilson', uid: 'TX-10478', type: 'Withdrawal', amount: 320, asset: 'USDT', method: 'TRC20', date: 'Oct 06, 2026 · 09:22', status: 'Processing' },
    { id: 'DEP-90210', user: 'Priya Patel', uid: 'TX-10477', type: 'Deposit', amount: 5000, asset: 'USDT', method: 'BEP20', date: 'Oct 06, 2026 · 08:47', status: 'Approved' },
    { id: 'WTH-90209', user: 'Mohammed Khan', uid: 'TX-10480', type: 'Withdrawal', amount: 1750, asset: 'USDT', method: 'TRC20', date: 'Oct 05, 2026 · 23:15', status: 'Rejected' }
  ],
  plans: [
    { id: 1, name: 'Flexible Earn', asset: 'USDT', apy: 5.2, duration: 'Flexible', min: 100, max: 25000, subscribers: 1248, state: 'Active', tone: 'gold' },
    { id: 2, name: 'Bitcoin Growth', asset: 'BTC', apy: 8.5, duration: '30 days', min: 0.005, max: 2, subscribers: 386, state: 'Active', tone: 'orange' },
    { id: 3, name: 'ETH Lock-up', asset: 'ETH', apy: 12.0, duration: '90 days', min: 0.1, max: 50, subscribers: 214, state: 'Active', tone: 'blue' },
    { id: 4, name: 'USDT Premium', asset: 'USDT', apy: 18.5, duration: '180 days', min: 1000, max: 100000, subscribers: 92, state: 'Paused', tone: 'green' }
  ],
  pairs: [
    { pair: 'BTC / USDT', duration: '1 – 5 min', payout: 85, min: 1, max: 5000, state: 'Enabled' },
    { pair: 'ETH / USDT', duration: '1 – 5 min', payout: 82, min: 1, max: 2500, state: 'Enabled' },
    { pair: 'SOL / USDT', duration: '1 – 3 min', payout: 78, min: 5, max: 1000, state: 'Enabled' },
    { pair: 'XRP / USDT', duration: '1 – 5 min', payout: 75, min: 1, max: 1000, state: 'Disabled' }
  ],
  banners: [
    { id: 1, order: 1, title: 'Complete KYC & Unlock Platform Features', subtitle: 'Verify your identity to unlock more ways to trade.', imageUrl: '', ctaText: 'Complete KYC', ctaUrl: '/kyc.html', startsAt: '2026-10-01T00:00', endsAt: '2026-12-31T23:59', active: true },
    { id: 2, order: 2, title: 'Explore New Staking Plans', subtitle: 'Put eligible assets to work with flexible staking options.', imageUrl: '', ctaText: 'View Plans', ctaUrl: '/staking.html', startsAt: '2026-10-01T00:00', endsAt: '2026-12-31T23:59', active: false }
  ]
};
