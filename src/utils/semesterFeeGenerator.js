const Fee = require("../models/feeModel");

const generateSemesterFee = async ({ userId, semester, amount }) => {
  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + 1);

  await Fee.create({
    userId,
    amount,
    semester,
    due_date: dueDate
  });
};

module.exports = { generateSemesterFee };
