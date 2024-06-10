export const prepareSearchQuery = (req, searchFields) => {
  let query = {};
  for (const x of searchFields) {
    if (req.query[x]) {
      query[x] = req.query[x];
    }
  }
  console.log("searchquery==", query);
  return query;
};
