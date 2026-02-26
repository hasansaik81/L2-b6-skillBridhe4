

import nodemailer from 'nodemailer';
import type { User } from '../../generated/prisma/client';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

type SendMailProps = {
  user: Partial<User>;
  url: string;
  token: string;
};

const getEmailTemplate = (userName: string, verificationUrl: string): string => {
  return `<html> ... <a href="${verificationUrl}">Verify email</a> ... </html>`;
};

const sendVerificationEmail = async ({ user, url, token }: SendMailProps) => {
  try {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

    const info = await transporter.sendMail({
      from: '"SkillBridge" <skillbridge@mail.com>',
      to: user.email,
      subject: "Verify Your Email Address - SkillBridge",
      text: `Hi ${user.name}, please verify your email: ${verificationUrl}`,
      html: getEmailTemplate(user.name as string, verificationUrl),
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.log(error);
  }
};

export default sendVerificationEmail;