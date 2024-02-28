export default (controllerFunction)=>(res,req,next)=>
Promise.resolve(controllerFunction(res,req,next)).catch(next);
/*
 The Promise.resolve() is used to handle both synchronous and asynchronous code uniformly.
*/