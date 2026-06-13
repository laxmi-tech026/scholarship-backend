const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    role: { type: String, default: 'user' }, // 'user' or 'admin'
    photo: String // filename of uploaded photo
});

module.exports = mongoose.model('User', userSchema);
