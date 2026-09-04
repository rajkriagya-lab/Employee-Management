const notfoundMiddleware = (req, res, next) => {
    const error = new error(
        `Route not found: ${req.menthod} ${req.orginalUrl}`
    );

    res.status(404);

    next(error);
};

export default notfoundMiddleware;