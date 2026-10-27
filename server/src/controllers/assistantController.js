import { campusAssistantChat } from '../services/aiService.js';
import Complaint from '../models/Complaint.js';
import MessMenu from '../models/MessMenu.js';
import Room from '../models/Room.js';

/**
 * @desc    Chat with StayMate AI Campus Assistant
 * @route   POST /api/assistant/chat
 * @access  Protected
 */
export const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message for the assistant.',
      });
    }

    // Determine current day of week
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const todayName = days[new Date().getDay()];

    // Fetch student's assigned room info if available
    let roomInfo = 'Not assigned yet';
    if (req.user.room) {
      const room = await Room.findById(req.user.room);
      if (room) {
        roomInfo = `Room ${room.roomNumber} (${room.block}, Floor ${room.floor})`;
      }
    }

    // Fetch student's active open complaints
    const activeComplaints = await Complaint.find({
      student: req.user._id,
      status: { $ne: 'Resolved' },
    })
      .select('title category priority status createdAt')
      .limit(3);

    // Fetch today's mess menu
    const todayMenu = await MessMenu.find({ dayOfWeek: todayName }).select(
      'mealType items timings'
    );

    const contextData = {
      studentName: req.user.name,
      rollNumber: req.user.rollNumber,
      roomNumber: roomInfo,
      activeComplaints: activeComplaints.map((c) => ({
        title: c.title,
        category: c.category,
        priority: c.priority,
        status: c.status,
      })),
      todayMenu: todayMenu.map((m) => ({
        mealType: m.mealType,
        items: m.items,
        timings: m.timings,
      })),
    };

    // Invoke Gemini AI Assistant
    const result = await campusAssistantChat(message, history || [], contextData);

    res.status(200).json({
      success: true,
      reply: result.reply,
      suggestions: result.suggestions,
      context: {
        room: roomInfo,
        activeComplaintsCount: activeComplaints.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  chatWithAssistant,
};
