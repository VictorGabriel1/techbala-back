import express from "express";
import { CardModel } from "../models/card";
import { checkAuthMiddleware } from "./auth";

export const paymentRoute = express.Router();

paymentRoute.post('/card', checkAuthMiddleware, async (request, response) => {
  const { numero, cpf, cvv, titular, nascimento, vencimento, limite } = request.body
  
  const card = await CardModel.findOne({ numero })
  if(!card) return response.status(404).json({ error: true, message: "Cartão não existente." })
  


  return response.status(200).json({message : "transação aceita!"})

})