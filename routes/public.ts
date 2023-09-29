import express from "express";
import { getAllProperties } from "../controllers/property";

const router = express.Router();

router.get("/getAllProperties", getAllProperties);

export default router;
