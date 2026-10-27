import { GoogleGenAI } from '@google/genai';

/**
 * Initialize Google GenAI client if a valid key is provided
 */
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Model configuration
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/**
 * Clean and parse JSON from Gemini's response (handles markdown code fences)
 * @param {string} rawText 
 * @returns {object|null}
 */
const safeParseJSON = (rawText) => {
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }
    return JSON.parse(clean);
  } catch (error) {
    console.warn('[AI Service] Failed to parse JSON response directly:', error.message);
    // Secondary regex match for JSON block
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};

/**
 * Heuristic fallback for complaint analysis when Gemini is unavailable
 */
const fallbackComplaintAnalysis = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();

  let suggestedCategory = 'Other';
  let urgencyScore = 5;
  let actionRecommendation = 'Assign a maintenance technician for inspection during standard working hours.';

  if (/leak|tap|pipe|water|flush|sink|toilet|drain|overflow/i.test(text)) {
    suggestedCategory = 'Plumbing';
    urgencyScore = /overflow|flood|burst|continuous/i.test(text) ? 9 : 7;
    actionRecommendation = 'Dispatch plumbing team promptly and check main floor valve.';
  } else if (/spark|shock|smoke|switch|short\s?circuit|wire|power|light|fan|geyser|mcb/i.test(text)) {
    suggestedCategory = 'Electrical';
    urgencyScore = /spark|shock|smoke|short\s?circuit/i.test(text) ? 10 : 8;
    actionRecommendation = 'Immediate electrical inspection required. Isolate power breaker if smoke or sparks reported.';
  } else if (/door|lock|latch|key|window|hinge|bed|almirah|cupboard|desk/i.test(text)) {
    suggestedCategory = 'Carpentry';
    urgencyScore = /lock|broken|cannot open|stuck/i.test(text) ? 7 : 5;
    actionRecommendation = 'Schedule hostel carpenter to repair hardware within 24 hours.';
  } else if (/dirty|garbage|smell|stench|dust|cockroach|rodent|rat|insect|clean|washroom/i.test(text)) {
    suggestedCategory = 'Cleanliness';
    urgencyScore = 6;
    actionRecommendation = 'Alert housekeeping supervisor for deep cleaning and sanitation.';
  } else if (/food|meal|dining|cater|roti|rice|curry|taste|undercooked|mess/i.test(text)) {
    suggestedCategory = 'Mess';
    urgencyScore = 6;
    actionRecommendation = 'Forward student feedback to mess manager and head chef for quality review.';
  } else if (/wifi|wi-fi|internet|lan|network|router|slow|disconnect|dns/i.test(text)) {
    suggestedCategory = 'Internet/WiFi';
    urgencyScore = 5;
    actionRecommendation = 'Contact IT network admin to verify wing access point signal and throughput.';
  }

  const summary = description.length > 100 ? `${description.slice(0, 100)}...` : description || title;

  return {
    suggestedCategory,
    urgencyScore,
    summary: `Reported issue: ${summary}`,
    actionRecommendation,
  };
};

/**
 * a. Analyze complaint using Gemini structured prompt
 * @param {string} title 
 * @param {string} description 
 * @returns {Promise<{suggestedCategory: string, urgencyScore: number, summary: string, actionRecommendation: string}>}
 */
export const analyzeComplaintAI = async (title, description) => {
  const fallback = fallbackComplaintAnalysis(title, description);
  const client = getGenAIClient();

  if (!client) {
    return fallback;
  }

  try {
    const prompt = `You are an expert facility management AI for a university hostel campus.
Analyze this student grievance:
Title: "${title}"
Description: "${description}"

Respond ONLY with a valid JSON object matching this schema:
{
  "suggestedCategory": "Plumbing" | "Electrical" | "Carpentry" | "Cleanliness" | "Mess" | "Internet/WiFi" | "Other",
  "urgencyScore": <integer between 1 and 10, where 10 is immediate hazard/flood/fire risk and 1 is minor cosmetic>,
  "summary": "<concise 1-sentence executive summary of the issue>",
  "actionRecommendation": "<1 actionable instruction for hostel staff>"
}`;

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = safeParseJSON(response.text || '');
    if (parsed && parsed.suggestedCategory && parsed.urgencyScore) {
      const validCategories = [
        'Plumbing',
        'Electrical',
        'Carpentry',
        'Cleanliness',
        'Mess',
        'Internet/WiFi',
        'Other',
      ];

      return {
        suggestedCategory: validCategories.includes(parsed.suggestedCategory)
          ? parsed.suggestedCategory
          : fallback.suggestedCategory,
        urgencyScore: Math.min(10, Math.max(1, Number(parsed.urgencyScore) || fallback.urgencyScore)),
        summary: parsed.summary || fallback.summary,
        actionRecommendation: parsed.actionRecommendation || fallback.actionRecommendation,
      };
    }

    return fallback;
  } catch (error) {
    console.error('[AI Service Error - analyzeComplaintAI]:', error.message);
    return fallback;
  }
};

/**
 * Heuristic fallback for mess headcount prediction
 */
const fallbackHeadcountPrediction = (dayOfWeek = 'Monday', mealType = 'Dinner', pastAttendanceArray = []) => {
  const baselines = {
    Breakfast: 180,
    Lunch: 320,
    Snacks: 210,
    Dinner: 340,
  };

  let turnout = baselines[mealType] || 250;

  // Day of week adjustments
  if (dayOfWeek === 'Sunday') {
    if (mealType === 'Breakfast') turnout = 120; // Students sleep late
    if (mealType === 'Dinner') turnout = 280; // Many students eat outside
  } else if (dayOfWeek === 'Saturday' && mealType === 'Dinner') {
    turnout = 270;
  } else if (dayOfWeek === 'Monday' && mealType === 'Breakfast') {
    turnout = 210;
  }

  // Adjust with historical averages if available
  if (Array.isArray(pastAttendanceArray) && pastAttendanceArray.length > 0) {
    const validNumbers = pastAttendanceArray.filter((n) => typeof n === 'number' && n > 0);
    if (validNumbers.length > 0) {
      const avg = validNumbers.reduce((a, b) => a + b, 0) / validNumbers.length;
      turnout = Math.round((turnout + avg) / 2);
    }
  }

  const tips = {
    Breakfast: 'Plan lighter batter quantities on weekends; offer hot grab-and-go options on weekday mornings.',
    Lunch: 'Cook rice in phased batches to avoid overcooking during post-lecture rush hours.',
    Snacks: 'Prepare finger food portions aligned with the scheduled hostel tea hour.',
    Dinner: 'On weekend nights, prepare 15-20% fewer rotis to mitigate plate waste from outside dining.',
  };

  return {
    predictedTurnout: turnout,
    confidence: 'Medium',
    wasteReductionTips: tips[mealType] || 'Prepare food in progressive batches based on peak dining intervals.',
  };
};

/**
 * b. Predict mess headcount turnout using Gemini
 * @param {string} dayOfWeek 
 * @param {string} mealType 
 * @param {Array<number>} pastAttendanceArray 
 * @returns {Promise<{predictedTurnout: number, confidence: string, wasteReductionTips: string}>}
 */
export const predictMessHeadcountAI = async (dayOfWeek, mealType, pastAttendanceArray = []) => {
  const fallback = fallbackHeadcountPrediction(dayOfWeek, mealType, pastAttendanceArray);
  const client = getGenAIClient();

  if (!client) {
    return fallback;
  }

  try {
    const prompt = `You are a university mess catering optimization AI.
Given:
- Day of Week: ${dayOfWeek}
- Meal Type: ${mealType}
- Recent Turnout History: ${JSON.stringify(pastAttendanceArray)}

Predict student attendance and provide food waste reduction recommendations.
Return ONLY valid JSON:
{
  "predictedTurnout": <number, integer count of students expected to dine>,
  "confidence": "High" | "Medium" | "Low",
  "wasteReductionTips": "<practical advice for kitchen staff to minimize leftover food>"
}`;

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = safeParseJSON(response.text || '');
    if (parsed && typeof parsed.predictedTurnout === 'number') {
      return {
        predictedTurnout: Math.max(0, Math.round(parsed.predictedTurnout)),
        confidence: ['High', 'Medium', 'Low'].includes(parsed.confidence) ? parsed.confidence : 'Medium',
        wasteReductionTips: parsed.wasteReductionTips || fallback.wasteReductionTips,
      };
    }

    return fallback;
  } catch (error) {
    console.error('[AI Service Error - predictMessHeadcountAI]:', error.message);
    return fallback;
  }
};

/**
 * Heuristic fallback for campus chatbot when offline
 */
const fallbackCampusChat = (userMessage = '', contextData = {}) => {
  const msg = userMessage.toLowerCase();

  let reply = '';
  const suggestions = [
    'What are the mess timings today?',
    'What is the hostel gate curfew?',
    'How do I file a maintenance complaint?',
    'Where is the warden office located?',
  ];

  if (/curfew|gate|in-time|late\s?entry|night\s?out|entry time/i.test(msg)) {
    reply = `🚪 **Hostel Gate & Curfew Rules:**\n- **Main Gate Closes:** 9:30 PM sharp.\n- **Late Entry:** Allowed up to 10:00 PM with student ID verification.\n- **Night Outs:** Require an approved Digital Gate Pass applied 24 hours in advance via the Warden Portal.`;
  } else if (/mess|food|menu|breakfast|lunch|dinner|snacks|timing|meal/i.test(msg)) {
    reply = `🍽️ **Daily Dining & Mess Timings:**\n- **Breakfast:** 7:30 AM – 9:30 AM\n- **Lunch:** 12:30 PM – 2:30 PM\n- **Evening Snacks:** 4:30 PM – 5:30 PM\n- **Dinner:** 7:30 PM – 9:30 PM\n\nCheck the **Mess Menu** tab on your dashboard for today's curated items!`;
  } else if (/complaint|repair|plumber|electrician|leak|wifi|broken|fix/i.test(msg)) {
    reply = `🛠️ **Maintenance & Complaints Protocol:**\n- You can file an issue anytime via the **Complaints** section.\n- Our Gemini AI automatically scores the urgency and notifies the maintenance team.\n- **Emergency repairs** (water leakage, sparks) are prioritized within 2–4 hours.`;
  } else if (/laundry|wash|dryer/i.test(msg)) {
    reply = `🧺 **Laundry Services:**\n- Laundry rooms are located on the ground floor of each wing.\n- **Hours:** 8:00 AM – 8:00 PM daily. Washing machines are free for resident students.`;
  } else if (/warden|office|contact|emergency|doctor|medical|health/i.test(msg)) {
    reply = `🏥 **Important Campus Contacts:**\n- **Warden Office:** Block A, Room 102 (Hours: 4:00 PM – 6:00 PM)\n- **Medical Health Centre:** Ground Floor, Ext. 108 (24x7 Helpline: +91-9876543210)\n- **Campus Security Gate:** Ext. 100`;
  } else {
    const studentName = contextData.studentName ? `, ${contextData.studentName}` : '';
    reply = `Hello${studentName}! 👋 I am **StayMate AI**, your Smart Campus Living Assistant.\n\nI can help you with:\n- ⏰ Hostel gate curfews and entry regulations\n- 🍲 Daily mess timings and menu updates\n- 🔧 Submitting and checking maintenance complaints\n- 📍 Campus amenities and emergency contacts.\n\nHow may I help you today?`;
  }

  return { reply, suggestions };
};

/**
 * c. Campus Assistant Chatbot using Gemini
 * @param {string} userMessage 
 * @param {Array<{role: string, content: string}>} conversationHistory 
 * @param {object} contextData - Context such as student name, room, pending complaints, today's menu
 * @returns {Promise<{reply: string, suggestions: string[]}>}
 */
export const campusAssistantChat = async (userMessage, conversationHistory = [], contextData = {}) => {
  const fallback = fallbackCampusChat(userMessage, contextData);
  const client = getGenAIClient();

  if (!client) {
    return fallback;
  }

  try {
    const systemInstruction = `You are StayMate AI, the official, intelligent, and polite Campus Living & Hostel Assistant for students.
Your mission is to help students with their day-to-day hostel life, mess routines, and campus protocols.

Official Campus Rules & Parameters:
- Hostel Gate Curfew: 9:30 PM (Main Gate closes at 9:30 PM. Late entry after 10:00 PM strictly requires warden authorization. Night-out gate pass must be submitted 24 hours prior).
- Mess Timings:
  - Breakfast: 7:30 AM - 9:30 AM
  - Lunch: 12:30 PM - 2:30 PM
  - Evening Snacks: 4:30 PM - 5:30 PM
  - Dinner: 7:30 PM - 9:30 PM
- Quiet Hours: 11:00 PM - 6:00 AM (music/loud voices prohibited).
- Laundry Rooms: Located on Ground Floor of Wings A & B, open 8:00 AM - 8:00 PM.
- Maintenance & Repairs: Filed through StayMate. Critical issues (electrical spark, water burst) resolved in 2-4 hours; standard in 24-48 hours.
- Warden Office Hours: 4:00 PM - 6:00 PM, Block A, Room 102.
- Campus Health Emergency: Ext. 108 / +91-9876543210 (24x7).

Current Student Context:
- Student Name: ${contextData.studentName || 'Student'}
- Roll Number: ${contextData.rollNumber || 'N/A'}
- Assigned Room: ${contextData.roomNumber || 'Not assigned yet'}
- Active Complaints: ${JSON.stringify(contextData.activeComplaints || [])}
- Today's Mess Special: ${JSON.stringify(contextData.todayMenu || [])}

Tone: Welcoming, courteous, concise, well-formatted using markdown bullet points. Never make up inaccurate rules outside of campus protocols.`;

    // Format chat history for prompt
    let formattedHistory = '';
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      formattedHistory = conversationHistory
        .slice(-6)
        .map((m) => `${m.role === 'user' ? 'Student' : 'StayMate AI'}: ${m.content}`)
        .join('\n');
    }

    const fullPrompt = `${systemInstruction}

Conversation History:
${formattedHistory || 'No previous history.'}

Student: "${userMessage}"
StayMate AI:`;

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: fullPrompt,
    });

    const reply = response.text ? response.text.trim() : fallback.reply;

    return {
      reply,
      suggestions: [
        'What are the mess timings today?',
        'Can I get an extension for the gate curfew?',
        'Check status of my open complaints',
        'Who is the warden on duty?',
      ],
    };
  } catch (error) {
    console.error('[AI Service Error - campusAssistantChat]:', error.message);
    return fallback;
  }
};

export default {
  analyzeComplaintAI,
  predictMessHeadcountAI,
  campusAssistantChat,
};
