const errorMiddleware = (err,req,res,next) => {
  err.message = err.message || "Somthing went wrong"
  err.statusCode = err.statusCode || 500
  
  res.status(500).json({ 
    success:false,
    message: err.message,
    stack:err.stack
    });
}

module.exports = errorMiddleware