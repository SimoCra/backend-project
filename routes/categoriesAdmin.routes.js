import { Router } from "express";
import {
  getAllCategoriesController,
  addCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getProductsByCategoryController,
  getProductByIdController,
  updateProductController,
  deleteProductController
} from "../controllers/categoriesAdminController.js";

import { upload, validarFirmaHex } from "../middleware/upload.js";

const router = Router();

// Categorías
router.get("/", getAllCategoriesController);

router.post("/", upload.single("image"), validarFirmaHex, addCategoryController);

router.put("/:id", upload.single("image"), validarFirmaHex, updateCategoryController);

router.delete("/:id", deleteCategoryController);

router.get("/:id/products", getProductsByCategoryController);

// Productos
router.get("/product/:id", getProductByIdController);

router.put("/product/:id", updateProductController);

router.delete("/product/:id", deleteProductController);

export default router;

