const  { data } = require("./postgres.js")

const users = async(userId) => {
    if (userId){
        let res = await data(`
            select * from users where user_id = $1;
        `,userId)
        return res[0]
    } else {
        let res = await data(`
            select * from users;
        `)
        return res
    }
}

const insertUser = async(obj, chatId) => {
    if (obj?.steep){
        let res = await data(`
            update users set steep = $1 where user_id = $2
        `,obj?.steep, obj?.chatId)
    } else if(chatId){
        let res = await data(`
            insert into users(user_id,steep) values ($1 , 'home')
        `,chatId,)
    } else if (obj?.username){
        let res = await data(`
            update users set username = $1 where user_id = $2
        `,obj?.username, obj?.chatId)
    } else if (obj?.steep){
        let res = await data(`
            update users set phone_number = $1 where user_id = $2
        `,obj?.phone_number, obj?.chatId)
    }
}

const cards = async(obj) => {
    if(obj.card_num){
        let res = await data(`
            insert into cards (user_Id, card_number) values ($1,$2)
        `,obj.chatId, obj.card_num)
    }else if(obj.card_number){
        let res = await data(`
            update cards set card_number = $1 where user_id = $2 
        `,obj.card_number,obj.chatId)
    } 
    else if(obj.card_date){
        let res = await data(`
            update cards set card_date = $2 where user_id = $1
        `,obj.chatId, obj.card_date)
    } else if(obj.card_holder) {
        let res = await data(`
        update cards set card_holder = $2 where user_id = $1
        `,obj.chatId, obj.card_holder)
    } else {
        let res = await data(`
            select * from cards where user_id = $1
        `, obj.chatId)
        return res[0]
    }
} 



const selectService = async (obj) => {
    if(obj.service){
        let res = await data(`
            select * from service
        `)
        return res
    } else if (obj.m_service){
        let res = await data(`
            select * from master_service where service_id = $1
        `, obj.m_service)
        return res
    }
}

const deleteOrder = async(userId) => { 
    await data(`delete from orders where user_id = $1`,userId)
}

const orders = async(obj, userId) => {
    if(obj.card_num){
        let res = await data(`
            update orders set card_number = $1 where user_id = $2 returning *
        `,obj.card_num, obj.chatId)
        if(res) return true
    } else if (obj.card_date){
        let res = await data(`
            update orders set card_date = $1 where user_id = $2 returning *
        `, obj.card_date, obj.chatId)
        if (res) return true
    } else if(obj.schot){
        let res = await data(`
            update orders set schot = $1 where user_id = $2 returning *
        `, obj.schot, obj.chatId)
        if(res) return  true 
    } else if (obj.summa){
        let res = await data(`
            update orders set summa = $1 where user_id = $2 returning *
        `, obj.summa, obj.chatId)
        if(res) return  true 
    } else if (obj.service_id){
        let res = await data(`
            insert into orders(service_id, user_id) values ($1,$2) returning * 
        `, obj.service_id, obj.chatId)
        if(res) return  true 
    } else if(obj.verify){
        let res = await data(`
            update orders set verify = $1 where user_id = $2
        `,obj.verify, obj.chatId)
    } else {
        let res = await data(`
            select * from orders where user_id = $1
        `, userId)
        return res
    }
}

    

module.exports = {
    selectService,
    deleteOrder,
    insertUser,
    orders,
    users,
    cards
}







