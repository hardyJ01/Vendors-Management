const express = require('express');
const authenticate = require('../middlewares/Auth');
const validateRequest = require('../middlewares/Validate');
const upload = require('../middlewares/Upload');
const controller = require('../controllers/Profile');
const { updateUserValidation } = require('../validators/Profile');

const router = express.Router();

router.get('/get_user', authenticate, controller.getUser);
router.patch(
  '/update_user',
  authenticate,
  upload.single('profile_pic'),
  updateUserValidation,
  validateRequest,
  controller.updateUser
);

module.exports = router;
