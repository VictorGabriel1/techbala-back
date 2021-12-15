"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.userSchema = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.userSchema = new mongoose_1.default.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true },
    senha: {
        salt: { type: String, required: true },
        hash: { type: String, required: true }
    },
    endereco: {
        rua: { type: String, default: "" },
        casanum: { type: String, default: "" },
        complemento: { type: String, default: "" },
        bairro: { type: String, default: "" },
        cep: { type: String, default: "" },
        estado: { type: String, default: "" },
        cidade: { type: String, default: "" }
    },
    telefone: {
        fixo: { type: String, default: "" },
        celular: { type: String, default: "" }
    },
    imagem: { type: String, default: "http://localhost:3333/images/perfildef.png" },
    carrinho: Array,
    pedidos: Array,
    ativo: { type: Boolean, default: true }
});
exports.UserModel = mongoose_1.default.model("usuario", exports.userSchema);
