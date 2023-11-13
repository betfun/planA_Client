
const express = require('express');
const router = express.Router();

const multer  = require('multer');
const upload = multer({ dest: process.env.UPLOAD_PATH+'/passport'});

const userCtlr = require('../controller/user');
const boardCtlr = require('../controller/board');
const { catchErrors } = require('../helpers/errorHandlers');

/**
 * 회원 정보 수정
 */
router.get('/modify', catchErrors(userCtlr.getModifyUserInfo));
router.post('/modify', upload.single('passport'), catchErrors(userCtlr.modifyUserInfo));

/**
 * 언어 변경
 */
router.post('/change-language', catchErrors(userCtlr.changeUserLanguage));

router.get('/history', catchErrors(userCtlr.history));

/**
 * 전송
 */
router.get('/send',  catchErrors(userCtlr.sendToken));
/**
 * 인출
 */
router.get('/payout', catchErrors(userCtlr.payoutToken));

router.get('/contact', catchErrors(boardCtlr.contactlist));

module.exports = router;
