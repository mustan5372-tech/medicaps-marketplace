const mongoose = require('mongoose')

const ebookSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  subject:     { type: String, required: true, trim: true },
  branch:      {
    type: String,
    required: true,
    enum: ['Computer Science', 'Mechanical', 'Electrical', 'Electronics', 'Automobile', 'Robotics', 'Civil', 'First Year'],
  },
  fileUrl:     { type: String, required: true },   // real URL — never sent to client
  coverUrl:    { type: String, default: '' },       // optional cover image
  isImportant: { type: Boolean, default: false },   // 🔥 MST important flag
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views:       { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Ebook', ebookSchema)
