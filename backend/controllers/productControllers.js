import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Product from "../models/product.js";
import APIfilters from "../utils/apiFilters.js";
import errorHandler from "../utils/errorHandler.js";

//get products ========================================= >  /api/v1/products?keyword=vsdvsdds
export const getProducts = catchAsyncErrors(async (req, res) => {
  const resPerPage = 4;
  const apiFilters = new APIfilters(Product, req.query).search().filters();
  let products = await apiFilters.query;
  let filterdProductsCount = products.length;
  apiFilters.pagination(resPerPage);
  products = await apiFilters.query.clone();

  res.status(200).json({
    resPerPage,
    filterdProductsCount,
    products,
  });
});
//create a new product ================================== >  /api/v1/admin/products
export const newProducts = catchAsyncErrors(async (req, res) => {
  req.body.user = req.user._id;
  const product = await Product.create(req.body);
  res.status(200).json({
    product,
  });
});

//get single product details  ============================= >  /api/v1/products/:id
export const getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req?.params?.id);
  if (!product) {
    return next(new errorHandler("product not found", 404));
  }
  res.status(200).json({
    product,
  });
});
//update  product details  ===================================== >  /api/v1/products/:id
export const updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req?.params?.id);
  if (!product) {
    return next(new errorHandler("product not found", 404));
  }
  product = await Product.findByIdAndUpdate(req?.params?.id, req.body, {
    new: true,
  });
  res.status(200).json({
    product,
  });
});
// delete product ================================================== >  /api/v1/products/:id
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req?.params?.id);
  if (!product) {
    return next(new errorHandler("product not found", 404));
  }
  await product.deleteOne();
  res.status(200).json({
    message: "Product deleted",
  });
});

// create/update product review ===================================== >  /api/v1/review
export const createProductReview = catchAsyncErrors(async (req, res) => {
  const { rating, comment, ProductId } = req.body;

  const review = {
    user: req?.user?._id,
    rating: Number(rating),
    comment,
  };

  let product = await Product.findById(ProductId);
  if (!product) {
    return next(new errorHandler("product not found", 404));
  }

  const isReviewed = product?.reviews?.find(
    (r) => r.user.toString() === req?.user?._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review?.user.toString() === req?.user?._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();

  res.status(200).json({
    success: true,
  });
});

// get product reviews == ===================================>  /api/v1/reviews
export const getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(new errorHandler("product not found", 404));
  }

  res.status(200).json({
    reviews: product.reviews,
  });
});
// delete product review ===================================== >  /api/v1/review
export const deleteReview = catchAsyncErrors(async (req, res) => {
  let product = await Product.findById(req.query.productId);
  if (!product) {
    return next(new errorHandler("product not found", 404));
  }

  product.reviews = product?.reviews?.filter(
    (review) => review._id.toString() !== req?.query?.id.toString()
  );

  product.numOfReviews = product.reviews.length;

  product.ratings =
    product.numOfReviews === 0
      ? 0
      : product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.numOfReviews;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });
});
