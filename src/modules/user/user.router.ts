import { Router } from "express";
import { UserRoles } from "../../../generated/prisma/enums";
import auth from "../../middleware/auth";
import { userController } from "./user.controller";

const router=Router();
router.get("/me",auth(UserRoles.STUDENT,UserRoles.ADMIN),userController.getUser)
router.put("/update",auth(UserRoles.STUDENT,UserRoles.ADMIN),userController.updateUserData)

router.get("/list",auth(UserRoles.ADMIN),userController.listUserts)
router.put("/ban/:userId",auth(UserRoles.ADMIN),userController.updateUserStatus)

export const userRouter=router;