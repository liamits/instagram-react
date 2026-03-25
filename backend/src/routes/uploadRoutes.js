const express = require('express');
const auth = require('../middlewares/auth');
const { upload, uploadToCloudinary } = require('../config/cloudinary');
const catchAsync = require('../common/catchAsync');
const ApiError = require('../common/ApiError');
const { sendResponse } = require('../common/response');

const router = express.Router();

router.post('/', auth, upload.single('image'), catchAsync(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const result = await uploadToCloudinary(req.file.buffer);
  sendResponse(res, 200, { url: result.secure_url });
}));

module.exports = router;
