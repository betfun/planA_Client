const url = require('url');
/**
 * check authorized
 * @returns 
 */
exports.isAuthorized = (req, res, next) => {  
  if (!req.session || !req.session.logined) {
    if (req.xhr) {
      return res.json({
        result:102, 
        msg:'로그인이 필요한 서비스입니다',
        rUrl: `/auth/login`
      });
    } else {
      res.redirect(`/auth/login?path=${req.originalUrl}`);
      return;
    }
  }
  res.locals.email = req.session.f_email;
  res.locals.account = req.session.account;
  return next();
}

