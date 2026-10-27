import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  UtensilsCrossed,
  Sparkles,
  TrendingUp,
  Clock,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  X,
} from 'lucide-react';

export const AdminMess = () => {
  // Headcount Predictor State
  const [predictDay, setPredictDay] = useState('Sunday');
  const [predictMeal, setPredictMeal] = useState('Dinner');
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [savingTarget, setSavingTarget] = useState(false);

  // Menu Manager State
  const [menuDay, setMenuDay] = useState('Monday');
  const [menuMeal, setMenuMeal] = useState('Lunch');
  const [itemsList, setItemsList] = useState(['Paneer Butter Masala', 'Steamed Rice', 'Dal Tadka', 'Phulka Roti']);
  const [newItemInput, setNewItemInput] = useState('');
  const [startTime, setStartTime] = useState('12:30 PM');
  const [endTime, setEndTime] = useState('2:30 PM');
  const [savingMenu, setSavingMenu] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  // Load existing slot items when day or meal selection changes
  useEffect(() => {
    const fetchExistingSlot = async () => {
      try {
        const response = await api.get(`/mess?dayOfWeek=${menuDay}`);
        const matched = (response.data.menus || []).find((m) => m.mealType === menuMeal);
        if (matched) {
          setItemsList(matched.items || []);
          if (matched.timings?.start) setStartTime(matched.timings.start);
          if (matched.timings?.end) setEndTime(matched.timings.end);
        } else {
          // Defaults
          const defaults = {
            Breakfast: { items: ['Idli', 'Medu Vada', 'Sambar', 'Tea'], start: '7:30 AM', end: '9:30 AM' },
            Lunch: { items: ['Paneer Curry', 'Rice', 'Dal', 'Roti', 'Salad'], start: '12:30 PM', end: '2:30 PM' },
            Snacks: { items: ['Poha', 'Tea', 'Biscuits'], start: '4:30 PM', end: '5:30 PM' },
            Dinner: { items: ['Veg Biryani', 'Raita', 'Gulab Jamun'], start: '7:30 PM', end: '9:30 PM' },
          };
          const def = defaults[menuMeal] || defaults.Lunch;
          setItemsList(def.items);
          setStartTime(def.start);
          setEndTime(def.end);
        }
      } catch (err) {
        console.error('Failed to load menu slot', err);
      }
    };

    fetchExistingSlot();
  }, [menuDay, menuMeal]);

  // Run AI Forecast
  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    setError('');

    try {
      const response = await api.post('/mess/predict', {
        dayOfWeek: predictDay,
        mealType: predictMeal,
        pastAttendanceArray: [315, 290, 275],
      });
      setPrediction(response.data.prediction);
      setToastMessage('Gemini Headcount Forecast generated successfully!');
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Headcount prediction failed.');
    } finally {
      setPredicting(false);
    }
  };

  // Save Target Headcount
  const handleSaveTarget = async () => {
    if (!prediction) return;
    setSavingTarget(true);

    try {
      await api.post('/mess/predict', {
        dayOfWeek: predictDay,
        mealType: predictMeal,
        updateDatabase: true,
      });
      setToastMessage(`Saved ${prediction.predictedTurnout} as target headcount for ${predictDay} ${predictMeal}!`);
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save headcount target.');
    } finally {
      setSavingTarget(false);
    }
  };

  // Menu Items operations
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemInput.trim()) return;
    setItemsList((prev) => [...prev, newItemInput.trim()]);
    setNewItemInput('');
  };

  const handleRemoveItem = (index) => {
    setItemsList((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Menu Changes to Server
  const handleSaveMenu = async () => {
    setSavingMenu(true);
    setError('');

    try {
      await api.post('/mess', {
        dayOfWeek: menuDay,
        mealType: menuMeal,
        items: itemsList,
        timings: { start: startTime, end: endTime },
      });
      setToastMessage(`Updated menu for ${menuDay} ${menuMeal} successfully!`);
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save menu changes.');
    } finally {
      setSavingMenu(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Dining Operations & AI Turnout Forecast
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Predict student headcounts to minimize kitchen food waste and update daily meal timetables.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: AI Headcount Predictor Widget */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Gemini Headcount Predictor & Waste Reduction</h2>
              <p className="text-xs text-slate-400">Calculates student dining turnout based on day, slot, and past attendance.</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
            Gemini 2.5 Model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <form onSubmit={handlePredict} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Day</label>
              <select
                value={predictDay}
                onChange={(e) => setPredictDay(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white"
              >
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Meal Slot</label>
              <select
                value={predictMeal}
                onChange={(e) => setPredictMeal(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white"
              >
                {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={predicting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {predicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{predicting ? 'Forecasting Attendance...' : 'Run AI Forecast'}</span>
            </button>
          </form>

          {/* Results Display */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400 font-mono">
                  {predictDay} {predictMeal} Forecast
                </span>
                {prediction && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Confidence: {prediction.confidence}
                  </span>
                )}
              </div>

              {prediction ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-indigo-400">
                      {prediction.predictedTurnout}
                    </span>
                    <span className="text-sm font-semibold text-slate-300">
                      Students Expected
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <TrendingUp className="w-4 h-4" />
                      <span>Kitchen Waste Reduction Strategy:</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-6">
                      {prediction.wasteReductionTips}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Select a day and meal slot, then click <strong>Run AI Forecast</strong> to analyze expected student dining turnout.
                </div>
              )}
            </div>

            {prediction && (
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveTarget}
                  disabled={savingTarget}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition"
                >
                  {savingTarget ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savingTarget ? 'Saving...' : 'Save as Target Headcount'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Weekly Menu Manager */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Campus Weekly Menu Manager</h2>
              <p className="text-xs text-slate-400">Configure daily dishes and service timings displayed on student dashboards.</p>
            </div>
          </div>
          <button
            onClick={handleSaveMenu}
            disabled={savingMenu}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {savingMenu ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savingMenu ? 'Saving Menu...' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Slot Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Day of Week</label>
            <div className="flex flex-wrap gap-1.5">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setMenuDay(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    menuDay === d
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meal Service Slot</label>
            <div className="flex flex-wrap gap-1.5">
              {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMenuMeal(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    menuMeal === m
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timings Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Serving Start Time</label>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="e.g. 12:30 PM"
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Serving End Time</label>
            <input
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="e.g. 2:30 PM"
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white"
            />
          </div>
        </div>

        {/* Menu Items Editor */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-slate-300">
            Active Menu Dishes ({itemsList.length} items configured)
          </label>

          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              value={newItemInput}
              onChange={(e) => setNewItemInput(e.target.value)}
              placeholder="Add dish (e.g. Malai Kofta, Jeera Rice)..."
              className="flex-1 px-4 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Dish</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-1">
            {itemsList.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-slate-500 hover:text-rose-400 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMess;
