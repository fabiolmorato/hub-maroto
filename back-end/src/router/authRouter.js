const express = require('express');

const router = express.Router();

const controller = require('../controllers/authController');
const schemaValidationMiddleware = require('../middlewares/schemaValidationMiddleware');

const loginSchema = require('../schemas/loginSchema');

router.post('/sign-in', schemaValidationMiddleware(loginSchema), async (req, res) => {
  const { username, password } = req.body;
  const data = await controller.login(username, password);
  return res.send(data);
});

module.exports = router;
