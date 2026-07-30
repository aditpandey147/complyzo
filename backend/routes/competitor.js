// routes/competitor.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { analyzeCompetitors } = require('../controllers/competitorController');

router.post('/analyze', auth, analyzeCompetitors);

module.exports = router;