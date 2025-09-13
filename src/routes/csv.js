const express = require('express');
const router = express.Router();
const { upload } = require('../lib/multer'); 
const { authenticate } = require('../lib/auth');
const csvController = require('../controllers/csvController');

router.post('/upload', upload, authenticate, csvController.importCSV);
router.get('/download', authenticate, csvController.exportCSV);

module.exports = router;