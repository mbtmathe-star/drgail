const { Redis } = require('@upstash/redis');

module.exports = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
