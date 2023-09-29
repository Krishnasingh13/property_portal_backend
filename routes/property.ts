import express from "express";
import {
  getMyProperties,
  updateProperty,
  deleteProperty,
} from "../controllers/property";

const router = express.Router();

router.get("/getMyProperties", getMyProperties);
router.patch("/updateProperty/:id", updateProperty);
router.delete("/deleteProperty/:id", deleteProperty);

export default router;
