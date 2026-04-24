import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();
  console.log("Ethereal account created: %s / %s", testAccount.user, testAccount.pass);

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
}

export async function sendPasswordChangedEmail(to: string, name: string): Promise<void> {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: '"GearRent" <noreply@gearrent.com>',
    to,
    subject: "Password changed",
    text: `Hi ${name},\n\nYour GearRent password has been successfully changed.\n\nIf you did not make this change, contact support immediately.`,
    html: `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your GearRent password has been successfully changed.</p>
      <p>If you did not make this change, contact support immediately.</p>
    `,
  });

  console.log("Password change email sent. Preview: %s", nodemailer.getTestMessageUrl(info));
}

export async function sendPasswordResetEmail(to: string, name: string, code: string): Promise<void> {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: '"GearRent" <noreply@gearrent.com>',
    to,
    subject: "Password reset code",
    text: `Hi ${name},\n\nYour password reset code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you did not request this, ignore this email.`,
    html: `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your password reset code is:</p>
      <h2 style="letter-spacing: 4px;">${code}</h2>
      <p>This code expires in <strong>15 minutes</strong>.</p>
      <p>If you did not request this, ignore this email.</p>
    `,
  });

  console.log("Password reset email sent. Preview: %s", nodemailer.getTestMessageUrl(info));
}
