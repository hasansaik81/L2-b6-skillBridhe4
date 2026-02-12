import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "./prisma";
import nodemailer from "nodemailer";
import { prisma } from "./prisma";
// import { prisma } from "./prisma";

// If your Prisma file is located elsewhere, you can change the path
// import { PrismaClient } from "@/generated/prisma/client";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
     user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
        trustedOrigins:[process.env.BETTER_AUTH_URL!],
        user:{
          additionalFields:{
            role:{
              type:"string",
              defaultValue:"STUDENT",
              required:false
            },
            phone:{
              type:"string",
              required:false
            },
            status:{
              type:"string",
              defaultValue:"ACTIVE",
              required:false
            }
          }
        },

    emailAndPassword: { 
    enabled: true, 
    autoSignIn:false,
    requireEmailVerification:true
  }, 
  emailVerification:{
      sendOnSignUp: true,
     autoSignInAfterVerification: true,
    sendVerificationEmail:async({user,url,token},request)=>{
      try{
        const verificationUrl=`${process.env.APP_URL}/verify-email?token=${token}`
        const info = await transporter.sendMail({
          from: '"prisma blog app" <prisma53@ethereal.email>',
            to: user.email,
            subject: "Please verify your email address",
             html: "<b> Hello World</b>"
        })
        console.log("Message sent:",info.messageId)

      }catch(err){
        console.error(err);
        throw err
      }

    },
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

});