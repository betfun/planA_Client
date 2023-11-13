const express = require('express');
const router = express.Router();

const { catchErrors } = require('../helpers/errorHandlers');

const commonCtlr = require('../controllers/common');
const dashboard = require('../controllers/dashboard');

router.get('/', [commonCtlr.isAuthorized, commonCtlr.getLeftMenu],  catchErrors(dashboard.dashboard1));

module.exports = router;
