require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const email = process.argv[2]
const newPassword = process.argv[3]
if (!email || !newPassword) {
  console.log('Usage: node scripts/resetPassword.js email newpassword')
  process.exit(1)
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('../models/User')
  const user = await User.findOne({ email })
  if (!user) { console.log('User not found'); process.exit(1) }
  user.password = newPassword
  await user.save()
  console.log(`✅ Password reset for ${user.name} (${user.email})`)
  process.exit(0)
}).catch(e => { console.log(e.message); process.exit(1) })
