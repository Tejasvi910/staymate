import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user (Manager, Warden, Accountant, or Student)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      rollNumber,
      contactNumber,
      avatar,
      campus,
      totalFee,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Role mapping
    const validRoles = ['manager', 'warden', 'accountant', 'student', 'admin'];
    const assignedRole = validRoles.includes(role) ? role : 'student';

    // If role is student, rollNumber is required
    if (assignedRole === 'student' && !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Roll number is required for student registration.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole,
      campus: campus || null,
      rollNumber: assignedRole === 'student' ? rollNumber.toUpperCase().trim() : undefined,
      contactNumber: contactNumber ? contactNumber.trim() : undefined,
      avatar,
      totalFee: assignedRole === 'student' ? (Number(totalFee) || 60000) : 0,
      paidFee: 0,
      feeStatus: assignedRole === 'student' ? 'Pending' : 'Paid',
    });

    const token = generateToken(user._id);

    const populatedUser = await User.findById(user._id).populate('room').populate('campus', 'name address');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        campus: populatedUser.campus,
        rollNumber: populatedUser.rollNumber,
        room: populatedUser.room,
        contactNumber: populatedUser.contactNumber,
        avatar: populatedUser.avatar,
        totalFee: populatedUser.totalFee,
        paidFee: populatedUser.paidFee,
        feeStatus: populatedUser.feeStatus,
        createdAt: populatedUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { identifier, email, password } = req.body;
    const loginId = identifier || email;

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email or roll number, and password.',
      });
    }

    const trimmedId = loginId.trim();

    // Query by either email or rollNumber
    const user = await User.findOne({
      $or: [
        { email: trimmedId.toLowerCase() },
        { rollNumber: trimmedId.toUpperCase() },
        { rollNumber: trimmedId },
      ],
    })
      .populate('room')
      .populate('campus', 'name address blocks');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email or roll number and password.',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email or roll number and password.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        campus: user.campus,
        rollNumber: user.rollNumber,
        room: user.room,
        contactNumber: user.contactNumber,
        avatar: user.avatar,
        totalFee: user.totalFee,
        paidFee: user.paidFee,
        feeStatus: user.feeStatus,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile with populated room & campus
 * @route   GET /api/auth/me
 * @access  Protected
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('room')
      .populate('campus', 'name address blocks');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        campus: user.campus,
        rollNumber: user.rollNumber,
        room: user.room,
        contactNumber: user.contactNumber,
        avatar: user.avatar,
        totalFee: user.totalFee,
        paidFee: user.paidFee,
        feeStatus: user.feeStatus,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student list with filters (campus, search, unassigned, feeStatus)
 * @route   GET /api/auth/students
 * @access  Protected (manager, warden, accountant, admin)
 */
export const getStudents = async (req, res, next) => {
  try {
    const { search, unassigned, campus, feeStatus } = req.query;
    const query = { role: 'student' };

    // If warden is logged in, restrict to warden's campus
    if (req.user.role === 'warden' && req.user.campus) {
      query.campus = req.user.campus;
    } else if (campus) {
      query.campus = campus;
    }

    if (unassigned === 'true') {
      query.room = null;
    }

    if (feeStatus) {
      query.feeStatus = feeStatus;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(query)
      .select('name email rollNumber room campus contactNumber avatar totalFee paidFee feeStatus createdAt')
      .populate('room', 'roomNumber block floor')
      .populate('campus', 'name address')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student fee payment / fee structure
 * @route   PUT /api/auth/students/:id/fee
 * @access  Protected (manager, accountant, admin)
 */
export const updateStudentFee = async (req, res, next) => {
  try {
    const { paidAmount, totalFee } = req.body;

    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (totalFee !== undefined) {
      student.totalFee = Math.max(0, Number(totalFee));
    }

    if (paidAmount !== undefined) {
      // Add paidAmount to existing paidFee
      student.paidFee = Math.max(0, student.paidFee + Number(paidAmount));
    }

    // Determine status
    if (student.totalFee > 0) {
      if (student.paidFee >= student.totalFee) {
        student.feeStatus = 'Paid';
      } else if (student.paidFee > 0) {
        student.feeStatus = 'Partial';
      } else {
        student.feeStatus = 'Pending';
      }
    } else {
      student.feeStatus = 'Paid';
    }

    await student.save();

    const populatedStudent = await User.findById(student._id)
      .populate('room', 'roomNumber block')
      .populate('campus', 'name');

    res.status(200).json({
      success: true,
      message: 'Student fee updated successfully',
      student: populatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get staff members (for warden assignment dropdowns)
 * @route   GET /api/auth/staff
 * @access  Protected (manager, admin)
 */
export const getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({
      role: { $in: ['warden', 'accountant', 'manager'] },
    }).select('name email role contactNumber avatar campus');

    res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = login;

export default {
  register,
  login,
  loginUser,
  getMe,
  getStudents,
  updateStudentFee,
  getStaff,
};
