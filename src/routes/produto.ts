import express, { Request, Response } from 'express'
import mongoose, { isValidObjectId, QuerySelector } from "mongoose";
import ProdutoModel from '../models/produto';

export const produtoRoute = express.Router()

// Procurar todos produtos
produtoRoute.get('', async (request:Request, response: Response) => {
  
  let titulo = request.query.titulo;
  if(!titulo) titulo = ''
  let categoria = request.query.categoria;
  if(!categoria) categoria = ''
  let orderBy = request.query.orderBy;
  if(!orderBy) orderBy = ''
  
  const produtos = await ProdutoModel.find({ titulo: new RegExp(`${titulo}`, 'gi'), categoria: new RegExp(`${categoria}`, 'gi') })
  .sort(orderBy === 'higherprice' ? {preco: -1} : orderBy === 'lowerprice' ? { preco : 1} : orderBy === 'relevancia' ? {titulo: -1} : {} )
  
  if(produtos.length === 0) return response.status(404).json({error: "Produtos nao encontrados!"})

  return response.json(produtos);
})

// Procurar UM Produto
produtoRoute.get('/:id', async (request:Request, response:Response) => {
  const { id } = request.params;
  if (!isValidObjectId(id)) {
    return response.status(400).json({ error: "id not valid!"})
  }

  const produto = await ProdutoModel.findById(id)

  if(!produto) return response.status(404).json({error: "produto nao encontrado"})

  return response.json(produto)
})

interface IProduto<T> extends Request {
  body: T
}

interface ProdutoDoc extends mongoose.Document {
  titulo: String,
  descricao: String,
  preco: Number,
  imagem: String,
  categoria: 'placa de video' | 'processador' | 'memoria' | 'armazenamento' | 
    'gabinete' | 'cooler' | 'fontes' | 'placa mae' | 'headset' | 'mouse' | 
    'teclado' | 'monitor' | 'computador' | 'outros',
  estoque?: Number,
  informacoestecnicas?: { 
    modelo?: String,
    marca?: String,
    especificacoes?: String,
    garantia?: String,
    peso?: Number,
    dimensoes?: {
      comprimeto?: Number,
      largura?: Number,
      altura?: Number
    }
  }
}

// Criar produto
produtoRoute.post('', async (request: Request, response: Response) => {
  const produto:ProdutoDoc = request.body;
  // console.log(produto);
  try {
    
    //console.log(body);
    // if(!produto) return response.status(400).json({ error: "produto invalido!"})
    
    const newProduto = new ProdutoModel(produto)
    console.log(newProduto);
    const res = await newProduto.save()
    console.log(res);
    
    if(!res) return response.status(500).json({error: "Erro Interno"});
    
    return response.status(201).json(res)
  } catch (error) {
    return response.status(400).json({message: "produto invalido", ...error})
  }
  })
  
