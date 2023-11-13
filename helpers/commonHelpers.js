const url = require('url');
/**
 * check authorized
 * @returns 
 */
exports.isAuthorized = async (req, res, next) => {

  if (!req.session || !req.session.logined) {

    if (req.xhr) {
      return res.json({
        result: 102, 
        msg:'Please log in',
        rUrl: `/auth/login`
      });
    } else {
      let re = url.parse(req.url).pathname;
      let msg = req.query.msg || '';
      res.redirect(`/auth/login?path=${re}&msg=${msg}`);
      return;
    }
  }
  
  res.locals.email = req.session.f_email;
  res.locals.account = req.session.account;

  return next();
}

