const multer = require('multer')
const path = require('path')

// Always use memory storage - we'll handle upload manually
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/i
  if (allowed.test(path.extname(file.originalname))) cb(null, true)
  else cb(new Error('Only images allowed'), false)
}

const listingUpload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter })
const avatarUpload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter })

// Upload to Cloudinary if configured, else return base64
async function uploadImage(buffer, mimetype, folder = 'listings') {
  const isConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'medicapsmart' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'placeholder'

  if (isConfigured) {
    const cloudinary = require('cloudinary').v2
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `medicaps/${folder}`, transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }] },
        (err, result) => err ? reject(err) : resolve(result.secure_url)
      )
      const { Readable } = require('stream')
      Readable.from(buffer).pipe(stream)
    })
  }

  // Fallback: base64 data URL (works without Cloudinary)
  return `data:${mimetype};base64,${buffer.toString('base64')}`
}

module.exports = { listingUpload, avatarUpload, uploadImage }
