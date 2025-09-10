const express = require('express');
const router = express.Router();
const { upload } = require('../lib/multer'); 
const { authenticate } = require('../lib/auth');
const csvController = require('../controllers/csvController');

router.post('/upload', upload, csvController.importCSV);
router.get('/import', authenticate, csvController.exportCSV);

module.exports = router;