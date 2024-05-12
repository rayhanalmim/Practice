const mongoose = require("mongoose");
const practiceData = mongoose.model('practice', new mongoose.Schema({}, { strict: false }));
module.exports = practiceData;