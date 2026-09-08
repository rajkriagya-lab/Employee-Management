const errorMiddleware = (err, req, res, next) => {
    console.error("ERROR:",err );

    const statusCode = 
        res.statusCode === 200 ? 500 : res.statusCode;
    
        res.status(statusCode).json({
        success: true,
        message: err.message || "Internal Server Error",
    });
};

export default errorMiddleware;