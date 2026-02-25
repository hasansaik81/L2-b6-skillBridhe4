import { AvailabilityStatus, Booking, BookingStatus, User, UserRoles } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllBookings=async (user:User,tutorId:string)=>{
    if(user.role===UserRoles.STUDENT){
        return await prisma.booking.findMany({
            where:{
                studentId:user.id,
            },
            include:{
                tutor:true,
                availability:true,
            },
            orderBy:{
                completedAt:"desc",
            },
        });
    }
    if(user.role===UserRoles.TUTOR){
        return await prisma.booking.findMany({
            where:{
                tutorId:user.id,
            },
            include:{
                stdudent:true,
                availability:true,
            },
            orderBy:{
                completedAt:"desc",
            },
        });
    }
    if(user.role===UserRoles.ADMIN){
        return prisma.booking.findMany({
            include:{
                stdudent:true,
                availability:true
            },
            orderBy:{
                completedAt:"desc",
            },
        });
    }

    throw new Error("Unathorized");
};

const getBookingBYId=async (user:User,tutorId:string,bookingId:string)=>{
    if(user.role===UserRoles.STUDENT){
        return await prisma.booking.findFirst({
            where:{
                studentId:user.id,
                id:bookingId
            },
            include:{
                stdudent:true,
                tutor:{
                   include:{
                    user:true
                   } 

                },
                subject:true,
                availability:true,
                review:true
            }

        });
    }

    if(user.role===UserRoles.TUTOR){
        return await prisma.booking.findFirst({
            where:{
                tutorId,
                id:bookingId
            },
            include:{
                stdudent:true,
                tutor:{
                    include:{
                        user:true
                    }
                },
                subject:true,
                availability:true,
                review:true
            }
        });
    }

    if(user.role===UserRoles.ADMIN){
        return await prisma.booking.findFirst({
            where:{
                id:bookingId
            },
            include:{
                stdudent:true,
                tutor:{
                    include:{
                        user:true
                    }
                },
                subject:true,
                availability:true,
                review:true
            }
        });
    }
    throw new Error("Unauthorized")
};

const createBooking=async(data:Booking,studentId:string)=>{
    const {tutorId,availabilityId,subjectId}=data;
    if(!availabilityId||!tutorId||!subjectId){
        throw new Error ("Availability ID,Tutor ID,and Subject ID are required");

    }
    const tutorInfo=await prisma.$transaction(async(tx)=>{
        const availability=await tx.availability.findUniqueOrThrow({
            where:{
                id:availabilityId as string,
                tutorId,
                
            },
         
        
     });
     const tutor= await tx.tutorProfiles.findUniqueOrThrow({
        where:{
            id:tutorId,
        },
     });

     return {...tutor,availability};
    });

    if(tutorInfo.availability.status===AvailabilityStatus.BOOKED){
        throw new Error("This availability is already booked");

    }
    const {startTime,endTime}=tutorInfo.availability;

       const [startHour,startMinute]:number[]=startTime

       .split(":").map(Number) as [number,number];
    
       const [endHour,endMinute]=endTime.split(":").map(Number)as[
        number,number ]
        const start=startHour*60 + startMinute;
        const end=endHour*60+endMinute;
         
        const duration=(end - start)/60;
        const price =(tutorInfo.hourlyRate as number)*duration;

        return prisma.$transaction(async(tx)=>{
            await tx.availability.update({
                where:{
                    id:availabilityId as string,

                },
                data:{
                    status:AvailabilityStatus.BOOKED,
                },
            });
            return await tx.booking.create({
                data:{
                    studentId,
                    tutorId,
                    availabilityId,
                    price,
                    subjectId
                },
            });
        });
      
  
};

const updateBookingStatus=async (
    bookingId:string,
    status:BookingStatus,
    user:User,
    tutorId?:string|null,

)=>{
    const booking = await prisma.booking.findUniqueOrThrow({
        where:{id:bookingId},
    });
    if(user.role===UserRoles.STUDENT){
        if(booking.status===BookingStatus.CANCELLED){
            throw new Error("you can not change a completed booking")
        }

        if(status!==BookingStatus.CANCELLED){
             throw new Error("Students can only cancel their bookings");
        }
        
        if(booking.studentId !==user.id){
             throw new Error("Not authorized to cancel this bookin");
        }
        
    }
    if(tutorId){
        if(user.role===UserRoles.TUTOR){
            if(booking.status===BookingStatus.CANCELLED){
                 throw new Error("you can not change a cancelled booking");
            }

            if(status!==BookingStatus.COMPLETED){
                 throw new Error("Tutors can only complete bookings")
            }

            if(booking.tutorId!==tutorId){
                 throw new Error("Nor authorized to complete this booking");
            }
        }
    }
    return await prisma.$transaction(async(tx)=>{
        await tx.availability.update({
            where:{
                id:booking.availabilityId as string,
            },
            data:{
                status:AvailabilityStatus.AVAILABLE
            },
        });
        return await tx.booking.update({
            where:{id:bookingId},
            data:{
                status,
                completedAt:status===BookingStatus.CANCELLED?new Date():null,
            },
        });
    });
   

    };

  
export const bookingService={
    getAllBookings,
    createBooking,
    getBookingBYId,
    updateBookingStatus
}