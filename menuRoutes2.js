const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const router = express.Router();

// MongoDB Schema
const menuSchema = new mongoose.Schema({
  menu_id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  tot_quantity: { type: Number, required: true },
  quantity: { type: String, required: true },
  type: { type: String, required: true },
  rating: { type: Number, default: 0 },
  imageurl: { type: String }, // Base64 string for image storage
});

const Menu = mongoose.model("Menu", menuSchema);

// File Upload Setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST route to upload menu item
router.post("/add", upload.single("image"), async (req, res) => {
  const { menu_id, name, price, tot_quantity, quantity, type, rating } =
    req.body;

  try {
    const newMenuItem = new Menu({
      menu_id,
      name,
      price,
      tot_quantity,
      quantity,
      type,
      rating,
      image: req.file ? req.file.buffer.toString("base64") : null,
    });

    await newMenuItem.save();
    res.json({ success: true, message: "Menu item added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding menu item" });
  }
});

module.exports = router;
