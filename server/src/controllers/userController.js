import User from '../models/User.js';
import Room from '../models/Room.js';
import Campus from '../models/Campus.js';

/**
 * @desc    Create a staff member (Warden or Accountant)
 * @route   POST /api/users/staff
 * @access  Protected (manager, admin)
 */
export const createStaff = async (req, res, next) => {
  try {
    const { name, email, password, role, campus, contactNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role (warden or accountant).',
      });
    }

    const normalizedRole = role.toLowerCase().trim();
    if (normalizedRole !== 'warden' && normalizedRole !== 'accountant') {
      return res.status(400).json({
        success: false,
        message: "Staff role must be either 'warden' or 'accountant'.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email '${normalizedEmail}' already exists.`,
      });
    }

    let campusId = null;
    if (campus) {
      const foundCampus = await Campus.findById(campus);
      if (foundCampus) {
        campusId = foundCampus._id;
      }
    }

    const staff = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: normalizedRole,
      campus: campusId,
      contactNumber: contactNumber ? contactNumber.trim() : undefined,
    });

    // If role is warden and a campus was assigned, link warden to campus
    if (normalizedRole === 'warden' && campusId) {
      await Campus.findByIdAndUpdate(campusId, { warden: staff._id });
    }

    const populatedStaff = await User.findById(staff._id)
      .select('-password')
      .populate('campus', 'name address');

    res.status(201).json({
      success: true,
      message: `${normalizedRole.toUpperCase()} account created successfully.`,
      staff: populatedStaff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove/Delete a staff member (Warden or Accountant)
 * @route   DELETE /api/users/staff/:id
 * @access  Protected (manager, admin)
 */
export const removeStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own active manager account.',
      });
    }

    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found.',
      });
    }

    if (staff.role !== 'warden' && staff.role !== 'accountant') {
      return res.status(400).json({
        success: false,
        message: 'Only Warden or Accountant accounts can be removed through this endpoint.',
      });
    }

    // If warden is linked to any campus, unassign warden
    await Campus.updateMany({ warden: id }, { $set: { warden: null } });

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `${staff.role.toUpperCase()} ${staff.name} (${staff.email}) was removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all staff members (Wardens, Accountants, Managers)
 * @route   GET /api/users/staff
 * @access  Protected (manager, warden, admin)
 */
export const getStaffList = async (req, res, next) => {
  try {
    const staff = await User.find({
      role: { $in: ['warden', 'accountant', 'manager'] },
    })
      .select('-password')
      .populate('campus', 'name address blocks')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new student (Manager & Warden hierarchy)
 * @route   POST /api/users/student
 * @access  Protected (manager, warden, admin)
 */
export const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      rollNumber,
      password,
      campus,
      room,
      contactNumber,
      totalFee,
    } = req.body;

    if (!name || !email || !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and roll number are required for student admission.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRollNumber = rollNumber.toUpperCase().trim();

    // Check if duplicate student exists
    const duplicate = await User.findOne({
      $or: [{ email: normalizedEmail }, { rollNumber: normalizedRollNumber }],
    });

    if (duplicate) {
      const isEmail = duplicate.email === normalizedEmail;
      return res.status(400).json({
        success: false,
        message: isEmail
          ? `A student with email '${normalizedEmail}' already exists.`
          : `A student with roll number '${normalizedRollNumber}' already exists.`,
      });
    }

    // Determine campus based on role
    let targetCampusId = campus;
    if (req.user.role === 'warden') {
      // Warden must register student to warden's assigned campus
      targetCampusId = req.user.campus?._id || req.user.campus;
      if (!targetCampusId) {
        return res.status(400).json({
          success: false,
          message: 'Warden has no campus assigned. Contact manager to link a campus.',
        });
      }
    }

    // If room is provided, validate capacity
    let roomDoc = null;
    if (room) {
      roomDoc = await Room.findById(room);
      if (!roomDoc) {
        return res.status(404).json({
          success: false,
          message: 'Specified room was not found.',
        });
      }

      if (roomDoc.status === 'maintenance') {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign student to a room under maintenance.',
        });
      }

      if (roomDoc.currentOccupancy >= roomDoc.capacity) {
        return res.status(400).json({
          success: false,
          message: `Room ${roomDoc.roomNumber} has reached its full capacity of ${roomDoc.capacity}.`,
        });
      }

      if (!targetCampusId) {
        targetCampusId = roomDoc.campus;
      }
    }

    const student = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      rollNumber: normalizedRollNumber,
      password: password ? password.trim() : 'password123',
      role: 'student',
      campus: targetCampusId || null,
      room: roomDoc ? roomDoc._id : null,
      contactNumber: contactNumber ? contactNumber.trim() : undefined,
      totalFee: Number(totalFee) || 60000,
      paidFee: 0,
      feeStatus: 'Pending',
    });

    // If room was assigned, add to residents and sync occupancy
    if (roomDoc) {
      roomDoc.residents.push(student._id);
      roomDoc.currentOccupancy = roomDoc.residents.length;
      roomDoc.status = roomDoc.currentOccupancy >= roomDoc.capacity ? 'full' : 'available';
      await roomDoc.save();
    }

    const populatedStudent = await User.findById(student._id)
      .select('-password')
      .populate('campus', 'name address')
      .populate('room', 'roomNumber block floor');

    res.status(201).json({
      success: true,
      message: `Student ${student.name} (${student.rollNumber}) admitted successfully.`,
      student: populatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a student account (Manager only)
 * @route   DELETE /api/users/student/:id
 * @access  Protected (manager, admin)
 */
export const removeStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({ _id: id, role: 'student' });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // If student was assigned to a room, unassign and decrease occupancy
    if (student.room) {
      await Room.findByIdAndUpdate(student.room, {
        $pull: { residents: student._id },
        $inc: { currentOccupancy: -1 },
        $set: { status: 'available' },
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Student ${student.name} (${student.rollNumber}) was removed from the system.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reassign / Alter room for a student
 * @route   PATCH /api/rooms/reassign OR PATCH /api/users/student/:id/room
 * @access  Protected (manager, warden, admin)
 */
export const reassignStudentRoom = async (req, res, next) => {
  try {
    const studentId = req.params.id || req.body.studentId;
    const { newRoomId, rollNumber } = req.body;

    let student = null;
    if (studentId) {
      student = await User.findOne({ _id: studentId, role: 'student' });
    } else if (rollNumber) {
      student = await User.findOne({
        rollNumber: rollNumber.toUpperCase().trim(),
        role: 'student',
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // If Warden is calling, ensure student belongs to or is being moved within Warden's campus
    if (req.user.role === 'warden' && req.user.campus) {
      const wardenCampusId = req.user.campus?._id || req.user.campus;
      if (student.campus && student.campus.toString() !== wardenCampusId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Wardens can only alter room allotments within their own campus.',
        });
      }
    }

    const previousRoomId = student.room;

    // 1. Unassign from previous room if any
    if (previousRoomId) {
      await Room.findByIdAndUpdate(previousRoomId, {
        $pull: { residents: student._id },
        $inc: { currentOccupancy: -1 },
        $set: { status: 'available' },
      });
    }

    // 2. Assign to new room if requested and not checking out
    if (newRoomId && newRoomId !== 'checkout' && newRoomId !== 'none') {
      const targetRoom = await Room.findById(newRoomId);
      if (!targetRoom) {
        return res.status(404).json({
          success: false,
          message: 'Target room not found.',
        });
      }

      if (targetRoom.status === 'maintenance') {
        return res.status(400).json({
          success: false,
          message: 'Cannot reassign student: Target room is under maintenance.',
        });
      }

      if (targetRoom.currentOccupancy >= targetRoom.capacity) {
        return res.status(400).json({
          success: false,
          message: `Target room ${targetRoom.roomNumber} is already at full capacity (${targetRoom.capacity} beds).`,
        });
      }

      targetRoom.residents.push(student._id);
      targetRoom.currentOccupancy = targetRoom.residents.length;
      targetRoom.status = targetRoom.currentOccupancy >= targetRoom.capacity ? 'full' : 'available';
      await targetRoom.save();

      student.room = targetRoom._id;
      student.campus = targetRoom.campus;
      await student.save();
    } else {
      // Check-out / unassign
      student.room = null;
      await student.save();
    }

    const updatedStudent = await User.findById(student._id)
      .select('-password')
      .populate('room', 'roomNumber block floor capacity currentOccupancy')
      .populate('campus', 'name address');

    res.status(200).json({
      success: true,
      message:
        newRoomId && newRoomId !== 'checkout' && newRoomId !== 'none'
          ? `Student ${student.name} reallocated to Room ${updatedStudent.room?.roomNumber} successfully.`
          : `Student ${student.name} checked out from room successfully.`,
      student: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createStaff,
  removeStaff,
  getStaffList,
  createStudent,
  removeStudent,
  reassignStudentRoom,
};
