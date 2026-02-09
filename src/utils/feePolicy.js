const Fee = require("../models/feeModel");

/**
 * Auto-create initial fee for a student
 * Runs exactly once per student
 */
const createInitialFee = async ({ userId, baseFees }) => {
  // 🔒 Prevent duplicate fee creation
  const existingFees = await Fee.findByUser(userId);
  if (existingFees.length > 0) return;

  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + 1); // 1 month due

  await Fee.create({
    userId,
    amount: baseFees,
    semester: "Semester 1",
    due_date: dueDate
  });
};

module.exports = { createInitialFee };
