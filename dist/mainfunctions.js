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
exports.fetcheverythingusingOrderId = exports.verifyRazorpay = exports.create_order_id = exports.getRazorpay = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = require("crypto");
let instance = new razorpay_1.default({
    key_id: process.env.KEY_ID,
    key_secret: process.env.SECRET,
});
function getRazorpay(username, email, phoneNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const order_Id = yield create_order_id();
        if (order_Id) {
            const response = yield instance.orders.create({
                amount: 100,
                currency: "INR",
                receipt: order_Id,
                notes: {
                    key1: "value3",
                    key2: "value2",
                },
            });
            const update_id = yield prisma.user.update({
                where: { orderId: order_Id },
                data: {
                    name: username,
                    email: email,
                    phoneNumber: phoneNumber,
                    paymentId: response.id,
                },
            });
            const { paymentId } = update_id;
            if (paymentId === response.id) {
                console.log("paymentId", paymentId, order_Id);
                return { razopaypaymentId: paymentId, orderId: order_Id };
            }
        }
        else
            return null;
    });
}
exports.getRazorpay = getRazorpay;
function create_order_id() {
    return __awaiter(this, void 0, void 0, function* () {
        const receipt = Date.now().toString() + Math.random().toString();
        const response = yield prisma.user.create({
            data: {
                orderId: receipt,
            },
        });
        if (response) {
            const { orderId } = response;
            return orderId;
        }
        else {
            return "Something went wrong";
        }
    });
}
exports.create_order_id = create_order_id;
function verifyRazorpay(order_id, payment_id, signature, order_idServer) {
    return __awaiter(this, void 0, void 0, function* () {
        const verifyString = order_id + "|" + payment_id;
        const expectedSignature = (0, crypto_1.createHmac)("sha256", process.env.SECRET)
            .update(verifyString.toString())
            .digest("hex");
        console.log("expectedSignature", expectedSignature);
        if (signature === expectedSignature) {
            try {
                const payment = yield instance.payments.fetch(payment_id);
                console.log("orderId Form verify", order_id);
                console.log("payment from verify", payment);
                if (payment.status === "captured") {
                    console.log("order_id", order_id);
                    console.log("payment_id", payment_id);
                    console.log("signature", signature);
                    const updatingdatabase = yield prisma.user.update({
                        where: { orderId: order_idServer },
                        data: {
                            paymentId: payment_id,
                            signature: signature,
                        },
                    });
                    if (updatingdatabase) {
                        console.log("Payment successfull");
                        return { success: true, message: "Payment successful" };
                    }
                }
                else {
                    console.log("Payment failed");
                    return { success: false, message: "Payment failed" };
                }
            }
            catch (error) {
                console.log("error", error);
                return { success: false, message: error };
            }
        }
        else {
            return { success: false, message: "Invalid signature" };
        }
        // verify signature
    });
}
exports.verifyRazorpay = verifyRazorpay;
function fetcheverythingusingOrderId(order_ID) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield prisma.user.findUnique({
            where: { orderId: order_ID },
        });
        if (response) {
            const { name, email, phoneNumber, paymentId, orderId } = response;
            return { name, email, phoneNumber, paymentId, orderId };
        }
        else {
            return null;
        }
    });
}
exports.fetcheverythingusingOrderId = fetcheverythingusingOrderId;
