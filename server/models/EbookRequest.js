const mongoose = require('mongoose')
const s = new mongoose.Schema({
  bookName:    { type: String, required: true },
  subject:     { type: String, required: true },
  branch:      { type: String, required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })
module.exports = mongoose.model('EbookRequest', s)
