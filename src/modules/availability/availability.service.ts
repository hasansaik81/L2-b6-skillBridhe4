import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createAvailbability=async(data:Prisma.AvailabilityCreateInput,tutorId:string)=>{
    const {day,startTime,endTime}=data;
    const timeRegex=/^([01]\d|2[0-3]):([0-5]\d)$/;
    if(!timeRegex.test(startTime)||!timeRegex.test(endTime)){
      throw new Error ("Time must be in HH:mm format")  ;
     
    }

     if(endTime<=startTime){
          throw new Error ("end time must be after start time") ;
      }
      const confict = await prisma.availability.findFirst({
        where:{
            tutorId,
            day,
            status:"AVAILABLE",
            AND:[
                {startTime:{lt:endTime}},
                {endTime:{gt:startTime}},
            ],
        },
      });

      if(confict){
        throw new Error("This time slot overlaps with existion availability ");

      }
      return prisma.availability.create({
        data:{
            tutorId,
            day,
            startTime,
            endTime
        },
      });
};

const updateAvailability=async(data:Prisma.AvailabilityCreateInput,tutorId:string,availabilityId:string)=>{
    const existing= await prisma.availability.findUnique({
        where:{id:availabilityId,tutorId},
    });
    if(!existing){
   throw new Error("Availability not found")
    }
    if(existing.tutorId !==tutorId){
       throw new Error ("Not authorized to update this availability") 
    }
    
}

export const availabilityService={
    createAvailbability
}