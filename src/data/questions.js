export const QUESTIONS = [
  {
    q: "When you feel overwhelmed, what's your first instinct?",
    opts: ["Go quiet / withdraw", "Get busy / distract", "Talk it through", "Push through anyway"],
  },
  {
    q: "How would you describe your relationship with follow-through?",
    opts: ["Strong — I usually finish", "Inconsistent — I lose momentum", "Rare — I struggle to start", "Depends heavily on how I feel"],
  },
  {
    q: "What typically stops you from doing what you know you should?",
    opts: ["Fear of getting it wrong", "Low energy or motivation", "Too many competing priorities", "Unclear where to begin"],
  },
  {
    q: "How do you feel at the end of a typical day?",
    opts: ["Accomplished and settled", "Okay but unfulfilled", "Scattered or drained", "Unclear what I actually did"],
  },
  {
    q: "When stress arrives, it usually affects your:",
    opts: ["Body (tension, fatigue)", "Mind (overthinking, loops)", "Behavior (avoidance, impulse)", "Relationships (withdrawal, friction)"],
  },
  {
    q: "How often do you act on decisions you've already made?",
    opts: ["Usually — I follow through", "Sometimes — it depends", "Rarely — I second-guess", "Almost never — I freeze"],
  },
  {
    q: "Your inner critic is loudest when you're about to:",
    opts: ["Take a risk", "Ask for help", "Be seen / perform", "Rest or slow down"],
  },
  {
    q: "In the last week, how many things did you start but not finish?",
    opts: ["None", "1–2", "3–5", "More than 5"],
  },
  {
    q: "Which statement feels most true for you right now?",
    opts: ["I know what I need to do — I just don't do it", "I'm not sure what I need", "I need structure and momentum", "I need clarity and calm"],
  },
  {
    q: "What does a 'good day' look like for you, mostly?",
    opts: ["I stayed present and calm", "I made progress on something meaningful", "I connected with people genuinely", "I took care of myself properly"],
  },
];

export const REFLECTION_QS = [
  { q: "Did you complete today's action?", opts: ["Fully completed", "Partially", "I attempted it", "I avoided it"], key: "completion" },
  { q: "What resistance showed up?", opts: ["Fear or doubt", "Distraction", "Low energy", "External circumstances"], key: "resistance" },
  { q: "How do you feel right now?", opts: ["Calm and settled", "Still processing", "Slightly drained", "Lighter than expected"], key: "feeling" },
  { q: "What did you take away from today?", opts: ["A new awareness", "A behavior to change", "A confirmation", "More questions than answers"], key: "insight" },
];

// Program-specific journaling questions
export const JOURNALING_QUESTIONS = {
  calm: [
    { q: "How would you rate your stress level before this session?", opts: ["Very calm (1-2)", "Slightly tense (3-4)", "Moderately stressed (5-6)", "Very stressed (7-10)"], key: "stress_before" },
    { q: "What emotions showed up during this practice?", opts: ["Peace and ease", "Frustration or resistance", "Sadness or release", "Clarity and lightness"], key: "emotions" },
    { q: "How is your body feeling right now?", opts: ["Relaxed and loose", "Still holding tension", "Tired but settled", "Energized and calm"], key: "body_state" },
  ],
  
  confidence: [
    { q: "How did you feel approaching today's practice?", opts: ["Excited and ready", "Nervous but willing", "Hesitant or doubtful", "Avoided it initially"], key: "approach" },
    { q: "What inner dialogue came up during this session?", opts: ["Encouraging self-talk", "Critical thoughts", "Neutral observation", "Shifting between both"], key: "self_talk" },
    { q: "How confident do you feel about yourself right now?", opts: ["Stronger than before", "About the same", "Still uncertain", "More aware of my doubts"], key: "confidence_level" },
  ],
  
  focus: [
    { q: "How easily did you stay present during this session?", opts: ["Fully focused", "Mostly present with some drift", "Distracted several times", "Hard to stay engaged"], key: "presence" },
    { q: "What pulled your attention away (if anything)?", opts: ["Nothing major", "Phone or digital distractions", "Wandering thoughts", "Physical discomfort"], key: "distractions" },
    { q: "How clear is your mind right now?", opts: ["Sharp and clear", "Calmer than before", "Still scattered", "Foggy or tired"], key: "mental_clarity" },
  ],
  
  discipline: [
    { q: "How much resistance did you feel to starting this?", opts: ["None — I wanted to do it", "A little hesitation", "Significant resistance", "Almost didn't start"], key: "resistance_level" },
    { q: "What motivated you to follow through today?", opts: ["Personal commitment", "Routine and habit", "External accountability", "Didn't want to break the streak"], key: "motivation" },
    { q: "How do you feel about your commitment right now?", opts: ["Proud and strengthened", "Relieved I did it", "Still struggling", "Neutral — just checking the box"], key: "commitment_feeling" },
  ],
  
  healing: [
    { q: "What emotional layer came up during this session?", opts: ["Past memories or grief", "Present stress or tension", "Hope or opening", "Nothing specific"], key: "emotional_layer" },
    { q: "How safe did you feel during this practice?", opts: ["Completely safe", "Mostly safe with moments of unease", "Guarded or protective", "Unsafe or triggered"], key: "safety" },
    { q: "What do you need most right now?", opts: ["Rest and gentleness", "Validation and understanding", "Space to process", "Connection or support"], key: "needs" },
  ],
  
  purpose: [
    { q: "How connected do you feel to your deeper purpose?", opts: ["Very connected and clear", "Somewhat connected", "Searching for it", "Disconnected or lost"], key: "purpose_connection" },
    { q: "What insight or awareness emerged during this?", opts: ["A clear next step", "A deeper question", "An old pattern or block", "Nothing came through yet"], key: "insight" },
    { q: "How aligned do your actions feel with what matters to you?", opts: ["Very aligned", "Somewhat aligned", "Misaligned but aware", "Unsure what matters"], key: "alignment" },
  ],
  
  habit: [
    { q: "How automatic did this practice feel today?", opts: ["Like second nature", "Getting easier", "Still requires effort", "Felt like starting over"], key: "automaticity" },
    { q: "What obstacle showed up (if any)?", opts: ["None — smooth process", "Time constraints", "Low motivation", "Forgot until reminded"], key: "obstacles" },
    { q: "How likely are you to do this tomorrow?", opts: ["Very likely — it's locked in", "Likely if I remember", "50/50 depending on the day", "Unlikely — still struggling"], key: "likelihood" },
  ],
};

// Night reflection questions for paid programs
export const NIGHT_REFLECTION_QUESTIONS = {
  calm: [
    { q: "How has your stress shifted throughout the day?", opts: ["Significantly calmer", "Slightly better", "About the same", "More tense than morning"], key: "stress_shift" },
    { q: "What brought you the most peace today?", opts: ["The practice itself", "A moment in nature", "A conversation or connection", "Taking a break from something"], key: "peace_source" },
  ],
  
  confidence: [
    { q: "Did you take any bold actions today?", opts: ["Yes — I pushed my edge", "Small steps forward", "Thought about it but didn't act", "Avoided the challenge"], key: "bold_action" },
    { q: "How do you see yourself compared to yesterday?", opts: ["Stronger and clearer", "Same with small shifts", "Still working through doubts", "Harder on myself"], key: "self_perception" },
  ],
  
  focus: [
    { q: "How productive was your day?", opts: ["Very focused and effective", "Got some things done", "Scattered with minimal progress", "Lost to distractions"], key: "productivity" },
    { q: "What was your biggest distraction today?", opts: ["Digital devices", "Mental loops and overthinking", "External interruptions", "Procrastination or avoidance"], key: "main_distraction" },
  ],
  
  discipline: [
    { q: "How many commitments did you follow through on today?", opts: ["All of them", "Most of them", "Some of them", "Few or none"], key: "follow_through" },
    { q: "What made it easier or harder to stay disciplined?", opts: ["Clear structure helped", "My mindset was strong", "I struggled with motivation", "External factors interfered"], key: "discipline_factors" },
  ],
  
  healing: [
    { q: "What emotions surfaced most today?", opts: ["Peace and acceptance", "Sadness or grief", "Frustration or anger", "Numbness or avoidance"], key: "dominant_emotion" },
    { q: "Did you give yourself permission to feel?", opts: ["Yes — I allowed it all", "Partially — with some resistance", "No — I stayed busy", "I wasn't aware of my feelings"], key: "permission_to_feel" },
  ],
  
  purpose: [
    { q: "Did today feel meaningful to you?", opts: ["Very meaningful", "Somewhat meaningful", "Routine and neutral", "Empty or disconnected"], key: "meaningfulness" },
    { q: "What action today aligned with your deeper values?", opts: ["A specific decision I made", "How I showed up for someone", "Time I invested in growth", "Nothing stood out"], key: "aligned_action" },
  ],
  
  habit: [
    { q: "How consistent were you with your new habit today?", opts: ["Did it as planned", "Did it partially", "Skipped but noticed", "Completely forgot"], key: "consistency" },
    { q: "What would make tomorrow's habit easier?", opts: ["A reminder or cue", "Removing a specific obstacle", "Pairing it with something I enjoy", "Just doing it again"], key: "ease_factor" },
  ],
};

export default QUESTIONS;
