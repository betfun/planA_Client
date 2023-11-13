const express = require('express');
const router = express.Router();
const authCtlr = require('../controllers/auth');
const { catchErrors } = require('../helpers/errorHandlers');

router.get('/login', authCtlr.login);

router.post('/login', catchErrors(authCtlr.procLogin));

router.get('/logout', authCtlr.logout);

/** 
 * forgot password
 */
router.get('/findpassword', catchErrors(authCtlr.findPassword));
router.post('/findpassword', catchErrors(authCtlr.dofindPassword));

router.get('/resetpassword', catchErrors(authCtlr.resetPassword));
router.post('/resetpassword', catchErrors(authCtlr.doResetPassword));

module.exports = router;
