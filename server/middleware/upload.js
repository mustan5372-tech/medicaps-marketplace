const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const path = require('path')
const fs = require('fs')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const isCloudinaryConfigured = () =>
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'medicapsmart' &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'

const getStorage = (folder) => {
  if (isCloudinaryConfigured()) {
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `medicaps/${folder}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
      },
    })
  }
  // Local fallback
  const uploadDir = path.join(__dirname, `../uploads/${folder}`)
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
  })
}

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()))
}

module.exports = {
  listingUpload: multer({ storage: getStorage('listings'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }),
  avatarUpload: multer({ storage: getStorage('avatars'), limits: { fileSize: 2 * 1024 * 1024 }, fileFilter }),
  isCloudinaryConfigured,
}
