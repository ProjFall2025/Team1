const db = require("./models/db");

async function fix() {
  try {
    console.log("🔧 Adding Capacity Column...");
    
    // Add capacity column (Default 100 seats)
    try {
      await db.query("ALTER TABLE events ADD COLUMN capacity INT DEFAULT 100");
      console.log("✅ Added 'capacity' column");
    } catch (e) { console.log("⚠️ 'capacity' already exists"); }

    console.log("🎉 Database updated! You can now book events.");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

fix();