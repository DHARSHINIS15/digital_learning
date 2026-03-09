const { pool } = require('./config/db');

async function checkJava() {
  try {
    const [rows] = await pool.query("SELECT id, title, image_url FROM courses WHERE title LIKE '%java%' COLLATE utf8mb4_general_ci");
    console.log("Java Courses in DB:", rows);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkJava();
