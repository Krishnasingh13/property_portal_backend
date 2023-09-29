import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { verifyUser } from "../helpers/verifyUser";

import { S3Client } from "@aws-sdk/client-s3";

import { connectWithDb } from "../config/db";

import authRoutes from "../routes/auth";
import propertyRoutes from "../routes/property";
import publicRoutes from "../routes/public";
import { addProperty } from "../controllers/property";

dotenv.config();

const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());

/* FILE STORAGE */
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/* PUBLIC ROUTES */
app.use("/property", publicRoutes);

/* PUBLIC ROUTES WITH IMAGE UPLOAD */
app.use(
  "/property/addProperty",
  verifyUser,
  upload.single("propertyImage"),
  addProperty
);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/property", publicRoutes);
app.use("/property", verifyUser, propertyRoutes);

/* MONGOOSE SETUP */
connectWithDb();

/* PORT */
const PORT = process.env.PORT || 6001;

/* SERVER */
app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});
