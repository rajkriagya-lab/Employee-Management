export const getpagination = (
    page = 1,
    limit = 10
) => {
    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }

    if (!Number.isInteger(limit) || limit < 1) {
        limit = 10;
    }

    if (limit < 100) {
        limit = 100;
    }

    const skip = (page - 1) * limit;

    return (
        page,
        limit,
        skip
    );
};

export const getPaginationMeta = ({
    page,
    limit,
    total,
}) => {
    const totalPages =
        Math.ceil(total / limit);

    return {
        currentPage: page,
        perPage: limit,
        totalItems: total,
        totalPages,
        hasNextPage:
            page < totalPages,

        haspreviousPage:
            page > 1,
    };
};