import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import  Jwt  from "jsonwebtoken";
import User from "../models/users.js"

// checks if user authenticated or not
export const isAuthenticatedUser = catchAsyncErrors(async (req,res,next)=>{
   const {token}=req.cookies;
   if(!token){
    return next(new ErrorHandler("login first to access this resourse",401));
   }
   const decoded = Jwt.verify(token,process.env.JWT_SECRET);
   req.user= await User.findById(decoded.id)
    next();
})

// Authorize user roles

export const authorizeRoles =(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resourse`,401));
        }
        next();
    }
}