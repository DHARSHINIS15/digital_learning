const { pool } = require('../config/db');

async function fixJavaImage() {
  try {
    const cleanUrl = 'https://www.sipltraining.com/assets/img/sipl-java-course1.png';
    const [result] = await pool.execute(
      "UPDATE courses SET image_url = ? WHERE title LIKE '%java%' OR id = 1",
      [cleanUrl]
    );
    console.log(`Updated ${result.affectedRows} row(s) for the Java course image.`);
    process.exit(0);
  } catch (err) {
    console.error("Error updating database:", err);
    process.exit(1);
  }
}

fixJavaImage();
