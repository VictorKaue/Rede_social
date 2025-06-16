const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authController = require('../controllers/authController'); 
const { protect } = require('../middleware/AuthMiddleware'); 

router.post('/register', authController.register);
router.post('/login', authController.login); 
router.get('/me', protect, authController.getMe); 

router.get('/generate-token', (req, res) => {
  const JWT_SECRET = '1aA!@#Fsd782Jshs8sYzXkU93jhs7KaP09';
  const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

module.exports = router;