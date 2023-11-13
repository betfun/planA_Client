const nodemailer = require('nodemailer');

exports.send = async (_toAddress, _subject = 'no subject', _content = '', _templage = '') => {
 
  try {

    const transporter = await nodemailer.createTransport({
      pool: true,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // use TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },    
    });
    
    let verfied = await transporter.verify();
  
    if (!verfied) throw new Error('Mail Auth Error');

    let mail = {
      from: `${process.env.SMTP_NAME}🙂 <${process.env.SMTP_USER}>`, // sender address
      to: _toAddress,//"bar@example.com, baz@example.com", // list of receivers
      subject: _subject, // Subject line
    }

    if (_templage) {
      mail['html'] = _templage; // html body
    } else mail['text'] = _content; // plain text body

    let info = await transporter.sendMail(mail);    
        
  } catch (err) {
    console.log(err.message);
    return false;    
  }

  return true;
}

exports.templateForgotEmail = (_name, _account, _token) => {

  let host = (process.env.NODE_ENV == 'production')?'https://prewallet.biz':'http://127.0.0.1:8001';

  return `
    <table border="0" cellspacing="0" cellpadding="0" align="center"  style="border-collapse: collapse" >
    <tbody>
      <tr>
        <td style="font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana, arial, sans-serif;background: #ffffff;">
          <table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse" >
            <tbody>
              <tr>
                <td height="20" style="line-height: 20px" colspan="3">&nbsp;</td>
              </tr>
              <tr>
                <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                <td>
                  <table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse" >
                    <tbody>
                      <tr>
                        <td height="15" style="line-height: 15px" colspan="3">&nbsp;</td>
                      </tr>
                      <tr>
                        <td width="32" align="left" valign="middle" style="height: 32; line-height: 0px" >
                          😀
                        </td>
                        <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                        <td width="100%">
                          <span style="font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana,arial, sans-serif;font-size: 19px;line-height: 32px;color: #1877f2;">
                            PlanA</span>
                        </td>
                      </tr>
                      <tr style="border-bottom: solid 1px #e5e5e5">
                        <td height="15" style="line-height: 15px" colspan="3">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
              </tr>
              <tr>
                <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                <td>
                  <table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse">
                    <tbody>
                      <tr>
                        <td height="28" style="line-height: 28px">&nbsp;</td>
                      </tr>
                      <tr>
                        <td>
                          <span style="font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana,arial, sans-serif;font-size: 16px;line-height: 21px;color: #141823;">
                            Hello! ${_name}
                            <h3>Resseting your password:</h3>
                            <p style="margin:1em 0px">We received a request to change your APlan account password.</p>
                            <a href="${host}/auth/resetpassword?_t=${_token}&_account=${_account}" style="display: inline-block;background-color: #3a79e3; color: #fff;text-decoration: none;padding:1rem">
                              Change your password
                            </a>                          
                            <p style="margin:1em 0px">If you didn't request this, please ignore this email</p>
                            <p>Your password won't change until you access thie link above and create a new one.</p>                          
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td height="28" style="line-height: 28px">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
              </tr>
              <tr>
                <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                <td>
                  <table
                    border="0"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    align="left"
                    style="border-collapse: collapse"
                  >
                    <tbody>
                      <tr style="border-top: solid 1px #e5e5e5">
                        <td height="19" style="line-height: 19px">&nbsp;</td>
                      </tr>
                      <tr>
                        <td
                          style="
                            font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana,
                              arial, sans-serif;
                            font-size: 11px;
                            color: #aaaaaa;
                            line-height: 16px;
                          "
                        >
                          Thanks<br />
                          PrEcoY team
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
              </tr>
              <tr>
                <td height="20" style="line-height: 20px" colspan="3">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
`;
}