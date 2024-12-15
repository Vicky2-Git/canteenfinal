const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");

const Cashfree = require("./app/CashFree")

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Set up express-session for session management
app.use(
    session({
        secret: "your-secret-key", // Change this to a more secure key
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // For local testing, set secure to false. For production, set to true (with HTTPS).
    })
);

// MongoDB connection
mongoose
    .connect("mongodb://localhost:27017/canteen", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error:", err));

// User Schema with password hashing
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    Regno: String,
    password: String,
});

const User = mongoose.model("User", userSchema);

// Register route (no change)
app.post("/register", async (req, res) => {
    const { username, email, Regno, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,
        email,
        Regno,
        password: hashedPassword,
    });

    try {
        await newUser.save();
        res.json({ success: true });
    } catch (error) {
        res
            .status(400)
            .json({ success: false, message: "User registration failed" });
    }
});

// Login route with session handling
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && (await bcrypt.compare(password, user.password))) {
            req.session.username = user.username; // Store username in session
            res.json({ success: true, message: "Login successful" });
        } else {
            res.json({ success: false, message: "Invalid username or password" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred" });
    }
});

// Fetch menu items from MongoDB (no change)
app.get("/menu", async (req, res) => {
    try {
        const menuItems = await mongoose.connection.db
            .collection("menus")
            .find()
            .toArray();
        res.json(menuItems);
    } catch (error) {
        res.status(500).send("Error fetching menu");
    }
});

// Admin Schema and login
const aduserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
});

const UserLogin = mongoose.model("adminlogin", aduserSchema);

// Register an admin user with hashed password
app.post("/admin/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserLogin({
            username,
            password: hashedPassword,
        });
        await newUser.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error registering user" });
    }
});

// Admin login route with password hashing
app.post("/admin/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await UserLogin.findOne({ username });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                req.session.admin = user.username; // Store username in session
                res.json({ success: true });
            } else {
                res.json({ success: false, message: "Invalid username or password" });
            }
        } else {
            res.json({ success: false, message: "Invalid username or password" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred" });
    }
});

const menuSchema = new mongoose.Schema({
    menu_id: { type: Number, unique: true, required: true },
    item_name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    type: { type: String, required: true },
    timelimit: { type: Number, default: 0 },
    imageurl: { type: String, required: true },
    last_update: { type: Date, default: Date.now }, // Adding last_update to track the last update time
});

const Menu = mongoose.model("menus", menuSchema);

// Route to add menu item
app.post("/add-menu-item", async (req, res) => {
    const newMenuItem = new Menu({
        ...req.body,
        last_update: new Date(), // Set the current time as last_update
    });

    try {
        await newMenuItem.save();
        res.json(newMenuItem);
    } catch (err) {
        res.status(400).json({ error: "Error adding menu item: " + err });
    }
});

// Update menu item
app.put("/update-menu-item/:id", async (req, res) => {
    try {
        // Update the menu item and set last_update to the current time
        const updatedItem = await Menu.findByIdAndUpdate(
            req.params.id,
            { ...req.body, last_update: new Date() }, // Update last_update
            { new: true }
        );
        res.json(updatedItem);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Password Change Route
app.post("/change-password", async (req, res) => {
    const { username, newPassword } = req.body;

    // Validate the input data
    if (!username || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Username and new password are required.",
        });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: "Password changed successfully!" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while changing the password.",
        });
    }
});

const orderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true, required: true }, // Unique order ID
    username: { type: String, required: true },
    items: [
        {
            item_name: String,
            quantity: Number,
            price: Number,
        },
    ],
    totalAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// Endpoint to place an order
app.post("/place-order", async (req, res) => {
    const { username, items, totalAmount } = req.body;

    try {
        // Check stock availability
        for (const itemName in items) {
            const menuItem = await Menu.findOne({ item_name: itemName });
            if (!menuItem || menuItem.stock < items[itemName].quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${itemName}`,
                });
            }
        }

        // Reduce stock and save order
        for (const itemName in items) {
            const quantityToReduce = items[itemName].quantity;
            await Menu.updateOne(
                { item_name: itemName },
                { $inc: { stock: -quantityToReduce } }
            );
        }
        // Save order details with a unique order ID
        const newOrder = new Order({
            orderId: generateOrderId(),
            username,
            items: Object.keys(items).map((key) => ({
                item_name: key,
                quantity: items[key].quantity,
                price: items[key].price,
            })),
            totalAmount,
        });

        await newOrder.save();

        res.json({
            success: true,
            message: "Order placed successfully!",
            orderId: newOrder.orderId,
        });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to place order. Please try again.",
        });
    }
});
app.get("/paymentStatus/:oid", async (req, res) => {
    const orderId = req.params.oid;
    if (orderId == null) {
        res.json({ error: { name: "BadRequest", message: "oid required" } })
        return
    }
    const result = await Cashfree.getStatus(orderId);
    res.json(result)
})

function generateOrderId() {
    const timestamp = Date.now(); // Current timestamp
    const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    return `ORD-${randomNum}`; // Example: ORD-1673829384737-1234
}

app.use(express.static("public"));

// API to get all orders
app.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).send("Error retrieving orders");
    }
});


app.post("/createOrder", async (req, res) => {
    try {
        if (req.body.amount == null) {
            res.status(400).json({ error: { name: "BadRequest", message: "amount required" } })
            return
        }
        if (req.body.cid == null) {
            res.status(400).json({ error: { name: "BadRequest", message: "cid required" } })
            return
        }
        if (req.body.cphone == null) {
            res.status(400).json({ error: { name: "BadRequest", message: "cphone required" } })
            return
        }
        const { status, error } = await Cashfree.createOrder(req.body.amount, req.body.cid, req.body.cphone)
        if (error) {
            res.status(500).json({ error })
            return
        }
        res.json({ order: status })
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving orders");
    }
})