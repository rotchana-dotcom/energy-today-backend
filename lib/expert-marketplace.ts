import AsyncStorage from "@react-native-async-storage/async-storage";

const EXPERTS_KEY = "expert_profiles";
const BOOKINGS_KEY = "consultation_bookings";
const REVIEWS_KEY = "expert_reviews";
const MESSAGES_KEY = "consultation_messages";

export type ExpertCategory = 
  | "wellness_coach"
  | "nutritionist"
  | "sleep_specialist"
  | "fitness_trainer"
  | "stress_management"
  | "mental_health";

export interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  category: ExpertCategory;
  specialties: string[];
  bio: string;
  credentials: string[];
  certifications: string[];
  yearsExperience: number;
  avatar?: string;
  rating: number; // 0-5
  reviewCount: number;
  consultationRate: number; // per hour in USD
  availability: ExpertAvailability[];
  languages: string[];
  verified: boolean;
  joinedDate: string;
}

export interface ExpertAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  timezone: string;
}

export interface ConsultationBooking {
  id: string;
  expertId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  type: "video" | "phone" | "chat";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  amount: number;
  notes?: string;
  meetingLink?: string;
  createdDate: string;
  completedDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
}

export interface ExpertReview {
  id: string;
  expertId: string;
  userId: string;
  bookingId: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  helpful: number;
  createdDate: string;
  response?: {
    text: string;
    date: string;
  };
}

export interface ConsultationMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderType: "user" | "expert";
  message: string;
  timestamp: string;
  read: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "succeeded" | "failed";
  clientSecret: string;
}

/**
 * Get all experts
 */
export async function getExperts(filters?: {
  category?: ExpertCategory;
  minRating?: number;
  maxRate?: number;
  verified?: boolean;
}): Promise<ExpertProfile[]> {
  try {
    const data = await AsyncStorage.getItem(EXPERTS_KEY);
    let experts: ExpertProfile[] = data ? JSON.parse(data) : getSampleExperts();
    
    // Apply filters
    if (filters) {
      if (filters.category) {
        experts = experts.filter((e) => e.category === filters.category);
      }
      if (filters.minRating !== undefined) {
        experts = experts.filter((e) => e.rating >= filters.minRating!);
      }
      if (filters.maxRate !== undefined) {
        experts = experts.filter((e) => e.consultationRate <= filters.maxRate!);
      }
      if (filters.verified !== undefined) {
        experts = experts.filter((e) => e.verified === filters.verified);
      }
    }
    
    // Sort by rating
    experts.sort((a, b) => b.rating - a.rating);
    
    return experts;
  } catch (error) {
    console.error("Failed to get experts:", error);
    return [];
  }
}

/**
 * Get expert by ID
 */
export async function getExpert(id: string): Promise<ExpertProfile | null> {
  const experts = await getExperts();
  return experts.find((e) => e.id === id) || null;
}

/**
 * Search experts
 */
export async function searchExperts(query: string): Promise<ExpertProfile[]> {
  const experts = await getExperts();
  const lowerQuery = query.toLowerCase();
  
  return experts.filter(
    (e) =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.title.toLowerCase().includes(lowerQuery) ||
      e.specialties.some((s) => s.toLowerCase().includes(lowerQuery)) ||
      e.bio.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get expert availability
 */
export async function getExpertAvailableSlots(
  expertId: string,
  date: string
): Promise<{ startTime: string; endTime: string }[]> {
  const expert = await getExpert(expertId);
  if (!expert) return [];
  
  const dayOfWeek = new Date(date).getDay();
  const availability = expert.availability.find((a) => a.dayOfWeek === dayOfWeek);
  
  if (!availability) return [];
  
  // Generate 1-hour slots
  const slots: { startTime: string; endTime: string }[] = [];
  const start = parseInt(availability.startTime.split(":")[0]);
  const end = parseInt(availability.endTime.split(":")[0]);
  
  for (let hour = start; hour < end; hour++) {
    slots.push({
      startTime: `${hour.toString().padStart(2, "0")}:00`,
      endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
    });
  }
  
  // Filter out booked slots
  const bookings = await getBookings({ expertId, date });
  return slots.filter((slot) => {
    return !bookings.some(
      (b) =>
        b.status !== "cancelled" &&
        b.startTime === slot.startTime
    );
  });
}

/**
 * Create booking
 */
export async function createBooking(
  booking: Omit<ConsultationBooking, "id" | "createdDate" | "status" | "paymentStatus">
): Promise<ConsultationBooking> {
  try {
    const bookings = await getBookings();
    
    const newBooking: ConsultationBooking = {
      ...booking,
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      paymentStatus: "pending",
      createdDate: new Date().toISOString(),
    };
    
    bookings.push(newBooking);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    
    return newBooking;
  } catch (error) {
    console.error("Failed to create booking:", error);
    throw error;
  }
}

/**
 * Get bookings
 */
export async function getBookings(filters?: {
  expertId?: string;
  userId?: string;
  date?: string;
  status?: ConsultationBooking["status"];
}): Promise<ConsultationBooking[]> {
  try {
    const data = await AsyncStorage.getItem(BOOKINGS_KEY);
    let bookings: ConsultationBooking[] = data ? JSON.parse(data) : [];
    
    // Apply filters
    if (filters) {
      if (filters.expertId) {
        bookings = bookings.filter((b) => b.expertId === filters.expertId);
      }
      if (filters.userId) {
        bookings = bookings.filter((b) => b.userId === filters.userId);
      }
      if (filters.date) {
        bookings = bookings.filter((b) => b.date === filters.date);
      }
      if (filters.status) {
        bookings = bookings.filter((b) => b.status === filters.status);
      }
    }
    
    // Sort by date
    bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return bookings;
  } catch (error) {
    console.error("Failed to get bookings:", error);
    return [];
  }
}

/**
 * Update booking
 */
export async function updateBooking(
  id: string,
  updates: Partial<ConsultationBooking>
): Promise<ConsultationBooking> {
  try {
    const bookings = await getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    
    if (index === -1) {
      throw new Error("Booking not found");
    }
    
    bookings[index] = { ...bookings[index], ...updates };
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    
    return bookings[index];
  } catch (error) {
    console.error("Failed to update booking:", error);
    throw error;
  }
}

/**
 * Cancel booking
 */
export async function cancelBooking(
  id: string,
  reason?: string
): Promise<void> {
  try {
    await updateBooking(id, {
      status: "cancelled",
      cancelledDate: new Date().toISOString(),
      cancellationReason: reason,
      paymentStatus: "refunded",
    });
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    throw error;
  }
}

/**
 * Complete booking
 */
export async function completeBooking(id: string): Promise<void> {
  try {
    await updateBooking(id, {
      status: "completed",
      completedDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to complete booking:", error);
    throw error;
  }
}

/**
 * Create payment intent
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = "usd"
): Promise<PaymentIntent> {
  try {
    // In real implementation, would call Stripe API
    // For now, simulate payment intent
    
    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: "pending",
      clientSecret: `secret_${Date.now()}`,
    };
    
    return paymentIntent;
  } catch (error) {
    console.error("Failed to create payment intent:", error);
    throw error;
  }
}

/**
 * Confirm payment
 */
export async function confirmPayment(
  paymentIntentId: string,
  bookingId: string
): Promise<void> {
  try {
    // In real implementation, would confirm with Stripe
    // For now, just update booking
    
    await updateBooking(bookingId, {
      paymentStatus: "paid",
      status: "confirmed",
    });
  } catch (error) {
    console.error("Failed to confirm payment:", error);
    throw error;
  }
}

/**
 * Get expert reviews
 */
export async function getExpertReviews(expertId: string): Promise<ExpertReview[]> {
  try {
    const data = await AsyncStorage.getItem(REVIEWS_KEY);
    let reviews: ExpertReview[] = data ? JSON.parse(data) : [];
    
    reviews = reviews.filter((r) => r.expertId === expertId);
    reviews.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    
    return reviews;
  } catch (error) {
    console.error("Failed to get expert reviews:", error);
    return [];
  }
}

/**
 * Create review
 */
export async function createReview(
  review: Omit<ExpertReview, "id" | "createdDate" | "helpful">
): Promise<ExpertReview> {
  try {
    const data = await AsyncStorage.getItem(REVIEWS_KEY);
    const reviews: ExpertReview[] = data ? JSON.parse(data) : [];
    
    const newReview: ExpertReview = {
      ...review,
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date().toISOString(),
      helpful: 0,
    };
    
    reviews.push(newReview);
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    
    // Update expert rating
    const expert = await getExpert(review.expertId);
    if (expert) {
      const expertReviews = await getExpertReviews(review.expertId);
      const avgRating =
        expertReviews.reduce((sum, r) => sum + r.rating, 0) / expertReviews.length;
      
      const experts = await getExperts();
      const expertIndex = experts.findIndex((e) => e.id === review.expertId);
      if (expertIndex !== -1) {
        experts[expertIndex].rating = Math.round(avgRating * 10) / 10;
        experts[expertIndex].reviewCount = expertReviews.length;
        await AsyncStorage.setItem(EXPERTS_KEY, JSON.stringify(experts));
      }
    }
    
    return newReview;
  } catch (error) {
    console.error("Failed to create review:", error);
    throw error;
  }
}

/**
 * Get consultation messages
 */
export async function getConsultationMessages(
  bookingId: string
): Promise<ConsultationMessage[]> {
  try {
    const data = await AsyncStorage.getItem(`${MESSAGES_KEY}_${bookingId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get consultation messages:", error);
    return [];
  }
}

/**
 * Send consultation message
 */
export async function sendConsultationMessage(
  bookingId: string,
  senderId: string,
  senderType: "user" | "expert",
  message: string
): Promise<ConsultationMessage> {
  try {
    const messages = await getConsultationMessages(bookingId);
    
    const newMessage: ConsultationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookingId,
      senderId,
      senderType,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    messages.push(newMessage);
    await AsyncStorage.setItem(`${MESSAGES_KEY}_${bookingId}`, JSON.stringify(messages));
    
    return newMessage;
  } catch (error) {
    console.error("Failed to send consultation message:", error);
    throw error;
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  bookingId: string,
  senderType: "user" | "expert"
): Promise<void> {
  try {
    const messages = await getConsultationMessages(bookingId);
    
    messages.forEach((msg) => {
      if (msg.senderType !== senderType) {
        msg.read = true;
      }
    });
    
    await AsyncStorage.setItem(`${MESSAGES_KEY}_${bookingId}`, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    throw error;
  }
}

/**
 * Get sample experts (for initial data)
 */
function getSampleExperts(): ExpertProfile[] {
  return [
    {
      id: "expert_1",
      name: "Dr. Sarah Johnson",
      title: "Certified Wellness Coach & Nutritionist",
      category: "wellness_coach",
      specialties: ["Energy Optimization", "Stress Management", "Work-Life Balance"],
      bio: "15+ years helping professionals optimize their energy and performance. Specialized in sustainable lifestyle changes.",
      credentials: ["PhD in Nutrition Science", "Certified Health Coach (NBC-HWC)"],
      certifications: ["ACE Certified", "Precision Nutrition Level 2"],
      yearsExperience: 15,
      rating: 4.9,
      reviewCount: 127,
      consultationRate: 150,
      availability: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", timezone: "America/New_York" },
        { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", timezone: "America/New_York" },
        { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", timezone: "America/New_York" },
        { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", timezone: "America/New_York" },
        { dayOfWeek: 5, startTime: "09:00", endTime: "15:00", timezone: "America/New_York" },
      ],
      languages: ["English", "Spanish"],
      verified: true,
      joinedDate: "2022-01-15",
    },
    {
      id: "expert_2",
      name: "Michael Chen",
      title: "Sleep Specialist & Behavioral Therapist",
      category: "sleep_specialist",
      specialties: ["Insomnia Treatment", "Sleep Optimization", "Circadian Rhythm"],
      bio: "Board-certified sleep specialist with expertise in cognitive behavioral therapy for insomnia (CBT-I).",
      credentials: ["MD, Sleep Medicine", "Board Certified Sleep Specialist"],
      certifications: ["ABSM Diplomate", "CBT-I Certified"],
      yearsExperience: 12,
      rating: 4.8,
      reviewCount: 89,
      consultationRate: 200,
      availability: [
        { dayOfWeek: 1, startTime: "14:00", endTime: "20:00", timezone: "America/Los_Angeles" },
        { dayOfWeek: 2, startTime: "14:00", endTime: "20:00", timezone: "America/Los_Angeles" },
        { dayOfWeek: 4, startTime: "14:00", endTime: "20:00", timezone: "America/Los_Angeles" },
        { dayOfWeek: 5, startTime: "14:00", endTime: "20:00", timezone: "America/Los_Angeles" },
      ],
      languages: ["English", "Mandarin"],
      verified: true,
      joinedDate: "2022-03-20",
    },
    {
      id: "expert_3",
      name: "Emma Rodriguez",
      title: "Registered Dietitian Nutritionist",
      category: "nutritionist",
      specialties: ["Sports Nutrition", "Energy Nutrition", "Meal Planning"],
      bio: "Helping athletes and busy professionals fuel their bodies for optimal energy and performance.",
      credentials: ["MS, Nutrition", "Registered Dietitian (RD)"],
      certifications: ["CSSD", "Intuitive Eating Counselor"],
      yearsExperience: 8,
      rating: 4.7,
      reviewCount: 64,
      consultationRate: 120,
      availability: [
        { dayOfWeek: 1, startTime: "10:00", endTime: "18:00", timezone: "America/Chicago" },
        { dayOfWeek: 3, startTime: "10:00", endTime: "18:00", timezone: "America/Chicago" },
        { dayOfWeek: 5, startTime: "10:00", endTime: "16:00", timezone: "America/Chicago" },
      ],
      languages: ["English", "Spanish"],
      verified: true,
      joinedDate: "2022-06-10",
    },
    {
      id: "expert_4",
      name: "David Park",
      title: "Certified Personal Trainer & Fitness Coach",
      category: "fitness_trainer",
      specialties: ["Strength Training", "Energy Boosting Workouts", "Recovery"],
      bio: "Former professional athlete turned coach. Specialized in building sustainable fitness habits.",
      credentials: ["BS, Exercise Science", "NASM-CPT"],
      certifications: ["NASM-PES", "FMS Level 2"],
      yearsExperience: 10,
      rating: 4.9,
      reviewCount: 112,
      consultationRate: 100,
      availability: [
        { dayOfWeek: 1, startTime: "06:00", endTime: "12:00", timezone: "America/Denver" },
        { dayOfWeek: 2, startTime: "06:00", endTime: "12:00", timezone: "America/Denver" },
        { dayOfWeek: 3, startTime: "06:00", endTime: "12:00", timezone: "America/Denver" },
        { dayOfWeek: 4, startTime: "06:00", endTime: "12:00", timezone: "America/Denver" },
        { dayOfWeek: 5, startTime: "06:00", endTime: "12:00", timezone: "America/Denver" },
        { dayOfWeek: 6, startTime: "08:00", endTime: "12:00", timezone: "America/Denver" },
      ],
      languages: ["English", "Korean"],
      verified: true,
      joinedDate: "2021-11-05",
    },
    {
      id: "expert_5",
      name: "Dr. Lisa Thompson",
      title: "Clinical Psychologist & Stress Management Expert",
      category: "stress_management",
      specialties: ["Burnout Prevention", "Mindfulness", "Cognitive Behavioral Therapy"],
      bio: "Helping high-performers manage stress and prevent burnout through evidence-based techniques.",
      credentials: ["PhD, Clinical Psychology", "Licensed Psychologist"],
      certifications: ["MBSR Teacher", "ACT Therapist"],
      yearsExperience: 18,
      rating: 5.0,
      reviewCount: 95,
      consultationRate: 180,
      availability: [
        { dayOfWeek: 2, startTime: "13:00", endTime: "19:00", timezone: "America/New_York" },
        { dayOfWeek: 3, startTime: "13:00", endTime: "19:00", timezone: "America/New_York" },
        { dayOfWeek: 4, startTime: "13:00", endTime: "19:00", timezone: "America/New_York" },
      ],
      languages: ["English"],
      verified: true,
      joinedDate: "2021-09-12",
    },
  ];
}
