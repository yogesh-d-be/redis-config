// redis.config.js in @infra/redis-config
const Redis = require('ioredis');

let redis;

function initRedis(customConfig = {}) {
  const {
    host = 'localhost',
    port = 6379,
    password = null,
    db = 0,
    keyPrefix = '',
  } = customConfig;

  redis = new Redis({
    host,
    port,
    password,
    db,
    keyPrefix,
    enableReadyCheck: false,
  });

  redis.on('connect', () => console.log('✅ Redis connected successfully'));
  redis.on('error', (err) => console.error('❌ Redis connection error:', err));
  redis.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));

  return redis;
}

module.exports = {
  initRedis,
};
