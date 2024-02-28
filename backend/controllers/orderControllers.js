import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import errorHandler from "../utils/errorHandler.js"

// create new order ================================> api/v1/orders/new

export const newOrder = catchAsyncErrors(async (req,res,next)=>{
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    paymentInfo,
  }= req.body;
  const order = await Order.create ({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    paymentInfo,
    user: req.user._id,
  })
  res.status(200).json({
    order,
  });
})

// get order details ================================> api/v1/orders/:id

export const getOrderDetails = catchAsyncErrors(async (req,res,next)=>{
    
    const order = await Order.findById(req.params.id).populate("user","name email");
    if(!order){
        return next(new errorHandler(`no order with this Id: ${req.params.id}`,404));
    }
    res.status(200).json({
        order,
    });

})
// get current user order  ================================> api/v1/me/orders/

export const myOrders = catchAsyncErrors(async (req,res,next)=>{
    
    const order = await Order.find({user:req.user._id});
    if(!order){
        return next(new errorHandler(`no order with this Id`,404));
    }
    res.status(200).json({
        order,
    });

})
// get all orders -admin ================================> api/v1/admin/orders/

export const allOrders = catchAsyncErrors(async (req,res,next)=>{
    
    const order = await Order.find()

    res.status(200).json({
        order,
    });

})
// update order -admin ================================> api/v1/admin/order/:id

export const updateOrder = catchAsyncErrors(async (req,res,next)=>{
    
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new errorHandler(`no order with this Id: ${req.params.id}`,404));
    }
    if(order?.orderStatus === "Delivered"){
        return next(new errorHandler(`You have already delivered this order: ${req.params.id}`,400));
    }

    // update product stock -----------
    order.orderItems.forEach(async(item)=>{
        const product = await Product.findById(item?.product?.toString());
        if(!product){
            return next(new errorHandler(`no product with this Id`,404));
        }
        product.stock = product?.stock - item.quantity
        await product.save();

    })
     
    order.orderStatus = req.body.status;
    order.deliveredAt = Date.now();
    await order.save();
    res.status(200).json({
        success:true
    });

})
// delete order  ================================> api/v1/admin/orders/:id

export const deleteOrder = catchAsyncErrors(async (req,res,next)=>{
    
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new errorHandler(`no order with this Id: ${req.params.id}`,404));
    }
    await order.deleteOne();
    res.status(200).json({
        success:true
    });

})

