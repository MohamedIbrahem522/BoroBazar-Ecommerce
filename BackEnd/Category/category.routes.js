import { Router } from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";
import { fileUpload, filterObject } from "../utils/multer.js";

const router = Router();
/////////////////(CreateCategory)\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

router.post(
  "/",
  //req.file.buffer بعدين يبعت ريكويست اول حاجه الريك هيدخل علي الميدل وير يقوم ملتر فاكك الريكويست ويقرا بينات الملف ويحطها كبفر في الرام وتلاقي imageاليوزر هيحط الصوره في متغير اسمه 
  //url and id بعدين هبعت البفر لكلاودنري يحط الصوره هناك ويرجعلي 
  fileUpload(filterObject.image).single("image"), // لزما الصوره تيجي في متغير اسمه image
  createCategory,
);
/////////////////(GetCategories)\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

router.get("/", getCategories);

/////////////////(UpdateCategory)\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

router.patch(
  "/:categoryId",
  fileUpload(filterObject.image).single("image"),
  updateCategory,
);

/////////////////(DeleteCategory)\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

router.delete("/:categoryId", deleteCategory);

export default router;
