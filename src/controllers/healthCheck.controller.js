import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/async-handler.js";
/*
normal way of writing code 
const healthCheck = (req, res) => {
  try {
    res
      .status(200)
      .json(new ApiResponse(200, { message: "Server is running fine!" }));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
*/
const healthCheck = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { message: "Server is running Fine!" }));
});

export default healthCheck;
