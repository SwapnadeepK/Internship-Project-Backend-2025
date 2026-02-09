const FeePayment = require("../models/feePaymentModel");
const Fee = require("../models/feeModel");

/**
 * @desc    Get logged-in student's payment history
 * @route   GET /api/student/payments/history
 * @access  Student
 */
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const fees = await Fee.findByUser(userId);

    const history = await Promise.all(
      fees.map(async (fee) => {
        const totalPaid = await FeePayment.getTotalPaid(fee.feeId);
        const payments = await FeePayment.findAllByFee(fee.feeId);

        return {
          feeId: fee.feeId,
          amount: Number(fee.amount),
          status: fee.status,
          totalPaid,
          remaining: Math.max(Number(fee.amount) - totalPaid, 0),
          payments
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error("Payment History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { getPaymentHistory };
