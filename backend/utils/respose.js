export const successResponse = (
    res,
    statusCode = 200,
    message = "Success",
    data = null,
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const errorResponse = (
    res,
    statusCode = 500,
    message = "Server Error",
    errors = null,
) => {
    return res.status(statusCode).json({
        success: false,
        message,

        ...(errors && {
            errors,
        }),
    });
};

export const createResponse = (
    res,
    message = "Created successfully",
    data = null,
) => {
    return res.status(201).json({
        success: true,
        message,
        data
    });
};

export const notContentResponse = (
    res,
    message = "Deleted successfully"
) => {
    return res.status(200).json({
        success: true,
        message,
    });
};