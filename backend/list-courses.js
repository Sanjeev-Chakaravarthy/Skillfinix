require('dotenv').config();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Only the 2 orphaned test course IDs (NOT Sanjeev's course)
const ORPHAN_IDS = [
  '698d7659a1d0fad1f6efacc9', // "mn m"
  '698d9083a1d0fad1f6efad96', // "Mastering React Hooks"
];

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
}).then(async () => {
  const db = mongoose.connection.db;
  const result = await db.collection('courses').deleteMany({
    _id: { $in: ORPHAN_IDS.map(id => new ObjectId(id)) }
  });
  console.log(`✅ Deleted ${result.deletedCount} orphaned course(s).`);
  await mongoose.disconnect();
  process.exit(0);
}).catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
