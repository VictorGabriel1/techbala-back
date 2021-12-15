import express from "express";
import { produtoRoute } from "./routes/produto";
import { authRoute } from "./routes/auth"
import { correiosRoute } from "./routes/correios";
import cors from "cors";
import mongoose from "mongoose";
import { paymentRoute } from "./routes/payment";

const app = express();

app.use(express.static("src"))
app.use("/static", express.static("images"))

app.use(cors())
app.use(express.json())

// mongoose.connect("mongodb://192.168.15.30:27017/TechBala")
mongoose.connect("mongodb+srv://AdminTB:Gabrielpaulovictor2021@cluster0.yf8dl.mongodb.net/TechBala")

app.use('/produto', produtoRoute)
app.use('/auth', authRoute)
app.use('/correios', correiosRoute)
app.use('/payment', paymentRoute)

app.listen(3333, () => console.log("Server running!"))