import express from "express";
const app = express();
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/errors.js";

//handle uncaught exception 
process.on("uncaughtException",(err)=>{
    console.log(`ERROR: ${err}`);
    console.log(err.stack);
    console.log("shutting down derver due to uncought exception");
    process.exit(1);
    
})

dotenv.config();
// connect to database 
connectDatabase()
app.use(express.json());
app.use(cookieParser());

//import all rotes 

import productRoutes from './routes/products.js'
import authRoutes from "./routes/auth.js"
import orderRoutes from "./routes/order.js"
app.use("/api/v1/",productRoutes);
app.use("/api/v1/",authRoutes);
app.use("/api/v1/",orderRoutes);

//using error middleware

app.use(errorMiddleware)

const PORT= process.env.PORT || 6001
const server = app.listen(PORT,()=>{
    console.log(`server started ${PORT}`)
})

//handle unhandled promise rejection
process.on("unhandledRejection",(err)=>{
    console.log(`ERROR: ${err}`);
    console.log(err.stack);
    console.log("shutting down server due to unhandled promise rejection");
    server.close(()=>{
        process.exit(1);
    })
})