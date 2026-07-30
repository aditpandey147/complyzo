// routes/admin.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Website = require('../models/Website');
const Payment = require('../models/Payment');
const Plan = require('../models/Plan');

// ==================== STATS ====================

// Get Dashboard Stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalWebsites = await Website.countDocuments();
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: thisMonth },
      role: 'user'
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: sevenDaysAgo },
      role: 'user'
    });

    res.json({
      totalUsers,
      totalAdmins,
      totalWebsites,
      totalScans: 0,
      newUsersThisMonth,
      activeUsers,
      scansToday: 0
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== USER MANAGEMENT ====================

// Get All Users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const usersWithStats = await Promise.all(users.map(async (user) => {
      const websiteCount = await Website.countDocuments({ userId: user._id });
      return {
        ...user.toObject(),
        websiteCount,
        scanCount: 0,
        lastScanAt: null
      };
    }));

    const total = await User.countDocuments(query);

    res.json({
      users: usersWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Single User Details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const websites = await Website.find({ userId: user._id });

    res.json({ user, websites, scans: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update User
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, planId, isActive, role } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (planId) updateData.planId = planId;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete User
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await Payment.deleteMany({ userId: user._id });
    await Website.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    res.json({ 
      message: 'User and all associated data deleted'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle User Active Status
router.patch('/users/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create User (Admin)
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { name, email, password, planId, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      planId: planId || 1,
      planName: 'Free',
      role: role || 'user',
      isActive: true
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        planId: user.planId
      }
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PAYMENT MANAGEMENT (ADD THIS) ====================

// Get all payments
router.get('/payments', adminAuth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 payments for performance
    
    res.json(payments);
  } catch (error) {
    console.error('Admin payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment by ID
router.get('/payments/:id', adminAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Admin payment detail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payments by email
router.get('/payments/email/:email', adminAuth, async (req, res) => {
  try {
    const { email } = req.params;
    const payments = await Payment.find({ 
      buyerEmail: { $regex: email, $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Admin payment email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PLAN MANAGEMENT (ADD THIS) ====================

// Get all plans
router.get('/plans', adminAuth, async (req, res) => {
  try {
    const plans = await Plan.find().sort({ planId: 1 });
    res.json(plans);
  } catch (error) {
    console.error('Admin plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create plan
router.post('/plans', adminAuth, async (req, res) => {
  try {
    const { name, slug, planId, jvzoo_id, launchpad_id, validity_days, status, order } = req.body;
    
    // Check if plan already exists
    const existingPlan = await Plan.findOne({ $or: [{ name }, { slug }] });
    if (existingPlan) {
      return res.status(400).json({ message: 'Plan with this name or slug already exists' });
    }

    const plan = new Plan({
      name,
      slug: slug || name.toLowerCase().replace(/\s/g, '-'),
      planId: planId || undefined,
      jvzoo_id: jvzoo_id || '',
      launchpad_id: launchpad_id || '',
      validity_days: validity_days || 365,
      status: status || 'active',
      order: order || 0
    });

    await plan.save();
    res.status(201).json({ message: 'Plan created successfully', plan });
  } catch (error) {
    console.error('Admin create plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update plan
router.put('/plans/:id', adminAuth, async (req, res) => {
  try {
    const { name, slug, planId, jvzoo_id, launchpad_id, validity_days, status, order } = req.body;
    
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug: slug || name.toLowerCase().replace(/\s/g, '-'),
        planId,
        jvzoo_id,
        launchpad_id,
        validity_days,
        status,
        order,
        updated_at: Date.now()
      },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({ message: 'Plan updated successfully', plan });
  } catch (error) {
    console.error('Admin update plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete plan
router.delete('/plans/:id', adminAuth, async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Admin delete plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
