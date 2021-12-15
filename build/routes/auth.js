"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthMiddleware = exports.authRoute = void 0;
var express_1 = __importDefault(require("express"));
var user_1 = require("../models/user");
var crypto_1 = __importDefault(require("crypto"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var multer_1 = __importDefault(require("multer"));
var path_1 = __importDefault(require("path"));
var promises_1 = __importDefault(require("fs/promises"));
exports.authRoute = express_1.default.Router();
function checkAuthMiddleware(request, response, next) {
    var authorization = request.headers.authorization;
    console.log(authorization);
    if (!authorization) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Token not present.' });
    }
    var _a = authorization === null || authorization === void 0 ? void 0 : authorization.split(' '), token = _a[1];
    console.log(token);
    if (!token) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Token not present.' });
    }
    try {
        var decoded = jsonwebtoken_1.default.verify(token, "supersecret");
        console.log(decoded);
        request.user = decoded.sub;
        return next();
    }
    catch (err) {
        return response
            .status(401)
            .json({ error: true, code: 'token.expired', message: 'Token invalid.' });
    }
}
exports.checkAuthMiddleware = checkAuthMiddleware;
var createPath = function (request, response, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, promises_1.default.rm("src/perfilImgs/" + request.user, { recursive: true, force: true })];
            case 1:
                _a.sent();
                return [4 /*yield*/, promises_1.default.mkdir(path_1.default.join(__dirname, "../perfilImgs", "" + request.user))];
            case 2:
                _a.sent();
                next();
                return [2 /*return*/];
        }
    });
}); };
var saveFileToDataBase = function (request, response, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1.UserModel.findOneAndUpdate({ email: request.user }, { imagem: "http://localhost:3333/perfilImgs/" + request.user + "/" + request.fileName })];
            case 1:
                _a.sent();
                next();
                return [2 /*return*/];
        }
    });
}); };
function generateJwt(email, payload) {
    if (payload === void 0) { payload = {}; }
    var token = jsonwebtoken_1.default.sign(payload, "supersecret", {
        subject: email,
        expiresIn: 24 * 60 * 60
    });
    return token;
}
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // error first callback
        cb(null, "src/perfilImgs/" + req.user);
    },
    filename: function (req, file, cb) {
        var fileName = file.fieldname + "-" + Date.now() + path_1.default.extname(file.originalname);
        req.fileName = fileName;
        cb(null, "" + fileName);
    }
});
var upload = (0, multer_1.default)({ storage: storage });
exports.authRoute.post('/upload', checkAuthMiddleware, createPath, upload.single('file'), saveFileToDataBase, function (req, res) { return res.send('<h2>Upload realizado com sucesso</h2>'); });
exports.authRoute.get('/me', checkAuthMiddleware, function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = request.user;
                return [4 /*yield*/, user_1.UserModel.findOne({ email: email }).select("-senha")];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, response
                            .status(404)
                            .json({ error: true, message: 'User not found.' })];
                }
                return [2 /*return*/, response.status(200).json(user)];
        }
    });
}); });
exports.authRoute.post("/login", function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, pwd, check, authenticatedPass, token;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = request.body, email = _a.email, pwd = _a.senha;
                return [4 /*yield*/, user_1.UserModel.findOne({ email: email })];
            case 1:
                check = _b.sent();
                console.log(check);
                if (!check) return [3 /*break*/, 4];
                return [4 /*yield*/, isPasswordCorrect(check.senha.hash, check.senha.salt, 1000, pwd)];
            case 2:
                authenticatedPass = _b.sent();
                if (!authenticatedPass) return [3 /*break*/, 4];
                return [4 /*yield*/, generateJwt(check.email)];
            case 3:
                token = _b.sent();
                return [2 /*return*/, response.json({
                        token: token
                    })];
            case 4: return [2 /*return*/, response.status(401).json({ error: "E-mail ou senha incorretos!" })];
        }
    });
}); });
exports.authRoute.post("/newuser", function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, nome, email, senha, emailsExistentes, passcode, user, res, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = request.body, nome = _a.nome, email = _a.email, senha = _a.senha;
                return [4 /*yield*/, user_1.UserModel.findOne({ email: email })];
            case 1:
                emailsExistentes = _b.sent();
                if (!!emailsExistentes) return [3 /*break*/, 7];
                _b.label = 2;
            case 2:
                _b.trys.push([2, 5, , 6]);
                return [4 /*yield*/, hashPassword(senha)];
            case 3:
                passcode = _b.sent();
                user = new user_1.UserModel({ nome: nome, email: email, senha: passcode });
                return [4 /*yield*/, user.save()];
            case 4:
                res = _b.sent();
                response.status(201).json({ message: "Cadastro feito com sucesso." });
                return [3 /*break*/, 6];
            case 5:
                e_1 = _b.sent();
                console.log(e_1);
                response.status(500);
                return [3 /*break*/, 6];
            case 6: return [3 /*break*/, 8];
            case 7: return [2 /*return*/, response.status(409).json({ message: "Uma conta com o e-mail digitado aparentemente já existe." })];
            case 8: return [2 /*return*/];
        }
    });
}); });
exports.authRoute.put("/edituser", checkAuthMiddleware, function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, nome, rua, casanum, complemento, bairro, cep, cidade, estado, fixo, celular, carrinho, pedidos, filter, e_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = request.body, nome = _a.nome, rua = _a.rua, casanum = _a.casanum, complemento = _a.complemento, bairro = _a.bairro, cep = _a.cep, cidade = _a.cidade, estado = _a.estado, fixo = _a.fixo, celular = _a.celular, carrinho = _a.carrinho, pedidos = _a.pedidos;
                filter = { email: request.user };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 26, , 27]);
                if (!nome) return [3 /*break*/, 3];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { nome: nome })];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3:
                if (!rua) return [3 /*break*/, 5];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "endereco.rua": rua })];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                if (!casanum) return [3 /*break*/, 7];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "endereco.casanum": casanum })];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7:
                if (!complemento) return [3 /*break*/, 9];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "endereco.complemento": complemento })];
            case 8:
                _b.sent();
                _b.label = 9;
            case 9:
                if (!bairro) return [3 /*break*/, 11];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "endereco.bairro": bairro })];
            case 10:
                _b.sent();
                _b.label = 11;
            case 11:
                if (!cep) return [3 /*break*/, 13];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "endereco.cep": cep })];
            case 12:
                _b.sent();
                _b.label = 13;
            case 13:
                if (!cidade) return [3 /*break*/, 15];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "endereco.cidade": cidade })];
            case 14:
                _b.sent();
                _b.label = 15;
            case 15:
                if (!estado) return [3 /*break*/, 17];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "endereco.estado": estado })];
            case 16:
                _b.sent();
                _b.label = 17;
            case 17:
                if (!fixo) return [3 /*break*/, 19];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "telefone.fixo": fixo })];
            case 18:
                _b.sent();
                _b.label = 19;
            case 19:
                if (!celular) return [3 /*break*/, 21];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "telefone.celular": celular })];
            case 20:
                _b.sent();
                _b.label = 21;
            case 21:
                if (!carrinho) return [3 /*break*/, 23];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "carrinho": carrinho })];
            case 22:
                _b.sent();
                _b.label = 23;
            case 23:
                if (!pedidos) return [3 /*break*/, 25];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "pedidos": pedidos })];
            case 24:
                _b.sent();
                _b.label = 25;
            case 25:
                response.status(200).json("Alteração concluida.");
                return [3 /*break*/, 27];
            case 26:
                e_2 = _b.sent();
                console.log(e_2);
                response.sendStatus(500);
                return [3 /*break*/, 27];
            case 27: return [2 /*return*/];
        }
    });
}); });
exports.authRoute.put("/addcard", function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, titular, numero, cvv, validade, cpf, nascimento, filter, e_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = request.body, email = _a.email, titular = _a.titular, numero = _a.numero, cvv = _a.cvv, validade = _a.validade, cpf = _a.cpf, nascimento = _a.nascimento;
                filter = { email: email };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 9, , 10]);
                if (!titular) return [3 /*break*/, 8];
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "cartao.titular": titular })];
            case 2:
                _b.sent();
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "cartao.numero": numero })];
            case 3:
                _b.sent();
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "cartao.cvv": cvv })];
            case 4:
                _b.sent();
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "cartao.validade": validade })];
            case 5:
                _b.sent();
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "cartao.cpf": cpf })];
            case 6:
                _b.sent();
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { "cartao.nascimento": nascimento })];
            case 7:
                _b.sent();
                _b.label = 8;
            case 8:
                response.status(200).json("Alteração concluida.");
                return [3 /*break*/, 10];
            case 9:
                e_3 = _b.sent();
                console.log(e_3);
                response.sendStatus(500);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); });
exports.authRoute.put("/userremove", function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var email, filter, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = request.body.email;
                filter = { email: email };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, user_1.UserModel.updateOne(filter, { ativo: false })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_4 = _a.sent();
                console.log(e_4);
                response.sendStatus(500);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
var hashPassword = function (password) { return __awaiter(void 0, void 0, void 0, function () {
    var salt, iterations;
    return __generator(this, function (_a) {
        salt = crypto_1.default.randomBytes(128).toString("base64");
        iterations = 1000;
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, crypto_1.default.pbkdf2(password, salt, iterations, 32, "sha512", function (err, key) {
                                if (err)
                                    reject(err);
                                resolve({
                                    salt: salt,
                                    hash: key.toString("hex"),
                                });
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var isPasswordCorrect = function (hash, salt, iterations, password) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, crypto_1.default.pbkdf2(password, salt, iterations, 32, "sha512", function (err, key) {
                                if (err)
                                    reject(err);
                                resolve(key.toString("hex") === hash);
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
// const obj = JSON.parse(fs.readFileSync("./password.json").toString());
// const { hash, salt, iterations } = obj;
// isPasswordCorrect(hash, salt, iterations, "banana").then(console.log);
// hashPassword("banana").then(console.log);
