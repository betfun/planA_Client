
const express = require('express');
const router = express.Router();

const userCtlr = require('../controllers/user');
const { catchErrors } = require('../helpers/errorHandlers');

/**
 * 회원 정보 수정
 */
router.get('/repassword', catchErrors(userCtlr.rePassword));
router.post('/repassword', catchErrors(userCtlr.doRePassword));

module.exports = router;
