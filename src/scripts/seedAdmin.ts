
import { UserRoles } from "../../generated/prisma/enums"
import { prisma } from "../lib/prisma"
// import { UserRoles } from "../middleware/auth"


async function seedAdmin(){
    try{
        console.log("*** Admin  seeding Started..")
        const adminData={
            name:"Admin shaheb1",
            email:"skillbridge1@admin.com",
            role:UserRoles.ADMIN,
            password:"admin12345",
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
                "content-type":"application/json"
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