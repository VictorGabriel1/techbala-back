import mongoose from "mongoose"


export const cardSchema = new mongoose.Schema({
    numero: String,
    cpf: String,
    cvv: String,
    titular: String,
    nascimetno: String,
    vencimento: String,
    limite: Number
})

export const CardModel = mongoose.model("card", cardSchema)