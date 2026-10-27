import Notice from '../models/Notice.js';

/**
 * @desc    Get all notices
 * @route   GET /api/notices
 * @access  Protected
 */
export const getNotices = async (req, res, next) => {
  try {
    const filter = {};

    // Allow category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by audience if requested
    if (req.query.targetAudience) {
      filter.targetAudience = { $in: ['All', req.query.targetAudience] };
    }

    const notices = await Notice.find(filter)
      .populate('postedBy', 'name email role avatar')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new notice
 * @route   POST /api/notices
 * @access  Admin only
 */
export const createNotice = async (req, res, next) => {
  try {
    const { title, content, category, targetAudience, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content for the notice.',
      });
    }

    const notice = await Notice.create({
      title,
      content,
      category: category || 'General',
      targetAudience: targetAudience || 'All',
      postedBy: req.user._id,
      isPinned: Boolean(isPinned),
    });

    const populatedNotice = await Notice.findById(notice._id).populate(
      'postedBy',
      'name email role avatar'
    );

    res.status(201).json({
      success: true,
      message: 'Notice posted successfully',
      notice: populatedNotice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a notice
 * @route   DELETE /api/notices/:id
 * @access  Admin only
 */
export const deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    await Notice.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully',
      deletedId: id,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getNotices,
  createNotice,
  deleteNotice,
};
