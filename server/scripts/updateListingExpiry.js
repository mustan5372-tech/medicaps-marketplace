const mongoose = require('mongoose')
const Listing = require('../models/Listing')
require('dotenv').config()

const updateListingExpiry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const now = new Date()
    const fifteenDaysFromNow = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Update all active listings
    const result = await Listing.updateMany(
      { status: { $ne: 'deleted' }, isActive: true },
      {
        $set: {
          expiresAt: fifteenDaysFromNow,
          boostExpiresAt: thirtyDaysFromNow
        }
      }
    )

    console.log(`✓ Updated ${result.modifiedCount} listings`)
    console.log(`  - All listings now expire in 15 days (${fifteenDaysFromNow.toISOString()})`)
    console.log(`  - Boosted listings expire in 30 days (${thirtyDaysFromNow.toISOString()})`)
    
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

updateListingExpiry()
