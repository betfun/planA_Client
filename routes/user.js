
const express = require('express');
const router = express.Router();

const userCtlr = require('../controllers/user');
const { catchErrors } = require('../helpers/errorHandlers');

/**
 * 회원 정보 수정
 */
router.get('/profile', catchErrors(userCtlr.getUserInfo));
// router.post('/profile', catchErrors(userCtlr.modifyUserInfo));


module.exports = router;
