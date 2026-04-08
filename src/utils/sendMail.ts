import nodemailer from "nodemailer";

import CONFIG from "../config";

interface Message {
  to: string;
  subject: string;
  text: string;
  html: string;
}

async function sendMail(msg: Message): Promise<void> {
  if (!CONFIG.smtpHost || !CONFIG.smtpAuthUser || !CONFIG.smtpAuthPass) {
    console.log(`[sendMail] to=${msg.to} subject="${msg.subject}"\n${msg.text}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: CONFIG.smtpHost,
    port: CONFIG.smtpPort,
    secure: false,
    auth: {
      user: CONFIG.smtpAuthUser,
      pass: CONFIG.smtpAuthPass,
    },
  });

  await transporter.sendMail({ ...msg, from: CONFIG.senderEmail });
}

export default sendMail;
