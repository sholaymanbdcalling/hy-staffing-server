const searchQuery = (keyword, res) => {
  const forbiddenChars = /[^a-zA-Z0-9\s]/;

  if (!keyword || keyword.trim() === "") {
    return { error: "Search keyword is required" };
  }

  if (keyword.length < 3 || keyword.length > 50) {
    return { error: "Search keyword must be between 3 and 50 characters" };
  }

  if (forbiddenChars.test(keyword)) {
    return { error: "Search keyword contains invalid characters" };
  }

  let searchRegex = { $regex: keyword, $options: "i" };
  let searchParams = [{ title: searchRegex }, { company: searchRegex }];
  let searchQuery = { $or: searchParams };

  return searchQuery;
};

export default searchQuery;
