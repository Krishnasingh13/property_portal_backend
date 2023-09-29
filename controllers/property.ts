import { Request, Response } from "express";
import User from "../models/User";
import Property from "../models/Property";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { s3Client } from "../src/index";

export const getMyProperties = async (req: Request, res: Response) => {
  try {
    const { token } = req.cookies;

    const user = await User.findOne({ token }).populate("properties");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ properties: user.properties });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const properties = await Property.find();

    return res.status(200).json({ properties });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const addProperty = async (req: Request, res: Response) => {
  try {
    const image = req.file;

    const {
      propertyName,
      propertyType,
      bedrooms,
      bathrooms,
      squareFeet,
      price,
      city,
      state,
      country,
      dateAvailableFrom,
    } = req.body;

    const location = {
      city,
      state,
      country,
    };

    const fileBuffer = await sharp(image.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer();

    const fileName = image.originalname;
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: fileBuffer,
      Key: fileName,
      ContentType: image.mimetype,
    };

    // Send the upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams));

    const link = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    if (
      !propertyName ||
      !propertyType ||
      !bedrooms ||
      !bathrooms ||
      !squareFeet ||
      !price ||
      !city ||
      !state ||
      !country ||
      !dateAvailableFrom
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newProperty = new Property({
      propertyName,
      propertyType,
      propertyImage: link,
      bedrooms,
      bathrooms,
      squareFeet,
      price,
      location,
      dateAvailableFrom,
    });

    const savedProperty = await newProperty.save();

    const { token } = req.cookies;
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    user.properties.push(savedProperty._id);

    savedProperty.owner = user._id;

    const resn = await Promise.all([user.save(), savedProperty.save()]);

    return res.status(200).json({ property: savedProperty });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { token } = req.cookies;

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (property.owner.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Permission denied" });
    }

    await User.updateOne({ _id: user._id }, { $pull: { properties: id } });

    await Property.findByIdAndRemove(id);

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { token } = req.cookies;

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      propertyName,
      propertyType,
      bedrooms,
      bathrooms,
      squareFeet,
      price,
      city,
      state,
      country,
    } = req.body;

    const location = {
      city,
      state,
      country,
    };

    const existingProperty = await Property.findById(id);

    if (existingProperty.owner.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Permission denied" });
    }

    if (!existingProperty) {
      return res.status(404).json({ error: "Property not found" });
    }

    existingProperty.propertyName =
      propertyName || existingProperty.propertyName;
    existingProperty.propertyType =
      propertyType || existingProperty.propertyType;
    existingProperty.bedrooms = bedrooms || existingProperty.bedrooms;
    existingProperty.bathrooms = bathrooms || existingProperty.bathrooms;
    existingProperty.squareFeet = squareFeet || existingProperty.squareFeet;
    existingProperty.price = price || existingProperty.price;
    existingProperty.location.city =
      location.city || existingProperty.location.city;
    existingProperty.location.state =
      location.state || existingProperty.location.state;
    existingProperty.location.country =
      location.country || existingProperty.location.country;

    const updatedProperty = await existingProperty.save();

    res.status(200).json({ property: updatedProperty });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
