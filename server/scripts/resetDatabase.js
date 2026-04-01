require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const readline = require('readline')
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

async function reset() {
  rl.question('\n⚠️  This will DELETE all listings, messages, and conversations.\nUsers will NOT be affected.\n\nType "yes" to confirm: ', async (answer) => {
    rl.close()
    if (answer.trim().toLowerCase() !== 'yes') {
      console.log('❌ Cancelled.')
      process.exit(0)
    }

    try {
      console.log('\n🔌 Connecting to MongoDB...')
      await mongoose.connect(process.env.MONGO_URI)
      console.log('✅ Connected\n')

      const Listing = require('../models/Listing')
      const Message = require('../models/Message')
      const Conversation = require('../models/Conversation')
      const User = require('../models/User')

      const [listings, messages, conversations] = await Promise.all([
        Listing.deleteMany({}),
        Message.deleteMany({}),
        Conversation.deleteMany({}),
      ])

      // Clear savedListings from all users
      await User.updateMany({}, { $set: { savedListings: [] } })

      console.log(`🗑️  Deleted ${listings.deletedCount} listings`)
      console.log(`🗑️  Deleted ${messages.deletedCount} messages`)
      console.log(`🗑️  Deleted ${conversations.deletedCount} conversations`)
      console.log(`🧹 Cleared savedListings from all users`)
      console.log('\n✅ Database reset complete. Users are intact.')
    } catch (err) {
      console.error('❌ Error:', err.message)
    } finally {
      await mongoose.disconnect()
      process.exit(0)
    }
  })
}

reset()
