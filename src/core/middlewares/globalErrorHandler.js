import { ZodError } from "zod";
import { env } from "../config/config.js";  
import handleCastError from "../error/handleCastError.js";
import handleDuplicateError from "../error/handleDuplicateError.js";
import handleValidationError from "../error/handleValidationError.js";
import handleZodError from "../error/handleZodError.js";
import AppError from "../error/appError.js";


const globalErrorHandler = (err, req, res, next) => {
  console.error("Global Error Handler:", err);

  let statusCode = err?.statusCode || 500;
  let message = "Something went wrong!";
  let errorSources = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [{ path: "", message: err?.message }];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [{ path: "", message: err?.message }];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: env === "development" ? err?.stack : null,
  });
};


export default globalErrorHandler;