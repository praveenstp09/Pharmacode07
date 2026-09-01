/**
 * Standard pagination helper for database queries and in-memory arrays.
 * 
 * @param {Object} options
 * @param {number|string} [options.page] 1-indexed page number
 * @param {number|string} [options.limit] Number of items per page (max 100)
 * @param {number} options.total Total items matching the query
 * @returns {{ page: number, limit: number, total: number, totalPages: number, skip: number, hasNext: boolean, hasPrev: boolean }}
 */
export const getPaginationMeta = ({ page, limit, total }) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const totalPages = Math.ceil(total / parsedLimit) || 1;
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    total,
    totalPages,
    skip,
    hasNext: parsedPage < totalPages,
    hasPrev: parsedPage > 1,
  };
};

/**
 * Slice an in-memory array with standard pagination metadata.
 * 
 * @param {Array} items
 * @param {Object} queryParams
 * @param {number|string} [queryParams.page]
 * @param {number|string} [queryParams.limit]
 * @returns {{ data: Array, meta: Object }}
 */
export const paginateArray = (items, queryParams = {}) => {
  const total = items.length;
  if (!queryParams.page && !queryParams.limit) {
    return {
      data: items,
      meta: {
        page: 1,
        limit: total,
        total,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  const meta = getPaginationMeta({
    page: queryParams.page,
    limit: queryParams.limit,
    total,
  });

  const data = items.slice(meta.skip, meta.skip + meta.limit);

  return {
    data,
    meta,
  };
};
