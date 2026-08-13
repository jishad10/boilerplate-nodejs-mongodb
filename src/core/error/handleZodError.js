const handleZodError = (err) => {
  const errorSources = err.issues.map((issue) => ({
    path: String(issue?.path[issue.path.length - 1]),
    message: issue.message,
  }));

  const statusCode = 400;

  return {
    statusCode,
    message: "Validation Error",
    errorSources,
  };
};

export default handleZodError;