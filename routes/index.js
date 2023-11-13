const express = require('express');
const router = express.Router();

const { catchErrors } = require('../helpers/errorHandlers');

const commonCtlr = require('../controllers/common');
const commonHelper = require('../helpers/commonHelpers');
const dashboard = require('../controllers/dashboard');

router.get('/', [commonHelper.isAuthorized, commonCtlr.getLeftMenu],  catchErrors(dashboard.dashboard1));

module.exports = router;
