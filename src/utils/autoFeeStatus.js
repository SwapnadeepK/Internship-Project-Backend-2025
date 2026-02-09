const FeePayment = require("../models/feePaymentModel");
const Fee = require("../models/feeModel");

const autoUpdateFeeStatus = async (feeId) => {
  // Get total paid amount
  const totalPaid = await FeePayment.getTotalPaid(feeId);

  // Get fee details
  const fee = await Fee.findById(feeId);
  if (!fee) return;

  let status = "PENDING";

  if (totalPaid > 0 && totalPaid < fee.amount) {
    status = "PARTIAL"; // Partial payment
  } else if (totalPaid >= fee.amount) {
    status = "PAID";    // Fully paid
  }

  // Update fee status
  await Fee.updateStatus(feeId, status);
};

module.exports = { autoUpdateFeeStatus };
