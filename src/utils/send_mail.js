import { transporter } from "../config/mail_config.js";
import "dotenv/config";
import path from "path";
import ejs from "ejs";
import { baseDir } from "../../app.js";

export const sendMail = async ({ user, subject, token = null }) => {
  let html;
  let link;
  const emailFileDir = path.join(baseDir, "src", "views");

  if (subject === "User Verification Email") {
    console.log("inside user verification email");
    const bodyTitle = `We're happy you signed up for Xyx. To start exploring the xyz webapp please confirm your email address.`;
    const bodyDescription =
      "Please click on the link below to verify your email. Thank You!";
    let PORT = process.env.PORT || 8000;

    link = `http:127.0.0.1:${PORT}/api/account/verify-email`;
    html = await ejs.renderFile(`${emailFileDir}/verification_email.ejs`, {
      title: subject,
      link: link,
      button: "Verify",
      bodyTitle: bodyTitle,
      bodyDescription: bodyDescription,
      userName: user.userName,
      token: token,
    });
  } else if (subject === "Password Reset Email") {
    const bodyTitle = "Password Reset Email";
    const bodyDescription =
      "We noticed that you requested to reset your password.If you did not request this password reset, please ignore this email. Your account security is important to us, and we take every measure to ensure your information remains safe";
    let PORT = process.env.PORT || 8000;

    link = `http:127.0.0.1:${PORT}/api/account/password-reset/confirm/${user._id}/${token}`;
    html = await ejs.renderFile(`${emailFileDir}/verification_email.ejs`, {
      title: subject,
      link: link,
      button: "Submit",
      bodyTitle: bodyTitle,
      bodyDescription: bodyDescription,
      userName: user.userName,
      token: token,
    });
  }

  const info = await transporter.sendMail({
    from: "abc@gmail.com", // sender address
    to: user.email, // list of receivers
    subject: subject, // Subject line

    html: html, // html body
  });

  console.log("Message sent: %s", info.messageId);
};
