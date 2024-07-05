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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mainfunctions_1 = require("./mainfunctions");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/createuser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phoneNumber } = yield req.body;
    console.log("name", name, "email", email, "phoneNumber", phoneNumber);
    const response = yield (0, mainfunctions_1.getRazorpay)(name, email, phoneNumber);
    console.log("response from create server", response);
    res.send(response);
}));
app.post("/verify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_idServer, } = yield req.body;
    const order_id = razorpay_order_id;
    const payment_id = razorpay_payment_id;
    const signature = razorpay_signature;
    const response = yield (0, mainfunctions_1.verifyRazorpay)(order_id, payment_id, signature, order_idServer);
    res.send(response);
}));
app.listen(3000, () => console.log("listening on port 3000"));
