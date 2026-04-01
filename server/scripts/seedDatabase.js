require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4'])

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected\n')

    const Listing = require('../models/Listing')
    const User = require('../models/User')

    // Get first user to use as seller
    const seller = await User.findOne({})
    if (!seller) {
      console.log('❌ No users found. Register an account first, then run this script.')
      process.exit(1)
    }

    const sampleListings = [
      {
        title: 'Engineering Mathematics Textbook',
        description: 'R.K. Jain & S.R.K. Iyengar, 4th edition. Excellent condition, barely used. Perfect for 1st year students.',
        price: 250,
        category: 'Books',
        condition: 'Like New',
        location: 'Library',
        images: ['https://placehold.co/600x400/3b82f6/ffffff?text=Math+Book'],
        seller: seller._id,
        status: 'active',
        isActive: true,
      },
      {
        title: 'HP Laptop 15s - Core i5 11th Gen',
        description: '8GB RAM, 512GB SSD, Windows 11. Used for 1 year, no scratches. Charger included. Battery backup 4-5 hours.',
        price: 32000,
        category: 'Electronics',
        condition: 'Used',
        location: 'Boys Hostel',
        images: ['https://placehold.co/600x400/6366f1/ffffff?text=HP+Laptop'],
        seller: seller._id,
        status: 'active',
        isActive: true,
      },
      {
        title: 'Hero Cycle - Good Condition',
        description: 'Black Hero Sprint cycle. Used for 2 years. Tyres recently changed. Good for campus commute.',
        price: 1800,
        category: 'Vehicles',
        condition: 'Used',
        location: 'Sports Ground',
        images: ['https://placehold.co/600x400/10b981/ffffff?text=Cycle'],
        seller: seller._id,
        status: 'active',
        isActive: true,
      },
      {
        title: 'Study Table + Chair Set',
        description: 'Wooden study table (4x2 ft) with cushioned chair. Perfect for hostel room. Self-pickup only.',
        price: 1500,
        category: 'Furniture',
        condition: 'Used',
        location: 'Girls Hostel',
        images: ['https://placehold.co/600x400/f59e0b/ffffff?text=Study+Table'],
        seller: seller._id,
        status: 'active',
        isActive: true,
      },
      {
        title: 'JBL Bluetooth Speaker',
        description: 'JBL Go 3, waterproof, 5 hours battery. Bought 6 months ago. Works perfectly.',
        price: 1200,
        category: 'Electronics',
        condition: 'Like New',
        location: 'Main Block',
        images: ['https://placehold.co/600x400/8b5cf6/ffffff?text=JBL+Speaker'],
        seller: seller._id,
        status: 'active',
        isActive: true,
      },
    ]

    const inserted = await Listing.insertMany(sampleListings)
    console.log(`✅ Seeded ${inserted.length} sample listings`)
    console.log('🎉 Database seeded successfully!')
  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

seed()
