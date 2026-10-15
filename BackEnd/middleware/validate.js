// Validates req.body against a zod schema and replaces it with the parsed (typed, trimmed) value.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0]?.message || "Invalid input",
      details: result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }
  req.body = result.data;
  next();
};

module.exports = validate;
