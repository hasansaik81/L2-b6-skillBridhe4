import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRoles } from "../../../generated/prisma/enums";
import { bookingController } from "./booking.controller";

const router=Router()

router.get("/",auth(UserRoles.STUDENT,UserRoles.TUTOR,UserRoles.ADMIN),bookingController.getAllBookings )
router.get("/:bookingId",auth(UserRoles.STUDENT),bookingController.getBookingById)
router.post("/create",auth(UserRoles.STUDENT),bookingController.createBooking)
router.put("/update/:bookingId",auth(UserRoles.STUDENT,UserRoles.TUTOR,UserRoles.ADMIN),bookingController.updateBookingStatus)


export const bookingRouter=router;
