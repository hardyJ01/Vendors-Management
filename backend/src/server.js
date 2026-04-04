import express from 'express';
import connectDB from './config/Db.js';

const app=express();

connectDB();

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/',(req,res)=>{
    res.json({message:'VendorFlow API running'})
})


const PORT=5000
app.listen(PORT,()=>{console.log(`Server started on ${PORT}`)})