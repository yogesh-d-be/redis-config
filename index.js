const Redis = require('ioredis');

let redisInstance = null;

function initRedis(config = {}) {
  if (redisInstance) return redisInstance;

  const {
    host = 'localhost',
    port = 6379,
    password = null,
    db = 0,
    keyPrefix = '',
    enableCluster = false,
    clusterNodes = [],
    tlsOptions = null,
    scaleReadsFromReplicas = false,
    lazyConnect = false,
    autoResubscribe = true,
    autoResendUnfulfilledCommands = true,
    logger = console,
  } = config;

  const redisOptions = {
    password,
    db,
    keyPrefix,
    enableReadyCheck: true,
    tls: tlsOptions || undefined,
    lazyConnect,
    autoResubscribe,
    autoResendUnfulfilledCommands,
  };

  if (enableCluster) {
    if (!Array.isArray(clusterNodes) || clusterNodes.length < 3) {
      throw new Error('Redis Cluster requires at least 3 master nodes.');
    }

    redisInstance = new Redis.Cluster(clusterNodes, {
      redisOptions,
      scaleReads: scaleReadsFromReplicas ? 'slave' : 'master',
      slotsRefreshTimeout: 2000,
      slotsRefreshInterval: 10000,
      dnsLookup: (address, callback) => callback(null, address),
    });
  } else {
    redisInstance = new Redis({ host, port, ...redisOptions });
  }

  redisInstance.on('connect', () => logger.log('✅ Redis connected'));
  redisInstance.on('ready', () => logger.log('🚀 Redis ready'));
  redisInstance.on('error', (err) => logger.error('❌ Redis error:', err));
  redisInstance.on('reconnecting', () => logger.warn('🔄 Redis reconnecting...'));
  redisInstance.on('close', () => logger.warn('🔌 Redis connection closed'));
  redisInstance.on('end', () => logger.warn('🛑 Redis connection ended'));


  process.on('SIGINT', async () => {
    if (redisInstance) {
      await redisInstance.quit();
      logger.log('👋 Redis disconnected (SIGINT)');
      process.exit(0);
    }
  });

  return redisInstance;
}


function getRedis() {
  if (!redisInstance) {
    throw new Error('❌ Redis not initialized. Call initRedis() first.');
  }
  return redisInstance;
}


// Close the current Redis connection manually.

async function closeRedis() {
  if (redisInstance) {
    await redisInstance.quit();
    redisInstance = null;
  }
}

module.exports = {
  initRedis,
  getRedis,
  closeRedis,
};
