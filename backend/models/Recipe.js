const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  rid: Number,
  name: String,
  slug: String,
  imageURL: String,
  ingredients: [String],
  category: String,
  tags: [String],
  description: String,
  cuisine: String,
  instructions: String,
  time: Object,
  videoURL: String
});

module.exports = mongoose.model("Recipe", RecipeSchema);
