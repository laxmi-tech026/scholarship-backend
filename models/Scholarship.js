const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
    name: String,
    email: String,
    course: String,
    income: Number,
    document: String, // filename of uploaded document
    status: {
        type: String,
        default: "pending"
    }
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);
