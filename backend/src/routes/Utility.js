const express = require('express');
const { getUserQrCode } = require('../controllers/Qr');

const router = express.Router();

router.get('/users/:userId/qr', getUserQrCode);

module.exports = router;
