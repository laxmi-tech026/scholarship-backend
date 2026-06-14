const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    course: String,
    income: Number,
    document: String,
    status: { type: String, default: "pending" }
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);