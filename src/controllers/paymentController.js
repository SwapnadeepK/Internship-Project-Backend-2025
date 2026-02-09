const db = require("../config/db");
const FeePayment = require("../models/feePaymentModel");
const updateFeeStatus = require("../utils/updateFeeStatus");

const makePayment = async (req, res) => {
  const { feeId, amount, payment_mode, transaction_ref } = req.body;
  const userId = req.user.userId;

  if (!feeId || !amount || !payment_mode) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing"
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Insert payment
    await FeePayment.create({
      feeId,
      userId,
      amount,
      payment_mode,
      transaction_ref
    });

    // 2️⃣ Auto update fee status
    await updateFeeStatus(feeId);

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Payment recorded successfully"
    });

  } catch (error) {
    await connection.rollback();
    console.error("Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment failed"
    });
  } finally {
    connection.release();
  }
};

module.exports = { makePayment };
