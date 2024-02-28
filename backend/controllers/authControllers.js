import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/users.js";
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";
import errorHandler from "../utils/errorHandler.js"
import sendEmail from "../utils/sendEmail.js";
import sendToken from "../utils/sendToken.js";
import crypto from "crypto";
//register user ================================> /api/v1/register
export const regusterUser = catchAsyncErrors( async (req,res,next)=>{
    const {name,email,password}=req.body;
    const user = await User.create({
        name,email,password
    })
    sendToken(user,201,res)
}
)
//login user =================================> /api/v1/login
export const loginUser = catchAsyncErrors( async (req,res,next)=>{
    const {email,password}=req.body;
    if(!email || ! password){
        return (next(new errorHandler("please enter email and passwrod",400)))
    }
    const user = await User.findOne({email}).select("+password")
    if(!user){
        return (next(new errorHandler("invalid email or passwrod",401)))
    }
    //check is password correct

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return (next(new errorHandler("invalid email or passwrod",401)))
    }

    sendToken(user,200,res)
}
)
//  logout user ==> /api/v1/logout
export const logout = catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    });
    res.status(200).json({
        message:"logged out"
    })
})

//forgot password user ==================================> /api/v1/forgot/password
export const forgotPassword = catchAsyncErrors( async (req,res,next)=>{

    //find the user in the database
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return (next(new errorHandler("user not found with this email",404)))
    }
    //get reset password token

    const resetToken =  user.getResetPasswordToken();
    await user.save();


    // create reset password URL 

    const resetUrl = `${process.env.FRONTEND_URL}/api/v1/password/reset/${resetToken}`

    const message = getResetPasswordTemplate(user?.name,resetUrl);

    try {
        await sendEmail ({
            email:user.email,
            subject:"StringScape password recovery",
            message
        });
        res.status(200).json({
            message:`Email send to : ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return (next(new errorHandler(error.message,500)))
    }
}
)
//reset password user ==================================> /api/v1/password/reset/:token
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Hash the URL Token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
  
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  
    if (!user) {
      return next(
        new errorHandler(
          "Password reset token is invalid or has been expired",
          400
        )
      );
    }
  
    if (req.body.password !== req.body.confirmPassword) {
      return next(new errorHandler("Passwords does not match", 400));
    }
  
    // Set the new password
    user.password = req.body.password;
  
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
  
    await user.save();
  
    sendToken(user, 200, res);
  });
// Get current user profile  ===========================>  /api/v1/me
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req?.user?._id);
    res.status(200).json({
      user,
    });
  });
  
// Update Password  ====================================>  /api/v1/password/update
  export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req?.user?._id).select("+password");
  
    // Check the previous user password
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  
    if (!isPasswordMatched) {
      return next(new errorHandler("Old Password is incorrect", 400));
    }
  
    user.password = req.body.password;
    user.save();
  
    res.status(200).json({
      success: true,
    });
  });
  
// Update user profile  ====================================>  /api/v1/me/update
export const updateProfile = catchAsyncErrors(async (req, res, next) => {

    const newUserData = {
        name:req.body.name,
        email:req.body.email
    }
    const user = await User.findByIdAndUpdate(req.user._id,newUserData,{new:true})
    res.status(200).json({
      user
    });
  });
// get all users - ADMIN ====================================>  /api/v1/admin/users
export const allUsers = catchAsyncErrors(async (req, res, next) => {

    const users = await User.find()

    res.status(200).json({
      users,
    });
  });
  
// get user details -ADMIN ====================================>  /api/v1/admin/users/:id
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.params.id);
    if(!user){
        return next (new errorHandler(`user not found with the ID: ${req.params.id}`,404))
    }

    res.status(200).json({
      user,
    });
  });
// Update user details Admin  ====================================>  /api/v1/admin/users/:id
export const updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }
    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{new:true})
    res.status(200).json({
      user
    });
  });

// delete user details -ADMIN ====================================>  /api/v1/admin/users/:id
export const deleteUser = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.params.id);
    if(!user){
        return next (new errorHandler(`user not found with the ID: ${req.params.id}`,404))
    };

    //TODO --- remove user avatar from cloudniary 
    await user.deleteOne()

    res.status(200).json({
      success:true,
    });
  });