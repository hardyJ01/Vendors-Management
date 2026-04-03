const mongoose=require('mongoose');

const connectDB= async()=>{
    try{
        const conn= await mongoose.connect();
        console.log(`MongoDB connected: ${conn.connection.host}`)
    }
    catch(err){
        console.error(`MongoDB error: ${err}`)
        process.exit(1);
    }
}

module.exports=connectDB