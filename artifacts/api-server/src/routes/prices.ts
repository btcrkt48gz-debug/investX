import { Router, type IRouter } from 'express';

const router: IRouter = Router();

// CoinGecko free API — no key required
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
const COIN_IDS =
  'bitcoin,ethereum,solana,binancecoin,cardano,ripple,polkadot,dogecoin,litecoin,uniswap,avalanche-2,chainlink,tron,near';

// Map from ticker symbol → CoinGecko ID
const SYMBOL_TO_ID: Record<string, string> = {
  BTC:  'bitcoin',
  ETH:  'ethereum',
  SOL:  'solana',
  BNB:  'binancecoin',
  ADA:  'cardano',
  XRP:  'ripple',
  DOT:  'polkadot',
  DOGE: 'dogecoin',
  LTC:  'litecoin',
  UNI:  'uniswap',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  TRX:  'tron',
  NEAR: 'near',
};

interface CoinGeckoPrice {
  usd: number;
  usd_24h_change?: number;
}

interface CoinGeckoResponse {
  [coinId: string]: CoinGeckoPrice;
}

interface PriceEntry {
  price: number;
  change24h: number;
}

interface CacheEntry {
  prices: Record<string, PriceEntry>;
  fetchedAt: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 60_000; // refresh at most once per minute

async function fetchPrices(): Promise<Record<string, PriceEntry>> {
  // Serve from cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.prices;
  }

  const url = `${COINGECKO_URL}?ids=${COIN_IDS}&vs_currencies=usd&include_24hr_change=true`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`CoinGecko responded with ${res.status}`);

  const data = (await res.json()) as CoinGeckoResponse;

  const prices: Record<string, PriceEntry> = {};
  for (const [symbol, coinId] of Object.entries(SYMBOL_TO_ID)) {
    const coin = data[coinId];
    if (coin) {
      prices[symbol] = {
        price:     coin.usd,
        change24h: coin.usd_24h_change ?? 0,
      };
    }
  }

  cache = { prices, fetchedAt: Date.now() };
  return prices;
}

/* GET /api/prices — returns live crypto prices, cached 60 s */
router.get('/prices', async (req, res) => {
  try {
    const prices = await fetchPrices();
    res.json({ prices, cachedAt: cache?.fetchedAt ?? Date.now(), ok: true });
  } catch (err) {
    // Fall back to last cache even if stale, rather than returning nothing
    if (cache) {
      res.json({ prices: cache.prices, cachedAt: cache.fetchedAt, stale: true, ok: true });
      return;
    }
    req.log.warn({ err }, 'Failed to fetch live crypto prices from CoinGecko');
    res.status(503).json({ prices: {}, ok: false, error: 'Price feed temporarily unavailable' });
  }
});

export default router;
