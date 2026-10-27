import MessMenu from '../models/MessMenu.js';
import { predictMessHeadcountAI } from '../services/aiService.js';

/**
 * @desc    Get mess menu (full weekly menu or filtered by dayOfWeek)
 * @route   GET /api/mess
 * @access  Protected or Public
 */
export const getMessMenu = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.dayOfWeek) {
      filter.dayOfWeek = req.query.dayOfWeek;
    }

    const daysOrder = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    const mealOrder = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

    const menus = await MessMenu.find(filter);

    // Custom sorting: by day of week then meal type
    menus.sort((a, b) => {
      const dayDiff = daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek);
      if (dayDiff !== 0) return dayDiff;
      return mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType);
    });

    res.status(200).json({
      success: true,
      count: menus.length,
      menus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or upsert a mess meal slot
 * @route   POST /api/mess
 * @access  Admin only
 */
export const upsertMessMenu = async (req, res, next) => {
  try {
    const { dayOfWeek, mealType, items, timings, expectedHeadcount } = req.body;

    if (!dayOfWeek || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both dayOfWeek and mealType.',
      });
    }

    // Upsert menu entry based on dayOfWeek & mealType
    const menu = await MessMenu.findOneAndUpdate(
      { dayOfWeek, mealType },
      {
        dayOfWeek,
        mealType,
        items: Array.isArray(items) ? items : (items ? items.split(',').map((s) => s.trim()) : []),
        timings: timings || {},
        expectedHeadcount: expectedHeadcount !== undefined ? Number(expectedHeadcount) : 0,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: `${dayOfWeek} ${mealType} menu updated successfully`,
      menu,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a specific mess menu slot by ID
 * @route   PUT /api/mess/:id
 * @access  Admin only
 */
export const updateMessMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items, timings, expectedHeadcount } = req.body;

    const menu = await MessMenu.findById(id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Mess menu item not found.',
      });
    }

    if (items !== undefined) {
      menu.items = Array.isArray(items) ? items : items.split(',').map((s) => s.trim());
    }

    if (timings) {
      menu.timings = timings;
    }

    if (expectedHeadcount !== undefined) {
      menu.expectedHeadcount = Number(expectedHeadcount);
    }

    await menu.save();

    res.status(200).json({
      success: true,
      message: 'Mess menu slot updated successfully',
      menu,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Predict turnout & waste reduction using Gemini AI
 * @route   POST /api/mess/predict
 * @access  Protected
 */
export const predictHeadcount = async (req, res, next) => {
  try {
    const { dayOfWeek, mealType, pastAttendanceArray, updateDatabase } = req.body;

    if (!dayOfWeek || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both dayOfWeek and mealType.',
      });
    }

    const prediction = await predictMessHeadcountAI(
      dayOfWeek,
      mealType,
      pastAttendanceArray || []
    );

    // Optionally update expectedHeadcount in database if requested
    if (updateDatabase) {
      await MessMenu.findOneAndUpdate(
        { dayOfWeek, mealType },
        { expectedHeadcount: prediction.predictedTurnout }
      );
    }

    res.status(200).json({
      success: true,
      dayOfWeek,
      mealType,
      prediction,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMessMenu,
  upsertMessMenu,
  updateMessMenu,
  predictHeadcount,
};
