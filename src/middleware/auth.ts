
import { Request, Response,NextFunction } from "express";
import {auth as betterAuth} from "../lib/auth"
// import { success } from "better-auth/*";
import { prisma } from "../lib/prisma";
import { UserRoles } from "../../generated/prisma/enums";

// export enum UserRoles{
//    TUTOR  = "USER",
//    STUDENT="STUDENT",
//     ADMIN = "ADMIN"
// }

const auth=(...roles:UserRoles[])=>{
    return async(req:Request,  res:Response, next:NextFunction)=>{
        try{
            // get user session 
            const session =await betterAuth.api.getSession({
                headers:req.headers as any
            })

            if(!session){
                return res.status(401).json({
                    success:false,
                    message:"you are not authenticated"
                })
            }

            if(!session.user.emailVerified){
                return res.status(403).json({
                    success:false,
                    message:"Email verification required.please verify your email!"
                })
            }

            req.user={
                id:session.user.id,
                email:session.user.email,
                name:session.user.name,
                role:session.user.role as string,
                emailVerified:session.user.emailVerified
            }

            if(roles.length&& !roles.includes(req.user.role as UserRoles)){
                return res.status(403).json({
                    success:false,
                    message:"Forbidden! You dont have access to this premission"
                })
            }

                 if (req.user.role === UserRoles.TUTOR) {
                const tutorProfile = await prisma.tutorProfiles.findUnique({
                    where : {
                        userId : req.user.id as string
                    },
                    select : {
                        id : true
                    }
                });
                if (tutorProfile) {
                    req.tutorId = tutorProfile.id
                }
            } 

            next();
        }catch(err){
            next(err);
        }
         

    }
}

export default auth;