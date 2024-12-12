const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// MongoDB Schema
const menuSchema = new mongoose.Schema({
  menu_id: { type: Number, unique: true, required: true },
  item_name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  type: { type: String, required: true },
  timelimit: { type: Number, default: 0 },
  imageurl: { type: String, required: true },
  // Removed image field
});

const Menu = mongoose.model("menu", menuSchema);

// POST route to upload menu item (without image)
router.post("/add", async (req, res) => {
  const { menu_id, item_name, price, stock, type, timelimit, imageurl } =
    req.body;

  try {
    const newMenuItem = new Menu({
      menu_id,
      item_name,
      price,
      stock,
      type,
      timelimit,
      imageurl,
      // Removed image assignment
    });

    await newMenuItem.save();
    res.json({ success: true, message: "Menu item added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding menu item" });
  }
});

module.exports = router;
