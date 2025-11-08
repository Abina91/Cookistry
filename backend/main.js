require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");

// Models
const User = require("./models/User");

// Express app
const app = express();

// Middleware
app.use(cors()); // You can replace "*" with your frontend URL in production
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve uploaded images

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to DB:", err));

// Multer Storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Recipe Schema
const recipeSchema = new mongoose.Schema({
  rid: { type: Number, required: true, unique: true },
  name: String,
  slug: String,
  ingredients: [String],
  category: String,
  tags: [String],
  description: String,
  cuisine: String,
  instructions: String,
  time: {
    serves: String,
    prep_time: String,
    cook_time: String,
    total_time: String,
  },
  imageURL: String,
  videoURL: String,
});
const Recipe = mongoose.model("Recipe", recipeSchema);

// --- ROUTES ---

// POST Recipe
app.post("/recipe", upload.single("image"), async (req, res) => {
  try {
    const newRecipe = new Recipe({
      rid: req.body.rid,
      name: req.body.name,
      slug: req.body.slug,
      ingredients: req.body.ingredients?.split(",") || [],
      category: req.body.category,
      tags: req.body.tags?.split(",") || [],
      description: req.body.description,
      cuisine: req.body.cuisine,
      instructions: req.body.instructions,
      time: {
        serves: req.body.serves,
        prep_time: req.body.prep_time,
        cook_time: req.body.cook_time,
        total_time: req.body.total_time,
      },
      imageURL: req.file ? `/uploads/${req.file.filename}` : "",
      videoURL: req.body.videoURL || "",
    });

    const savedRecipe = await newRecipe.save();
    res.json(savedRecipe);
  } catch (err) {
    console.error("Error saving recipe:", err);
    res.status(500).json({ error: "Failed to save recipe" });
  }
});

// GET All Recipes
app.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    console.error("Error fetching recipes:", err);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// SEARCH Recipes
app.get("/recipes/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Search query required" });

  const regex = new RegExp(q, "i");
  try {
    const results = await Recipe.find({
      $or: [
        { name: { $regex: regex } },
        { category: { $regex: regex } },
        { tags: { $elemMatch: { $regex: regex } } },
        { ingredients: { $elemMatch: { $regex: regex } } },
        { cuisine: { $regex: regex } },
        { description: { $regex: regex } },
      ],
    });
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// GET Recipe by Slug
app.get("/recipes/:slug", async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ slug: req.params.slug });
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    res.json(recipe);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

// DELETE Recipe by Slug
app.delete("/recipes/:slug", async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findOneAndDelete({ slug: req.params.slug });
    if (!deletedRecipe) return res.status(404).json({ error: "Recipe not found" });
    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// REGISTER
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Serve static files
app.use(express.static("public"));

// Start server (for local dev)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
