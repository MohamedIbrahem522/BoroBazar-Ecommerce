import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      url: { type: String, required: true },
      id: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const Category =
  mongoose.models.Category || model("Category", categorySchema);

export default Category;