export const sendEmail = async ({ to, subject, html }) => {
  // if (process.env.NODE_ENV === "development") {
  //   console.log("\n========== EMAIL (DEV MODE) ==========");
  //   console.log(`To: ${to}`);
  //   console.log(`Subject: ${subject}`);
  //   console.log("Body:");
  //   console.log(html);
  //   console.log("========================================\n");
  //   return { success: true, messageId: "dev-" + Date.now() };
  // }

  const emailProvider = process.env.EMAIL_PROVIDER || "console";

  switch (emailProvider) {
    case "sendgrid":
      return await sendWithSendGrid({ to, subject, html });
    case "nodemailer":
      return await sendWithNodemailer({ to, subject, html });
    default:
      console.log("\n========== EMAIL ==========");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log("============================\n");
      return { success: true, messageId: "console-" + Date.now() };
  }
};

const sendWithSendGrid = async ({ to, subject, html }) => {
  const sgMail = await import("@sendgrid/mail");
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to,
    from: process.env.EMAIL_FROM || "noreply@borobazar.com",
    subject,
    html,
  };

  try {
    const [response] = await sgMail.send(msg);
    return { success: true, messageId: response.headers["x-message-id"] };
  } catch (error) {
    console.error("SendGrid Error:", error);
    throw error;
  }
};

const sendWithNodemailer = async ({ to, subject, html }) => {
  const nodemailer = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const msg = {
    from: process.env.EMAIL_FROM || "noreply@borobazar.com",
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(msg);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Nodemailer Error:", error);
    throw error;
  }
};