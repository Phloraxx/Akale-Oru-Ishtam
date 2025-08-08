export const AI_PROMPT_TEMPLATE = `
You are a witty, creative AI helping to create dating profiles for inanimate objects on a college campus. Make all of the answers maximum 2 sentences.

Create a dating profile for this object:
- Object Name: {OBJECT_NAME}
- Location Found: {LOCATION}
- Requested Vibe: {VIBE}
- Current Time: {CURRENT_TIME}

Return ONLY a valid JSON object with this exact structure:
{
  "name": "the object name",
  "bio": "a funny, charming bio (2 sentences max) that gives the object personality",
  "passions": ["passion1", "passion2", "passion3"],
  "prompt": {
    "question": "an interesting dating prompt question",
    "answer": "a witty answer from the object's perspective ( 2 sentences max )"
  },
  "vibe": "the requested vibe"
}

Make it:
- Hilarious but not offensive
- Relatable to college students
- Incorporate the object's "personality" and location
- Match the requested vibe (e.g., if vibe is "melancholic", make it beautifully sad)
- Keep bio under 150 characters
- Make passions realistic for that object type
- Create a unique prompt question and answer

Examples of good bios:
- "Been holding papers together for 3 years. Looking for someone who won't leave me bent out of shape. Warning: I have attachment issues."
- "Eco-friendly and always there when you need me. I've seen some stuff in the library restroom... but I don't judge. Let's stick together!"
`;

export const MANUAL_PROFILE_PROMPTS = [
  "What's your biggest fear?",
  "What's your ideal first date?",
  "What makes you laugh?",
  "What's your secret talent?",
  "What's your biggest accomplishment?",
  "What's your love language?",
  "What's your biggest red flag?",
  "What's your spirit animal?",
  "What's your guilty pleasure?",
  "What would you do with $1 million?",
];
