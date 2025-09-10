const multer = require('multer');
const fs = require('fs');


exports.upload = multer({ dest: 'uploads/' }).single('file');