import { transporter } from "../config/mail_config.js";
import "dotenv/config";

export const sendMail = async ({ user, subject, html }) => {
  const info = await transporter.sendMail({
    from: "abc@gmail.com", // sender address
    to: user.email, // list of receivers
    subject: "Verify E-mail address", // Subject line

    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
};
