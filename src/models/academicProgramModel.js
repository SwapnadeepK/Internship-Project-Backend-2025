const db = require("../config/db");

const AcademicProgram = {

  // ✅ Create program
  async create(data) {
  const sql = `
    INSERT INTO academic_programs
    (degreeId, department_name, degree_name, batch_year, base_fees, total_semesters, semester_fee)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  return db.execute(sql, [
    data.degreeId,
    data.department_name,
    data.degree_name,
    data.batch_year,
    data.base_fees,
    data.total_semesters,
    data.semester_fee,
  ]);
},

  // ✅ Get all programs
  async findAll() {
    const sql = `SELECT * FROM academic_programs ORDER BY degree_name`;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // ✅ Find by degreeId (already partially existed, keep consistent)
  async findByDegreeId(degreeId) {
    const sql = `
      SELECT *
      FROM academic_programs
      WHERE degreeId = ?
    `;
    const [rows] = await db.execute(sql, [degreeId]);
    return rows[0];
  },

  // ✅ Update safely by degreeId
  async updateByDegreeId(degreeId, data) {
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
      UPDATE academic_programs
      SET ${fields.join(", ")}
      WHERE degreeId = ?
    `;
    values.push(degreeId);

    return db.execute(sql, values);
  },

  // ✅ Delete by degreeId
  async deleteByDegreeId(degreeId) {
    const sql = `
      DELETE FROM academic_programs
      WHERE degreeId = ?
    `;
    return db.execute(sql, [degreeId]);
  }
};

module.exports = AcademicProgram;
