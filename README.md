# infra-redis-config

A production-grade, flexible Redis/Redis Cluster configuration utility built on top of [ioredis](https://github.com/luin/ioredis). Designed for reuse across monoliths and microservices in CommonJS-based Node.js projects. Handles connection lifecycle, TLS, cluster mode, graceful shutdown, and replica-aware reads.

---

## Features

- **Cluster & Single-node support**
- **TLS-ready**
- **Graceful shutdown (`SIGINT`)**
- **Key prefixing**
- **Replica-aware read scaling**
- **Plug-and-play singleton instance**
- **Environment-agnostic (dev/staging/prod)**

---

## Installation

From your **private Verdaccio registry**:

```bash
npm install infra-redis-config --registry=https://package.99wincart.com/
```

---

## Usage

### Basic (Single Instance)

```js
const { initRedis, getRedis } = require('infra-redis-config');

initRedis({
  host: '127.0.0.1',
  port: 6379,
  db: 0,
  keyPrefix: 'myapp:',
});

const redis = getRedis();
redis.set('key', 'value');
```

---

### Cluster Mode (Production)

```js
const { initRedis, getRedis } = require('infra-redis-config');

initRedis({
  enableCluster: true,
  clusterNodes: [
    { host: '10.0.0.1', port: 6379 },
    { host: '10.0.0.2', port: 6379 },
    { host: '10.0.0.3', port: 6379 },
  ],
  password: 'securePassword',
  scaleReadsFromReplicas: true,
  keyPrefix: 'prod:',
  tlsOptions: {
    // For example, with stunnel or AWS ElastiCache TLS
    rejectUnauthorized: false,
  },
});

const redis = getRedis();
redis.set('user:1001', JSON.stringify({ name: 'Yogesh' }));
```

---

## Graceful Shutdown

Gracefully closes Redis connections when your Node.js process receives a termination signal:

```bash
SIGINT → redis.quit() → process.exit(0)
```

---

## API Reference

### `initRedis(config: RedisConfig): Redis | Redis.Cluster`

Initialize Redis or Redis Cluster.

| Option                    | Type      | Description                                                                 |
|---------------------------|-----------|-----------------------------------------------------------------------------|
| `host`                    | `string`  | Redis host (default: `'localhost'`)                                         |
| `port`                    | `number`  | Redis port (default: `6379`)                                                |
| `password`                | `string`  | Redis password                                                              |
| `db`                      | `number`  | Redis DB index (ignored in cluster mode)                                   |
| `keyPrefix`               | `string`  | Prefix for all keys                                                         |
| `enableCluster`           | `boolean` | Enable Redis Cluster mode                                                   |
| `clusterNodes`            | `array`   | Array of `{ host, port }` nodes for cluster                                |
| `tlsOptions`              | `object`  | TLS config for secure Redis connections                                     |
| `scaleReadsFromReplicas` | `boolean` | Use replicas for reads in cluster mode (default: `false`)                  |
| `logger`                  | `object`  | Logger (must implement `log/info/error/warn`)                              |

---

### `getRedis(): Redis | Redis.Cluster`

Returns the current singleton Redis client.

---

## Best Practices

- Use `keyPrefix` to namespace each microservice.
- Avoid multiple DBs (e.g., `db=1`, `db=2`) if you're using Redis Cluster.
- Log Redis status clearly in all environments.
- Centralize config (dotenv or shared config service).

---

## Author

**Yogesh D** — MERN Stack Developer

---

## License

MIT © Yogesh D
