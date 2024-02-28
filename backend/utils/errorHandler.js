class ErrorHandler extends Error{
    constructor(message,statusCode){
        super(message);// invoking parent class constractor
        this.statusCode= statusCode;
        Error.captureStackTrace(this, this.constructor)
    }
    
}
export default ErrorHandler;