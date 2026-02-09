const FeePayment = require("../models/feePaymentModel");
const Fee = require("../models/feeModel");
const { autoUpdateFeeStatus } = require("../utils/autoFeeStatus");

/**
 * @desc    Pay a fee (partial or full)
 * @route   POST /api/student/fees/pay
 * @access  Student only
 */
const payFee = async (req, res) => {
  try {
    // ❌ Admins cannot make payments
    if (req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admins cannot make payments"
      });
    }

    const userId = req.user.userId;
    const { feeId, amount, payment_mode, transaction_ref } = req.body;

    // ✅ Validate request
    if (!feeId || !amount || !payment_mode) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details"
      });
    }

    const fee = await Fee.findById(feeId);
    if (!fee || fee.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized payment"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero"
      });
    }

    // 🔒 Ensure we don’t overpay
    const FeePaymentModel = FeePayment;
    const totalPaidSoFar = await FeePaymentModel.getTotalPaid(feeId);
    if (totalPaidSoFar + Number(amount) > Number(fee.amount)) {
      return res.status(400).json({
        success: false,
        message: "Payment exceeds remaining fee balance"
      });
    }

    // ✅ CREATE PAYMENT (PARTIAL OR FULL)
    await FeePaymentModel.create({
      feeId,
      userId,
      amount,
      payment_mode,
      transaction_ref
    });

    // 🎯 AUTO STATUS UPDATE
    await autoUpdateFeeStatus(feeId);

    // Optional: Fetch updated fee after payment
    const updatedFee = await Fee.findById(feeId);

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: updatedFee
    });

  } catch (error) {
    console.error("Fee Payment Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Duplicate payment entry"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { payFee };
