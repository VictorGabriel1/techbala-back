"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var produto_1 = require("./routes/produto");
var auth_1 = require("./routes/auth");
var correios_1 = require("./routes/correios");
var cors_1 = __importDefault(require("cors"));
var mongoose_1 = __importDefault(require("mongoose"));
var payment_1 = require("./routes/payment");
var app = (0, express_1.default)();
app.use(express_1.default.static("src"));
app.use("/static", express_1.default.static("images"));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// mongoose.connect("mongodb://192.168.15.30:27017/TechBala")
mongoose_1.default.connect("mongodb+srv://AdminTB:Gabrielpaulovictor2021@cluster0.yf8dl.mongodb.net/TechBala");
app.use('/produto', produto_1.produtoRoute);
app.use('/auth', auth_1.authRoute);
app.use('/correios', correios_1.correiosRoute);
app.use('/payment', payment_1.paymentRoute);
app.listen(3333, function () { return console.log("Server running!"); });
