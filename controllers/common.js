
const dbHelpers = require('../helpers/dbHelpers');

exports.getLeftMenu = async (req, res, next) => {
 
  res.locals.account = req.session.account;
  
  return next();
}
