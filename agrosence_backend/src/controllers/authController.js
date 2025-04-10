const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
    try {
        const { name, mobile, email, password, confirmPassword, state, address, language } = req.body;

        // Validate language
        if (!["English", "Hindi", "Gujarati"].includes(language)) {
            return res.status(400).json({ message: "Invalid language selected" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, mobile, email, password: hashedPassword, state, address, language });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, "your_jwt_secret", { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token, userId: user._id });  
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password"); // ✅ Exclude passwords
        res.status(200).json({
            data: users.map(user => ({
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                state: user.state,
                address: user.address
            })),
            total: users.length
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


exports.deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await User.findByIdAndDelete(id);
  
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  exports.getUserProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            state: user.state,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
  