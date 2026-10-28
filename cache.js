const NodeCache = require("node-cache");

// Practical 9: In-memory caching with a 60-second standard TTL
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
});

let cacheHits = 0;
let cacheMisses = 0;

const getCache = (key) => {
  const value = cache.get(key);

  if (value !== undefined) {
    cacheHits++;
    return value;
  }

  cacheMisses++;
  return undefined;
};

const getStats = () => {
  const total = cacheHits + cacheMisses;
  const hitRatio = total > 0 ? ((cacheHits / total) * 100).toFixed(1) : "0.0";
  return {
    hits: cacheHits,
    misses: cacheMisses,
    totalRequests: total,
    hitRatio: `${hitRatio}%`,
    cachedKeysCount: cache.keys().length,
    cachedKeys: cache.keys(),
    stdTTL: 60,
  };
};

const resetStats = () => {
  cacheHits = 0;
  cacheMisses = 0;
};

module.exports = {
  cache,
  getCache,
  getStats,
  resetStats,
};
