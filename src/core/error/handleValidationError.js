const handleValidationError = (err) => {
  const errorSources = Object.values(err.errors).map((val) => ({
    path: val?.path,
    message: val?.message,
  }));

  const statusCode = 400;

  return {
    statusCode,
    message: "Validation Error",
    errorSources,
  };
};

export default handleValidationError;