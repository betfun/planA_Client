
const express = require('express');
const router = express.Router();

const commonCtlr = require('../controllers/common');
const userCtlr = require('../controllers/user');
const tranCtlr = require('../controllers/trans');

const { catchErrors } = require('../helpers/errorHandlers');

/**
 * 회원 정보 수정
 */
router.get('/repassword', catchErrors(userCtlr.rePassword));
router.post('/repassword', catchErrors(userCtlr.doRePassword));
router.post('/doEditWallet', catchErrors(userCtlr.doEditWallet));

router.get('/trans', catchErrors(tranCtlr.getTrans));

router.get('/tree', catchErrors(userCtlr.getTree));
module.exports = router;
