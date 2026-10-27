import Room from '../models/Room.js';
import User from '../models/User.js';
import Campus from '../models/Campus.js';

/**
 * @desc    Get rooms (Admin/Manager/Warden get all rooms; Student gets available rooms)
 * @route   GET /api/rooms
 * @access  Protected
 */
export const getRooms = async (req, res, next) => {
  try {
    const filter = {};
    const { campus, block, status } = req.query;

    // Scope to warden's campus if warden
    if (req.user.role === 'warden' && req.user.campus) {
      filter.campus = req.user.campus;
    } else if (campus) {
      filter.campus = campus;
    }

    if (block) {
      filter.block = block;
    }

    if (status) {
      filter.status = status;
    }

    // Students only see available rooms
    if (req.user.role === 'student') {
      filter.status = 'available';
      if (req.user.campus) {
        filter.campus = req.user.campus;
      }
    }

    const rooms = await Room.find(filter)
      .populate('residents', 'name email rollNumber contactNumber avatar totalFee paidFee feeStatus')
      .populate('campus', 'name address')
      .sort({ block: 1, floor: 1, roomNumber: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new room
 * @route   POST /api/rooms
 * @access  Protected (manager, warden, admin)
 */
export const createRoom = async (req, res, next) => {
  try {
    let { roomNumber, block, floor, capacity, campus } = req.body;

    if (!roomNumber || !block || floor === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomNumber, block, and floor.',
      });
    }

    // Determine campus
    let campusId = campus || (req.user.campus ? req.user.campus : null);
    if (!campusId) {
      const defaultCampus = await Campus.findOne();
      if (defaultCampus) {
        campusId = defaultCampus._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'No campus found. Please create a campus first.',
        });
      }
    }

    const normalizedRoomNumber = roomNumber.toUpperCase().trim();

    // Check if room number already exists in this campus
    const existingRoom = await Room.findOne({
      campus: campusId,
      roomNumber: normalizedRoomNumber,
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room ${normalizedRoomNumber} already exists in this campus.`,
      });
    }

    const room = await Room.create({
      roomNumber: normalizedRoomNumber,
      campus: campusId,
      block,
      floor: Number(floor),
      capacity: Number(capacity) || 2,
    });

    const populatedRoom = await Room.findById(room._id).populate('campus', 'name');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: populatedRoom,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign a student to a room
 * @route   PUT /api/rooms/:id/assign
 * @access  Protected (manager, warden, admin)
 */
export const assignStudentToRoom = async (req, res, next) => {
  try {
    const { studentId, rollNumber } = req.body;
    const { id: roomId } = req.params;

    if (!studentId && !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either studentId or rollNumber to assign.',
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    if (room.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign student: Room is under maintenance.',
      });
    }

    if (room.currentOccupancy >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign student: Room has reached maximum capacity.',
      });
    }

    let student = null;
    if (studentId) {
      student = await User.findById(studentId);
    } else if (rollNumber) {
      student = await User.findOne({
        rollNumber: rollNumber.toUpperCase().trim(),
        role: 'student',
      });
    }

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // Check if student is already assigned to this room
    if (room.residents.map((r) => r.toString()).includes(student._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'Student is already assigned to this room.',
      });
    }

    // If student was assigned to another room, unassign from that room first
    if (student.room && student.room.toString() !== roomId) {
      await Room.findByIdAndUpdate(student.room, {
        $pull: { residents: student._id },
        $inc: { currentOccupancy: -1 },
        $set: { status: 'available' },
      });
    }

    // Add student to current room
    room.residents.push(student._id);
    room.currentOccupancy = room.residents.length;
    room.status = room.currentOccupancy >= room.capacity ? 'full' : 'available';
    await room.save();

    // Link room and campus to student
    student.room = room._id;
    if (!student.campus) {
      student.campus = room.campus;
    }
    await student.save();

    const updatedRoom = await Room.findById(roomId)
      .populate('residents', 'name email rollNumber contactNumber avatar totalFee paidFee feeStatus')
      .populate('campus', 'name');

    res.status(200).json({
      success: true,
      message: `Student ${student.name} assigned to room ${room.roomNumber} successfully`,
      room: updatedRoom,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unassign a student from a room
 * @route   PUT /api/rooms/:id/unassign
 * @access  Protected (manager, warden, admin)
 */
export const unassignStudentFromRoom = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const { id: roomId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId to unassign.',
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // Filter out resident
    room.residents = room.residents.filter(
      (residentId) => residentId.toString() !== studentId
    );
    room.currentOccupancy = room.residents.length;
    if (room.status !== 'maintenance') {
      room.status = room.currentOccupancy >= room.capacity ? 'full' : 'available';
    }
    await room.save();

    // Unlink room from student
    await User.findByIdAndUpdate(studentId, { room: null });

    const updatedRoom = await Room.findById(roomId)
      .populate('residents', 'name email rollNumber contactNumber avatar totalFee paidFee feeStatus')
      .populate('campus', 'name');

    res.status(200).json({
      success: true,
      message: 'Student unassigned successfully',
      room: updatedRoom,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current student's room details and roommates
 * @route   GET /api/rooms/my-room
 * @access  Protected
 */
export const getMyRoom = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.room) {
      return res.status(200).json({
        success: true,
        assigned: false,
        message: 'You have not been assigned to a hostel room yet.',
        room: null,
        roommates: [],
      });
    }

    const room = await Room.findById(user.room)
      .populate('residents', 'name email rollNumber contactNumber avatar')
      .populate('campus', 'name address blocks');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Assigned room not found in database records.',
      });
    }

    // Roommates excluding current user
    const roommates = room.residents.filter(
      (resident) => resident._id.toString() !== req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      assigned: true,
      room,
      roommates,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getRooms,
  createRoom,
  assignStudentToRoom,
  unassignStudentFromRoom,
  getMyRoom,
};
