const db = require("../config/db");
const { autoUpdateFeeStatus } = require("../utils/autoFeeStatus");

const Fee = {
  async create(data) {
    const sql = `
      INSERT INTO fees (userId, amount, semester, due_date)
      VALUES (?, ?, ?, ?)
    `;
    return db.execute(sql, [data.userId, data.amount, data.semester, data.due_date]);
  },

  async findByUser(userId) {
    const sql = `SELECT * FROM fees WHERE userId = ? ORDER BY semester ASC`;
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  },

  async findById(feeId) {
    const sql = `SELECT * FROM fees WHERE feeId = ?`;
    const [rows] = await db.execute(sql, [feeId]);
    return rows[0];
  },

  async updateStatus(feeId, status) {
    const sql = `UPDATE fees SET status = ? WHERE feeId = ?`;
    return db.execute(sql, [status, feeId]);
  },

  // 🎯 Full semester fee creation per program
  async createInitialFees({ userId, program }) {
    const existingFees = await Fee.findByUser(userId);
    if (existingFees.length > 0) return;

    const totalSemesters = program.total_semesters || 8;
    const semesterFee = program.semester_fee || Math.round(program.base_fees / totalSemesters);

    for (let semester = 1; semester <= totalSemesters; semester++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + semester); // 1 month apart per semester

      await Fee.create({
        userId,
        amount: semesterFee,
        semester: `Semester ${semester}`,
        due_date: dueDate
      });
    }
  },
  // ✅ New: Get all fees
  async findAll() {
    const sql = `SELECT S.usn,f.amount, f.semester, f.status, f.due_date, f.paid_at 
    FROM fees as f JOIN student_profiles AS S 
    ON f.userId = S.userId ORDER BY f.userId ASC, f.semester ASC;`;
    const [rows] = await db.execute(sql);
    return rows;
  },

};

module.exports = Fee;
