import AsyncStorage from "@react-native-async-storage/async-storage";

const STUDIES_KEY = "research_studies";
const PARTICIPATIONS_KEY = "study_participations";
const CONTRIBUTIONS_KEY = "research_contributions";
const FINDINGS_KEY = "research_findings";

export type StudyCategory = 
  | "energy"
  | "sleep"
  | "nutrition"
  | "fitness"
  | "stress"
  | "habits"
  | "wellness";

export type StudyStatus = "recruiting" | "active" | "completed" | "paused";

export interface ResearchStudy {
  id: string;
  title: string;
  description: string;
  category: StudyCategory;
  institution: string;
  principalInvestigator: string;
  duration: number; // days
  participantGoal: number;
  currentParticipants: number;
  status: StudyStatus;
  requirements: string[];
  dataCollected: string[];
  compensation?: string;
  irbApproved: boolean;
  irbNumber?: string;
  startDate: string;
  endDate?: string;
  earlyAccessFeatures?: string[];
  privacyLevel: "anonymous" | "pseudonymous" | "identified";
}

export interface StudyParticipation {
  id: string;
  studyId: string;
  userId: string;
  status: "pending" | "active" | "completed" | "withdrawn";
  consentDate: string;
  startDate?: string;
  completionDate?: string;
  withdrawalDate?: string;
  withdrawalReason?: string;
  progress: number; // 0-100
  dataPointsContributed: number;
  lastContributionDate?: string;
}

export interface ResearchContribution {
  id: string;
  studyId: string;
  participationId: string;
  dataType: string;
  timestamp: string;
  anonymized: boolean;
}

export interface ResearchFinding {
  id: string;
  studyId: string;
  title: string;
  summary: string;
  keyInsights: string[];
  publishedDate: string;
  publicationLink?: string;
  impactScore: number; // 0-100
  participantCount: number;
}

export interface ConsentForm {
  studyId: string;
  version: string;
  content: string;
  sections: ConsentSection[];
}

export interface ConsentSection {
  title: string;
  content: string;
  required: boolean;
}

export interface ParticipantReward {
  id: string;
  participationId: string;
  type: "feature_access" | "badge" | "certificate" | "credit";
  name: string;
  description: string;
  earnedDate: string;
  expiryDate?: string;
}

/**
 * Get all research studies
 */
export async function getResearchStudies(filters?: {
  category?: StudyCategory;
  status?: StudyStatus;
  institution?: string;
}): Promise<ResearchStudy[]> {
  try {
    const data = await AsyncStorage.getItem(STUDIES_KEY);
    let studies: ResearchStudy[] = data ? JSON.parse(data) : getSampleStudies();
    
    // Apply filters
    if (filters) {
      if (filters.category) {
        studies = studies.filter((s) => s.category === filters.category);
      }
      if (filters.status) {
        studies = studies.filter((s) => s.status === filters.status);
      }
      if (filters.institution) {
        studies = studies.filter((s) => s.institution === filters.institution);
      }
    }
    
    // Sort by status and date
    const statusOrder: Record<StudyStatus, number> = {
      recruiting: 0,
      active: 1,
      paused: 2,
      completed: 3,
    };
    studies.sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
    
    return studies;
  } catch (error) {
    console.error("Failed to get research studies:", error);
    return [];
  }
}

/**
 * Get study by ID
 */
export async function getResearchStudy(id: string): Promise<ResearchStudy | null> {
  const studies = await getResearchStudies();
  return studies.find((s) => s.id === id) || null;
}

/**
 * Get consent form
 */
export async function getConsentForm(studyId: string): Promise<ConsentForm> {
  // In real implementation, would fetch from server
  // For now, return sample consent form
  
  return {
    studyId,
    version: "1.0",
    content: "Research Study Informed Consent",
    sections: [
      {
        title: "Purpose of the Study",
        content: "This research study aims to understand patterns in energy levels and their correlation with lifestyle factors.",
        required: true,
      },
      {
        title: "What You Will Do",
        content: "You will be asked to track your daily energy levels, sleep, nutrition, and exercise for the duration of the study.",
        required: true,
      },
      {
        title: "Risks and Benefits",
        content: "There are no known risks. Benefits include early access to research-backed features and contribution to scientific knowledge.",
        required: true,
      },
      {
        title: "Privacy and Confidentiality",
        content: "Your data will be anonymized and used only for research purposes. No personally identifiable information will be shared.",
        required: true,
      },
      {
        title: "Voluntary Participation",
        content: "Your participation is completely voluntary. You may withdraw at any time without penalty.",
        required: true,
      },
      {
        title: "Contact Information",
        content: "If you have questions, contact the principal investigator or the IRB.",
        required: false,
      },
    ],
  };
}

/**
 * Join study (opt-in)
 */
export async function joinStudy(
  studyId: string,
  userId: string
): Promise<StudyParticipation> {
  try {
    const data = await AsyncStorage.getItem(PARTICIPATIONS_KEY);
    const participations: StudyParticipation[] = data ? JSON.parse(data) : [];
    
    // Check if already participating
    const existing = participations.find(
      (p) => p.studyId === studyId && p.userId === userId && p.status !== "withdrawn"
    );
    if (existing) {
      return existing;
    }
    
    const newParticipation: StudyParticipation = {
      id: `participation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studyId,
      userId,
      status: "pending",
      consentDate: new Date().toISOString(),
      progress: 0,
      dataPointsContributed: 0,
    };
    
    participations.push(newParticipation);
    await AsyncStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(participations));
    
    // Update study participant count
    const studies = await getResearchStudies();
    const study = studies.find((s) => s.id === studyId);
    if (study) {
      study.currentParticipants++;
      await AsyncStorage.setItem(STUDIES_KEY, JSON.stringify(studies));
    }
    
    return newParticipation;
  } catch (error) {
    console.error("Failed to join study:", error);
    throw error;
  }
}

/**
 * Activate participation (after consent)
 */
export async function activateParticipation(
  participationId: string
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(PARTICIPATIONS_KEY);
    const participations: StudyParticipation[] = data ? JSON.parse(data) : [];
    
    const participation = participations.find((p) => p.id === participationId);
    if (participation) {
      participation.status = "active";
      participation.startDate = new Date().toISOString();
      await AsyncStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(participations));
    }
  } catch (error) {
    console.error("Failed to activate participation:", error);
    throw error;
  }
}

/**
 * Get user participations
 */
export async function getUserParticipations(
  userId: string,
  status?: StudyParticipation["status"]
): Promise<StudyParticipation[]> {
  try {
    const data = await AsyncStorage.getItem(PARTICIPATIONS_KEY);
    let participations: StudyParticipation[] = data ? JSON.parse(data) : [];
    
    participations = participations.filter((p) => p.userId === userId);
    
    if (status) {
      participations = participations.filter((p) => p.status === status);
    }
    
    return participations;
  } catch (error) {
    console.error("Failed to get user participations:", error);
    return [];
  }
}

/**
 * Withdraw from study
 */
export async function withdrawFromStudy(
  participationId: string,
  reason?: string
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(PARTICIPATIONS_KEY);
    const participations: StudyParticipation[] = data ? JSON.parse(data) : [];
    
    const participation = participations.find((p) => p.id === participationId);
    if (participation) {
      participation.status = "withdrawn";
      participation.withdrawalDate = new Date().toISOString();
      participation.withdrawalReason = reason;
      await AsyncStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(participations));
      
      // Update study participant count
      const studies = await getResearchStudies();
      const study = studies.find((s) => s.id === participation.studyId);
      if (study && study.currentParticipants > 0) {
        study.currentParticipants--;
        await AsyncStorage.setItem(STUDIES_KEY, JSON.stringify(studies));
      }
    }
  } catch (error) {
    console.error("Failed to withdraw from study:", error);
    throw error;
  }
}

/**
 * Contribute data to study
 */
export async function contributeData(
  participationId: string,
  dataType: string,
  anonymized: boolean = true
): Promise<ResearchContribution> {
  try {
    const data = await AsyncStorage.getItem(CONTRIBUTIONS_KEY);
    const contributions: ResearchContribution[] = data ? JSON.parse(data) : [];
    
    // Get participation to find study ID
    const participationsData = await AsyncStorage.getItem(PARTICIPATIONS_KEY);
    const participations: StudyParticipation[] = participationsData
      ? JSON.parse(participationsData)
      : [];
    const participation = participations.find((p) => p.id === participationId);
    
    if (!participation) {
      throw new Error("Participation not found");
    }
    
    const newContribution: ResearchContribution = {
      id: `contribution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studyId: participation.studyId,
      participationId,
      dataType,
      timestamp: new Date().toISOString(),
      anonymized,
    };
    
    contributions.push(newContribution);
    await AsyncStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(contributions));
    
    // Update participation stats
    participation.dataPointsContributed++;
    participation.lastContributionDate = new Date().toISOString();
    
    // Update progress (simplified calculation)
    const study = await getResearchStudy(participation.studyId);
    if (study) {
      const daysPassed = Math.floor(
        (Date.now() - new Date(participation.startDate || participation.consentDate).getTime()) /
          86400000
      );
      participation.progress = Math.min(100, Math.round((daysPassed / study.duration) * 100));
    }
    
    await AsyncStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(participations));
    
    return newContribution;
  } catch (error) {
    console.error("Failed to contribute data:", error);
    throw error;
  }
}

/**
 * Get research findings
 */
export async function getResearchFindings(studyId?: string): Promise<ResearchFinding[]> {
  try {
    const data = await AsyncStorage.getItem(FINDINGS_KEY);
    let findings: ResearchFinding[] = data ? JSON.parse(data) : getSampleFindings();
    
    if (studyId) {
      findings = findings.filter((f) => f.studyId === studyId);
    }
    
    // Sort by published date
    findings.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
    
    return findings;
  } catch (error) {
    console.error("Failed to get research findings:", error);
    return [];
  }
}

/**
 * Get participant rewards
 */
export async function getParticipantRewards(
  participationId: string
): Promise<ParticipantReward[]> {
  try {
    const data = await AsyncStorage.getItem(`rewards_${participationId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get participant rewards:", error);
    return [];
  }
}

/**
 * Award participant
 */
export async function awardParticipant(
  participationId: string,
  reward: Omit<ParticipantReward, "id" | "participationId" | "earnedDate">
): Promise<ParticipantReward> {
  try {
    const rewards = await getParticipantRewards(participationId);
    
    const newReward: ParticipantReward = {
      ...reward,
      id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participationId,
      earnedDate: new Date().toISOString(),
    };
    
    rewards.push(newReward);
    await AsyncStorage.setItem(`rewards_${participationId}`, JSON.stringify(rewards));
    
    return newReward;
  } catch (error) {
    console.error("Failed to award participant:", error);
    throw error;
  }
}

/**
 * Get participation summary
 */
export async function getParticipationSummary(userId: string): Promise<{
  activeStudies: number;
  completedStudies: number;
  totalContributions: number;
  totalRewards: number;
  impactScore: number;
}> {
  try {
    const participations = await getUserParticipations(userId);
    
    const activeStudies = participations.filter((p) => p.status === "active").length;
    const completedStudies = participations.filter((p) => p.status === "completed").length;
    
    const totalContributions = participations.reduce(
      (sum, p) => sum + p.dataPointsContributed,
      0
    );
    
    let totalRewards = 0;
    for (const participation of participations) {
      const rewards = await getParticipantRewards(participation.id);
      totalRewards += rewards.length;
    }
    
    // Calculate impact score (0-100)
    const impactScore = Math.min(
      100,
      Math.round((completedStudies * 20) + (totalContributions / 10))
    );
    
    return {
      activeStudies,
      completedStudies,
      totalContributions,
      totalRewards,
      impactScore,
    };
  } catch (error) {
    console.error("Failed to get participation summary:", error);
    return {
      activeStudies: 0,
      completedStudies: 0,
      totalContributions: 0,
      totalRewards: 0,
      impactScore: 0,
    };
  }
}

/**
 * Get sample studies
 */
function getSampleStudies(): ResearchStudy[] {
  return [
    {
      id: "study_1",
      title: "Energy Patterns in Remote Workers",
      description: "Understanding how remote work affects daily energy levels and productivity patterns.",
      category: "energy",
      institution: "Stanford University",
      principalInvestigator: "Dr. Emily Chen",
      duration: 90,
      participantGoal: 500,
      currentParticipants: 342,
      status: "recruiting",
      requirements: [
        "Work remotely at least 3 days per week",
        "Age 25-55",
        "Commit to daily energy tracking for 90 days",
      ],
      dataCollected: [
        "Energy levels (4x daily)",
        "Work hours and breaks",
        "Sleep duration",
        "Physical activity",
      ],
      compensation: "Early access to AI-powered work schedule optimizer",
      irbApproved: true,
      irbNumber: "IRB-2024-0142",
      startDate: "2024-01-15",
      earlyAccessFeatures: ["AI Work Schedule Optimizer", "Advanced Energy Forecasting"],
      privacyLevel: "anonymous",
    },
    {
      id: "study_2",
      title: "Sleep Quality and Next-Day Performance",
      description: "Investigating the relationship between sleep metrics and cognitive performance.",
      category: "sleep",
      institution: "MIT Sleep Lab",
      principalInvestigator: "Dr. Michael Park",
      duration: 60,
      participantGoal: 300,
      currentParticipants: 287,
      status: "active",
      requirements: [
        "No diagnosed sleep disorders",
        "Age 18-65",
        "Track sleep with wearable device",
      ],
      dataCollected: [
        "Sleep duration and quality",
        "REM and deep sleep stages",
        "Morning cognitive tests",
        "Energy levels throughout day",
      ],
      compensation: "Research participation certificate + $50 gift card",
      irbApproved: true,
      irbNumber: "IRB-2024-0089",
      startDate: "2024-02-01",
      earlyAccessFeatures: ["Sleep Optimization AI", "Cognitive Performance Tracker"],
      privacyLevel: "pseudonymous",
    },
    {
      id: "study_3",
      title: "Nutrition Timing and Energy Optimization",
      description: "Exploring optimal meal timing for sustained energy throughout the day.",
      category: "nutrition",
      institution: "Harvard School of Public Health",
      principalInvestigator: "Dr. Sarah Johnson",
      duration: 45,
      participantGoal: 400,
      currentParticipants: 156,
      status: "recruiting",
      requirements: [
        "No food allergies or restrictions",
        "Age 21-60",
        "Log all meals and snacks",
      ],
      dataCollected: [
        "Meal timing and composition",
        "Energy levels (6x daily)",
        "Hunger and satiety ratings",
        "Physical activity",
      ],
      compensation: "Personalized nutrition plan + early access to meal timing optimizer",
      irbApproved: true,
      irbNumber: "IRB-2024-0201",
      startDate: "2024-03-10",
      earlyAccessFeatures: ["Meal Timing Optimizer", "Personalized Nutrition AI"],
      privacyLevel: "anonymous",
    },
    {
      id: "study_4",
      title: "Exercise and Mental Energy",
      description: "Understanding how different types of exercise affect mental energy and focus.",
      category: "fitness",
      institution: "UC Berkeley Exercise Science",
      principalInvestigator: "Dr. David Rodriguez",
      duration: 30,
      participantGoal: 250,
      currentParticipants: 250,
      status: "completed",
      requirements: [
        "Exercise at least 3x per week",
        "Age 18-50",
        "Track workouts and energy",
      ],
      dataCollected: [
        "Exercise type, duration, intensity",
        "Pre and post-workout energy",
        "Mental focus ratings",
        "Mood assessments",
      ],
      compensation: "Research findings report + fitness optimization guide",
      irbApproved: true,
      irbNumber: "IRB-2023-0312",
      startDate: "2023-11-01",
      endDate: "2024-01-15",
      earlyAccessFeatures: ["Exercise Energy Optimizer"],
      privacyLevel: "anonymous",
    },
  ];
}

/**
 * Get sample findings
 */
function getSampleFindings(): ResearchFinding[] {
  return [
    {
      id: "finding_1",
      studyId: "study_4",
      title: "Morning Exercise Boosts Mental Energy by 40%",
      summary: "Study participants who exercised before 10 AM showed 40% higher mental energy scores throughout the day compared to evening exercisers.",
      keyInsights: [
        "Morning exercise (6-10 AM) correlated with sustained energy until 6 PM",
        "Moderate intensity (60-70% max HR) was optimal",
        "Benefits persisted even with only 20 minutes of exercise",
        "Effect was strongest for aerobic activities (running, cycling)",
      ],
      publishedDate: "2024-02-15",
      publicationLink: "https://example.com/research/morning-exercise-energy",
      impactScore: 85,
      participantCount: 250,
    },
    {
      id: "finding_2",
      studyId: "study_2",
      title: "7.5 Hours Sleep is the Sweet Spot for Energy",
      summary: "Participants with 7-8 hours of sleep reported optimal energy levels, while both shorter and longer durations showed diminishing returns.",
      keyInsights: [
        "7.5 hours of sleep correlated with highest energy scores",
        "Sleep quality mattered more than quantity after 7 hours",
        "Consistent sleep schedule improved energy by 25%",
        "REM sleep percentage predicted afternoon energy levels",
      ],
      publishedDate: "2024-03-01",
      impactScore: 92,
      participantCount: 287,
    },
  ];
}
