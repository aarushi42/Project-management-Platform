import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.util.js";

export const validate = (req, res, next) => {
  const errors = validationesult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((error) =>
    extractedErrors.push({
      [error.path]: error.msg,
    }),
  );

  throw new ApiError(422, "Received data is not valid", extractedErrors);
};
