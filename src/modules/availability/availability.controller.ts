import { NextFunction, Request, Response } from "express";
import { availabilityService } from "./availability.service";

const createAvailability=async(req:Request,res:Response,next:NextFunction)=>{
  try{
  const result=await availabilityService.createAvailbability(req.body,req.tutorId as string)
  return res.json({success:true,message:"Tutor availability slot created successfully ",data:result})

  }catch (e) {
    next(e)
  }
}

export const availabilityController={
    createAvailability
}