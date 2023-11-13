
const dbHelpers = require('../helpers/dbHelpers');

exports.getLeftMenu = async (req, res, next) => {
 
  res.locals.account = req.session.account;
  
  try {

    // let rs = await dbHelpers.getOneRow(`SELECT COUNT(1) AS count FROM user WHERE approve = 0`);  
    // res.locals.menu_approve = rs['count'];
  
    // rs = await dbHelpers.getOneRow(`SELECT COUNT(1) AS count FROM withdrawal WHERE withdrawtype = 2 and approve = 0`);
    // res.locals.menu_approve_usdt = rs['count'];

    // rs = await dbHelpers.getOneRow(`SELECT COUNT(1) AS count FROM withdrawal WHERE withdrawtype = 1 and approve = 0`);
    // res.locals.menu_approve_cash = rs['count'];
  
    // rs = await dbHelpers.getOneRow(`SELECT COUNT(1) AS count FROM history A, user B WHERE A.confirm = 0 AND A.user_id = B.id AND B.name = 'UnionMK' AND A.type = 4`);
    // res.locals.menu_approve3 = rs['count'];
    
    // rs = await dbHelpers.getOneRow(`SELECT COUNT(1) AS count FROM history A, user B WHERE A.confirm = 0 AND A.user_id = B.id AND B.name = 'SPS Global' AND A.type = 4`);
    // res.locals.menu_approve4 = rs['count'];

    // rs = await dbHelpers.getOneRow(`SELECT COUNT(1) AS count FROM board WHERE bsId = 1 and status = 'normal'`);
    // res.locals.qna_approve = rs['count'];
  
    // const group = await dbHelpers.getRows(`SELECT id, name FROM \`group\` WHERE seller = 0`); 
    // res.locals.group_type = group;
  
    // const group2 = await dbHelpers.getRows(`SELECT id, name FROM \`group\` WHERE seller = 1`); 
    // res.locals.group_type2 = group2;
    
    // const partner = await dbHelpers.getRows(`select name from user where type = 2`);
    // res.locals.partner = partner;      

  } catch (error) {
    
  }

  return next();
}
