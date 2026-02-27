require('dotenv').config();
const mongoose = require('mongoose');
const Community = require('./models/Community');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const comms = await Community.find().sort({createdAt: -1}).limit(2);
        console.log(JSON.stringify(comms, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
