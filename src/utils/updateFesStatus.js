const db = require("../config/db");
const FeePayment = require("../models/feePaymentModel");

const updateFeeStatus = async (feeId) => {
  // 1️⃣ Get fee amount
  const [[fee]] = await db.execute(
    "SELECT amount FROM fees WHERE feeId = ?",
    [feeId]
  );

  // 2️⃣ Get total paid
  const totalPaid = await FeePayment.getTotalPaid(feeId);

  let status = "PENDING";

  if (totalPaid >= fee.amount) {
    status = "PAID";
  } else if (totalPaid > 0) {
    status = "PARTIAL";
  }

  // 3️⃣ Update fee
  await db.execute(
    "UPDATE fees SET status = ? WHERE feeId = ?",
    [status, feeId]
  );
};

module.exports = updateFeeStatus;
