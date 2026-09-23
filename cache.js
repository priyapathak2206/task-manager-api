const NodeCache = require("node-cache");

const cache = new NodeCache({
  stdTTL: 60,
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
  return {
    hits: cacheHits,
    misses: cacheMisses,
  };
};

module.exports = {
  cache,
  getCache,
  getStats,
};