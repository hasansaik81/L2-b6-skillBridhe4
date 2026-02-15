import { BookingStatus, Review } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { tutorService } from "../tutor/tutor.service";

const createReview=async(data:Review,studentId:string)=>{
    const {bookingId,rating,review}=data;
    if(!bookingId){
        throw new Error("Booking Id is required");
    }
    if(!review||review.trim().length===0){
        throw new Error("Review cannot be empty");
    }

    const numericRating =Number(rating);
    if(isNaN(numericRating)){
        throw new Error("Rating must be a number");
    }
    if(numericRating<1||numericRating>5){
        throw new Error("Rating must be between 1 and 5.0");
    }

    const roundedRating=Number(numericRating.toFixed(1));
    return await prisma.$transaction(async(tx)=>{
        const booking=await tx.booking.findFirstOrThrow({
            where:{id:bookingId},
            select:{
                id:true,
                studentId:true,
                tutorId:true,
                status:true,
            },
        });

        if(booking.status!==BookingStatus.COMPLETED){
            throw new Error("Booking must be completed to leave a review");  
        }
        if(booking.studentId!==studentId){
            throw new Error("Not authorized to leave a review for this booking"); 
        }

        const existingReview= await tx.review.findUnique({
            where:{bookingId},
        });

        if(existingReview){
             throw new Error("Review already exists for this booking"); 
        }
        const tutorReviews=await tx.review.findMany({
            where:{tutorId:booking.tutorId},
            select:{rating:true},
        });
        const totalOld=tutorReviews.reduce((acc,r)=>acc+Number(r.rating),0);
        const newAverage=Number(((totalOld+roundedRating)/(tutorReviews.length+1)).toFixed(1));
        await tx.tutorProfiles.update({
            where:{id:booking.tutorId},
            data:{
                totalReviews:tutorReviews.length+1,
                avgRating:newAverage,
            },
        });
        return await tx.review.create({
            data:{
                bookingId:booking.id,
                studentId,
                tutorId:booking.tutorId,
                rating:roundedRating,
                review:review.trim(),
                
            }
        })

    })
}