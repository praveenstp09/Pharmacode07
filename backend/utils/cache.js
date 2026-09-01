import Redis from 'ioredis';

// Local In-Memory Cache Store (Fallback if Redis is not configured)
const memoryStore = new Map();

let redisClient = null;
let isRedisConnected = false;

// Initialize Redis only if environment variable is configured
const redisUrl = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : null);

if (redisUrl) {
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 500, 2000);
      },
      lazyConnect: true,
    });

    redisClient.connect()
      .then(() => {
        isRedisConnected = true;
        console.log('⚡ Redis Cache Connected successfully');
      })
      .catch(err => {
        console.warn('⚠️ Redis connection failed, falling back to in-memory cache:', err.message);
        isRedisConnected = false;
      });

    redisClient.on('error', err => {
      // Suppress noisy logs when Redis disconnects
      isRedisConnected = false;
    });
  } catch (err) {
    console.warn('⚠️ Redis initialization failed, using in-memory cache:', err.message);
  }
}

/**
 * Retrieve an item from cache (Redis or Memory)
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export const getCache = async (key) => {
  try {
    if (isRedisConnected && redisClient) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    }
  } catch (e) {
    // Redis get error, fallback to memory
  }

  const item = memoryStore.get(key);
  if (!item) return null;

  if (item.expiresAt && Date.now() > item.expiresAt) {
    memoryStore.delete(key);
    return null;
  }

  return item.value;
};

/**
 * Store an item in cache (Redis or Memory)
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds Default: 60 seconds
 * @returns {Promise<void>}
 */
export const setCache = async (key, value, ttlSeconds = 60) => {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    }
  } catch (e) {
    // Redis set error, fallback to memory
  }

  memoryStore.set(key, {
    value,
    expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
  });
};

/**
 * Delete an item from cache
 * @param {string} key
 * @returns {Promise<void>}
 */
export const delCache = async (key) => {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.del(key);
    }
  } catch (e) {}

  memoryStore.delete(key);
};

/**
 * Clear all cache entries or pattern match
 * @param {string} [prefix] Optional key prefix to flush
 * @returns {Promise<void>}
 */
export const flushCache = async (prefix = '') => {
  try {
    if (isRedisConnected && redisClient) {
      if (prefix) {
        const keys = await redisClient.keys(`${prefix}*`);
        if (keys.length > 0) await redisClient.del(...keys);
      } else {
        await redisClient.flushdb();
      }
    }
  } catch (e) {}

  if (prefix) {
    for (const key of memoryStore.keys()) {
      if (key.startsWith(prefix)) memoryStore.delete(key);
    }
  } else {
    memoryStore.clear();
  }
};

export default {
  get: getCache,
  set: setCache,
  del: delCache,
  flush: flushCache,
};
