const db = require("../config/db");

const FeePayment = {
  async getTotalPaid(feeId) {
    const [[row]] = await db.execute(
      `
      SELECT COALESCE(SUM(amount), 0) AS totalPaid
      FROM fee_payments
      WHERE feeId = ?
      `,
      [feeId]
    );
    return Number(row.totalPaid);
  },

  async findAllByFee(feeId) {
    const [rows] = await db.execute(
      `
      SELECT
        paymentId,
        amount,
        payment_mode,
        transaction_ref,
        paid_at
      FROM fee_payments
      WHERE feeId = ?
      ORDER BY paid_at DESC
      `,
      [feeId]
    );

    return rows;
  },
};

module.exports = FeePayment;
