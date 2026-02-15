import { Router } from "express";
import { categoryController } from "./category.controller";

import { UserRoles } from "../../../generated/prisma/enums";
import auth from "../../middleware/auth";

const router=Router()

router.get("/",categoryController.getAllCategories)
router.post("/create",auth(UserRoles.ADMIN),categoryController.createCategory)
router.post("/subject/create",auth(UserRoles.ADMIN),categoryController.createSubject)

router.put("/update/:categoryId",auth(UserRoles.ADMIN),categoryController.updateCategory)
router.put("/update/subject/:subjectId",auth(UserRoles.ADMIN),categoryController.updateSubject)
