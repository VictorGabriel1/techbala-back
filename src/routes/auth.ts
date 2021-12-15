import express, { NextFunction, request, Request, response, Response } from "express";
import { UserModel } from "../models/user";
import crypto from "crypto";
import jwt from "jsonwebtoken"
import multer from "multer"
import path from "path"
import fs from "fs/promises"

type DecodedToken = {
    sub: string;
}

export const authRoute = express.Router();

export function checkAuthMiddleware(request: Request, response: Response, next: NextFunction) {
    const { authorization } = request.headers;
    console.log(authorization)

    if (!authorization) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Token not present.' })
    }

    const [, token] = authorization?.split(' ');
    console.log(token);


    if (!token) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Token not present.' })
    }

    try {
        const decoded = jwt.verify(token as string, "supersecret") as DecodedToken;
        console.log(decoded);

        request.user = decoded.sub;

        return next();
    } catch (err) {

        return response
            .status(401)
            .json({ error: true, code: 'token.expired', message: 'Token invalid.' })
    }
}

const createPath = async (request: Request, response: Response, next: NextFunction) => {
    await fs.rm(`src/perfilImgs/${request.user}`, { recursive: true, force: true })
    await fs.mkdir(path.join(__dirname, "../perfilImgs", `${request.user}`))
    next()
}

const saveFileToDataBase = async (request: Request, response: Response, next: NextFunction) => {
    await UserModel.findOneAndUpdate({ email: request.user }, { imagem: `http://localhost:3333/perfilImgs/${request.user}/${request.fileName}` })
    next()
}

function generateJwt(email: string, payload: object = {}) {

    const token = jwt.sign(payload, "supersecret", {
        subject: email,
        expiresIn: 24 * 60 * 60
    });
    return token
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        // error first callback
        cb(null, `src/perfilImgs/${req.user}`);
    },
    filename: function (req, file, cb) {
        const fileName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        req.fileName = fileName
        cb(null, `${fileName}`);
    }
});

const upload = multer({ storage })

authRoute.post('/upload', checkAuthMiddleware, createPath, upload.single('file'), saveFileToDataBase,
    (req, res) => res.send('<h2>Upload realizado com sucesso</h2>'));

authRoute.get('/me', checkAuthMiddleware, async (request, response) => {
    const email = request.user;

    const user = await UserModel.findOne({ email }).select("-senha");
    if (!user) {
        return response
            .status(404)
            .json({ error: true, message: 'User not found.' });
    }

    return response.status(200).json(user)
});



authRoute.post("/login", async (request, response) => {
    const { email, senha: pwd } = request.body;
    const check: { email: string, senha: { hash: string, salt: string } } = await UserModel.findOne({ email })
    console.log(check)
    if (check) {
        const authenticatedPass = await isPasswordCorrect(check.senha.hash, check.senha.salt, 1000, pwd)
        if (authenticatedPass) {
            const token = await generateJwt(check.email)
            return response.json({
                token
            });
        }
    }
    return response.status(401).json({ error: "E-mail ou senha incorretos!" });
});

authRoute.post("/newuser", async (request, response) => {
    const { nome, email, senha } = request.body;
    const emailsExistentes = await UserModel.findOne({ email })

    if (!emailsExistentes) {
        try {
            const passcode = await hashPassword(senha)
            const user = new UserModel({ nome, email, senha: passcode });
            const res = await user.save();
            response.status(201).json({ message: "Cadastro feito com sucesso." });
        } catch (e) {
            console.log(e);
            response.status(500);
        }
    } else {
        return response.status(409).json({ message: "Uma conta com o e-mail digitado aparentemente já existe." })
    }
});

authRoute.put("/edituser", checkAuthMiddleware, async (request, response) => {
    const { nome, rua, casanum, complemento, bairro, cep, cidade, estado, fixo, celular, carrinho, pedidos } = request.body;
    let filter = { email: request.user };
    try {
        if (nome) {
            await UserModel.updateOne(filter, { nome });
        }
        if (rua) {
            await UserModel.updateOne(filter, { "endereco.rua": rua });
        }
        if (casanum) {
            await UserModel.updateOne(filter, { "endereco.casanum": casanum });
        }
        if (complemento) {
            await UserModel.updateOne(filter, { "endereco.complemento": complemento });
        }
        if (bairro) {
            await UserModel.updateOne(filter, { "endereco.bairro": bairro });
        }
        if (cep) {
            await UserModel.updateOne(filter, { "endereco.cep": cep });
        }
        if (cidade) {
            await UserModel.updateOne(filter, { "endereco.cidade": cidade });
        }
        if (estado) {
            await UserModel.updateOne(filter, { "endereco.estado": estado });
        }
        if (fixo) {
            await UserModel.updateOne(filter, { "telefone.fixo": fixo });
        }
        if (celular) {
            await UserModel.updateOne(filter, { "telefone.celular": celular });
        }
        if (carrinho) {
            await UserModel.updateOne(filter, { "carrinho": carrinho });
        }
        if (pedidos) {
            await UserModel.updateOne(filter, { "pedidos": pedidos });
        }
        response.status(200).json("Alteração concluida.")
    } catch (e) {
        console.log(e);
        response.sendStatus(500);
    }
});

authRoute.put("/addcard", async (request, response) => {
    const { email, titular, numero, cvv, validade, cpf, nascimento } = request.body;
    let filter = { email };
    try {
        if (titular) {
            await UserModel.updateOne(filter, { "cartao.titular": titular });
            await UserModel.updateOne(filter, { "cartao.numero": numero });
            await UserModel.updateOne(filter, { "cartao.cvv": cvv });
            await UserModel.updateOne(filter, { "cartao.validade": validade });
            await UserModel.updateOne(filter, { "cartao.cpf": cpf });
            await UserModel.updateOne(filter, { "cartao.nascimento": nascimento });
        }
        response.status(200).json("Alteração concluida.")
    } catch (e) {
        console.log(e);
        response.sendStatus(500);
    }
});

authRoute.put("/userremove", async (request, response) => {
    const { email } = request.body
    let filter = { email }
    try {
        await UserModel.updateOne(filter, { ativo: false })
    } catch (e) {
        console.log(e)
        response.sendStatus(500)
    }
});

const hashPassword = async (password) => {
    var salt = crypto.randomBytes(128).toString("base64");
    var iterations = 1000;
    return new Promise(async (resolve, reject) => {
        await crypto.pbkdf2(
            password,
            salt,
            iterations,
            32,
            "sha512",
            (err, key) => {
                if (err) reject(err);
                resolve({
                    salt,
                    hash: key.toString("hex"),
                });
            }
        );
    });
};

const isPasswordCorrect = async (hash, salt, iterations, password) => {
    return new Promise(async (resolve, reject) => {
        await crypto.pbkdf2(
            password,
            salt,
            iterations,
            32,
            "sha512",
            (err, key) => {
                if (err) reject(err);
                resolve(key.toString("hex") === hash);
            }
        );
    });
};

// const obj = JSON.parse(fs.readFileSync("./password.json").toString());

// const { hash, salt, iterations } = obj;

// isPasswordCorrect(hash, salt, iterations, "banana").then(console.log);

// hashPassword("banana").then(console.log);
