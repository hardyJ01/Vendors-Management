import { Router } from 'express';
import {
  getVendors,
  getAllVendors,
  addVendor,
  getVendor,
  hasRated,
  rateVendor,
} from '../controllers/vendorController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.get('/get_vendors', auth, getVendors);
router.get('/get_all_vendors', auth, getAllVendors);
router.post('/add_vendor', auth, addVendor);
router.get('/get_vendor/:vendor_id', auth, getVendor);
router.get('/has_rated/:vendor_id', auth, hasRated);
router.post('/rate', auth, rateVendor);

export default router;
