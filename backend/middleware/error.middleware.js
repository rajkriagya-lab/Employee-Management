const errorMiddleware = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error("ERROR:", err);

    const statusCode =
        Number.isInteger(err.statusCode) && err.statusCode >= 400
            ? err.statusCode
            : Number.isInteger(err.status) && err.status >= 400
                ? err.status
                : 500;

    return res.status(statusCode).json({
        success: false,
        message: statusCode >= 500
            ? "Internal Server Error"
            : err.message || "Request failed",
    });
};

export default errorMiddleware;