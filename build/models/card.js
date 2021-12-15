"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardModel = exports.cardSchema = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.cardSchema = new mongoose_1.default.Schema({
    numero: String,
    cpf: String,
    cvv: String,
    titular: String,
    nascimetno: String,
    vencimento: String,
    limite: Number
});
exports.CardModel = mongoose_1.default.model("card", exports.cardSchema);
