const mongoose = require('mongoose')
const s = new mongoose.Schema({
  title:       { type: String, required: true },
  subject:     { type: String, default: '' },
  branch:      { type: String, default: '' },
  semester:    { type: Number, default: 4 },
  isImportant: { type: Boolean, default: false },
  fileUrl:     { type: String, required: true },
  views:       { type: Number, default: 0 },
}, { timestamps: true })
module.exports = mongoose.model('Ebook', s)
