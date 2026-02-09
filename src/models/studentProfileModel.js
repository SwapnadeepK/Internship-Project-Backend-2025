const db = require("../config/db");

const StudentProfile = {

  async create(data) {
    const sql = `
      INSERT INTO student_profiles
      (userId, first_name, last_name, dob, age, usn, aadhaar, photo_url,
       address, phone, guardian_first_name, guardian_last_name,
       guardian_address, guardian_phone, reservation, degreeId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return db.execute(sql, [
      data.userId,
      data.first_name,
      data.last_name,
      data.dob,
      data.age,
      data.usn,
      data.aadhaar,
      data.photo_url || null,
      data.address,
      data.phone,
      data.guardian_first_name,
      data.guardian_last_name,
      data.guardian_address,
      data.guardian_phone,
      data.reservation,
      data.degreeId
    ]);
  },

  // ✅ Fetch profile + email from users table
  async findByUserId(userId) {
  const sql = `
    SELECT sp.*, u.email
    FROM student_profiles sp
    LEFT JOIN users u ON sp.userId = u.userId
    WHERE sp.userId = ?
  `;
  const [rows] = await db.execute(sql, [userId]);
  return rows[0] || null;
},


  async updateByUserId(userId, data) {
    const fields = [];
    const values = [];

    for (const key in data) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (!fields.length) return;

    const sql = `
      UPDATE student_profiles
      SET ${fields.join(", ")}
      WHERE userId = ?
    `;
    values.push(userId);

    return db.execute(sql, values);
  },

  async countByDegreeId(degreeId) {
    const sql = `
      SELECT COUNT(*) AS total
      FROM student_profiles
      WHERE degreeId = ?
    `;
    const [[row]] = await db.execute(sql, [degreeId]);
    return Number(row.total);
  },

  async findByUSN(usn) {
  const sql = `
    SELECT sp.*, u.email
    FROM student_profiles sp
    LEFT JOIN users u ON sp.userId = u.userId
    WHERE sp.usn = ?
  `;
  const [rows] = await db.execute(sql, [usn]);
  return rows[0] || null;
}
};

module.exports = StudentProfile;
