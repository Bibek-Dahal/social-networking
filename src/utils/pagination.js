export const paginate = async ({ req, model, filterQuery, query }) => {
  const maxLimit = 500;
  let sort = req.query.sort || "createdAt";
  let limit = req.query.limit || 10;
  let page = req.query.page || 1;
  let skip;
  limit = parseInt(limit) == NaN ? 10 : parseInt(limit);
  page = parseInt(page) === NaN ? 1 : parseInt(page);

  limit = limit > maxLimit ? maxLimit : limit;
  skip = (page - 1) * limit;
  const documentCount = await model.countDocuments(filterQuery);
  console.log(documentCount);

  let data = await query.skip(skip).limit(limit).sort(sort).exec();

  return { data, count: documentCount };
};
