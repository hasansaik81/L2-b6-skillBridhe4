import { Router } from "express";

import { UserRoles } from "../../../generated/prisma/enums";
import auth from "../../middleware/auth";
import { reviewController } from "./review.controller";

const router=Router()

router.post("/create",auth(UserRoles.STUDENT),reviewController.createReview)

export const reviewRouter=router
