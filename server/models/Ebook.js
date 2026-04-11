const mongoose = require('mongoose')
const s = new mongoose.Schema({
  title:       { type: String, required: true },
  subject:     { type: String, default: '' },
  branch:      { type: String, default: '' },
  isImportant: { type: Boolean, default: false },
  pdfData:     { type: String, required: true },
  views:       { type: Number, default: 0 },
}, { timestamps: true })
module.exports = mongoose.model('Ebook', s)
