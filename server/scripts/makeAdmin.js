require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const email = process.argv[2]
if (!email) { console.log('Usage: node scripts/makeAdmin.js your@email.com'); process.exit(1) }

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('../models/User')
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true })
  if (!user) { console.log('User not found:', email); process.exit(1) }
  console.log(`✅ ${user.name} (${user.email}) is now an admin`)
  process.exit(0)
}).catch(e => { console.log(e.message); process.exit(1) })
