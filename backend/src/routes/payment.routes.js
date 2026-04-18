import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import { getPayments, makePayment} from "../controllers/payment.controller.js";

const router = Router();

router.use(verifyJWT);

//Payment endpoint ensuring atomic transaction
router.route("/get_payments").get(getPayments);
router.route("/make_payment").post(makePayment);

export default router;
