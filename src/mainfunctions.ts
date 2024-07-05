import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import Razorpay from "razorpay";
import { createHmac } from "crypto";

let instance = new Razorpay({
  key_id: process.env.KEY_ID!,
  key_secret: process.env.SECRET,
});

export async function getRazorpay(
  username: string,
  email: string,
  phoneNumber: string
) {
  const order_Id = await create_order_id();

  if (order_Id) {
    const response = await instance.orders.create({
      amount: 100,
      currency: "INR",
      receipt: order_Id,
      notes: {
        key1: "value3",
        key2: "value2",
      },
    });

    const update_id = await prisma.user.update({
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
  } else return null;
}

export async function create_order_id() {
  const receipt = Date.now().toString() + Math.random().toString();
  const response = await prisma.user.create({
    data: {
      orderId: receipt,
    },
  });
  if (response) {
    const { orderId } = response;

    return orderId;
  } else {
    return "Something went wrong";
  }
}
export async function verifyRazorpay(
  order_id: string,
  payment_id: string,
  signature: string,
  order_idServer: string
) {
  const verifyString = order_id + "|" + payment_id;

  const expectedSignature = createHmac("sha256", process.env.SECRET!)
    .update(verifyString.toString())
    .digest("hex");
  console.log("expectedSignature", expectedSignature);
  if (signature === expectedSignature) {
    try {
      const payment = await instance.payments.fetch(payment_id);
      console.log("orderId Form verify", order_id);
      console.log("payment from verify", payment);
      if (payment.status === "captured") {
        console.log("order_id", order_id);
        console.log("payment_id", payment_id);
        console.log("signature", signature);
        const updatingdatabase = await prisma.user.update({
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
      } else {
        console.log("Payment failed");
        return { success: false, message: "Payment failed" };
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, message: error };
    }
  } else {
    return { success: false, message: "Invalid signature" };
  }

  // verify signature
}

export async function fetcheverythingusingOrderId(order_ID: string) {
  const response = await prisma.user.findUnique({
    where: { orderId: order_ID },
  });
  if (response) {
    const { name, email, phoneNumber, paymentId, orderId } = response;

    return { name, email, phoneNumber, paymentId, orderId };
  } else {
    return null;
  }
}
