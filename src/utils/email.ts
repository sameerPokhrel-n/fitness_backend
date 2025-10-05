import nodemailer from "nodemailer";

const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Fitness App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendOtpEmail = async (to: string, otp: string) => {
  const subject = "Your Fitness App Verification OTP";
  const html = `<p>Your OTP code is <b>${otp}</b>. It expires in 10 minutes.</p>`;
  await sendEmail(to, subject, html);
};
export const sendPasswordResetOtpEmail = async (to: string, otp: string) => {
  const subject = "Your Fitness App Password Reset OTP";
  const html = `<p>Your password reset OTP code is <b>${otp}</b>. It expires in 10 minutes.</p>`;
  await sendEmail(to, subject, html);
};

