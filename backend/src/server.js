import { app } from "./app.js";
import connectDB from "./config/Db.js";

connectDB();

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});