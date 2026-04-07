const mongoose = require('mongoose')
const User = require('../models/User')
require('dotenv').config()

const enableUnlimitedBoost = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const email = 'en24me3050010@medicaps.ac.in'
    const user = await User.findOneAndUpdate(
      { email },
      { unlimitedBoost: true },
      { new: true }
    )

    if (!user) {
      console.log(`User with email ${email} not found`)
      process.exit(1)
    }

    console.log(`✓ Unlimited boost enabled for ${user.name} (${user.email})`)
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

enableUnlimitedBoost()
