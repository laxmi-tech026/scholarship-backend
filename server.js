const auth = require('./middleware/auth');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('./models/User');
const Scholarship = require('./models/Scholarship');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// ── Multer Storage Config ──
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

mongoose.connect('mongodb+srv://Laxmi:Laxmipraja%402026@cluster0.uqthi3o.mongodb.net/?appName=Cluster0')
    .then(() => console.log('Mongodb connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Scholarship API running');
});

// ── REGISTER ──
// password min 6 chars, phone exactly 10 digits — validated here
app.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Validations
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        if (!phone || !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedpassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedpassword,
            phone,
            role: role === 'admin' ? 'admin' : 'user' // only allow admin if explicitly passed
        });
        await user.save();
        res.json({ message: "User Registered Successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── LOGIN ──
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.json({ message: "User not found" });

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) return res.json({ message: "Invalid password" });

        const token = jwt.sign({ id: user._id }, "secretkey");
        res.json({
            message: "Login Successfully",
            token,
            role: user.role  // send role to frontend
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── GET CURRENT USER (for profile page) ──
app.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── UPLOAD PROFILE PHOTO ──
app.post('/upload-photo', auth, upload.single('photo'), async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { photo: req.file.filename });
        res.json({ message: "Photo uploaded", filename: req.file.filename });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── APPLY (with document upload) ──
app.post('/apply', auth, upload.single('document'), async (req, res) => {
    try {
        const data = new Scholarship({
            name: req.body.name,
            email: req.user.email,
            course: req.body.course,
            income: req.body.income,
            document: req.file ? req.file.filename : null
        });
        await data.save();
        res.json({ message: "Application Submitted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── ADMIN: VIEW ALL APPLICATIONS ──
app.get('/application', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        const data = await Scholarship.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── ADMIN: APPROVE / REJECT ──
app.put('/update-status/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        await Scholarship.findByIdAndUpdate(req.params.id, { status: req.body.status });
        res.json({ message: "Status Updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── MY APPLICATION (student) ──
app.get('/my-application', auth, async (req, res) => {
    try {
        const data = await Scholarship.findOne({ email: req.user.email });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(5000, () => {
    console.log('server running on port 5000');
});
