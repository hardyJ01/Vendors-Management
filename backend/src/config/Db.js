import mongoose from 'mongoose';

const connectDB= async()=>{
    try{
        const conn= await mongoose.connect('mongodb+srv://yugtank05_db_user:T2GK2d3c0KDQesNG@cluster0.cfaiep0.mongodb.net/vendorflow?appName=Cluster0');
        console.log(`MongoDB connected: ${conn.connection.host}`)
    }
    catch(err){
        console.error(`MongoDB error: ${err}`)
        process.exit(1);
    }
}

export default connectDB;