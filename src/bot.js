const Telegram = require('node-telegram-bot-api')
const token = 'token'
const bot = new Telegram(token, {polling:true}) 

const { cards, users, insertUser, selectService, orders, deleteOrder} = require('./query')
const { home, cancel } = require('./menu')
const { default: axios } = require('axios')

bot.on('text', async(msg) => {
    
    const chatId = msg.chat.id;
    const text = msg.text;
    const steep = (await users(chatId))?.steep
    if(text == 'š Ortga'){
        await deleteOrder(chatId)
        bot.sendMessage(chatId, "š  Bosh sahifa",{
            reply_markup: await service(true)

        })
        await insertUser({chatId, steep:"home"})
    } else if(text == '/start'){
        await deleteOrder(chatId)
        bot.sendMessage(chatId, "š Assalomualekum to`lov tiziming yangi bosqichiga hush kelibsiz!\nš¤ Endi siz bot orqali to`lovlarni tez amalga oshirishingiz mumkin",{
            reply_markup: await service(true)
        })
        let user = await users(chatId)
        if(!user) {
            await insertUser(null,chatId)
        } else {
            await insertUser({chatId, steep:"home"})
        }
    } else if(steep == 'home'){
        bot.sendMessage(chatId, "š Xizmatlardan birini tanlang š",{
            reply_markup: await service(false, text)
        })
    } else if (steep == 'card') {

        try{
            if(!/^(8600|9860)[0-9]{12}?$/.test(text)) return bot.sendMessage(chatId, "Karta raqami xato kiritildi", {reply_markup: cancel})
            let card = await cards({chatId})
            if(!card) await cards({chatId, card_num: text})
            else await cards({chatId, card_number: text})
            await insertUser({chatId, steep: 'card_date'})
            await orders({chatId, card_num: text})
            bot.sendMessage(chatId, "Kartani amal qilish muddatini kiriting\nNamuna: 0526 yoki 05/26", {reply_markup: await mycard(chatId, false)})
        }catch(error){
            console.log(error)
        }

    } else if (steep == 'card_date'){
        try{
            if(text.length != 4 && text.length != 5 ) return bot.sendMessage(chatId, "Kartani amal qilish muddatini to`g`ri kiriting")
            let txt = text.split('/').join('')
            await cards({chatId, card_date: txt})
            await orders({chatId, card_date: txt})
            bot.sendMessage(chatId, "Kartangiz qo`shildi endi to`lov qilmoqchi bo`lgan hisob raqamingizni yozing",{reply_markup: cancel})
            await insertUser({chatId, steep: 'schet'}) 
        }catch(error){
            console.log(error)
        }

    } else if(steep ==  'schet'){
        try{ 
            let user = await orders({},chatId)   
            let order = user[0]
            let phone = ""
            if([628, 40, 132, 8, 163, 5].includes(order.service_id)){
                if(/^998(9[012345789]|3[3]|7[1]|8[8])[0-9]{7}$/.test(text)) phone = text.slice(3)
                else if(/^(9[012345789]|3[3]|7[1]|8[8])[0-9]{7}$/.test(text)) phone = text
                else return bot.sendMessage(chatId, "Telefon raqamingizni to'g'ri yozing\n<i>Nauna 998901234567 yoki 901234567</i>", {parse_mode: "HTML", reply_markup:cancel})
            }
            phone = text
            await orders({chatId, schot: text})
            let res = await axios.get(`http://localhost:4000/find_accaunt?accaunt=${phone}&serviceId=${order.service_id}`)
            if (res.data.data?.message) return bot.sendMessage(chatId, res.data.data?.message, {reply_markup: cancel})
            else if (res.data.data?.balance) bot.sendMessage(chatId, `Kartangizda ${res.data.data.balance} so'm bor\nTo'ldirmoqchi bo'gan summangizni yozing`, {reply_markup: cancel})
            else if (res.data.data?.currencyRate && res.data.data?.currencySymbol == 'USD') bot.sendMessage(chatId, `š Kurs: 1 USD = ${res.data.data.currencyRate} so'm\nš° To'ldirmoqchi bo'lgan summanigizni so'mda yozing`)
            else if (res.data.data?.currencyRate && res.data.data?.currencySymbol == 'RUB') bot.sendMessage(chatId, `š Kurs: 1 RUB = ${res.data.data.currencyRate} so'm\nš° To'ldirmoqchi bo'lgan summanigizni so'mda yozing`)
            else bot.sendMessage(chatId, "To'ldirmoqchi bo'lgan summangizni yozing")
            await insertUser({chatId, steep: 'summa'}) 
        }catch(error){
            console.log(error)
        }
    } else if (steep == 'summa'){
        try {
            if (isNaN(text)) return bot.sendMessage(chatId, 'Summani to`g `ri kiriting')
            if(text < 1000 || text > 1000000000) return bot.sendMessage(chatId, "Minimal summa 1000 so'm Maximal summa 1000000000" )
            let user = await orders({},chatId)
            let order = user[0]
            let res = await axios.get(`http://localhost:4000/pay?accaunt=${order.schot}&sum=${text}&cardNum=${order.card_number}&cardDate=${order.card_date}&serviceId=${order.service_id}`)
            await orders({chatId, summa: text})
            if(res.data?.verfyId) await orders({chatId, verify: res.data?.verfyId})
            if(res.data?.message != 'Card not found') {
                if(res.data?.message == 'Due to exceeding input attempts, your card is temporarily blocked') return bot.sendMessage(chatId, res.data?.message)
                
                bot.sendMessage(chatId, `${ res.data?.message } raqamiga yuborilgan sms kodni kiriting`, { reply_markup: cancel })
            }else if(res.data.message == 'Card not found') {
                await insertUser({chatId, steep:"home"})
                return bot.sendMessage(chatId, 'Kiritilgan karta topilmadi kartangiz raqmini yaxshilab tekshiring yoki boshqa karta kiriting',{ reply_markup: await service(true) })
            }   
            await insertUser({chatId, steep: 'sms'})  
        } catch (error) {
            console.log(error)        
        }     
        
    } else if (steep ==  'sms'){
        try{
            if (isNaN(text) && text.length  == 6) return bot.sendMessage(chatId, 'Iltimos raqamigizga yuborilgan sms kodni kiriting')
            let user = await orders({},chatId)
            let order = user[0]
            let res = await axios.get(`http://localhost:4000/code?verfyId=${order.verify}&phoneCode=${text}`)
            if(res.data.paymentDate){
                await insertUser({chatId, steep: 'home'})  
                return bot.sendMessage(chatId, `${res.data.amount} so'm miqdoridagi summa ${res.data.account} ${res.data.serviceName} hisobiga o'tkazildi `, {reply_markup: await service(true)}) 
            } 
            else if(res.data?.data?.message) bot.sendMessage(chatId, res.data.data.message, { reply_markup: await service(true) })
            else {
                if(res.data.message == "Kodni kiritishdagi urinishlar soni belgilangan me'yordan oshib ketdi"){
                    await insertUser({chatId, steep: 'home'})   
                    return bot.sendMessage(chatId, res.data.message, { reply_markup: await service(true) })
                }
                else  
                    bot.sendMessage(chatId, res.data.message)
            }
        }catch (error){
            console.log(error)
        }
    }
})


bot.on('callback_query', async(msg) => {
    try {
        let chatId = msg.from.id;
        let data = msg.data;
        let msgId = msg.message.message_id;
        bot.deleteMessage(chatId, msgId);
        bot.sendMessage(chatId, "To`lovni amalga oshirish uchun UZCARD/HUMO karta raqamizni kiriting",{
            reply_markup: await mycard(chatId, true)
        });
        await insertUser({chatId, steep: "card"});
        await orders({chatId, service_id: data })
    } catch (error) {
        console.log(error)
    }
})

const mycard = async (chatId, kluch) => {
    let res = await cards({chatId})
    let arr2 = []
    if(!res?.card_number || !res?.card_date) {
        arr2.push([{text: "š Ortga"}])
        return {resize_keyboard: true, keyboard: arr2}
    }
    if(kluch){
        arr2.push([{text: res.card_number}])
    } else {
        arr2.push([{text: res.card_date}])
    }
    arr2.push([{text: "š Ortga"}])
    return {resize_keyboard: true, keyboard: arr2}
}


const service = async (kluch, text) => {
    if (kluch) {
        let res = await selectService({service: true})
        let arr1 = []
        let arr2 = []
        let count = 0
        res.forEach(el => {
            if(count < 2){
                arr1.push({text: el.service_name})
                count += 1
            } else {
                arr2.push(arr1)
                count = 0
                arr1 = []
                arr1.push({text: el.service_name})
            }  
        })
        arr2.push(arr1)
        return {resize_keyboard: true, keyboard: arr2}
    } else {
        let ser = await selectService({service: true})
        let service = ser.find(el => el.service_name == text)
        if(!service) return  
        let res = await selectService({m_service: service?.service_id})
        let arr1 = []
        res.forEach(el => {
            arr1.push([{text: el.service_name, callback_data: el.m_service_id}])
        })
        return {inline_keyboard: arr1}
    }
}
