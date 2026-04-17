# VendorFlow Backend

Scalable Express + MongoDB backend using:

- Express.js
- MongoDB with Mongoose
- JWT authentication with refresh tokens
- MVC-style structure with services
- Validation middleware
- Proper centralized error handling

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

## Implemented endpoints

- `POST /api/auth/generate_otp`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot_password`
- `POST /api/auth/reset_password`
- `GET /api/get_user`
- `PATCH /api/update_user`
- `GET /api/get_balance`
- `GET /api/get_transaction_history`
- `POST /api/deposit`
- `POST /api/withdraw`
- `POST /api/set_budget`

## Notes

- OTPs are single-use and expire in 10 minutes.
- Refresh tokens are stored hashed in MongoDB.
- Wallet balance updates use MongoDB transactions.
- A `transaction_histories` collection is added because your wallet endpoints require a transaction source of truth.
- Profile images are stored under `uploads/profile-pics`.
