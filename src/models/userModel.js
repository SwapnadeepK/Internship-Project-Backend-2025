const db = require("../config/db");

const User = {
  async create(user) {
    const sql = `
      INSERT INTO users (userId, name, email, password, isAdmin)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      user.userId,
      user.name,
      user.email,
      user.password,
      user.isAdmin
    ];

    return db.execute(sql, values);
  },

  async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
  }
};

module.exports = User;
