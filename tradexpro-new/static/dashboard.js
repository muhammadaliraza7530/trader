const balanceVisibilityToggle = document.getElementById('balance-visibility-toggle');
const totalBalance = document.getElementById('total-balance');
const usdtBalance = document.getElementById('usdt-balance');
const eyeVisible = document.getElementById('eye-visible');
const eyeHidden = document.getElementById('eye-hidden');
const balanceStorageKey = 'trade-xpro-balance-visible';

const formatBalance = (value) => Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const setBalanceVisibility = (isVisible) => {
    if (isVisible) {
        totalBalance.textContent = `$${formatBalance(totalBalance.dataset.balance)}`;
        usdtBalance.textContent = `≈ ${formatBalance(usdtBalance.dataset.balance)} USDT`;
        eyeVisible.classList.remove('hidden');
        eyeHidden.classList.add('hidden');
        balanceVisibilityToggle.setAttribute('aria-pressed', 'false');
        balanceVisibilityToggle.setAttribute('aria-label', 'Hide balance');
    } else {
        const decimalPart = Number(totalBalance.dataset.balance).toFixed(2).split('.')[1];
        totalBalance.textContent = `$ ****.${decimalPart}`;
        usdtBalance.textContent = '≈ **** USDT';
        eyeVisible.classList.add('hidden');
        eyeHidden.classList.remove('hidden');
        balanceVisibilityToggle.setAttribute('aria-pressed', 'true');
        balanceVisibilityToggle.setAttribute('aria-label', 'Show balance');
    }

    try {
        localStorage.setItem(balanceStorageKey, String(isVisible));
    } catch (error) {
        // The toggle remains functional when browser storage is unavailable.
    }
};

let isBalanceVisible = true;
try {
    isBalanceVisible = localStorage.getItem(balanceStorageKey) !== 'false';
} catch (error) {
    isBalanceVisible = true;
}

balanceVisibilityToggle.addEventListener('click', () => {
    isBalanceVisible = !isBalanceVisible;
    setBalanceVisibility(isBalanceVisible);
});

setBalanceVisibility(isBalanceVisible);

const marketPairs = [
    { symbol: 'USDT', name: 'USDT/USDT', fullName: 'Tether / Tether', price: 1.0001, secondaryPrice: '$1.00', '24hChange': 0.01, chartData: [8, 9, 8, 10, 9, 11, 10, 12], type: 'hot', isHot: true },
    { symbol: 'BTC', name: 'BTC/USDT', fullName: 'Bitcoin / Tether', price: 62822.40, secondaryPrice: '$62,822.40', '24hChange': 2.45, chartData: [8, 10, 9, 13, 11, 16, 14, 19, 18, 22], type: 'gainer', isHot: true },
    { symbol: 'ETH', name: 'ETH/USDT', fullName: 'Ethereum / Tether', price: 2481.67, secondaryPrice: '$2,481.67', '24hChange': 1.05, chartData: [9, 8, 12, 11, 14, 13, 17, 19], type: 'gainer', isHot: true },
    { symbol: 'SOL', name: 'SOL/USDT', fullName: 'Solana / Tether', price: 145.20, secondaryPrice: '$145.20', '24hChange': 12.45, chartData: [6, 8, 9, 12, 11, 16, 19, 23, 27], type: 'gainer', isHot: false },
    { symbol: 'ALGO', name: 'ALGO/USDT', fullName: 'Algorand / Tether', price: 0.09503, secondaryPrice: '$0.095030', '24hChange': -8.45, chartData: [22, 20, 19, 16, 15, 12, 9, 7, 5], type: 'loser', isHot: false },
    { symbol: 'XRP', name: 'XRP/USDT', fullName: 'XRP / Tether', price: 1.41873, secondaryPrice: '$1.4187', '24hChange': -0.65, chartData: [20, 18, 19, 15, 16, 12, 13, 9], type: 'loser', isHot: true },
    { symbol: 'ADA', name: 'ADA/USDT', fullName: 'Cardano / Tether', price: 0.220888, secondaryPrice: '$0.2209', '24hChange': -3.08, chartData: [22, 20, 21, 16, 17, 12, 10, 7], type: 'loser', isHot: false },
];
const marketTabs = document.querySelectorAll('[data-market-tab]');
const marketList = document.getElementById('market-list');

const renderSparkline = (values, isPositive) => {
    const width = 52;
    const height = 22;
    const min = Math.min(...values);
    const range = Math.max(...values) - min || 1;
    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - 2 - ((value - min) / range) * (height - 4);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<svg class="market-sparkline ${isPositive ? 'is-positive' : 'is-negative'}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${isPositive ? 'Rising' : 'Falling'} price trend"><polyline points="${points}"/></svg>`;
};

const renderMarketRows = (category = 'hot') => {
    const filteredPairs = category === 'hot'
        ? marketPairs.filter((pair) => pair.isHot)
        : category === 'gainers'
            ? marketPairs.filter((pair) => pair['24hChange'] > 0).sort((left, right) => right['24hChange'] - left['24hChange'])
            : marketPairs.filter((pair) => pair['24hChange'] < 0).sort((left, right) => left['24hChange'] - right['24hChange']);
    marketList.innerHTML = filteredPairs.map((pair) => {
        const change = pair['24hChange'];
        const isPositive = change >= 0;
        const formattedChange = `${isPositive ? '+' : ''}${change.toFixed(2)}%`;
        return `<article class="market-row grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-800/30 cursor-pointer border-b border-gray-800/20 transition-all" data-symbol="${pair.symbol}" role="link" tabindex="0" aria-label="Open ${pair.name} market details">
            <div class="asset-name col-span-5"><span class="asset-pair text-sm font-bold text-white">${pair.name}</span><small class="asset-description text-[11px] text-gray-400">${pair.fullName}</small></div>
            <div class="market-middle col-span-4 text-right flex flex-col items-end justify-center">${renderSparkline(pair.chartData, isPositive)}<div class="asset-price"><span class="text-xs font-semibold text-white">$${pair.price.toLocaleString('en-US', { minimumFractionDigits: pair.price < 1 ? 6 : 2, maximumFractionDigits: pair.price < 1 ? 6 : 2 })}</span></div></div>
            <div class="market-right col-span-3 text-right flex justify-end"><span class="change-pill w-20 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-0.5 ${isPositive ? 'is-positive' : 'is-negative'}"><span aria-hidden="true">${isPositive ? '↑' : '↓'}</span>${formattedChange}</span></div>
        </article>`;
    }).join('');

    marketList.querySelectorAll('.market-row').forEach((row) => {
        const openTrade = () => window.location.assign(`/trading/${row.dataset.symbol}`);
        row.addEventListener('click', openTrade);
        row.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openTrade();
            }
        });
    });
};

renderMarketRows();
marketTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        marketTabs.forEach((item) => {
            const selected = item === tab;
            item.classList.toggle('is-active', selected);
            item.setAttribute('aria-selected', String(selected));
        });
        renderMarketRows(tab.dataset.marketTab);
    });
});

const promoBanners = [
    {
        title: 'Complete KYC & Unlock Platform Features',
        subtitle: 'Verify your identity to unlock more ways to trade.',
        cta: 'Complete KYC',
        href: '/kyc.html',
    },
    {
        title: 'Explore New Staking Plans',
        subtitle: 'Put your eligible assets to work with staking.',
        cta: 'View Plans',
        href: '/staking.html',
    },
];
const promoCard = document.getElementById('promo-card');
const promoTitle = document.getElementById('promo-title');
const promoSubtitle = document.getElementById('promo-subtitle');
const promoCta = document.getElementById('promo-cta');
const promoDots = document.getElementById('promo-dots');
let activePromoIndex = 0;
let promoSwipeStartX = 0;

const renderPromo = (index, animate = false) => {
    const nextIndex = (index + promoBanners.length) % promoBanners.length;
    const updatePromo = () => {
        const banner = promoBanners[nextIndex];
        promoTitle.textContent = banner.title;
        promoSubtitle.textContent = banner.subtitle;
        promoCta.textContent = banner.cta;
        promoCta.href = banner.href;
        activePromoIndex = nextIndex;
        promoDots.querySelectorAll('button').forEach((dot, dotIndex) => {
            const isActive = dotIndex === activePromoIndex;
            dot.classList.toggle('is-active', isActive);
            dot.setAttribute('aria-current', String(isActive));
        });
    };

    if (!animate) {
        updatePromo();
        return;
    }

    promoCard.classList.add('is-transitioning');
    window.setTimeout(() => {
        updatePromo();
        window.requestAnimationFrame(() => promoCard.classList.remove('is-transitioning'));
    }, 140);
};

promoBanners.forEach((banner, index) => {
    const dot = document.createElement('button');
    dot.className = 'promo-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show promotion ${index + 1}: ${banner.title}`);
    dot.addEventListener('click', () => renderPromo(index, true));
    promoDots.append(dot);
});
renderPromo(0);
window.setInterval(() => renderPromo(activePromoIndex + 1, true), 4000);

promoCard.addEventListener('touchstart', (event) => {
    promoSwipeStartX = event.changedTouches[0].clientX;
}, { passive: true });
promoCard.addEventListener('touchend', (event) => {
    const swipeDistance = event.changedTouches[0].clientX - promoSwipeStartX;
    if (Math.abs(swipeDistance) > 40) {
        renderPromo(activePromoIndex + (swipeDistance < 0 ? 1 : -1), true);
    }
}, { passive: true });

const transferDialog = document.getElementById('transfer-dialog');
const toast = document.getElementById('dashboard-toast');
let toastTimer;

document.getElementById('transfer-trigger').addEventListener('click', () => transferDialog.showModal());
document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => document.getElementById(button.dataset.closeDialog).close());
});

document.getElementById('transfer-form').addEventListener('submit', (event) => {
    event.preventDefault();
    transferDialog.close();
    event.currentTarget.reset();
    showDashboardToast('Internal transfers are not enabled in this preview');
});

document.querySelector('.notification-button').addEventListener('click', () => {
    showDashboardToast('You are all caught up');
});

function showDashboardToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}
