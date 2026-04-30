export const getOTPTemplate = (otp, userName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; text-align: center; }
    .otp-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px 30px; display: inline-block; margin: 20px 0; }
    .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
    .expiry { color: #666; font-size: 14px; margin-top: 15px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .warning { color: #dc3545; font-size: 13px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Boro Bazar</h1>
    </div>
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>Hello ${userName},</p>
      <p>We received a request to reset your password. Use the code below:</p>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="expiry">Code expires in <strong>10 minutes</strong></div>
      </div>
      <p class="warning">If you didn't request this, please ignore this email. Your account is secure.</p>
    </div>
    <div class="footer">
      <p>Boro Bazar - Your trusted marketplace</p>
    </div>
  </div>
</body>
</html>
`;

export const getPasswordResetSuccessTemplate = (userName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; text-align: center; }
    .success-icon { font-size: 60px; margin-bottom: 20px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Boro Bazar</h1>
    </div>
    <div class="content">
      <div class="success-icon">✓</div>
      <h2>Password Reset Complete</h2>
      <p>Hello ${userName},</p>
      <p>Your password has been successfully reset. You can now login with your new password.</p>
      <p>If you didn't make this change, please contact support immediately.</p>
    </div>
    <div class="footer">
      <p>Boro Bazar - Your trusted marketplace</p>
    </div>
  </div>
</body>
</html>
`;