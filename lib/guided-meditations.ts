/**
 * Guided Meditation Library
 * 
 * Collection of guided meditations for different purposes
 */

export interface GuidedMeditation {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  category: "breathing" | "mindfulness" | "sleep" | "energy" | "focus" | "stress";
  difficulty: "beginner" | "intermediate" | "advanced";
  script: string[];
  isPro: boolean;
}

export const guidedMeditations: GuidedMeditation[] = [
  {
    id: "breathing-basic",
    title: "Basic Breathing Meditation",
    description: "Simple breathing exercise to calm the mind and center yourself",
    duration: 5,
    category: "breathing",
    difficulty: "beginner",
    isPro: false,
    script: [
      "Find a comfortable seated position. Close your eyes gently.",
      "Take a deep breath in through your nose for 4 counts...",
      "Hold for 4 counts...",
      "Exhale slowly through your mouth for 6 counts...",
      "Notice the sensation of breath entering and leaving your body.",
      "If your mind wanders, gently bring your attention back to your breath.",
      "Continue this pattern for the next few minutes.",
      "When you're ready, slowly open your eyes.",
    ],
  },
  {
    id: "energy-morning",
    title: "Morning Energy Activation",
    description: "Awaken your inner energy and set intentions for the day",
    duration: 10,
    category: "energy",
    difficulty: "intermediate",
    isPro: true,
    script: [
      "Sit comfortably with your spine straight. Close your eyes.",
      "Visualize a warm golden light at your core, just below your navel.",
      "With each inhale, imagine this light growing brighter and warmer.",
      "Feel the energy radiating from your center to every part of your body.",
      "Set an intention for your day. What energy do you want to embody?",
      "Visualize yourself moving through your day with this energy.",
      "Take three deep breaths, feeling fully energized and present.",
      "When ready, open your eyes and carry this energy with you.",
    ],
  },
  {
    id: "sleep-lunar",
    title: "Lunar Sleep Meditation",
    description: "Connect with moon energy for deep, restorative sleep",
    duration: 15,
    category: "sleep",
    difficulty: "beginner",
    isPro: true,
    script: [
      "Lie down in a comfortable position. Close your eyes.",
      "Imagine a soft, silver moonlight washing over your body.",
      "Feel the gentle, cooling energy of the moon relaxing each muscle.",
      "Starting from your toes, release all tension as the moonlight touches each part.",
      "The moon's energy is calming, peaceful, and deeply restorative.",
      "Your breath becomes slower and deeper with each exhale.",
      "You are safe, supported, and ready for deep, healing sleep.",
      "Allow yourself to drift into peaceful slumber...",
    ],
  },
  {
    id: "mindfulness-present",
    title: "Present Moment Awareness",
    description: "Ground yourself in the here and now",
    duration: 7,
    category: "mindfulness",
    difficulty: "beginner",
    isPro: false,
    script: [
      "Sit comfortably and close your eyes.",
      "Notice five things you can hear right now.",
      "Notice four things you can feel (your clothes, the chair, the air).",
      "Notice three things you can smell or imagine smelling.",
      "Notice two things you can taste or imagine tasting.",
      "Notice one thing you're grateful for in this moment.",
      "Take a deep breath and open your eyes, fully present.",
    ],
  },
  {
    id: "chi-flow",
    title: "Chi Energy Flow",
    description: "Activate and balance your chi energy throughout your body",
    duration: 12,
    category: "energy",
    difficulty: "advanced",
    isPro: true,
    script: [
      "Stand or sit with your spine straight. Close your eyes.",
      "Rub your palms together vigorously until they feel warm.",
      "Hold your palms facing each other, about 6 inches apart.",
      "Feel the energy, the chi, flowing between your palms.",
      "Slowly move your hands closer and farther apart, feeling the energy expand and contract.",
      "Place your hands on your lower abdomen. Feel the chi gathering here.",
      "Visualize this energy flowing up your spine, through your crown, and back down the front.",
      "Continue this circular flow for several minutes.",
      "When ready, place your hands in prayer position at your heart.",
      "Take three deep breaths and open your eyes.",
    ],
  },
  {
    id: "focus-clarity",
    title: "Mental Clarity & Focus",
    description: "Clear mental fog and sharpen your concentration",
    duration: 8,
    category: "focus",
    difficulty: "intermediate",
    isPro: true,
    script: [
      "Sit upright with your eyes closed.",
      "Imagine a bright white light at the center of your forehead.",
      "This light represents clarity, focus, and mental sharpness.",
      "With each inhale, the light grows brighter and more intense.",
      "Feel it clearing away any mental fog or confusion.",
      "Your mind becomes clear, sharp, and ready to focus.",
      "Set an intention for what you want to accomplish.",
      "Take three energizing breaths and open your eyes, ready to focus.",
    ],
  },
  {
    id: "stress-release",
    title: "Stress Release Meditation",
    description: "Let go of tension and anxiety",
    duration: 10,
    category: "stress",
    difficulty: "beginner",
    isPro: false,
    script: [
      "Find a comfortable position and close your eyes.",
      "Take a deep breath in, and as you exhale, release any tension in your shoulders.",
      "Scan your body from head to toe, noticing where you hold stress.",
      "With each exhale, imagine releasing that stress like steam escaping.",
      "Visualize stress leaving your body as dark smoke, replaced by calming light.",
      "Your body becomes lighter and more relaxed with each breath.",
      "You are safe. You are calm. You are at peace.",
      "When ready, slowly open your eyes, feeling refreshed.",
    ],
  },
];

export function getMeditationsByCategory(category: string): GuidedMeditation[] {
  return guidedMeditations.filter((m) => m.category === category);
}

export function getFreeMeditations(): GuidedMeditation[] {
  return guidedMeditations.filter((m) => !m.isPro);
}

export function getProMeditations(): GuidedMeditation[] {
  return guidedMeditations.filter((m) => m.isPro);
}

export function getMeditationById(id: string): GuidedMeditation | undefined {
  return guidedMeditations.find((m) => m.id === id);
}
