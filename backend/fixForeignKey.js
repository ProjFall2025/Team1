const db = require("./models/db");

async function fix() {
  try {
    console.log("🔧 Fixing Foreign Key Constraints...");

    // 1. Drop the strict constraint that is causing the error
    // Note: 'payments_ibfk_1' is the constraint name seen in your error log
    try {
      await db.query("ALTER TABLE payments DROP FOREIGN KEY payments_ibfk_1");
      console.log("✅ Dropped old strict constraint.");
    } catch (e) {
      console.log("⚠️ Could not drop constraint (it might not exist or has a different name). Continuing...");
    }

    // 2. Add the new constraint with ON DELETE CASCADE
    // This ensures that when a Booking is deleted, the Payment is also deleted automatically.
    await db.query(`
      ALTER TABLE payments 
      ADD CONSTRAINT payments_ibfk_1 
      FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) 
      ON DELETE CASCADE
    `);
    console.log("✅ Added new constraint with ON DELETE CASCADE.");

    console.log("🎉 Database fixed! You can now cancel bookings.");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

fix();