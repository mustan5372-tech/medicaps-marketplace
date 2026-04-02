const router = require('express').Router()
const Listing = require('../models/Listing')

router.get('/monthly', async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const leaderboard = await Listing.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $ne: 'deleted' },
          isFlagged: { $ne: true },
        }
      },
      {
        $group: {
          _id: '$seller',
          listingCount: { $sum: 1 },
        }
      },
      { $sort: { listingCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          avatar: '$user.avatar',
          listingCount: 1,
        }
      }
    ])

    const month = now.toLocaleString('default', { month: 'long', year: 'numeric' })
    res.json({ leaderboard, month })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
