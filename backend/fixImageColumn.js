const db = require("./models/db");

async function fix() {
  try {
    console.log("🔧 Upgrading Image Column...");
    
    // Change column type to LONGTEXT to support Base64 strings
    await db.query("ALTER TABLE events MODIFY COLUMN image_url LONGTEXT");
    
    console.log("✅ Column 'image_url' upgraded to LONGTEXT.");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

fix();
