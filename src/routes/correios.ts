import express, { Request, Response } from "express";
import {calcularPrecoPrazo, consultarCep, rastrearEncomendas} from 'correios-brasil';

export const correiosRoute = express.Router()

correiosRoute.get('/endereco/:cep', async (request: Request, response: Response) => {
  const { cep } = request.params;
  
  if(!/^\d{8}$/.test(cep)) {
    return response.status(400).json({error: "cep informado invalido!"})
  }

  await consultarCep(cep).then((res) => {
    return response.json(res)
  }).catch((err) => {
    return response.status(500).json(err)
  });

});

interface CalcularPrecoPrazoReq {
  cep: string,
  peso: string ,
  formato?: '1' | '2' | '3',
  comprimento?: string,
  altura?: string,
  largura?: string,
  diametro?: string,
}

correiosRoute.post('/preco', async (request: Request, response: Response) => {
  const body:CalcularPrecoPrazoReq = request.body;
  const {cep, peso, formato, comprimento, altura, largura, diametro} = body

  if(!/^\d{8}$/.test(cep)) {
    return response.status(400).json({error: "cep informado invalido!"})
  }

  let args = {
    sCepOrigem: '04101100',
    sCepDestino: body.cep,
    nVlPeso: peso ? peso : '0',
    nCdFormato: formato ? formato : '1',
    nVlComprimento: comprimento ? comprimento : '15', //minimo 20 quando cilindro, 15 quando formato 1
    nVlAltura: formato === '3' ? '0' : (altura ? altura : '5'), //minimo 5
    nVlLargura: largura ? largura : '10',
    nCdServico: ['04014', '04510'], //Array com os códigos de serviço
    nVlDiametro: formato === '2' ? (diametro ? diametro : '8') :'0', // minimo 8
  };

  await calcularPrecoPrazo(args).then((res) => {
    return response.status(res[0].Erro !== '0' ? 400 : 200).json(res)
  })
  //nao esta fazendo nada 
  .catch((err) => {
    return response.status(500).json(err)
  });
})