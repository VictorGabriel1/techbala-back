"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var produtoSchema = new mongoose_1.default.Schema({
    titulo: {
        type: String,
        required: true,
    },
    descricao: {
        type: String,
        required: true,
    },
    preco: {
        type: Number,
        required: true,
    },
    imagem: {
        type: String,
        required: true
    },
    categoria: {
        type: String,
        enum: ['placa de video', 'processador', 'memoria', 'armazenamento', 'gabinete', 'cooler', 'fontes', 'placa mae', 'headset', 'mouse', 'teclado', 'monitor', 'computador', 'outros'],
        default: 'outros',
        required: true
    },
    estoque: {
        type: Number,
        required: true,
        default: 0
    },
    informacoestecnicas: {
        modelo: {
            type: String,
            default: ''
        },
        marca: {
            type: String,
            default: ''
        },
        especificacoes: {
            type: String,
            default: ''
        },
        garantia: {
            type: String,
            default: ''
        },
        // peso em gramas
        peso: {
            type: Number,
            default: 0
        },
        // dimensoes em milimetros
        dimensoes: {
            comprimento: {
                type: Number,
                default: 0
            },
            largura: {
                type: Number,
                default: 0
            },
            altura: {
                type: Number,
                default: 0
            }
        }
    }
});
var ProdutoModel = mongoose_1.default.model("produto", produtoSchema);
exports.default = ProdutoModel;
