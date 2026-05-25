const { Bot } = require('grammy');
const env = require('./env');

const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

module.exports = bot;