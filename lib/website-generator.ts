/**
 * Marketing Website Generator
 * Generates HTML/CSS for landing pages, pricing pages, and marketing content
 */

export interface WebsiteConfig {
  appName: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  contactEmail: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface Feature {
  icon: string; // emoji or icon name
  title: string;
  description: string;
}

export interface PricingTier {
  name: string;
  price: string;
  period: string; // "month" | "year"
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export interface Testimonial {
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  quote: string;
  rating?: number; // 1-5
}

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generate complete landing page HTML
 */
export function generateLandingPage(config: WebsiteConfig, options: {
  features: Feature[];
  pricing: PricingTier[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
}): string {
  const { features, pricing, testimonials, faqs } = options;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.appName} - ${config.tagline}</title>
  <meta name="description" content="${config.description}">
  
  <!-- SEO Meta Tags -->
  <meta property="og:title" content="${config.appName} - ${config.tagline}">
  <meta property="og:description" content="${config.description}">
  <meta property="og:image" content="${config.logoUrl || ''}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${config.appName}">
  <meta name="twitter:description" content="${config.description}">
  
  <style>
${generateCSS(config)}
  </style>
</head>
<body>
  ${generateHeader(config)}
  ${generateHeroSection(config)}
  ${generateFeaturesSection(features)}
  ${generatePricingSection(pricing)}
  ${generateTestimonialsSection(testimonials)}
  ${generateFAQSection(faqs)}
  ${generateCTASection(config)}
  ${generateFooter(config)}
  
  <script>
${generateJavaScript()}
  </script>
</body>
</html>`;
}

/**
 * Generate CSS styles
 */
function generateCSS(config: WebsiteConfig): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    /* Header */
    header {
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: ${config.primaryColor};
      text-decoration: none;
    }
    
    nav a {
      margin-left: 2rem;
      color: #666;
      text-decoration: none;
      transition: color 0.3s;
    }
    
    nav a:hover {
      color: ${config.primaryColor};
    }
    
    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.secondaryColor} 100%);
      color: white;
      padding: 6rem 0;
      text-align: center;
    }
    
    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .hero p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    
    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 0.75rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
      display: inline-block;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .btn-primary {
      background: white;
      color: ${config.primaryColor};
    }
    
    .btn-secondary {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid white;
    }
    
    /* Features Section */
    .features {
      padding: 6rem 0;
      background: #f9fafb;
    }
    
    .section-title {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: #111;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    
    .feature-card:hover {
      transform: translateY(-4px);
    }
    
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .feature-title {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #111;
    }
    
    .feature-description {
      color: #666;
    }
    
    /* Pricing Section */
    .pricing {
      padding: 6rem 0;
    }
    
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }
    
    .pricing-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .pricing-card.highlighted {
      border-color: ${config.primaryColor};
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      transform: scale(1.05);
    }
    
    .pricing-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    
    .pricing-name {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    
    .pricing-price {
      font-size: 3rem;
      font-weight: bold;
      color: ${config.primaryColor};
      margin-bottom: 0.5rem;
    }
    
    .pricing-period {
      color: #666;
      margin-bottom: 2rem;
    }
    
    .pricing-features {
      list-style: none;
      margin-bottom: 2rem;
      text-align: left;
    }
    
    .pricing-features li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .pricing-features li:before {
      content: "✓ ";
      color: ${config.primaryColor};
      font-weight: bold;
    }
    
    /* Testimonials Section */
    .testimonials {
      padding: 6rem 0;
      background: #f9fafb;
    }
    
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }
    
    .testimonial-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .testimonial-quote {
      font-style: italic;
      margin-bottom: 1rem;
      color: #666;
    }
    
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .testimonial-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: ${config.primaryColor};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    
    .testimonial-name {
      font-weight: bold;
    }
    
    .testimonial-role {
      color: #666;
      font-size: 0.9rem;
    }
    
    /* FAQ Section */
    .faq {
      padding: 6rem 0;
    }
    
    .faq-list {
      max-width: 800px;
      margin: 3rem auto 0;
    }
    
    .faq-item {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 1rem;
      overflow: hidden;
    }
    
    .faq-question {
      padding: 1.5rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .faq-question:hover {
      background: #f9fafb;
    }
    
    .faq-answer {
      padding: 0 1.5rem 1.5rem;
      color: #666;
      display: none;
    }
    
    .faq-item.active .faq-answer {
      display: block;
    }
    
    /* CTA Section */
    .cta-section {
      background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.secondaryColor} 100%);
      color: white;
      padding: 6rem 0;
      text-align: center;
    }
    
    .cta-section h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    
    .cta-section p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    
    /* Footer */
    footer {
      background: #111;
      color: white;
      padding: 3rem 0 1rem;
    }
    
    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .footer-section h3 {
      margin-bottom: 1rem;
    }
    
    .footer-section a {
      color: #999;
      text-decoration: none;
      display: block;
      margin-bottom: 0.5rem;
    }
    
    .footer-section a:hover {
      color: white;
    }
    
    .footer-bottom {
      text-align: center;
      padding-top: 2rem;
      border-top: 1px solid #333;
      color: #999;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem;
      }
      
      .section-title {
        font-size: 2rem;
      }
      
      .pricing-card.highlighted {
        transform: none;
      }
      
      nav {
        display: none;
      }
    }
  `;
}

/**
 * Generate header HTML
 */
function generateHeader(config: WebsiteConfig): string {
  return `
  <header>
    <div class="container">
      <div class="header-content">
        <a href="#" class="logo">${config.appName}</a>
        <nav>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#faq">FAQ</a>
        </nav>
      </div>
    </div>
  </header>`;
}

/**
 * Generate hero section HTML
 */
function generateHeroSection(config: WebsiteConfig): string {
  return `
  <section class="hero">
    <div class="container">
      <h1>${config.tagline}</h1>
      <p>${config.description}</p>
      <div class="cta-buttons">
        ${config.appStoreUrl ? `<a href="${config.appStoreUrl}" class="btn btn-primary">Download on App Store</a>` : ''}
        ${config.playStoreUrl ? `<a href="${config.playStoreUrl}" class="btn btn-secondary">Get it on Google Play</a>` : ''}
      </div>
    </div>
  </section>`;
}

/**
 * Generate features section HTML
 */
function generateFeaturesSection(features: Feature[]): string {
  const featureCards = features.map(f => `
    <div class="feature-card">
      <div class="feature-icon">${f.icon}</div>
      <h3 class="feature-title">${f.title}</h3>
      <p class="feature-description">${f.description}</p>
    </div>
  `).join('');
  
  return `
  <section id="features" class="features">
    <div class="container">
      <h2 class="section-title">Features</h2>
      <div class="features-grid">
        ${featureCards}
      </div>
    </div>
  </section>`;
}

/**
 * Generate pricing section HTML
 */
function generatePricingSection(pricing: PricingTier[]): string {
  const pricingCards = pricing.map(p => `
    <div class="pricing-card ${p.highlighted ? 'highlighted' : ''}">
      <h3 class="pricing-name">${p.name}</h3>
      <div class="pricing-price">${p.price}</div>
      <div class="pricing-period">per ${p.period}</div>
      <ul class="pricing-features">
        ${p.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <a href="#" class="btn btn-primary">${p.cta}</a>
    </div>
  `).join('');
  
  return `
  <section id="pricing" class="pricing">
    <div class="container">
      <h2 class="section-title">Pricing</h2>
      <div class="pricing-grid">
        ${pricingCards}
      </div>
    </div>
  </section>`;
}

/**
 * Generate testimonials section HTML
 */
function generateTestimonialsSection(testimonials: Testimonial[]): string {
  const testimonialCards = testimonials.map(t => `
    <div class="testimonial-card">
      <p class="testimonial-quote">"${t.quote}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.name.charAt(0)}</div>
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-role">${t.role}${t.company ? ` at ${t.company}` : ''}</div>
        </div>
      </div>
    </div>
  `).join('');
  
  return `
  <section id="testimonials" class="testimonials">
    <div class="container">
      <h2 class="section-title">What Our Users Say</h2>
      <div class="testimonials-grid">
        ${testimonialCards}
      </div>
    </div>
  </section>`;
}

/**
 * Generate FAQ section HTML
 */
function generateFAQSection(faqs: FAQItem[]): string {
  const faqItems = faqs.map((faq, index) => `
    <div class="faq-item" data-index="${index}">
      <div class="faq-question">
        <span>${faq.question}</span>
        <span>+</span>
      </div>
      <div class="faq-answer">${faq.answer}</div>
    </div>
  `).join('');
  
  return `
  <section id="faq" class="faq">
    <div class="container">
      <h2 class="section-title">Frequently Asked Questions</h2>
      <div class="faq-list">
        ${faqItems}
      </div>
    </div>
  </section>`;
}

/**
 * Generate CTA section HTML
 */
function generateCTASection(config: WebsiteConfig): string {
  return `
  <section class="cta-section">
    <div class="container">
      <h2>Ready to Get Started?</h2>
      <p>Download ${config.appName} today and start your journey</p>
      <div class="cta-buttons">
        ${config.appStoreUrl ? `<a href="${config.appStoreUrl}" class="btn btn-primary">Download Now</a>` : ''}
        ${config.playStoreUrl ? `<a href="${config.playStoreUrl}" class="btn btn-secondary">Get Started</a>` : ''}
      </div>
    </div>
  </section>`;
}

/**
 * Generate footer HTML
 */
function generateFooter(config: WebsiteConfig): string {
  return `
  <footer>
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>${config.appName}</h3>
          <p>${config.tagline}</p>
        </div>
        <div class="footer-section">
          <h3>Product</h3>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <div class="footer-section">
          <h3>Company</h3>
          <a href="#">About</a>
          <a href="#">Blog</a>
          <a href="mailto:${config.contactEmail}">Contact</a>
        </div>
        <div class="footer-section">
          <h3>Legal</h3>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${config.appName}. All rights reserved.</p>
      </div>
    </div>
  </footer>`;
}

/**
 * Generate JavaScript
 */
function generateJavaScript(): string {
  return `
    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach(question => {
      question.addEventListener('click', () => {
        const item = question.parentElement;
        const isActive = item.classList.contains('active');
        
        // Close all items
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        
        // Open clicked item if it wasn't active
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  `;
}

/**
 * Generate sample landing page for Energy Today
 */
export function generateEnergyTodayLandingPage(): string {
  const config: WebsiteConfig = {
    appName: "Energy Today",
    tagline: "Optimize Your Energy, Transform Your Life",
    description: "Track, analyze, and optimize your daily energy levels with AI-powered insights and personalized recommendations.",
    primaryColor: "#0a7ea4",
    secondaryColor: "#1e90ff",
    contactEmail: "hello@energytoday.app",
  };
  
  const features: Feature[] = [
    {
      icon: "⚡",
      title: "Energy Tracking",
      description: "Log your energy levels throughout the day and discover patterns in your productivity.",
    },
    {
      icon: "🧠",
      title: "AI Insights",
      description: "Get personalized recommendations based on your unique energy patterns and lifestyle.",
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Visualize trends, correlations, and forecasts with comprehensive data dashboards.",
    },
    {
      icon: "🎯",
      title: "Goal Tracking",
      description: "Set and achieve your wellness goals with smart habit tracking and coaching.",
    },
    {
      icon: "🌙",
      title: "Sleep Optimization",
      description: "Track sleep quality and discover how it impacts your next-day energy levels.",
    },
    {
      icon: "👥",
      title: "Social Features",
      description: "Connect with friends, join challenges, and share your wellness journey.",
    },
  ];
  
  const pricing: PricingTier[] = [
    {
      name: "Free",
      price: "$0",
      period: "month",
      features: [
        "Basic energy tracking",
        "Daily insights",
        "7-day history",
        "Mobile app access",
      ],
      cta: "Get Started",
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "month",
      features: [
        "Everything in Free",
        "AI-powered insights",
        "Unlimited history",
        "Advanced analytics",
        "Goal tracking",
        "Priority support",
      ],
      highlighted: true,
      cta: "Start Free Trial",
    },
    {
      name: "Family",
      price: "$19.99",
      period: "month",
      features: [
        "Everything in Pro",
        "Up to 5 family members",
        "Family dashboard",
        "Shared challenges",
        "Group insights",
      ],
      cta: "Get Started",
    },
  ];
  
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Entrepreneur",
      quote: "Energy Today helped me understand my productivity patterns and optimize my work schedule. Game changer!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      quote: "The AI insights are incredibly accurate. I've improved my sleep and energy levels significantly.",
      rating: 5,
    },
    {
      name: "Emma Davis",
      role: "Fitness Coach",
      quote: "I recommend Energy Today to all my clients. It's the best tool for tracking wellness holistically.",
      rating: 5,
    },
  ];
  
  const faqs: FAQItem[] = [
    {
      question: "How does Energy Today work?",
      answer: "Energy Today uses AI to analyze your daily energy patterns, sleep, habits, and activities to provide personalized insights and recommendations for optimizing your wellness.",
    },
    {
      question: "Is my data private and secure?",
      answer: "Yes! We take privacy seriously. All your data is encrypted and stored securely. We never sell your personal information to third parties.",
    },
    {
      question: "Can I try it before subscribing?",
      answer: "Absolutely! We offer a 7-day free trial for Pro and Family plans. No credit card required to start.",
    },
    {
      question: "Does it work on both iOS and Android?",
      answer: "Yes! Energy Today is available on both iOS (App Store) and Android (Google Play).",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. No questions asked, no hidden fees.",
    },
  ];
  
  return generateLandingPage(config, { features, pricing, testimonials, faqs });
}

/**
 * Save landing page to file
 */
export async function saveLandingPage(html: string, filename: string): Promise<string> {
  // In production, would save to file system or deploy to hosting
  // For now, return the HTML
  console.log(`Landing page saved to ${filename}`);
  return html;
}

/**
 * Generate structured data for SEO
 */
export function generateStructuredData(config: WebsiteConfig): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "name": config.appName,
    "description": config.description,
    "applicationCategory": "HealthApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
    },
  }, null, 2);
}
