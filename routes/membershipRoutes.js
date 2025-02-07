const express = require('express');
const router = express.Router();
const { getMembershipStatus, createMembership } = require('../controllers/membershipController');


router.get('/:userId', getMembershipStatus);
router.post('/', createMembership);

module.exports = router;
