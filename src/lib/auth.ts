import dotenv from "dotenv";
import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import nodemailer from "nodemailer";
import { prisma } from "./prisma";

import { createAuthMiddleware } from "better-auth/api";
import { UserRoles } from "../../generated/prisma/enums";
import { url } from "node:inspector";
import sendVerificationEmail from "../utils/sendVerificationEmail";


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
    
    sendVerificationEmail:async({user,url,token})=>{
      console.log(url)
      sendVerificationEmail({user:{...user,image:user.image??null},url,token})
     
      },
      autoSignInAfterVerification:true

    },

    socialProviders: {
       google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    
  },
  
  hooks:{
    before:createAuthMiddleware(async(ctx)=>{
      console.log(url)
      if(ctx.path==="/sign-up/email"){
        if(ctx.body.role===UserRoles.ADMIN&&(process.env.ALLOW_ADMIN_SEED =="true")){
          throw new APIError ("BAD_REQUEST",{
            message:"you can not sign up as admin"
          })
        }
      }
    }),
  },
  databaseHooks:{
    user:{
      create:{
        after:async(user)=>{
          try{
            if(user.role===UserRoles.TUTOR){
              await prisma.tutorProfiles.create({
                data:{
                  userId:user.id
                }
              })
            }
          }catch(error){
            console.log(error)
          };
          
        }
      }
    }
  }
  })
 

