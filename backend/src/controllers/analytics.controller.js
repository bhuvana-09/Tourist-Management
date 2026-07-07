/**
 * Analytics Controller:
 * 
 * Architecture Choice:
 * All numeric computations, counts, and grouping aggregations are performed server-side
 * utilizing MongoDB Aggregation Pipelines ($match, $group, $lookup, $facet, etc.). 
 * Aggregating on the database level rather than pulling raw documents and computing values
 * in JavaScript is highly efficient, minimizing memory consumption and network payloads
 * as the dataset scales.
 * 
 * Unassigned Bucket Strategy:
 * Because Package.destinationId is an optional relation field in our system, bookings on 
 * unlinked packages are grouped into an "Unassigned" category via $ifNull logic. This ensures
 * overall booking counts and revenue sums remain correct and fully reconciled across all dashboard charts.
 */

const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

// Helper to construct query matching Date range on Booking.createdAt
const getMatchQuery = (from, to) => {
  const query = {};
  if (from || to) {
    query.createdAt = {};
    if (from) {
      query.createdAt.$gte = new Date(from);
    }
    if (to) {
      query.createdAt.$lte = new Date(to);
    }
  }
  return query;
};

// @desc    Get KPI metrics overview
// @route   GET /api/analytics/overview
// @access  Private (Admin Only)
const getOverview = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const matchQuery = getMatchQuery(from, to);

  const overview = await Booking.aggregate([
    { $match: matchQuery },
    {
      $facet: {
        totalBookings: [
          { $count: "count" }
        ],
        cancelledBookings: [
          { $match: { status: 'cancelled' } },
          { $count: "count" }
        ],
        paidStats: [
          { $match: { paymentStatus: 'paid' } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalPrice" },
              avgSpend: { $avg: "$totalPrice" }
            }
          }
        ]
      }
    }
  ]);

  const total = overview[0].totalBookings[0]?.count || 0;
  const cancelled = overview[0].cancelledBookings[0]?.count || 0;
  const revenue = overview[0].paidStats[0]?.totalRevenue || 0;
  const avgSpend = overview[0].paidStats[0]?.avgSpend || 0;
  const cancellationRate = total > 0 ? (cancelled / total) : 0;

  res.status(200).json({
    success: true,
    data: {
      totalBookings: total,
      totalRevenue: Math.round(revenue * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 1000) / 10, // e.g. 15.5%
      averageSpend: Math.round(avgSpend * 100) / 100
    }
  });
});

// @desc    Get revenue trend series
// @route   GET /api/analytics/revenue
// @access  Private (Admin Only)
const getRevenueTrend = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const matchQuery = getMatchQuery(from, to);

  // Grouping format based on date range diff
  let diffDays = 30;
  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    diffDays = Math.ceil(Math.abs(toDate - fromDate) / (1000 * 60 * 60 * 24));
  }

  let format = "%Y-%m-%d"; // Day format
  if (diffDays > 30 && diffDays <= 180) {
    format = "%Y-W%V"; // Week format
  } else if (diffDays > 180) {
    format = "%Y-%m"; // Month format
  }

  const trend = await Booking.aggregate([
    {
      $match: {
        ...matchQuery,
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format, date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const formatted = trend.map(t => ({
    period: t._id,
    revenue: Math.round(t.revenue * 100) / 100,
    bookingsCount: t.count
  }));

  res.status(200).json({
    success: true,
    data: formatted
  });
});

// @desc    Get bookings breakdown status
// @route   GET /api/analytics/bookings
// @access  Private (Admin Only)
const getBookingsBreakdown = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const matchQuery = getMatchQuery(from, to);

  const breakdown = await Booking.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  // Ensure all standard enum keys exist in return payload
  const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  const formatted = statuses.map(s => {
    const match = breakdown.find(b => b._id === s);
    return {
      status: s,
      count: match ? match.count : 0
    };
  });

  res.status(200).json({
    success: true,
    data: formatted
  });
});

// @desc    Get top destinations by revenue / booking volume
// @route   GET /api/analytics/destinations/top
// @access  Private (Admin Only)
const getTopDestinations = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const matchQuery = getMatchQuery(from, to);

  const topDestinations = await Booking.aggregate([
    { $match: matchQuery },
    // Lookup package details
    {
      $lookup: {
        from: 'packages',
        localField: 'packageId',
        foreignField: '_id',
        as: 'package'
      }
    },
    { $unwind: { path: '$package', preserveNullAndEmptyArrays: true } },
    // Lookup destination details
    {
      $lookup: {
        from: 'destinations',
        localField: 'package.destinationId',
        foreignField: '_id',
        as: 'destination'
      }
    },
    { $unwind: { path: '$destination', preserveNullAndEmptyArrays: true } },
    // Group and handle unassigned null packages
    {
      $group: {
        _id: { $ifNull: ['$destination._id', 'unassigned'] },
        name: { $ifNull: ['$destination.name', 'Unassigned'] },
        bookingsCount: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalPrice", 0] } }
      }
    },
    { $sort: { bookingsCount: -1 } },
    { $limit: 10 }
  ]);

  const formatted = topDestinations.map(d => ({
    id: d._id,
    name: d.name,
    bookingsCount: d.bookingsCount,
    revenue: Math.round(d.revenue * 100) / 100
  }));

  res.status(200).json({
    success: true,
    data: formatted
  });
});

// @desc    Get top users ranked by paid spend
// @route   GET /api/analytics/users/top
// @access  Private (Admin Only)
const getTopUsers = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const matchQuery = getMatchQuery(from, to);

  const topUsers = await Booking.aggregate([
    { $match: matchQuery },
    // Lookup user details
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    // Group by user
    {
      $group: {
        _id: '$userId',
        name: { $ifNull: ['$user.name', 'Guest / Seed Traveler'] },
        email: { $ifNull: ['$user.email', 'N/A'] },
        bookingsCount: { $sum: 1 },
        totalPaid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalPrice", 0] } }
      }
    },
    { $sort: { totalPaid: -1 } },
    { $limit: 10 }
  ]);

  const formatted = topUsers.map(u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    bookingsCount: u.bookingsCount,
    totalPaidSpend: Math.round(u.totalPaid * 100) / 100
  }));

  res.status(200).json({
    success: true,
    data: formatted
  });
});

// @desc    Get peak travel months across years
// @route   GET /api/analytics/peak-season
// @access  Private (Admin Only)
const getPeakSeason = asyncHandler(async (req, res) => {
  const peak = await Booking.aggregate([
    // Project and convert travelDate string to month index
    {
      $project: {
        dateObj: {
          $dateFromString: {
            dateString: "$date",
            onError: new Date("2000-01-01"),
            onNull: new Date("2000-01-01")
          }
        }
      }
    },
    {
      $group: {
        _id: { $month: "$dateObj" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Map month index numbers to label strings
  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const formatted = monthLabels.map((label, idx) => {
    const match = peak.find(p => p._id === idx + 1);
    return {
      month: label,
      bookingsCount: match ? match.count : 0
    };
  });

  res.status(200).json({
    success: true,
    data: formatted
  });
});

module.exports = {
  getOverview,
  getRevenueTrend,
  getBookingsBreakdown,
  getTopDestinations,
  getTopUsers,
  getPeakSeason
};
