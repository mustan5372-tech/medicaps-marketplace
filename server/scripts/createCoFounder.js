require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const EMAIL = 'purandarydv23@gmail.com'
const NAME = 'Purandar Yadav'
const PASSWORD = 'py@230906'

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('../models/User')

  const existing = await User.findOne({ email: EMAIL })
  if (existing) {
    console.log(`⚠️  User already exists: ${existing.name} (${existing.email}) — role: ${existing.role}`)
    process.exit(0)
  }

  const hashed = await bcrypt.hash(PASSWORD, 12)
  const user = await User.create({
    name: NAME,
    email: EMAIL,
    password: hashed,
    role: 'admin',
    isVerified: true,
    banned: false,
  })

  console.log(`✅ Co-founder admin created: ${user.name} (${user.email})`)
  process.exit(0)
}).catch(e => { console.error('❌ Error:', e.message); process.exit(1) })
