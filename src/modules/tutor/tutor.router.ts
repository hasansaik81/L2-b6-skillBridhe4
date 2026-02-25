import { Router } from "express";
import { tutorController } from "./tutor.controller";
import auth from "../../middleware/auth";
import { UserRoles } from "../../../generated/prisma/enums";

const router=Router();

router.get("/",tutorController.getAllTutors);
router.get("/overview",auth(UserRoles.TUTOR),tutorController.getTutorDashboardOverview)
router.get("/:tutorId",tutorController.getTutorById);


router.put("/update",auth(UserRoles.TUTOR),tutorController.updateTutor);
router.put("/subjucts",auth(UserRoles.TUTOR),tutorController.updateTutorSubjects);
router.put("/feature/:tutorId",auth(UserRoles.ADMIN),tutorController.featureTutor);
 
router.delete("/subjects/:subjuctId",auth(UserRoles.TUTOR),tutorController.deleteTutorSubject);

export const tutorRouter=router