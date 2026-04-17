const express = require('express');
const authRoutes = require('./Auth');
const profileRoutes = require('./Profile');
const utilityRoutes = require('./Utility');
const walletRoutes = require('./Wallet');

const router = express.Router();

router.use('/auth', authRoutes);
router.use(profileRoutes);
router.use(utilityRoutes);
router.use(walletRoutes);

module.exports = router;
