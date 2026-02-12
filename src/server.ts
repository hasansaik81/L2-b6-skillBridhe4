

import app from "./app";
import { prisma } from "./lib/prisma";
// import { prisma } from "./lib/prisma";


const PORT=process.env.PORT ||3000

async function main(){
    try{
        await prisma.$connect()
        console.log("Connect to the database Successfully");
        app.listen(PORT,()=>{
            console.log(`server is running on http://localhost:${PORT}`)
        })
    }catch(error){
        console.error("An error occurred :",error)
         await prisma.$disconnect();
        process.exit(1);
    }
}

main();


