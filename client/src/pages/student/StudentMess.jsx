import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Calendar,
  Loader2,
  Sparkles,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

export const StudentMess = () => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];

  const [selectedDay, setSelectedDay] = useState(todayName);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Meal RSVP state (stored per meal slot in localStorage)
  const [rsvpState, setRsvpState] = useState(() => {
    try {
      const saved = localStorage.getItem('staymate_meal_rsvp');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleRSVP = (mealType) => {
    const key = `${selectedDay}_${mealType}`;
    const nextVal = !rsvpState[key];
    const updated = { ...rsvpState, [key]: nextVal };
    setRsvpState(updated);
    localStorage.setItem('staymate_meal_rsvp', JSON.stringify(updated));
  };

  useEffect(() => {
    const fetchMessMenu = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/mess?dayOfWeek=${selectedDay}`);
        setMenus(response.data.menus || []);
      } catch (err) {
        console.error('Failed to load mess schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessMenu();
  }, [selectedDay]);

  // Determine standard meal times
  const defaultMealSlots = [
    { mealType: 'Breakfast', timings: { start: '7:30 AM', end: '9:30 AM' }, defaultItems: ['Masala Dosa', 'Sambar & Chutney', 'Boiled Eggs', 'Tea / Coffee'] },
    { mealType: 'Lunch', timings: { start: '12:30 PM', end: '2:30 PM' }, defaultItems: ['Paneer Butter Masala', 'Steamed Basmati Rice', 'Dal Tadka', 'Phulka Roti', 'Green Salad'] },
    { mealType: 'Snacks', timings: { start: '4:30 PM', end: '5:30 PM' }, defaultItems: ['Veg Samosa', 'Mint Chutney', 'Masala Chai', 'Biscuits'] },
    { mealType: 'Dinner', timings: { start: '7:30 PM', end: '9:30 PM' }, defaultItems: ['Veg Biryani / Chicken Curry', 'Raita', 'Gulab Jamun', 'Tawa Roti'] },
  ];

  // Merge server records with defaults if specific meals haven't been customized yet
  const displaySlots = defaultMealSlots.map((defSlot) => {
    const matched = menus.find((m) => m.mealType === defSlot.mealType);
    return matched || { ...defSlot, _id: defSlot.mealType, dayOfWeek: selectedDay, items: defSlot.defaultItems };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Campus Dining & Mess Timetable
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Weekly rotating menu, special dietary options, and dining headcount RSVP.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 w-fit">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>Today is <strong className="text-white">{todayName}</strong></span>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
          const isToday = day === todayName;
          const isSelected = day === selectedDay;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-300'
                  }`}
                >
                  TODAY
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* RSVP Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">Meal Turnout RSVP System</span>
            <p className="text-slate-400 text-xs mt-0.5">
              Confirm your dining intention below. Your live RSVP powers the StayMate Gemini Headcount Prediction to eliminate food waste.
            </p>
          </div>
        </div>
      </div>

      {/* Meal Slots Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="text-sm">Loading dining schedule for {selectedDay}...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displaySlots.map((slot) => {
            const rsvpKey = `${selectedDay}_${slot.mealType}`;
            const isAttending = rsvpState[rsvpKey] ?? true; // Defaults to attending

            return (
              <div
                key={slot._id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between space-y-5 hover:border-slate-700 transition"
              >
                <div>
                  {/* Slot Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="font-extrabold text-white text-lg">{slot.mealType}</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{slot.timings?.start || '7:30 AM'} – {slot.timings?.end || '9:30 AM'}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Menu Offerings
                    </span>
                    <ul className="space-y-2 text-sm text-slate-200">
                      {slot.items && slot.items.length > 0 ? (
                        slot.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                            <span className="leading-tight">{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-500 italic">Standard wholesome hostel meal</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* RSVP Toggle Control */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Dining RSVP</span>
                    <button
                      onClick={() => toggleRSVP(slot.mealType)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isAttending
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isAttending ? (
                        <>
                          <ThumbsUp className="w-3 h-3" />
                          <span>Attending</span>
                        </>
                      ) : (
                        <>
                          <ThumbsDown className="w-3 h-3" />
                          <span>Skipping</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentMess;
