import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import billRouter from './routes/bill.routes.js';
import paymentRouter from './routes/payment.routes.js';
import aiRouter from "./ai/ai.routes.js";


const app = express();

app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/bills", billRouter);
app.use("/api/v1/payments", paymentRouter);

app.get('/', (req, res) => {
    res.json({ message: 'VendorFlow API running' });
});

app.use("/api/v1/ai", aiRouter);

app.use((err, req, res, next) => {
    const statusCode = err?.statusCode || 500;
    return res.status(statusCode).json({
        statusCode,
        data: null,
        message: err?.message || "Internal server error",
        success: false,
        errors: err?.errors || [],
    });
});

export { app };
