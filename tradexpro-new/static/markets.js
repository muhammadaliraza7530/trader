const marketAssets = [
    { symbol: 'USDT', pair: 'USDT/USDT', name: 'Tether', price: 1.0001, change24h: 0.01, isHot: true },
    { symbol: 'BTC', pair: 'BTC/USDT', name: 'Bitcoin', price: 79974.010042, change24h: 0.23, isHot: true },
    { symbol: 'ETH', pair: 'ETH/USDT', name: 'Ethereum', price: 2481.669953, change24h: 1.05, isHot: true },
    { symbol: 'SOL', pair: 'SOL/USDT', name: 'Solana', price: 145.2, change24h: 12.45, isHot: true },
    { symbol: 'ALGO', pair: 'ALGO/USDT', name: 'Algorand', price: 0.094953, change24h: -8.45, isHot: false },
    { symbol: 'XRP', pair: 'XRP/USDT', name: 'XRP', price: 1.418742, change24h: -0.65, isHot: true },
    { symbol: 'ADA', pair: 'ADA/USDT', name: 'Cardano', price: 0.220942, change24h: 3.08, isHot: false },
    { symbol: 'MATIC', pair: 'MATIC/USDT', name: 'Polygon', price: 0.379442, change24h: -0.29, isHot: false },
    { symbol: 'DOGE', pair: 'DOGE/USDT', name: 'Dogecoin', price: 0.091133, change24h: 7.25, isHot: true },
];

const marketList = document.getElementById('market-list');
const marketTabs = document.querySelectorAll('[data-market-tab]');

const formatMarketPrice = (price) => Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatMarketChange = (change) => {
    const roundedToThreeDecimals = Number(Math.abs(change).toFixed(3));
    const truncatedChange = Math.trunc(roundedToThreeDecimals * 100) / 100;
    return `${change >= 0 ? '+' : '-'}${truncatedChange.toFixed(2)}%`;
};

const renderMarketRows = (category = 'all') => {
    const filteredAssets = marketAssets.filter((asset) => {
        if (category === 'all') return true;
        if (category === 'gainers') return asset.change24h > 0;
        if (category === 'losers') return asset.change24h < 0;
        return asset.isHot;
    });

    marketList.innerHTML = filteredAssets.map((asset) => {
        const isPositive = asset.change24h >= 0;
        const formattedPrice = formatMarketPrice(asset.price);
        const formattedChange = formatMarketChange(asset.change24h);
        const changeClass = isPositive ? 'text-[#0ECB81]' : 'text-[#EA626A]';

        return `
            <article class="market-row flex items-center justify-between px-4 py-3.5 border-b border-gray-800/40 hover:bg-[#2B313A]/30 transition-colors cursor-pointer w-full" data-category="all ${isPositive ? 'gainers' : 'losers'} ${asset.isHot ? 'hot' : ''}" data-symbol="${asset.symbol}" role="link" tabindex="0" aria-label="Trade ${asset.name}">
                <div class="flex flex-col text-left w-[40%]">
                    <span class="text-sm font-bold text-white tracking-wide">${asset.symbol}<span class="text-xs text-gray-400 font-normal">/${asset.symbol === 'USDT' ? 'USDT' : 'USDT'}</span>${asset.isHot ? '<span class="ml-1 text-[#F0B90B]">★</span>' : ''}</span>
                    <span class="text-[11px] text-gray-400 mt-0.5">${asset.name}</span>
                </div>
                <div class="flex flex-col items-end text-right w-[30%] pr-2">
                    <span class="text-xs font-bold text-white">$${formattedPrice}</span>
                    <span class="text-[10px] text-gray-500">$${formattedPrice}</span>
                </div>
                <div class="flex justify-end items-center w-[30%]">
                    <div class="w-[72px] py-1.5 rounded-md text-xs font-bold text-center ${changeClass} ${isPositive ? 'bg-[#0ECB81]/15' : 'bg-[#EA3943]/15'}">${formattedChange}</div>
                </div>
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

renderMarketRows();
