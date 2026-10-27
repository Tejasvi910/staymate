import Complaint from '../models/Complaint.js';
import { analyzeComplaintAI } from '../services/aiService.js';

/**
 * @desc    File a new complaint with automatic AI urgency & categorization analysis
 * @route   POST /api/complaints
 * @access  Protected (Students)
 */
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category.',
      });
    }

    // Run AI analysis on the complaint description
    const aiResult = await analyzeComplaintAI(title, description);

    // If urgency score is high/critical, elevate priority if not explicitly specified
    let finalPriority = priority || 'Medium';
    if (!priority) {
      if (aiResult.urgencyScore >= 9) finalPriority = 'Urgent';
      else if (aiResult.urgencyScore >= 7) finalPriority = 'High';
      else if (aiResult.urgencyScore <= 3) finalPriority = 'Low';
    }

    const complaint = await Complaint.create({
      student: req.user._id,
      campus: req.user.campus || null,
      title,
      description,
      category,
      priority: finalPriority,
      aiAnalysis: {
        suggestedCategory: aiResult.suggestedCategory,
        urgencyScore: aiResult.urgencyScore,
        summary: aiResult.summary,
        actionRecommendation: aiResult.actionRecommendation,
      },
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('student', 'name email rollNumber room contactNumber')
      .populate('campus', 'name');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get complaints (Student gets their own; Manager/Warden/Admin get campus/all)
 * @route   GET /api/complaints
 * @access  Protected
 */
export const getComplaints = async (req, res, next) => {
  try {
    const query = {};

    // If role is student, only show complaints filed by this student
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'warden' && req.user.campus) {
      // Warden only views complaints of their assigned campus
      query.campus = req.user.campus;
    } else if (req.query.campus) {
      query.campus = req.query.campus;
    }

    // Filter parameters (status, category, priority)
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    const complaints = await Complaint.find(query)
      .populate({
        path: 'student',
        select: 'name email rollNumber contactNumber room avatar campus',
        populate: [
          { path: 'room', select: 'roomNumber block floor' },
          { path: 'campus', select: 'name' },
        ],
      })
      .populate('campus', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update complaint status and remarks
 * @route   PUT /api/complaints/:id/status
 * @access  Protected (manager, warden, admin)
 */
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    if (status) {
      const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed values: [${validStatuses.join(', ')}]`,
        });
      }
      complaint.status = status;

      if (status === 'Resolved') {
        complaint.resolvedAt = new Date();
      } else {
        complaint.resolvedAt = null;
      }
    }

    if (adminRemarks !== undefined) {
      complaint.adminRemarks = adminRemarks;
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(id)
      .populate({
        path: 'student',
        select: 'name email rollNumber contactNumber room avatar campus',
        populate: [
          { path: 'room', select: 'roomNumber block floor' },
          { path: 'campus', select: 'name' },
        ],
      })
      .populate('campus', 'name address');

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
};
