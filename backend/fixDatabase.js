// File: backend/fixDatabase.js
const db = require("./models/db"); 

async function fix() {
  try {
    console.log("🔧 Connecting to MySQL...");

    // 1. Add Price Column
    try {
      await db.query("ALTER TABLE events ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00");
      console.log("✅ Added 'price' column");
    } catch (e) { console.log("⚠️ 'price' already exists (Good)"); }

    // 2. Add Image URL Column
    try {
      await db.query("ALTER TABLE events ADD COLUMN image_url VARCHAR(500)");
      console.log("✅ Added 'image_url' column");
    } catch (e) { console.log("⚠️ 'image_url' already exists (Good)"); }

    // 3. Add Mode & Link (For Global requirement)
    try {
      await db.query("ALTER TABLE events ADD COLUMN mode ENUM('physical', 'online') DEFAULT 'physical'");
      console.log("✅ Added 'mode' column");
    } catch (e) { console.log("⚠️ 'mode' already exists"); }
    
    try {
      await db.query("ALTER TABLE events ADD COLUMN meeting_link VARCHAR(500)");
      console.log("✅ Added 'meeting_link' column");
    } catch (e) { console.log("⚠️ 'meeting_link' already exists"); }

    console.log("🎉 Database structure updated successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

fix();