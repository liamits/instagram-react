const express = require('express');
const auth = require('../middleware/authMiddleware');
const { upload, uploadToCloudinary } = require('../config/cloudinary');
const catchAsync = require('../common/utils/catchAsync');
const ApiError = require('../common/utils/ApiError');
const { sendResponse } = require('../common/utils/response');

const router = express.Router();

router.post('/', auth, upload.single('image'), catchAsync(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const result = await uploadToCloudinary(req.file.buffer);
  sendResponse(res, 200, { url: result.secure_url });
}));

module.exports = router;
