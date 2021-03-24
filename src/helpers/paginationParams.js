const paginationParams = (count, limit, page) => {
  const skip = page * limit - limit;
  const pages = Math.ceil(count/limit);
  return [skip, pages, limit];
}

export default paginationParams