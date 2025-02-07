const Membership = require('../models/Membership');


exports.getMembershipStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const membership = await Membership.findOne({ userId });

    if (!membership) {
      return res.status(404).json({ hasMembership: false });
    }

    res.json({ hasMembership: true, membership });
  } catch (error) {
    console.error('Error fetching membership status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.createMembership = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const existingMembership = await Membership.findOne({ userId });

    if (existingMembership) {
      return res.status(400).json({ error: 'User already has a membership' });
    }

    const newMembership = new Membership({ userId });
    await newMembership.save();

    res.json({ message: 'Membership activated successfully!', membership: newMembership });
  } catch (error) {
    console.error('Error creating membership:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
