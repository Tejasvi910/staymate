import Campus from '../models/Campus.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

/**
 * @desc    Get all campuses with operational & financial metrics
 * @route   GET /api/campuses
 * @access  Protected (manager, warden, accountant, admin)
 */
export const getCampuses = async (req, res, next) => {
  try {
    const campuses = await Campus.find().populate('warden', 'name email contactNumber avatar');

    // Aggregate statistics for each campus
    const campusesWithStats = await Promise.all(
      campuses.map(async (campus) => {
        const campusObj = campus.toObject();

        // Count rooms and occupancy
        const rooms = await Room.find({ campus: campus._id });
        const roomCount = rooms.length;
        const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
        const currentOccupancy = rooms.reduce((acc, r) => acc + (r.currentOccupancy || 0), 0);
        const occupancyRate = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

        // Financial collection for students in this campus
        const students = await User.find({ campus: campus._id, role: 'student' }).select('totalFee paidFee feeStatus');
        const totalFees = students.reduce((acc, s) => acc + (s.totalFee || 0), 0);
        const collectedFees = students.reduce((acc, s) => acc + (s.paidFee || 0), 0);
        const pendingFees = Math.max(0, totalFees - collectedFees);
        const collectionRate = totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0;

        // Pending complaints count
        const pendingComplaints = await Complaint.countDocuments({
          campus: campus._id,
          status: { $in: ['Pending', 'In Progress'] },
        });

        return {
          ...campusObj,
          stats: {
            totalRooms: roomCount || campus.totalRooms || 0,
            totalCapacity,
            currentOccupancy,
            occupancyRate,
            activeStaffCount: campus.activeStaff?.length || 0,
            totalStudents: students.length,
            totalFees,
            collectedFees,
            pendingFees,
            collectionRate,
            pendingComplaints,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: campusesWithStats.length,
      campuses: campusesWithStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single campus detail with rooms, staff roster, and students
 * @route   GET /api/campuses/:id
 * @access  Protected
 */
export const getCampusById = async (req, res, next) => {
  try {
    const campus = await Campus.findById(req.params.id).populate('warden', 'name email contactNumber avatar');

    if (!campus) {
      return res.status(404).json({
        success: false,
        message: 'Campus not found',
      });
    }

    const rooms = await Room.find({ campus: campus._id }).populate('residents', 'name email rollNumber contactNumber avatar totalFee paidFee feeStatus');
    const students = await User.find({ campus: campus._id, role: 'student' })
      .populate('room', 'roomNumber block')
      .sort({ name: 1 });
    const complaints = await Complaint.find({ campus: campus._id })
      .populate('student', 'name rollNumber room')
      .sort({ createdAt: -1 })
      .limit(20);

    const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const currentOccupancy = rooms.reduce((acc, r) => acc + (r.currentOccupancy || 0), 0);
    const totalFees = students.reduce((acc, s) => acc + (s.totalFee || 0), 0);
    const collectedFees = students.reduce((acc, s) => acc + (s.paidFee || 0), 0);

    res.status(200).json({
      success: true,
      campus: {
        ...campus.toObject(),
        rooms,
        students,
        complaints,
        stats: {
          totalRooms: rooms.length,
          totalCapacity,
          currentOccupancy,
          occupancyRate: totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0,
          activeStaffCount: campus.activeStaff?.length || 0,
          totalStudents: students.length,
          totalFees,
          collectedFees,
          pendingFees: Math.max(0, totalFees - collectedFees),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new campus
 * @route   POST /api/campuses
 * @access  Protected (manager, admin)
 */
export const createCampus = async (req, res, next) => {
  try {
    const { name, address, blocks, warden, activeStaff, totalRooms } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both campus name and address.',
      });
    }

    const existing = await Campus.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A campus with this name already exists.',
      });
    }

    const campus = await Campus.create({
      name: name.trim(),
      address: address.trim(),
      blocks: Array.isArray(blocks) ? blocks : (blocks ? blocks.split(',').map(b => b.trim()) : ['A-Wing', 'B-Wing']),
      warden: warden || null,
      activeStaff: activeStaff || [],
      totalRooms: Number(totalRooms) || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Campus created successfully',
      campus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update campus info
 * @route   PUT /api/campuses/:id
 * @access  Protected (manager, warden, admin)
 */
export const updateCampus = async (req, res, next) => {
  try {
    const campus = await Campus.findById(req.params.id);

    if (!campus) {
      return res.status(404).json({
        success: false,
        message: 'Campus not found',
      });
    }

    const { name, address, blocks, warden, totalRooms } = req.body;
    if (name) campus.name = name.trim();
    if (address) campus.address = address.trim();
    if (blocks) campus.blocks = Array.isArray(blocks) ? blocks : blocks.split(',').map(b => b.trim());
    if (warden !== undefined) campus.warden = warden;
    if (totalRooms !== undefined) campus.totalRooms = Number(totalRooms);

    await campus.save();

    res.status(200).json({
      success: true,
      message: 'Campus updated successfully',
      campus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add active staff member to campus roster
 * @route   POST /api/campuses/:id/staff
 * @access  Protected (manager, warden, admin)
 */
export const addStaffToCampus = async (req, res, next) => {
  try {
    const { name, designation, shift, contact } = req.body;

    if (!name || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide staff name and designation.',
      });
    }

    const campus = await Campus.findById(req.params.id);
    if (!campus) {
      return res.status(404).json({
        success: false,
        message: 'Campus not found',
      });
    }

    campus.activeStaff.push({
      name: name.trim(),
      designation: designation.trim(),
      shift: shift || 'Day (2 PM - 10 PM)',
      contact: contact ? contact.trim() : '',
    });

    await campus.save();

    res.status(201).json({
      success: true,
      message: 'Staff member added to campus roster',
      activeStaff: campus.activeStaff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove staff member from campus roster
 * @route   DELETE /api/campuses/:id/staff/:staffId
 * @access  Protected (manager, warden, admin)
 */
export const removeStaffFromCampus = async (req, res, next) => {
  try {
    const campus = await Campus.findById(req.params.id);
    if (!campus) {
      return res.status(404).json({
        success: false,
        message: 'Campus not found',
      });
    }

    campus.activeStaff = campus.activeStaff.filter(
      (s) => s._id.toString() !== req.params.staffId
    );

    await campus.save();

    res.status(200).json({
      success: true,
      message: 'Staff member removed from roster',
      activeStaff: campus.activeStaff,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCampuses,
  getCampusById,
  createCampus,
  updateCampus,
  addStaffToCampus,
  removeStaffFromCampus,
};
