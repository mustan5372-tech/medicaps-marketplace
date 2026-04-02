require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4'])

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Listing = require('../models/Listing')
  const result = await Listing.deleteMany({ title: { $regex: 'ghoda', $options: 'i' } })
  console.log('Deleted:', result.deletedCount, 'listing(s)')
  process.exit(0)
}).catch(e => { console.log(e.message); process.exit(1) })
