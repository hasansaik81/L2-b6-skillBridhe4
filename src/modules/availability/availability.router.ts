import { Router } from "express";
import { UserRoles } from "../../../generated/prisma/enums";
import { availabilityController } from "./availability.controller";
import auth from "../../middleware/auth";

const router=Router();

router.get("/",auth(UserRoles.TUTOR),availabilityController.createAvailability)