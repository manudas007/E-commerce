import mongoose from "mongoose";
import product from "../models/product.js";
import allProducts from "./data.js"
const seedProducts = async ()=>{
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/stringscape");

        await product.deleteMany();
        console.log("products deleted")

        await product.insertMany(allProducts);
        console.log("products added");

        process.exit();
    } catch (error) {
        console.log(error.message);
        process.exit()
    }
}
seedProducts();