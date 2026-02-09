const db = require("../config/db");

const Student = {
  /**
   * Fetch logged-in student's basic profile
   * (name & email come from users table)
   */
  async findProfileByUserId(userId) {
    const sql = `
      SELECT 
        userId,
        name,
        email
      FROM users
      WHERE userId = ?
    `;

    const [[row]] = await db.execute(sql, [userId]);
    return row;
  }
};

module.exports = Student;
