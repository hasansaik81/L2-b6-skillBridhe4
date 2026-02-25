
import { UserRoles } from "../../generated/prisma/enums"
import { prisma } from "../lib/prisma"
// import { UserRoles } from "../middleware/auth"


async function seedAdmin(){
    try{
        console.log("*** Admin  seeding Started..")
        const adminData={
            name:"Admin",
            email:"admin@skillbridge.com",
            role:UserRoles.ADMIN,
            password:"admin123",
            // emailVerified:true
           
        }
        console.log("*** cheking admin exist or not")
        // check user exist on db or not 
        const existingUser =await prisma.user.findUnique({
            where:{
                email:adminData.email
            }
        })
        if(existingUser){
            throw new Error("Admin user aleady exist!!")
        }
        const signUpAdmin= await fetch("http://localhost:3000/api/auth/sign-up/email",{
            method:"POST",
            headers:{
                "content-type":"application/json",
                  "Origin": process.env.APP_URL || "http://localhost:3000"
            },
            body:JSON.stringify(adminData)
        })
        console.log(signUpAdmin)

        if(signUpAdmin.ok){
            console.log("*** Admin created")
            await prisma.user.update({
                where:{
                    email:adminData.email

                },
                data:{
                    emailVerified:true
                }
            })
            console.log("** Email Verification status updated!")
        }
        console.log("** success***")
    }catch(error){
        console.error(error);
    }
}

seedAdmin()





// import "dotenv/config";
// import { prisma } from "../lib/prisma";
// // import prisma from "../app/prisma";
// import bcrypt from "bcrypt";

// async function seedAdmin() {
//   try {
//     if (process.env.ALLOW_ADMIN_SEED !== "true") {
//       console.log("⛔ Admin seeding disabled");
//       return;
//     }

//     console.log("🌱 Checking admin user...");

//     const email = process.env.ADMIN_EMAIL!;
//     const plainPassword = process.env.ADMIN_PASSWORD!;

//     const existingAdmin = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (existingAdmin) {
//       console.log("✅ Admin already exists");
//       return;
//     }

//     const hashedPassword = await bcrypt.hash(plainPassword, 10);

//     await prisma.user.create({
//       data: {
//         name: "Admin",
//         email,
//         password: hashedPassword,
//         role: "ADMIN",
//         emailVerified: true,
//       },
//     });

//     console.log("✅ Admin created successfully");
//   } catch (error) {
//     console.error("❌ Admin seed failed:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// seedAdmin();


