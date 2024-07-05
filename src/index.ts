import express from "express";

import cors from "cors";
import { getRazorpay, verifyRazorpay } from "./mainfunctions";

const app = express();
app.use(cors());
app.use(express.json());
app.post("/createuser", async (req, res) => {
  const { name, email, phoneNumber } = await req.body;
  console.log("name", name, "email", email, "phoneNumber", phoneNumber);
  const response = await getRazorpay(name, email, phoneNumber);
  console.log("response from create server", response);

  res.send(response);
});

app.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    order_idServer,
  } = await req.body;
  const order_id = razorpay_order_id;
  const payment_id = razorpay_payment_id;
  const signature = razorpay_signature;

  const response = await verifyRazorpay(
    order_id,
    payment_id,
    signature,
    order_idServer
  );

  res.send(response);
});
app.listen(3000, () => console.log("listening on port 3000"));
