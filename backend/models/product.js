import mongoose from "mongoose";
const productSchema = mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,"please enter the product name"],
            maxLength:[200,"product name cannot exceed 200 characters"]
        },
        price:{
            type:Number,
            required:[true,"Please enter product price"],
            maxLength:[5,"product price cannot exceed 5 digits"]
        },
        description:{
            type:String,
            required:[true,"please enter the product description"],
        },
        ratings:{
            type:Number,
            default:0
        },
        images:[
            {
                public_id:{
                    type:String,
                    required:true
                },
                url:{
                    type:String,
                    required:true
                }
            }
        ],
        category:{
            type:String,
            required:[true,"please select product category"],
            enum:{
                values:[
                    "violin",
                    "bow",
                    "string",
                    "case",
                ],
                message:"please select correct category"
            }
        },
        seller:{
            type:String,
            required:[true,"please enter the product seller"],
        },
        stock:{
            type:Number,
            required:[true,"please enter the product stock"],
        },
        numOfReviews:{
            type:Number,
            default:0
        },
        reviews:[
            {
                user:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"User",
                    required:true
                },
                rating:{
                    type:Number,
                    required:true
                },
                comment:{
                    type:String,
                    required:true
                }
            
            }
        ],
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
    },{timestamps:true}
)
export default  mongoose.model("product",productSchema)