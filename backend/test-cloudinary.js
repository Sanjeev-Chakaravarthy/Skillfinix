require('dotenv').config();
const { cloudinary } = require('./config/cloudinary');

cloudinary.api.ping()
  .then(res => console.log('Cloudinary Ping Success:', res))
  .catch(err => console.error('Cloudinary Ping Error:', err));
