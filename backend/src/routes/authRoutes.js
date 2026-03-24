const express = require('express');
const { register, login } = require('../controllers/authController');
const validate = require('../common/middlewares/validate');
const v = require('../modules/auth/auth.validation');

const router = express.Router();

router.post('/register', validate(v.register), register);
router.post('/login', validate(v.login), login);

module.exports = router;
