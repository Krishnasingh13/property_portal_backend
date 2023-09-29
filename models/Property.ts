import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const PropertySchema = new mongoose.Schema(
  {
    propertyName: {
      type: String,
      required: true,
      trim: true,
    },
    propertyType: {
      type: String,
      required: true,
      enum: ["Apartment", "House", "Condo", "Townhouse", "Duplex", "Other"],
    },
    propertyImage: {
      type: String,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    squareFeet: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    location: LocationSchema, // Include the location subdocument
    dateAvailableFrom: {
      type: Date, // You can use the Date type for the available date
      required: true, // Adjust as needed
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", PropertySchema);

export default Property;
