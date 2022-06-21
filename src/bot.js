const Telegram = require('node-telegram-bot-api')
const token = '5457614156:AAFA50LNE2dV9hu-gj-gvK9cFZxq_gPuJf0'

const bot = new Telegram(token, {polling:true}) 

bot.on('text', msg => {
    const chatId = msg.chat.id;
    const text = msg.text;
    bot.sendMessage
    
})