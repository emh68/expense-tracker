import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.get("/categories", requireAuth, getCategories);
router.get("/categories/:categoryId", requireAuth, getCategory);
router.post("/categories", requireAuth, createCategory);
router.patch(
  "/categories/:categoryId",
  requireAuth,
  /*
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        name: 'Dining Out',
        color: '#FFA500',
        isActive: true
      }
    }
  */
  updateCategory,
);
router.delete("/categories/:categoryId", requireAuth, deleteCategory);

export default router;
