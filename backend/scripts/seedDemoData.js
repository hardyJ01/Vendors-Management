import mongoose from "mongoose";
import bcrypt from "bcrypt";

const MONGO_URI = "mongodb://localhost:27017/vendors-management";

const objectId = () => new mongoose.Types.ObjectId();

const now = new Date("2026-04-12T10:00:00.000Z");

const userIds = {
    aarav: objectId(),
    ishita: objectId(),
    rohan: objectId(),
    neha: objectId(),
    karan: objectId(),
    priya: objectId(),
    amazon: objectId(),
    swiggy: objectId(),
    razorpay: objectId(),
    airtel: objectId(),
};

const paymentIds = Array.from({ length: 10 }, () => objectId());
const billIds = Array.from({ length: 10 }, () => objectId());
const splitGroupIds = Array.from({ length: 10 }, () => objectId());
const otpIds = Array.from({ length: 10 }, () => objectId());
const aiCacheIds = Array.from({ length: 10 }, () => objectId());

const users = [
    {
        _id: userIds.aarav,
        name: "Aarav Sharma",
        email: "aarav.sharma@example.com",
        phone_number: "9876500001",
        address: "Bengaluru, Karnataka",
        password: "$2b$10$wLrJ0T4Y/0wL8M.CrT1g0uCO0D4n7P8e2gJQwqYvN6mJmB1Q4n0vW",
        vendors: [userIds.amazon, userIds.swiggy, userIds.razorpay],
        business: "Northstar Consulting",
        profile_pic: "https://i.pravatar.cc/150?img=11",
        balance: 48200,
        rating: 4.8,
        no_rating: 17,
        budget_overall: 70000,
        budget_per_vendor: {
            [String(userIds.amazon)]: 15000,
            [String(userIds.swiggy)]: 4000,
            [String(userIds.razorpay)]: 18000,
        },
        createdAt: new Date("2026-03-01T08:00:00.000Z"),
        updatedAt: now,
    },
    {
        _id: userIds.ishita,
        name: "Ishita Patel",
        email: "ishita.patel@example.com",
        phone_number: "9876500002",
        address: "Ahmedabad, Gujarat",
        password: "$2b$10$wLrJ0T4Y/0wL8M.CrT1g0uCO0D4n7P8e2gJQwqYvN6mJmB1Q4n0vW",
        vendors: [userIds.airtel, userIds.amazon],
        business: "Patel Interiors",
        profile_pic: "https://i.pravatar.cc/150?img=12",
        balance: 35600,
        rating: 4.6,
        no_rating: 11,
        budget_overall: 54000,
        budget_per_vendor: {
            [String(userIds.airtel)]: 2500,
            [String(userIds.amazon)]: 12000,
        },
        createdAt: new Date("2026-03-02T08:00:00.000Z"),
        updatedAt: now,
    },
    {
        _id: userIds.rohan,
        name: "Rohan Mehta",
        email: "rohan.mehta@example.com",
        phone_number: "9876500003",
        address: "Mumbai, Maharashtra",
        password: "$2b$10$wLrJ0T4Y/0wL8M.CrT1g0uCO0D4n7P8e2gJQwqYvN6mJmB1Q4n0vW",
        vendors: [userIds.swiggy, userIds.razorpay],
        business: "Mehta Digital",
        profile_pic: "https://i.pravatar.cc/150?img=13",
        balance: 22150,
        rating: 4.3,
        no_rating: 9,
        budget_overall: 42000,
        budget_per_vendor: {
            [String(userIds.swiggy)]: 5000,
            [String(userIds.razorpay)]: 22000,
        },
        createdAt: new Date("2026-03-03T08:00:00.000Z"),
        updatedAt: now,
    },
    {
        _id: userIds.neha,
        name: "Neha Verma",
        email: "neha.verma@example.com",
        phone_number: "9876500004",
        address: "Delhi",
        password: "$2b$10$wLrJ0T4Y/0wL8M.CrT1g0uCO0D4n7P8e2gJQwqYvN6mJmB1Q4n0vW",
        vendors: [userIds.amazon, userIds.airtel],
        business: "Verma Studio",
        profile_pic: "https://i.pravatar.cc/150?img=14",
        balance: 29080,
        rating: 4.5,
        no_rating: 13,
        budget_overall: 48000,
        budget_per_vendor: {
            [String(userIds.amazon)]: 9000,
            [String(userIds.airtel)]: 2400,
        },
        createdAt: new Date("2026-03-04T08:00:00.000Z"),
        updatedAt: now,
    },
    {
        _id: userIds.karan,
        name: "Karan Kapoor",
        email: "karan.kapoor@example.com",
        phone_number: "9876500005",
        address: "Chandigarh",
        password: "$2b$10$wLrJ0T4Y/0wL8M.CrT1g0uCO0D4n7P8e2gJQwqYvN6mJmB1Q4n0vW",
        vendors: [userIds.swiggy, userIds.airtel],
        business: "Kapoor Legal Associates",
        profile_pic: "https://i.pravatar.cc/150?img=15",
        balance: 17940,
        rating: 4.1,
        no_rating: 7,
        budget_overall: 36000,
        budget_per_vendor: {
            [String(userIds.swiggy)]: 3200,
            [String(userIds.airtel)]: 2500,
        },
        createdAt: new Date("2026-03-05T08:00:00.000Z"),
        updatedAt: now,
    },
    {
        _id: userIds.priya,
        name: "Priya Nair",
        email: "priya.nair@example.com",
        phone_number: "9876500006",
        address: "Kochi, Kerala",
        password: null,
        google_id: "google-priya-nair-2026",
        vendors: [userIds.amazon, userIds.razorpay],
        business: "Nair Foods",
        profile_pic: "https://i.pravatar.cc/150?img=16",
        balance: 41275,
        rating: 4.9,
        no_rating: 22,
        budget_overall: 65000,
        budget_per_vendor: {
            [String(userIds.amazon)]: 11000,
            [String(userIds.razorpay)]: 14000,
        },
        createdAt: new Date("2026-03-06T08:00:00.000Z"),
        updatedAt: now,
    },
    {
        _id: userIds.amazon,
        name: "Amazon",
        email: "billing@amazon-demo.com",
        phone_number: "1800000001",
        address: "Hyderabad Service Hub",
        password: null,
        google_id: "vendor-amazon-demo",
        vendors: [],
        business: "Amazon Business",
        profile_pic: "https://logo.clearbit.com/amazon.com",
        balance: 0,
        rating: 4.7,
        no_rating: 91,
        budget_overall: null,
        budget_per_vendor: {},
        createdAt: new Date("2026-02-20T08:00:00.000Z"),
        updatedAt: now,
    },
    {
        _id: userIds.swiggy,
        name: "Swiggy",
        email: "accounts@swiggy-demo.com",
        phone_number: "1800000002",
        address: "Bengaluru",
        password: null,
        google_id: "vendor-swiggy-demo",
        vendors: [],
        business: "Swiggy Corporate",
        profile_pic: "https://logo.clearbit.com/swiggy.com",
        balance: 0,
        rating: 4.4,
        no_rating: 76,
        budget_overall: null,
        budget_per_vendor: {},
        createdAt: new Date("2026-02-21T08:00:00.000Z"),
        updatedAt: now,
    },
    {
        _id: userIds.razorpay,
        name: "Razorpay",
        email: "finance@razorpay-demo.com",
        phone_number: "1800000003",
        address: "Bengaluru",
        password: null,
        google_id: "vendor-razorpay-demo",
        vendors: [],
        business: "Razorpay Services",
        profile_pic: "https://logo.clearbit.com/razorpay.com",
        balance: 0,
        rating: 4.8,
        no_rating: 102,
        budget_overall: null,
        budget_per_vendor: {},
        createdAt: new Date("2026-02-22T08:00:00.000Z"),
        updatedAt: now,
    },
    {
        _id: userIds.airtel,
        name: "Airtel Fiber",
        email: "billing@airtel-demo.com",
        phone_number: "1800000004",
        address: "Gurugram",
        password: null,
        google_id: "vendor-airtel-demo",
        vendors: [],
        business: "Airtel Broadband",
        profile_pic: "https://logo.clearbit.com/airtel.in",
        balance: 0,
        rating: 4.2,
        no_rating: 64,
        budget_overall: null,
        budget_per_vendor: {},
        createdAt: new Date("2026-02-23T08:00:00.000Z"),
        updatedAt: now,
    },
];

const splitGroups = [
    { _id: splitGroupIds[0], created_by: userIds.aarav, total_amount: 2400, vendor_id: userIds.amazon, createdAt: new Date("2026-04-01T10:00:00.000Z"), updatedAt: now },
    { _id: splitGroupIds[1], created_by: userIds.ishita, total_amount: 1600, vendor_id: userIds.swiggy, createdAt: new Date("2026-04-02T10:00:00.000Z"), updatedAt: now },
    { _id: splitGroupIds[2], created_by: userIds.rohan, total_amount: 8500, vendor_id: userIds.razorpay, createdAt: new Date("2026-04-03T10:00:00.000Z"), updatedAt: now },
    { _id: splitGroupIds[3], created_by: userIds.neha, total_amount: 1199, vendor_id: userIds.airtel, createdAt: new Date("2026-04-04T10:00:00.000Z"), updatedAt: now },
    { _id: splitGroupIds[4], created_by: userIds.karan, total_amount: 2200, vendor_id: userIds.amazon, createdAt: new Date("2026-04-05T10:00:00.000Z"), updatedAt: now },
    { _id: splitGroupIds[5], created_by: userIds.priya, total_amount: 980, vendor_id: userIds.swiggy, createdAt: new Date("2026-04-06T10:00:00.000Z"), updatedAt: now },
    { _id: splitGroupIds[6], created_by: userIds.aarav, total_amount: 3100, vendor_id: userIds.razorpay, createdAt: new Date("2026-04-07T10:00:00.000Z"), updatedAt: now },
    { _id: splitGroupIds[7], created_by: userIds.ishita, total_amount: 1450, vendor_id: userIds.amazon, createdAt: new Date("2026-04-08T10:00:00.000Z"), updatedAt: now },
    { _id: splitGroupIds[8], created_by: userIds.neha, total_amount: 870, vendor_id: userIds.airtel, createdAt: new Date("2026-04-09T10:00:00.000Z"), updatedAt: now },
    { _id: splitGroupIds[9], created_by: userIds.priya, total_amount: 2600, vendor_id: userIds.amazon, createdAt: new Date("2026-04-10T10:00:00.000Z"), updatedAt: now },
];

const bills = [
    { _id: billIds[0], user_id: userIds.aarav, vendor_id: userIds.amazon, amount: 2400, status: "done", payment_id: paymentIds[0], is_recurring: false, recurrence_frequency: null, is_split: true, split_group_id: splitGroupIds[0], createdAt: new Date("2026-04-01T11:00:00.000Z"), updatedAt: now },
    { _id: billIds[1], user_id: userIds.ishita, vendor_id: userIds.swiggy, amount: 650, status: "pending", payment_id: null, is_recurring: false, recurrence_frequency: null, is_split: false, split_group_id: null, createdAt: new Date("2026-04-02T11:00:00.000Z"), updatedAt: now },
    { _id: billIds[2], user_id: userIds.rohan, vendor_id: userIds.razorpay, amount: 8500, status: "done", payment_id: paymentIds[2], is_recurring: true, recurrence_frequency: "monthly", is_split: true, split_group_id: splitGroupIds[2], createdAt: new Date("2026-04-03T11:00:00.000Z"), updatedAt: now },
    { _id: billIds[3], user_id: userIds.neha, vendor_id: userIds.airtel, amount: 1199, status: "pending", payment_id: null, is_recurring: true, recurrence_frequency: "monthly", is_split: false, split_group_id: null, createdAt: new Date("2026-04-04T11:00:00.000Z"), updatedAt: now },
    { _id: billIds[4], user_id: userIds.karan, vendor_id: userIds.amazon, amount: 2200, status: "disputed", payment_id: null, is_recurring: false, recurrence_frequency: null, is_split: true, split_group_id: splitGroupIds[4], createdAt: new Date("2026-04-05T11:00:00.000Z"), updatedAt: now },
    { _id: billIds[5], user_id: userIds.priya, vendor_id: userIds.swiggy, amount: 980, status: "done", payment_id: paymentIds[5], is_recurring: false, recurrence_frequency: null, is_split: true, split_group_id: splitGroupIds[5], createdAt: new Date("2026-04-06T11:00:00.000Z"), updatedAt: now },
    { _id: billIds[6], user_id: userIds.aarav, vendor_id: userIds.razorpay, amount: 3100, status: "pending", payment_id: null, is_recurring: true, recurrence_frequency: "weekly", is_split: true, split_group_id: splitGroupIds[6], createdAt: new Date("2026-04-07T11:00:00.000Z"), updatedAt: now },
    { _id: billIds[7], user_id: userIds.ishita, vendor_id: userIds.amazon, amount: 1450, status: "done", payment_id: paymentIds[7], is_recurring: false, recurrence_frequency: null, is_split: true, split_group_id: splitGroupIds[7], createdAt: new Date("2026-04-08T11:00:00.000Z"), updatedAt: now },
    { _id: billIds[8], user_id: userIds.neha, vendor_id: userIds.airtel, amount: 870, status: "pending", payment_id: null, is_recurring: false, recurrence_frequency: null, is_split: true, split_group_id: splitGroupIds[8], createdAt: new Date("2026-04-09T11:00:00.000Z"), updatedAt: now },
    { _id: billIds[9], user_id: userIds.priya, vendor_id: userIds.amazon, amount: 2600, status: "done", payment_id: paymentIds[9], is_recurring: true, recurrence_frequency: "monthly", is_split: true, split_group_id: splitGroupIds[9], createdAt: new Date("2026-04-10T11:00:00.000Z"), updatedAt: now },
];

const payments = [
    { _id: paymentIds[0], bill_id: billIds[0], user_id: userIds.aarav, vendor_id: userIds.amazon, amount: 2400, date: new Date("2026-04-01T16:10:00.000Z"), createdAt: new Date("2026-04-01T16:10:00.000Z"), updatedAt: now },
    { _id: paymentIds[1], bill_id: billIds[1], user_id: userIds.ishita, vendor_id: userIds.swiggy, amount: 450, date: new Date("2026-04-02T18:30:00.000Z"), createdAt: new Date("2026-04-02T18:30:00.000Z"), updatedAt: now },
    { _id: paymentIds[2], bill_id: billIds[2], user_id: userIds.rohan, vendor_id: userIds.razorpay, amount: 8500, date: new Date("2026-04-03T13:00:00.000Z"), createdAt: new Date("2026-04-03T13:00:00.000Z"), updatedAt: now },
    { _id: paymentIds[3], bill_id: billIds[3], user_id: userIds.neha, vendor_id: userIds.airtel, amount: 1199, date: new Date("2026-04-04T19:15:00.000Z"), createdAt: new Date("2026-04-04T19:15:00.000Z"), updatedAt: now },
    { _id: paymentIds[4], bill_id: billIds[4], user_id: userIds.karan, vendor_id: userIds.amazon, amount: 600, date: new Date("2026-04-05T10:20:00.000Z"), createdAt: new Date("2026-04-05T10:20:00.000Z"), updatedAt: now },
    { _id: paymentIds[5], bill_id: billIds[5], user_id: userIds.priya, vendor_id: userIds.swiggy, amount: 980, date: new Date("2026-04-06T12:05:00.000Z"), createdAt: new Date("2026-04-06T12:05:00.000Z"), updatedAt: now },
    { _id: paymentIds[6], bill_id: billIds[6], user_id: userIds.aarav, vendor_id: userIds.razorpay, amount: 1300, date: new Date("2026-04-07T18:50:00.000Z"), createdAt: new Date("2026-04-07T18:50:00.000Z"), updatedAt: now },
    { _id: paymentIds[7], bill_id: billIds[7], user_id: userIds.ishita, vendor_id: userIds.amazon, amount: 1450, date: new Date("2026-04-08T17:45:00.000Z"), createdAt: new Date("2026-04-08T17:45:00.000Z"), updatedAt: now },
    { _id: paymentIds[8], bill_id: billIds[8], user_id: userIds.neha, vendor_id: userIds.airtel, amount: 870, date: new Date("2026-04-09T14:30:00.000Z"), createdAt: new Date("2026-04-09T14:30:00.000Z"), updatedAt: now },
    { _id: paymentIds[9], bill_id: billIds[9], user_id: userIds.priya, vendor_id: userIds.amazon, amount: 2600, date: new Date("2026-04-10T15:00:00.000Z"), createdAt: new Date("2026-04-10T15:00:00.000Z"), updatedAt: now },
];

const otpHash = await bcrypt.hash("123456", 10);

const otpTokens = users.map((user, index) => ({
    _id: otpIds[index],
    email: user.email,
    otp_hash: otpHash,
    expires_at: new Date(now.getTime() + (index + 1) * 60 * 60 * 1000),
    used: index % 3 === 0,
    createdAt: new Date(now.getTime() - index * 30 * 60 * 1000),
    updatedAt: now,
}));

const aiSuggestionTemplates = [
    ["Amazon invoice likely due this week", "Razorpay software renewal predicted"],
    ["Airtel monthly bill repeating", "Amazon office supply spend detected"],
    ["Razorpay billing cadence matches last month", "Swiggy expense near weekly average"],
];

const aiSuggestionCaches = users.map((user, index) => ({
    _id: aiCacheIds[index],
    user_id: user._id,
    suggestions: [
        {
            vendor_name: index % 2 === 0 ? "Amazon" : "Razorpay",
            suggested_amount: 800 + index * 175,
            priority: index % 3 === 0 ? "high" : "low",
            reason: aiSuggestionTemplates[index % aiSuggestionTemplates.length][0],
            confidence: 0.72 + (index % 3) * 0.08,
        },
        {
            vendor_name: index % 2 === 0 ? "Swiggy" : "Airtel Fiber",
            suggested_amount: 450 + index * 60,
            priority: index % 2 === 0 ? "medium" : "low",
            reason: aiSuggestionTemplates[index % aiSuggestionTemplates.length][1],
            confidence: 0.61 + (index % 4) * 0.07,
        },
    ],
    generated_at: new Date(now.getTime() - index * 20 * 60 * 1000),
    expires_at: new Date(now.getTime() + (45 + index) * 60 * 1000),
    createdAt: new Date(now.getTime() - index * 20 * 60 * 1000),
    updatedAt: now,
}));

const seed = async () => {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    await db.collection("users").deleteMany({});
    await db.collection("splitgroups").deleteMany({});
    await db.collection("bills").deleteMany({});
    await db.collection("payments").deleteMany({});
    await db.collection("otptokens").deleteMany({});
    await db.collection("aisuggestioncaches").deleteMany({});

    await db.collection("users").insertMany(users);
    await db.collection("splitgroups").insertMany(splitGroups);
    await db.collection("bills").insertMany(bills);
    await db.collection("payments").insertMany(payments);
    await db.collection("otptokens").insertMany(otpTokens);
    await db.collection("aisuggestioncaches").insertMany(aiSuggestionCaches);

    console.log("Demo seed complete:");
    console.log(`- users: ${users.length}`);
    console.log(`- splitgroups: ${splitGroups.length}`);
    console.log(`- bills: ${bills.length}`);
    console.log(`- payments: ${payments.length}`);
    console.log(`- otptokens: ${otpTokens.length}`);
    console.log(`- aisuggestioncaches: ${aiSuggestionCaches.length}`);

    await mongoose.disconnect();
};

seed().catch(async (error) => {
    console.error("Seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
});
