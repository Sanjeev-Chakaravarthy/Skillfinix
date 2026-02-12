// migrate-database.js
// ✅ SAFE MIGRATION SCRIPT (Node 22 + Mongoose v7)

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// ✅ Import Message model
const Message = require("./models/Message");

async function migrateDatabase() {
  try {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔄 STARTING DATABASE MIGRATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const total = await Message.countDocuments();
    console.log("📊 Total messages:", total);

    const withoutDelivered = await Message.countDocuments({
      delivered: { $exists: false },
    });
    console.log("📊 Messages missing delivered field:", withoutDelivered);

    if (withoutDelivered === 0) {
      console.log("\n✅ No migration needed\n");
      process.exit(0);
    }

    console.log("\n🔄 Migrating...\n");

    const step1 = await Message.updateMany(
      { delivered: { $exists: false } },
      { $set: { delivered: false, deliveredAt: null } }
    );

    console.log("✅ STEP 1 DONE:", step1.modifiedCount);

    const step2 = await Message.updateMany(
      { read: true, delivered: false },
      { $set: { delivered: true, deliveredAt: new Date() } }
    );

    console.log("✅ STEP 2 DONE:", step2.modifiedCount);

    console.log("\n✅✅ MIGRATION COMPLETED SUCCESSFULLY\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ MIGRATION FAILED");
    console.error(err);
    process.exit(1);
  }
}

migrateDatabase();