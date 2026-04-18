import { User } from "../models/User.js";

export const verifyJWT = async (req, res, next) => {
    const demoUser =
        await User.findOne({ email: "aarav.sharma@example.com" }).select("_id name email") ||
        await User.findOne({ business: { $exists: true, $ne: null } }).select("_id name email");

    if (!demoUser) {
        return res.status(401).json({
            statusCode: 401,
            data: null,
            message: "Demo user not found. Seed the database first.",
            success: false,
        });
    }

    req.user = {
        _id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
    };
    req.user_id = req.user._id;
    next();
};
