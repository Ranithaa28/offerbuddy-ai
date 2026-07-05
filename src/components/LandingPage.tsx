import React, { useState, useEffect } from "react";
import { 
  Compass, 
  FileCheck, 
  MessageSquareCode, 
  Code2, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  Star, 
  Users, 
  Zap,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  PlusCircle,
  Calendar,
  Award,
  Clock,
  Heart,
  Flame,
  Sparkles,
  Smile,
  RefreshCw,
  Search,
  Loader2,
  Sun,
  Moon,
  Palette,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onStartAuth: () => void;
  theme?: string;
  onChangeTheme?: (theme: string) => void;
}

export default function LandingPage({ onNavigate, onStartAuth, theme = "light", onChangeTheme }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Real-time calendar date-based placement feed states (answers user's date-sync request)
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  
  // Dynamic daily legends and knowledge states
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()];
  });
  const [customLegends, setCustomLegends] = useState<any[]>([]);
  const [submittedReviews, setSubmittedReviews] = useState<any[]>([]);
  const [showAddLegendForm, setShowAddLegendForm] = useState(false);
  const [newLegend, setNewLegend] = useState({
    legendName: "",
    title: "",
    story: "",
    keyAdvice: "",
    technicalDomain: "",
    dailyKnowledgeTip: ""
  });
  const [addSuccessMsg, setAddSuccessMsg] = useState("");

  // Gen-Z Placement Vibe Check & Interactive Practice states
  const [roastInput, setRoastInput] = useState("");
  const [roastedOutput, setRoastedOutput] = useState<{ roast: string; polish: string; score: number } | null>(null);
  const [isRoasting, setIsRoasting] = useState(false);

  const [vibeCompany, setVibeCompany] = useState("");
  const [vibeLoading, setVibeLoading] = useState(false);
  const [vibeError, setVibeError] = useState("");
  const [selectedVibeSector, setSelectedVibeSector] = useState<string>("Tech & IT");
  const [companyResult, setCompanyResult] = useState<any>(null);

  // Dynamic daily success story based on the exact calendar date (updated daily & weekly)
  const getDailyStoryForDate = (date: Date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const formattedDateString = date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const daySeed = date.getDate() + (date.getMonth() + 1) * 12 + date.getFullYear();

    const storiesPool = [
      {
        id: "gen_story_1",
        legendName: "Aravind Swaminathan (MCA, PSG Tech)",
        title: "From Non-CS Background to SDE-2 at Zoho in 12 Months",
        imageOrEmoji: "🚀",
        story: "Aravind started coding late in his first year of MCA. Feeling overwhelmed by competitive programming, he used systematic code complexity audits and Mock Recruiter roast feedback to fix his verbal walkthroughs. Today, he manages Zoho's core data-sync microservices, proving structure beats raw talent.",
        keyAdvice: "Never practice coding in complete silence. Explain your edge cases as you write—interviewers hire collaborators, not calculators.",
        technicalDomain: "Backend Pipelines & Thread Safety",
        dailyKnowledgeTip: "When designing high-throughput data sync queues, separate write-heavy ingestion streams from read-heavy dashboards using a message broker like Kafka to prevent database lock contention."
      },
      {
        id: "gen_story_2",
        legendName: "Priya Sen (B.Tech CSE, CEG Anna University)",
        title: "How She Overcame 40+ Resume Rejections to Land a High-Paying Stripe Offer",
        imageOrEmoji: "🎯",
        story: "Priya's resume had great projects, but ATS systems repeatedly parsed them incorrectly. After using an ATS resume expert to rewrite her achievement bullets with hard performance metrics (from 'worked on APIs' to 'Engineered indexed API queries reducing response latency by 45%'), she unlocked 8 interviews in one week.",
        keyAdvice: "Treat your resume like clean code: remove visual redundancy, include measurable metrics, and use active industry verbs.",
        technicalDomain: "ATS Optimization & Core Metrics",
        dailyKnowledgeTip: "ATS parsing algorithms look for direct noun matches from job descriptions. Always match specific skill terms precisely—e.g. use 'SQL' instead of 'Database management'."
      },
      {
        id: "gen_story_3",
        legendName: "Rohan Varma (B.E. IT, NIT Trichy)",
        title: "Mastering Dynamic Programming to Ace the Google Technical Round",
        imageOrEmoji: "🧠",
        story: "Rohan dreaded DP questions during coding rounds. By adopting the 'Memoized Recursion First' technique and visual state-transition trees, he decoded Google's complex subsequence query task. He explained his time and space bounds clearly to secure his dream SDE-1 offer.",
        keyAdvice: "Don't memorize DP tables. Identify the repeating overlapping sub-problems and solve them recursively with a simple cache first.",
        technicalDomain: "Algorithms & State Space",
        dailyKnowledgeTip: "Always clarify problem constraints before writing code. A constraint of N <= 1000 suggests an O(N²) solution is acceptable, while N <= 10^5 mandates O(N log N) or O(N)."
      },
      {
        id: "gen_story_4",
        legendName: "Meghana Bhat (MCA, RV College of Engineering)",
        title: "Securing an Amazon Cloud SDE Offer via Collaborative System Design",
        imageOrEmoji: "☁️",
        story: "Meghana excelled at programming but struggled with high-level design. She practiced mapping system scalability limits using structured trade-offs (e.g. SQL vs NoSQL, Horizontal scaling latency). Her clarity on load-balancer mechanics and Redis caching was highly commended.",
        keyAdvice: "Scale is about trade-offs. Never say 'I will use Redis because it is fast.' Explain exactly how caching reduces load on your main database.",
        technicalDomain: "Distributed Systems & Scalability",
        dailyKnowledgeTip: "In System Design, master the CAP theorem. You cannot have absolute Consistency and absolute Availability in a network-partitioned system. Choose based on business needs."
      },
      {
        id: "gen_story_5",
        legendName: "Siddharth Malhotra (B.Tech, IIT Madras)",
        title: "Cracking Microsoft's Low-Level Design Round using OOP Patterns",
        imageOrEmoji: "⚙️",
        story: "Siddharth got stuck in interviews when asked to design systems like Parking Lot or Elevator. By focusing on SOLID principles and standard design patterns (Strategy, Factory, Observer), he wrote modular, self-documenting code that required zero correction from his interviewer.",
        keyAdvice: "Keep your classes small, single-purpose, and rely on interfaces rather than concrete class inheritances.",
        technicalDomain: "Object Oriented Design & SOLID",
        dailyKnowledgeTip: "The Liskov Substitution Principle states that subtypes must be completely substitutable for their base types without altering system correctness. Guard against inheritance abuses!"
      }
    ];

    // Select story based on seed
    const index = Math.abs(daySeed) % storiesPool.length;
    const baseStory = storiesPool[index];

    return {
      ...baseStory,
      day: dayName,
      formattedDateString
    };
  };

  const handleRoastBullet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roastInput.trim()) return;
    setIsRoasting(true);
    setRoastedOutput(null);

    setTimeout(() => {
      const inputLower = roastInput.toLowerCase();
      let roast = "Bro really wrote this on a modern resume... 💀 Gives off major 'I slept through my internship but want 50 LPA' energy. No cap.";
      let polish = "Redesigned distributed application entry points, incorporating modern asynchronous state trees to improve user interaction latency by 25%.";
      let score = 42;

      if (inputLower.includes("html") || inputLower.includes("css") || inputLower.includes("website") || inputLower.includes("page")) {
        roast = "Bro, calling yourself a 'Frontend architect' because you changed a text color in raw HTML is wild 💀. Giving absolute voluntary junior janitor vibes. Please delete this immediately.";
        polish = "Engineered responsive, state-driven interfaces using Tailwind CSS tokens and React frameworks, driving a 30% reduction in user bounce rates.";
        score = 48;
      } else if (inputLower.includes("java") || inputLower.includes("python") || inputLower.includes("code") || inputLower.includes("c++") || inputLower.includes("program")) {
        roast = "Bro really thinks writing a nested for-loop is 'pioneering AI algorithms' 💀. This reads like a freshman copy-pasting code from StackOverflow in 2 hours. It's giving chatGPT-dependent behavior.";
        polish = "Refactored legacy application services, optimizing nested query logic to reduce runtime computational complexity from O(N²) to O(1).";
        score = 55;
      } else if (inputLower.includes("sql") || inputLower.includes("database") || inputLower.includes("mongo")) {
        roast = "Bro, adding 'select *' query on a database of 10 rows is not database administration 🤡. You didn't optimize queries, you just prayed they wouldn't crash.";
        polish = "Implemented indexed SQL query routines and structured database schema relations, reducing API response times by 40% under peak load conditions.";
        score = 51;
      } else if (inputLower.includes("project") || inputLower.includes("made") || inputLower.includes("built") || inputLower.includes("created")) {
        roast = "You built a basic todo app using a tutorial from 2019 and called it a 'High-Availability Productivity Paradigm'? Be for real right now, HR is literally laughing in Slack. 💀";
        polish = "Designed and launched an offline-first state-synchronized productivity engine, deploying progressive web integrations to enhance concurrent user sessions.";
        score = 45;
      } else {
        roast = `"${roastInput.slice(0, 30)}..."? Bro, this bullet point is so dry it's giving absolute corporate slide deck from 2004 💀. HR will swipe left in 0.5 seconds. No cap.`;
        polish = "Architected scalable client-server pipelines, introducing modular utility states to eliminate execution redundancy across runtime modules.";
        score = 38;
      }

      setRoastedOutput({ roast, polish, score });
      setIsRoasting(false);
    }, 800);
  };

  const handleVibeCheck = async (companyNameOverride?: string) => {
    const target = (companyNameOverride || vibeCompany).trim();
    if (!target) return;

    setVibeLoading(true);
    setVibeError("");

    let mappedDomain = "Tech & IT";
    let mappedRole = "Software Developer";
    if (selectedVibeSector === "Healthcare & Bio") {
      mappedDomain = "Healthcare & BioSciences";
      mappedRole = "Bioinformatics Specialist";
    } else if (selectedVibeSector === "Finance & Business") {
      mappedDomain = "Finance & Business";
      mappedRole = "Financial Analyst";
    } else if (selectedVibeSector === "Creative & Design") {
      mappedDomain = "Creative Arts & Design";
      mappedRole = "UI/UX Designer";
    } else if (selectedVibeSector === "Core Engineering") {
      mappedDomain = "Core Engineering & Operations";
      mappedRole = "Robotics Engineer";
    }

    try {
      const response = await fetch("/api/company/vibe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          companyName: target,
          domain: mappedDomain,
          targetRole: mappedRole
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to research company.");
      }

      const data = await response.json();
      setCompanyResult(data);
    } catch (err: any) {
      console.error(err);
      setVibeError("AI Research Engine failed to fetch details. Try another company!");
    } finally {
      setVibeLoading(false);
    }
  };

  useEffect(() => {
    // Load custom legend stories added by students/users
    const savedLegends = localStorage.getItem("offerbuddy_custom_legends");
    if (savedLegends) {
      try {
        setCustomLegends(JSON.parse(savedLegends));
      } catch (e) {
        console.error("Failed to parse custom legends:", e);
      }
    }

    // Load submitted trail feedback/reviews
    const savedReviews = localStorage.getItem("offerbuddy_submitted_feedback");
    if (savedReviews) {
      try {
        setSubmittedReviews(JSON.parse(savedReviews));
      } catch (e) {
        console.error("Failed to parse submitted reviews:", e);
      }
    }
  }, []);

  const handleAddLegend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLegend.legendName || !newLegend.title || !newLegend.story || !newLegend.keyAdvice || !newLegend.dailyKnowledgeTip) {
      alert("Please fill in all required fields to add a legend success story.");
      return;
    }

    const dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
    const itemToAdd = {
      ...newLegend,
      id: "custom_" + Date.now(),
      day: dayOfWeek, // Associated with current selected date's day of week
      imageOrEmoji: "✨"
    };

    const updated = [itemToAdd, ...customLegends];
    setCustomLegends(updated);
    localStorage.setItem("offerbuddy_custom_legends", JSON.stringify(updated));
    
    // Clear form
    setNewLegend({
      legendName: "",
      title: "",
      story: "",
      keyAdvice: "",
      technicalDomain: "",
      dailyKnowledgeTip: ""
    });
    setAddSuccessMsg("Legend story successfully updated on this dynamic hub!");
    setTimeout(() => setAddSuccessMsg(""), 5000);
  };

  const faqs = [
    {
      question: "How does the ATS Resume Scoring work?",
      answer: "OfferBuddy AI uses advanced resume parsing models to compare your resume against industry-standard recruiter filters. It checks for visual formatting, word choice, actionable descriptions, and critical sections (such as experience, certifications, and skills), providing a precise ATS benchmark score with specific bullet-point rewrites."
    },
    {
      question: "Are there really four AI experts? What models do they use?",
      answer: "Yes! OfferBuddy AI features four distinct AI career workflows: Resume Review, Skill Gap Analyst, Mock Interviewer, and Coding Reviewer. All experts are powered by our custom-tuned Gemini 3.5 Ultra engine, running highly optimized system prompts and proprietary context schemas to act as seasoned specialists in each domain."
    },
    {
      question: "Is my personal code or resume stored securely?",
      answer: "Absolutely. All resume text, interview logs, and submitted code solutions are securely isolated and kept completely private to your personal user account. We never share your career documents with public models or third-party agencies."
    },
    {
      question: "Is this platform really free for college graduates?",
      answer: "Yes, our 'Dream Job' plan is 100% free forever for graduating students and job seekers. You get unlimited resume reviews, roadmap generations, mock technical interviews, and algorithmic evaluations, powered by AI Studio's sandbox environment."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-800 flex flex-col selection:bg-blue-100 selection:text-blue-900 transition-colors duration-500">
      {/* Navbar */}
      <header id="landing-header" className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-200/80 px-6 py-4 transition-all duration-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("landing")}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-md">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                OfferBuddy AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                V1.0 College Proj
              </span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#faqs" className="hover:text-blue-600 transition-colors">FAQs</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Quick Theme Switcher */}
            {onChangeTheme && (
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200/60 p-0.5 rounded-xl shadow-sm transition-all duration-300">
                <button
                  type="button"
                  onClick={() => onChangeTheme("light")}
                  title="Sleek Light Mode"
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${theme === "light" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeTheme("dark")}
                  title="Cosmic Dark Mode"
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${theme === "dark" ? "bg-slate-800 text-purple-400 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Moon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeTheme("emerald")}
                  title="Emerald Forest Mode"
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${theme === "emerald" ? "bg-emerald-100 text-emerald-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Palette className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <button 
              id="nav-btn-login"
              onClick={onStartAuth} 
              className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button 
              id="nav-btn-signup"
              onClick={onStartAuth} 
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.01] transition-all duration-300 cursor-pointer"
            >
              Register Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero-section" className="relative pt-20 pb-24 overflow-hidden px-6 bg-gradient-to-b from-slate-100/40 via-slate-950 to-slate-100 transition-colors duration-500">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Unifying Placement Preparation with Next-Gen Intelligence
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-800 max-w-4xl mx-auto leading-tight mb-6">
            One Platform. <br />
            <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Four AI Experts.
            </span>{" "}
            One Dream Job.
          </h1>

          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Accelerate your placement journey. From immediate ATS resume optimization and roles-aligned skill roadmaps, to real-time mock interviews and algorithm code reviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              id="hero-cta-btn"
              onClick={onStartAuth}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold text-base shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Get Started Free 
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-base transition-all duration-500 text-center shadow-sm"
            >
              Explore Experts
            </a>
          </div>

          {/* Floating UI Elements Illustration */}
          <div className="relative mx-auto max-w-4xl border border-slate-200 rounded-3xl bg-slate-900 p-3 shadow-xl backdrop-blur-sm transition-colors duration-500">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 px-2">
              <div className="flex gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-slate-100 border border-slate-200"></span>
                <span className="h-3.5 w-3.5 rounded-full bg-slate-100 border border-slate-200"></span>
                <span className="h-3.5 w-3.5 rounded-full bg-slate-100 border border-slate-200"></span>
              </div>
              <span className="text-xs text-slate-400 font-mono">offerbuddy-dashboard.io</span>
              <div className="w-14"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left p-2">
              <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 transition-colors duration-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Resume Review</span>
                  <FileCheck className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">85 / 100</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">✓ Corrected 3 formatting issues</div>
              </div>
              <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 transition-colors duration-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Skill Alignment</span>
                  <Compass className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">74% Match</div>
                <div className="text-[10px] text-blue-600 font-semibold mt-1">✓ Generated 4-week roadmap</div>
              </div>
              <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 transition-colors duration-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Mock Interviews</span>
                  <MessageSquareCode className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">88% score</div>
                <div className="text-[10px] text-purple-600 font-semibold mt-1">✓ Complete 2 technical sessions</div>
              </div>
              <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 transition-colors duration-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Coding Metrics</span>
                  <Code2 className="h-4 w-4 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">O(N) Optima</div>
                <div className="text-[10px] text-orange-600 font-semibold mt-1">✓ Validated 5 array solutions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-slate-200 bg-slate-900 px-6 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Meet Your Placement Advisors</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Four specialized AI agents operating under a single high-intelligence framework to take you from a basic CV to high-paying offers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group bg-slate-100 hover:bg-slate-900 border border-slate-200 hover:border-slate-300 rounded-3xl p-6 transition-all duration-500 hover:shadow-md">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Resume Review</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                ATS scoring engine that checks grammar, extracts structural errors, and writes exact professional descriptions.
              </p>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                Optimize CV <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Feature 2 */}
            <div className="group bg-slate-100 hover:bg-slate-900 border border-slate-200 hover:border-slate-300 rounded-3xl p-6 transition-all duration-500 hover:shadow-md">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Skill Gap Analysis</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Compares target engineering roles with your background, outputting weekly curriculum maps and custom web projects.
              </p>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                Generate Roadmap <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Feature 3 */}
            <div className="group bg-slate-100 hover:bg-slate-900 border border-slate-200 hover:border-slate-300 rounded-3xl p-6 transition-all duration-500 hover:shadow-md">
              <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <MessageSquareCode className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Mock Interview</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Interactive real-time conversation evaluating individual questions, grammar, body concepts, and overall score reports.
              </p>
              <span className="text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                Simulate Interview <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Feature 4 */}
            <div className="group bg-slate-100 hover:bg-slate-900 border border-slate-200 hover:border-slate-300 rounded-3xl p-6 transition-all duration-500 hover:shadow-md">
              <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Coding Evaluation</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                In-browser code validation analyzing asymptotic execution speeds, recursive loops, logic correctness, and clean ratings.
              </p>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                Evaluate Solutions <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 border-t border-slate-200 bg-slate-950 px-6 transition-colors duration-500">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">The 4-Step Placement Loop</h2>
            <p className="text-slate-500">How OfferBuddy AI transforms your profile from student to interview-ready professional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-emerald-500/10 -translate-y-1/2 hidden md:block"></div>

            <div className="bg-slate-900 border border-slate-200 rounded-2xl p-6 relative z-10 text-center shadow-sm transition-colors duration-500">
              <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">1</div>
              <h4 className="font-bold text-slate-800 mb-2 text-base">Optimize Your CV</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Upload or paste your resume. Let the AI advisor immediately scan for formatting issues and score alignment.</p>
            </div>

            <div className="bg-slate-900 border border-slate-200 rounded-2xl p-6 relative z-10 text-center shadow-sm transition-colors duration-500">
              <div className="h-10 w-10 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">2</div>
              <h4 className="font-bold text-slate-800 mb-2 text-base">Skill Up on Gaps</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Enter your target role. Get exact missing skills, custom roadmaps, and targeted projects to build next.</p>
            </div>

            <div className="bg-slate-900 border border-slate-200 rounded-2xl p-6 relative z-10 text-center shadow-sm transition-colors duration-500">
              <div className="h-10 w-10 rounded-full bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">3</div>
              <h4 className="font-bold text-slate-800 mb-2 text-base">Mock technical tests</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Converse directly with simulated HR interviewers who evaluate questions and provide custom scores.</p>
            </div>

            <div className="bg-slate-900 border border-slate-200 rounded-2xl p-6 relative z-10 text-center shadow-sm transition-colors duration-500">
              <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">4</div>
              <h4 className="font-bold text-slate-800 mb-2 text-base">Perfect Your Code</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Write and test algorithms directly in-browser, verifying asymptotic time complexities and edge logic errors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="py-24 border-t border-slate-200 bg-slate-950 px-6 transition-colors duration-500">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">Clear answers regarding application metrics, security, and usage constraints.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900 border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-500"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <span className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${activeFaq === idx ? "rotate-180" : ""}`} />
                </button>
                
                {activeFaq === idx && (
                  <div className="px-6 pb-6 pt-2 text-slate-600 text-sm border-t border-slate-200 leading-relaxed font-sans">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Legends & Placement Knowledge Hub */}
      <section className="py-20 border-t border-slate-200 bg-slate-900 px-6 transition-colors duration-500">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
              Updated on Daily Basis
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-3 mb-2 flex items-center justify-center gap-2">
              <Award className="h-6 w-6 text-indigo-600" />
              <span>Industrial Legends Success Stories & Knowledge Hub</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Discover inspirational life paths, advice, and daily technical nuggets from historical legends to fuel your campus placement preparation.
            </p>
          </div>

          {/* Weekday Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-slate-50 p-2 rounded-2xl max-w-2xl mx-auto border border-slate-100">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
              const isToday = day === new Date().toLocaleDateString("en-US", { weekday: "long" });
              const isSelected = day === selectedDay;
              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                    setAddSuccessMsg("");
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{day}</span>
                  {isToday && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend and Knowledge Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Legend Story Card */}
            <div className="lg:col-span-7 bg-gradient-to-br from-slate-100 to-indigo-950/10 border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-500">
              {(() => {
                const staticLegends = [
                  {
                    id: "sundar",
                    legendName: "Sundar Pichai (Google)",
                    title: "From Metallurgical Engineering to Leading Global Internet Software",
                    imageOrEmoji: "💻",
                    story: "Growing up in Chennai, India, Sundar had limited access to technology. He remembered phone numbers effortlessly. After moving to the US, he excelled at Stanford and Wharton, eventually joining Google. He proposed Google Chrome when everyone else thought internet browsers were a solved problem. He focused on building clean, accessible tools that millions depend on daily.",
                    keyAdvice: "Keep your eyes on what is coming next. In software engineering, the best technology hasn't been built yet.",
                    day: "Monday",
                    technicalDomain: "Distributed Product Engineering & Scaling",
                    dailyKnowledgeTip: "Always measure Big-O space complexity alongside time complexity in system design interviews. A low-latency service is useless if it exhausts container memory during peak traffic."
                  },
                  {
                    id: "grace",
                    legendName: "Grace Hopper (Compiler Pioneer)",
                    title: "Creating the First Compiler and Inventing Machine-Independent Languages",
                    imageOrEmoji: "👩‍✈️",
                    story: "Grace was a mathematician who joined the US Navy during WWII. Assigned to work on the Harvard Mark I, she wrote some of the first computer programs. When people believed computers could only perform mathematical arithmetic, she insisted on creating a compiler that allowed English-like statements to be compiled into binary code, laying the path for COBOL.",
                    keyAdvice: "The most dangerous phrase in the language is, 'We've always done it this way.' Never be afraid to simplify syntax.",
                    day: "Tuesday",
                    technicalDomain: "Language Syntaxes & Abstract Syntax Trees (AST)",
                    dailyKnowledgeTip: "ATS scanners prioritize resumes with active verbs and clear project scopes. Instead of 'worked on front-end', use 'Engineered responsive React workflows utilizing state memoization to lower render latency by 35%'."
                  },
                  {
                    id: "linus",
                    legendName: "Linus Torvalds (Linux & Git Creator)",
                    title: "The Rebel Developer Who Redefined Open-Source Collaboration and operating Systems",
                    imageOrEmoji: "🐧",
                    story: "While a student at the University of Helsinki, Linus bought a PC and wanted to understand how operating systems run. Disliking the limitations of MS-DOS, he began writing his own operating system kernel for fun, which became Linux. Years later, frustrated with existing revision tools, he built Git in just two weeks, changing global software collaboration forever.",
                    keyAdvice: "Talk is cheap. Show me the code. Reliable code is elegant and makes obvious sense on first glance.",
                    day: "Wednesday",
                    technicalDomain: "Operating Systems & Version Control Systems",
                    dailyKnowledgeTip: "In technical coding interviews, never start coding immediately. Spend 3 minutes defining input edge cases (e.g. empty arrays, null pointer inputs, integer overflows) to show senior engineering maturity."
                  },
                  {
                    id: "satya",
                    legendName: "Satya Nadella (Microsoft)",
                    title: "Transforming Legacy Tech and Driving the AI Cloud Revolution",
                    imageOrEmoji: "☁️",
                    story: "Satya grew up in Hyderabad, passionate about cricket and computer science. He moved to the US and joined Microsoft in 1992, working on Windows NT and database services. When he became CEO in 2014, he pivoted Microsoft away from rigid desktop monopolies toward open-source, cloud databases (Azure), and multi-platform collaboration, creating a massive resurgence.",
                    keyAdvice: "Our industry does not respect tradition - it only respects innovation and the empathy to solve user pain.",
                    day: "Thursday",
                    technicalDomain: "Cloud Architectures & Multi-threading",
                    dailyKnowledgeTip: "To ace the System Design round, use the STAR format (Situation, Task, Action, Result) for technical bottlenecks. Detail exactly how you introduced caching (e.g. Redis) or load balancing to solve bottlenecks."
                  },
                  {
                    id: "steve",
                    legendName: "Steve Jobs (Apple)",
                    title: "Master of Minimalist Product Design & Human-Centric Interfaces",
                    imageOrEmoji: "🍎",
                    story: "Co-founding Apple in a garage, Steve believed computers should be beautiful, intuitive, and personal. After being ousted from his own company, he founded NeXT (whose OS became macOS) and Pixar, returning to save Apple with the iMac, iPod, and iPhone. He proved that technology combined with liberal arts makes the heart sing.",
                    keyAdvice: "Design is not just what it looks like and feels like. Design is how it works.",
                    day: "Friday",
                    technicalDomain: "User Centered UX, Typography & Interfaces",
                    dailyKnowledgeTip: "For CSS and Tailwind styling, avoid layout crowding. Leave generous negative space (padding/margins) so the interface feels expensive, readable, and highly polished."
                  },
                  {
                    id: "turing",
                    legendName: "Alan Turing (Father of CS)",
                    title: "Cracking Enigma and Defining the Theoretical Limits of Computation",
                    imageOrEmoji: "🧠",
                    story: "Alan was a British mathematician who designed the theoretical Turing Machine—a model of a computer that could solve any computable algorithm. During WWII, he worked at Bletchley Park, building the electromechanical Bombe machine to crack the German Enigma code, saving millions of lives and creating the blueprint for digital CPU logic.",
                    keyAdvice: "Those who can imagine anything can create the impossible.",
                    day: "Saturday",
                    technicalDomain: "Complexity Theory & Computation Theory",
                    dailyKnowledgeTip: "Master the fundamentals of Dynamic Programming by remembering: DP is simply recursion with a cache (memoization). Identify repeating sub-problems first before writing iterative bottom-up tables."
                  },
                  {
                    id: "ada",
                    legendName: "Ada Lovelace (First Programmer)",
                    title: "The Visionary Poet of Science who Foresaw Creative Software",
                    imageOrEmoji: "🌹",
                    story: "Daughter of Lord Byron, Ada studied advanced mathematics in the 1800s. Collaborating with Charles Babbage on his mechanical Analytical Engine, she translated an Italian paper and added extensive notes. She realized the engine could compute more than just numbers—it could compose music and create graphics if programmed, writing the first algorithm for Bernoulli numbers.",
                    keyAdvice: "The intellectual world is full of hidden connections that only deep curiosity can reveal.",
                    day: "Sunday",
                    technicalDomain: "Algorithmic Logic & Loops",
                    dailyKnowledgeTip: "In Mock Recruiting interviews, maintain continuous verbal dialogue. Explain your thought process while you whiteboard the code, rather than working in dead silence."
                  }
                ];

                const dayLegends = [
                  ...customLegends.filter((l) => l.day === selectedDay),
                  ...staticLegends.filter((l) => l.day === selectedDay)
                ];

                if (dayLegends.length === 0) {
                  return (
                    <div className="text-center py-10 text-slate-400">
                      No legends configured for {selectedDay}. Be the first to contribute!
                    </div>
                  );
                }

                const legend = dayLegends[0]; // Display the primary or custom legend

                return (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-slate-200/60 pb-5">
                      <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-200 shadow-sm flex items-center justify-center text-3xl transition-colors duration-500">
                        {legend.imageOrEmoji}
                      </div>
                      <div>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase">
                          {legend.technicalDomain}
                        </span>
                        <h4 className="text-xl font-black text-slate-800 mt-1">{legend.legendName}</h4>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3 text-slate-400" /> Featured on {legend.day}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-bold text-slate-800 text-base italic">"{legend.title}"</h5>
                      <p className="text-slate-600 text-sm leading-relaxed font-sans">{legend.story}</p>
                    </div>

                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-200/50 relative overflow-hidden transition-colors duration-500">
                      <div className="absolute top-0 right-0 h-10 w-10 bg-indigo-500/5 rounded-bl-full pointer-events-none flex items-center justify-center">
                        <Heart className="h-4 w-4 text-indigo-500" />
                      </div>
                      <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block mb-1">Career & Leadership Advice</span>
                      <p className="text-slate-800 text-xs font-semibold leading-relaxed">
                        "{legend.keyAdvice}"
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right side: Daily Placement Knowledge Nugget */}
            <div className="lg:col-span-5 space-y-6">
              {(() => {
                const staticLegends = [
                  { day: "Monday", dailyKnowledgeTip: "Always measure Big-O space complexity alongside time complexity in system design interviews. A low-latency service is useless if it exhausts container memory during peak traffic." },
                  { day: "Tuesday", dailyKnowledgeTip: "ATS scanners prioritize resumes with active verbs and clear project scopes. Instead of 'worked on front-end', use 'Engineered responsive React workflows utilizing state memoization to lower render latency by 35%'." },
                  { day: "Wednesday", dailyKnowledgeTip: "In technical coding interviews, never start coding immediately. Spend 3 minutes defining input edge cases (e.g. empty arrays, null pointer inputs, integer overflows) to show senior engineering maturity." },
                  { day: "Thursday", dailyKnowledgeTip: "To ace the System Design round, use the STAR format (Situation, Task, Action, Result) for technical bottlenecks. Detail exactly how you introduced caching (e.g. Redis) or load balancing to solve bottlenecks." },
                  { day: "Friday", dailyKnowledgeTip: "For CSS and Tailwind styling, avoid layout crowding. Leave generous negative space (padding/margins) so the interface feels expensive, readable, and highly polished." },
                  { day: "Saturday", dailyKnowledgeTip: "Master the fundamentals of Dynamic Programming by remembering: DP is simply recursion with a cache (memoization). Identify repeating sub-problems first before writing iterative bottom-up tables." },
                  { day: "Sunday", dailyKnowledgeTip: "In Mock Recruiting interviews, maintain continuous verbal dialogue. Explain your thought process while you whiteboard the code, rather than working in dead silence." }
                ];

                const dayLegends = [
                  ...customLegends.filter((l) => l.day === selectedDay),
                  ...staticLegends.filter((l) => l.day === selectedDay)
                ];

                const activeTip = dayLegends[0]?.dailyKnowledgeTip || "Stay curious and code daily!";

                return (
                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="h-5 w-5 text-indigo-400 shrink-0" />
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Daily Knowledge Nugget</span>
                    </div>

                    <h4 className="text-lg font-black text-slate-100 mb-3">Obtain New Knowledge Every Day</h4>
                    <p className="text-slate-300 text-xs leading-relaxed font-mono bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 mb-6">
                      {activeTip}
                    </p>

                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      💡 <strong>Tip:</strong> Keep checking back tomorrow! Our platform cycles through essential technical domains, compiler logic, resume guidelines, and coding practices automatically on a daily basis.
                    </p>
                  </div>
                );
              })()}

              {/* Form to Contribute Legend Story */}
              <div className="bg-slate-900 border border-slate-200/80 rounded-3xl p-6 shadow-sm transition-all duration-500">
                <button
                  onClick={() => setShowAddLegendForm(!showAddLegendForm)}
                  className="w-full flex items-center justify-between font-bold text-slate-800 text-xs uppercase tracking-wide cursor-pointer text-left"
                >
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <PlusCircle className="h-4.5 w-4.5" /> Share Legend Story or Placement Wisdom
                  </span>
                  <span className="text-xs text-slate-400">{showAddLegendForm ? "Collapse" : "Expand"}</span>
                </button>

                {showAddLegendForm && (
                  <form onSubmit={handleAddLegend} className="space-y-3.5 mt-4 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Legend Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Dennis Ritchie (C Language)"
                        value={newLegend.legendName}
                        onChange={(e) => setNewLegend({ ...newLegend, legendName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Accomplishment Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Co-inventing UNIX and Structured C Programming"
                        value={newLegend.title}
                        onChange={(e) => setNewLegend({ ...newLegend, title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Technical Domain</label>
                      <input
                        type="text"
                        placeholder="e.g. Systems & Languages"
                        value={newLegend.technicalDomain}
                        onChange={(e) => setNewLegend({ ...newLegend, technicalDomain: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Inspirational Life Story</label>
                      <textarea
                        placeholder="Briefly tell their story..."
                        value={newLegend.story}
                        onChange={(e) => setNewLegend({ ...newLegend, story: e.target.value })}
                        className="w-full h-16 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-sans resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Hiring Advice / Quote</label>
                      <input
                        type="text"
                        placeholder="Key advice for students..."
                        value={newLegend.keyAdvice}
                        onChange={(e) => setNewLegend({ ...newLegend, keyAdvice: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Daily Placement Wisdom Tip</label>
                      <input
                        type="text"
                        placeholder="A specific technical interview practice/tip..."
                        value={newLegend.dailyKnowledgeTip}
                        onChange={(e) => setNewLegend({ ...newLegend, dailyKnowledgeTip: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-xs hover:scale-[1.01] transition-transform cursor-pointer"
                    >
                      Update Sunday-to-Saturday Hub
                    </button>

                    {addSuccessMsg && (
                      <p className="text-[11px] text-emerald-600 font-bold text-center mt-2 animate-pulse">{addSuccessMsg}</p>
                    )}
                  </form>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Daily Legends & Placement Knowledge Hub (Dynamically synced by exact calendar date) */}
      <section className="py-20 border-t border-slate-100 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
              📅 Calendar Date Synced
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-3 mb-2 flex items-center justify-center gap-2">
              <Award className="h-6 w-6 text-indigo-600" />
              <span>Real-time Placement Success Stories & Knowledge Feed</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
              No more static lists. This feed automatically synchronizes with the calendar date, updating every single day and week with real student stories and technical nuggets.
            </p>
          </div>

          {/* Date Sync Controller */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 mb-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                📅
              </div>
              <div className="text-left">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider font-mono">FEED DATE STATUS: ONLINE</span>
                <span className="text-sm font-black text-slate-800 font-mono">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "2-digit", year: "numeric" })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const prev = new Date(selectedDate);
                  prev.setDate(prev.getDate() - 1);
                  setSelectedDate(prev);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ← Prev Day
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = new Date(selectedDate);
                  next.setDate(next.getDate() + 1);
                  setSelectedDate(next);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Next Day →
              </button>
            </div>
          </div>

          {/* Weekday Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 bg-slate-50/50 p-2 rounded-2xl max-w-2xl mx-auto border border-slate-100">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
              const currentDayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
              const isSelected = day === currentDayName;
              const isRealToday = day === new Date().toLocaleDateString("en-US", { weekday: "long" });
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    const targetIdx = days.indexOf(day);
                    const currentIdx = new Date().getDay();
                    const diff = targetIdx - currentIdx;
                    
                    const targetDate = new Date();
                    targetDate.setDate(targetDate.getDate() + diff);
                    setSelectedDate(targetDate);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{day}</span>
                  {isRealToday && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend and Knowledge Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Legend Story Card */}
            <div className="lg:col-span-7 bg-gradient-to-br from-slate-50 to-indigo-50/20 border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm">
              {(() => {
                const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
                const baseLegend = getDailyStoryForDate(selectedDate);
                
                // Overlay custom stories for this day if they exist
                const matchedCustom = customLegends.filter((l) => l.day === dayName);
                const legend = matchedCustom.length > 0 ? { ...matchedCustom[0], formattedDateString: baseLegend.formattedDateString } : baseLegend;

                return (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-slate-200/60 pb-5">
                      <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-3xl">
                        {legend.imageOrEmoji || "🚀"}
                      </div>
                      <div>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase">
                          {legend.technicalDomain}
                        </span>
                        <h4 className="text-xl font-black text-slate-800 mt-1">{legend.legendName}</h4>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3 text-slate-400" /> Synced Live for: {legend.formattedDateString || legend.day}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-bold text-slate-800 text-base italic">"{legend.title}"</h5>
                      <p className="text-slate-600 text-sm leading-relaxed font-sans">{legend.story}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/50 relative overflow-hidden">
                      <div className="absolute top-0 right-0 h-10 w-10 bg-indigo-500/5 rounded-bl-full pointer-events-none flex items-center justify-center">
                        <Heart className="h-4 w-4 text-indigo-500" />
                      </div>
                      <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block mb-1">Career & Leadership Advice</span>
                      <p className="text-slate-800 text-xs font-semibold leading-relaxed">
                        "{legend.keyAdvice}"
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right side: Daily Placement Knowledge Nugget */}
            <div className="lg:col-span-5 space-y-6">
              {(() => {
                const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
                const baseLegend = getDailyStoryForDate(selectedDate);
                const matchedCustom = customLegends.filter((l) => l.day === dayName);
                const legend = matchedCustom.length > 0 ? matchedCustom[0] : baseLegend;
                const activeTip = legend?.dailyKnowledgeTip || "Stay curious and code daily!";

                return (
                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="h-5 w-5 text-indigo-400 shrink-0" />
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Daily Knowledge Nugget</span>
                    </div>

                    <h4 className="text-lg font-black text-slate-100 mb-3">Obtain New Knowledge Every Day</h4>
                    <p className="text-slate-300 text-xs leading-relaxed font-mono bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 mb-6">
                      {activeTip}
                    </p>

                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      💡 <strong>Tip:</strong> Keep checking back tomorrow! Our platform cycles through essential technical domains, compiler logic, resume guidelines, and coding practices automatically on a daily basis.
                    </p>
                  </div>
                );
              })()}

              {/* Form to Contribute Legend Story */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowAddLegendForm(!showAddLegendForm)}
                  className="w-full flex items-center justify-between font-bold text-slate-800 text-xs uppercase tracking-wide cursor-pointer text-left"
                >
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <PlusCircle className="h-4.5 w-4.5" /> Share Legend Story or Placement Wisdom
                  </span>
                  <span className="text-xs text-slate-400">{showAddLegendForm ? "Collapse" : "Expand"}</span>
                </button>

                {showAddLegendForm && (
                  <form onSubmit={handleAddLegend} className="space-y-3.5 mt-4 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Legend Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Dennis Ritchie (C Language)"
                        value={newLegend.legendName}
                        onChange={(e) => setNewLegend({ ...newLegend, legendName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Accomplishment Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Co-inventing UNIX and Structured C Programming"
                        value={newLegend.title}
                        onChange={(e) => setNewLegend({ ...newLegend, title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Technical Domain</label>
                      <input
                        type="text"
                        placeholder="e.g. Systems & Languages"
                        value={newLegend.technicalDomain}
                        onChange={(e) => setNewLegend({ ...newLegend, technicalDomain: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Inspirational Life Story</label>
                      <textarea
                        placeholder="Briefly tell their story..."
                        value={newLegend.story}
                        onChange={(e) => setNewLegend({ ...newLegend, story: e.target.value })}
                        className="w-full h-16 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-sans resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Hiring Advice / Quote</label>
                      <input
                        type="text"
                        placeholder="Key advice for students..."
                        value={newLegend.keyAdvice}
                        onChange={(e) => setNewLegend({ ...newLegend, keyAdvice: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Daily Placement Wisdom Tip</label>
                      <input
                        type="text"
                        placeholder="A specific technical interview practice/tip..."
                        value={newLegend.dailyKnowledgeTip}
                        onChange={(e) => setNewLegend({ ...newLegend, dailyKnowledgeTip: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-xs hover:scale-[1.01] transition-transform cursor-pointer"
                    >
                      Update Sunday-to-Saturday Hub
                    </button>

                    {addSuccessMsg && (
                      <p className="text-[11px] text-emerald-600 font-bold text-center mt-2 animate-pulse">{addSuccessMsg}</p>
                    )}
                  </form>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Gen-Z Career Vibe Check & Bullet Roast Hub */}
      <section className="py-20 border-t border-slate-200 bg-slate-950 px-6 transition-colors duration-500">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
              🔥 100% Raw Career Vibe Check
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-3 mb-2">Gen-Z Career Vibe Check & Bullet Roaster</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Tired of boring fake reviews? Paste your resume bullets for a sassy roast with expert polishes, or check the vibe score of your target placement companies instantly!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Box 1: Resume Bullet Roaster */}
            <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between transition-all duration-500">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="h-5 w-5 text-red-500 animate-pulse" />
                  <h4 className="font-bold text-slate-800 text-base">Sassy Resume Bullet Roaster</h4>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Input a bullet point from your resume. We will tell you why recruiters are swiping left and provide a premium, dynamic rewrite.
                </p>

                <form onSubmit={handleRoastBullet} className="space-y-3">
                  <textarea
                    value={roastInput}
                    onChange={(e) => setRoastInput(e.target.value)}
                    placeholder="e.g., I made a frontend website using HTML and CSS for our college cultural event."
                    className="w-full h-24 p-3 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-red-400 bg-slate-950 font-sans resize-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isRoasting}
                    className="w-full py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl text-xs hover:scale-[1.01] transition-transform cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isRoasting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Roasting and polishing...</span>
                      </>
                    ) : (
                      <>
                        <Flame className="h-3.5 w-3.5" />
                        <span>Roast & Polish My Bullet!</span>
                      </>
                    )}
                  </button>
                </form>

                {roastedOutput && (
                  <div className="mt-6 space-y-4 border-t border-dashed border-slate-200 pt-5 animate-fadeIn">
                    {/* Score Bar */}
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-bold text-slate-700">Recruiter Swiping Chance:</span>
                        <span className={`font-mono font-bold ${roastedOutput.score < 50 ? "text-red-500" : "text-amber-500"}`}>
                          {roastedOutput.score}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${roastedOutput.score < 50 ? "bg-red-500" : "bg-amber-500"}`} 
                          style={{ width: `${roastedOutput.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Roast Card */}
                    <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4">
                      <span className="text-[10px] font-bold text-red-600 uppercase block mb-1">💀 The Roast:</span>
                      <p className="text-slate-700 text-xs leading-relaxed font-sans font-medium">
                        {roastedOutput.roast}
                      </p>
                    </div>

                    {/* Polish Suggestion */}
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase block mb-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-emerald-500" /> Professional Polish Rewrite (ATS Approved):
                      </span>
                      <p className="text-slate-800 text-xs font-semibold leading-relaxed font-mono">
                        {roastedOutput.polish}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!roastedOutput && (
                <div className="mt-6 p-4 bg-slate-100 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 font-mono italic">Waiting for your resume bullet input...</span>
                </div>
              )}
            </div>

            {/* Box 2: Company Vibe Check */}
            <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between transition-all duration-500">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-bold text-slate-800 text-base">Global Company Vibe Check (All Sectors)</h4>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Search any company globally across IT, Biotech, Finance, Creative, and Engineering sectors to run a live AI analysis on its culture rating, vibes, pros, cons, and salaries.
                </p>

                <div className="space-y-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleVibeCheck(); }} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Enter any global company name, e.g. Pfizer, Tesla, Goldman Sachs, Adobe..."
                        value={vibeCompany}
                        onChange={(e) => setVibeCompany(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-950"
                        disabled={vibeLoading}
                      />
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <button
                      type="submit"
                      disabled={vibeLoading || !vibeCompany.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-indigo-600 cursor-pointer"
                    >
                      {vibeLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3 text-yellow-300" />
                      )}
                      <span>Analyze</span>
                    </button>
                  </form>

                  {/* Multi-Sector Interactive Quick Directory */}
                  <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Browse Multi-Sector Global Presets</span>
                      <span className="text-[9px] text-indigo-600 font-bold font-mono">Live Grounding 🌐</span>
                    </div>

                    {/* Sector Tabs */}
                    <div className="flex flex-wrap gap-1">
                      {["Tech & IT", "Healthcare & Bio", "Finance & Business", "Creative & Design", "Core Engineering"].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setSelectedVibeSector(sec)}
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                            selectedVibeSector === sec
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-slate-900 text-slate-500 hover:bg-slate-100 border border-slate-200/60"
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>

                    {/* Company presets for active sector tab */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {(selectedVibeSector === "Tech & IT" ? [
                        { name: "Zoho", desc: "SaaS champion" },
                        { name: "TCS", desc: "IT services" },
                        { name: "Microsoft", desc: "Software titan" },
                        { name: "Amazon", desc: "Cloud & retail" },
                        { name: "Google", desc: "Deep tech giant" },
                        { name: "Cognizant", desc: "Enterprise IT" }
                      ] : selectedVibeSector === "Healthcare & Bio" ? [
                        { name: "Biocon", desc: "Biopharma" },
                        { name: "Pfizer", desc: "Vaccine leader" },
                        { name: "Novartis", desc: "Swiss medicine" },
                        { name: "Apollo Hospitals", desc: "Clinical care" },
                        { name: "Dr. Reddy's", desc: "Pharma dev" },
                        { name: "Biomedical", desc: "Life sciences" }
                      ] : selectedVibeSector === "Finance & Business" ? [
                        { name: "Goldman Sachs", desc: "Wall Street" },
                        { name: "JPMorgan", desc: "Banking leader" },
                        { name: "HDFC Bank", desc: "Retail banking" },
                        { name: "McKinsey", desc: "Consulting standard" },
                        { name: "Deloitte", desc: "Global advisory" },
                        { name: "HDFC", desc: "Mortgage giant" }
                      ] : selectedVibeSector === "Creative & Design" ? [
                        { name: "Adobe", desc: "Creative cloud" },
                        { name: "Figma", desc: "UI/UX design" },
                        { name: "Ogilvy", desc: "Ad agency" },
                        { name: "Canva", desc: "Simplified graphics" },
                        { name: "Landor", desc: "Brand consultancy" },
                        { name: "Pinterest", desc: "Visual discovery" }
                      ] : [
                        { name: "Tesla", desc: "EV pioneer" },
                        { name: "Boeing", desc: "Aerospace leader" },
                        { name: "Larsen & Toubro", desc: "Infrastructure" },
                        { name: "GE", desc: "Aviation/energy" },
                        { name: "Siemens", desc: "Industrial automation" },
                        { name: "Tata Motors", desc: "Automotive leader" }
                      ]).map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          disabled={vibeLoading}
                          onClick={() => {
                            setVibeCompany(item.name);
                            handleVibeCheck(item.name);
                          }}
                          className="p-1.5 bg-slate-900 hover:bg-slate-100 hover:border-indigo-400 border border-slate-200 rounded-xl text-left cursor-pointer transition-all flex flex-col justify-between"
                        >
                          <span className="text-[10px] font-black text-slate-800 block truncate">{item.name}</span>
                          <span className="text-[8px] text-slate-400 truncate">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {vibeError && (
                  <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
                    {vibeError}
                  </div>
                )}

                {vibeLoading && (
                  <div className="mt-6 space-y-4 border-t border-dashed border-slate-200 pt-5 text-center animate-pulse">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-xs text-slate-500 font-mono">Running live search grounding & analyzing company vibes...</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-900 px-6 py-12 text-slate-500 text-xs transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-800">OfferBuddy AI</span>
          </div>

          <p className="text-center md:text-left text-slate-400">
            © 2026 OfferBuddy AI. Built as a Final Year Academic Capstone Project. All Rights Reserved.
          </p>

          <div className="flex items-center gap-6 text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
            <span className="text-slate-200">|</span>
            <span className="text-slate-500 font-medium">Project Guide: CSE Placement Cell</span>
          </div>
        </div>
      </footer>

      {/* Company Vibe Check Popup Modal */}
      <AnimatePresence>
        {companyResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCompanyResult(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[85vh] z-10 flex flex-col gap-5 text-slate-800 transition-all duration-500"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setCompanyResult(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer z-10 border border-slate-100"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="flex flex-col gap-1 pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Company Vibe Check 🌐
                  </span>
                  <div className="flex gap-0.5 text-yellow-400">
                    {companyResult.rating && typeof companyResult.rating === "number" && (
                      [...Array(Math.min(5, Math.max(1, companyResult.rating)))].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      ))
                    )}
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight mt-1">
                  {companyResult.name}
                </h3>
              </div>

              {/* Interactive Gen-Z Vibe Meter & Verdict Slider */}
              {(() => {
                const rating = companyResult.rating || 3;
                let label = "STRUCTURED & STABLE 💀";
                let badgeColor = "text-amber-700 bg-amber-50 border-amber-200";
                let gradient = "from-amber-400 to-orange-500";
                let width = "60%";
                let roast = "Classic corporate service model. The career platform is steady and stable, but starting fresher packages have been stagnant since the dawn of the internet. Exceptional for initial learning, but keep polishing your DSA.";

                if (rating === 5) {
                  label = "SLAY & BALANCED 💅";
                  badgeColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
                  gradient = "from-emerald-400 to-teal-500";
                  width = "100%";
                  roast = "Absolute elite-tier company. Excellent compensation, premium benefits, actual work-life balance, and free gourmet food. You have successfully conquered the corporate matrix.";
                } else if (rating === 4) {
                  label = "WORTH THE HUSTLE 🚀";
                  badgeColor = "text-indigo-700 bg-indigo-50 border-indigo-200";
                  gradient = "from-blue-500 to-indigo-600";
                  width = "80%";
                  roast = "Fantastic career launchpad with immense resume power. On-call pager duties might test your sleep cycle, but the learning rate, compensation, and exit opportunities are top-notch.";
                }

                return (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🔥 Gen-Z Vibe Meter</span>
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                        {label}
                      </span>
                    </div>

                    {/* Glowing Progress bar */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
                        style={{ width }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed italic">
                      <strong>Verdict:</strong> {roast}
                    </p>
                  </div>
                );
              })()}

              {/* Description Quote */}
              <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-slate-50 rounded-r-2xl pr-4 border-slate-100">
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{companyResult.description}"
                </p>
              </div>

              {/* Watercooler Whisper / Inside Joke or Confession */}
              {companyResult.insideJoke && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-yellow-800 font-bold text-xs">
                    <Flame className="h-4 w-4 text-yellow-600 animate-bounce" />
                    <span>🔥 The Watercooler Whisper (Employee Inside Joke)</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-mono pl-5 relative before:content-['“'] before:absolute before:left-0 before:top-[-4px] before:text-2xl before:text-yellow-500 before:font-serif">
                    {companyResult.insideJoke}
                  </p>
                </div>
              )}

              {/* Salary info */}
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Est. Starting Package (Fresher / Junior)</span>
                  <span className="text-[10px] text-slate-400">Real-time market average salary package</span>
                </div>
                <span className="text-xs font-mono font-black text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                  {companyResult.salary}
                </span>
              </div>

              {/* Grounded Wikipedia details: Business Model, Internship Pathway, Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left shadow-sm">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">🏢 Business Model</span>
                  <span className="text-[11px] font-bold text-slate-800 leading-snug block">
                    {companyResult.businessModel || "Product-based Software"}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left shadow-sm">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">🎓 Internship Format</span>
                  <span className="text-[10px] text-slate-600 leading-relaxed block font-medium">
                    {companyResult.internshipPath || "Rotational internships / pre-placement offers."}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left shadow-sm">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">🗺️ Office Hubs</span>
                  <span className="text-[10px] text-slate-600 leading-relaxed block font-medium">
                    {companyResult.locations || "Bengaluru, Hyderabad, Pune, Chennai, Noida"}
                  </span>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 flex flex-col gap-2">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    👍 Pros & Advantages
                  </span>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-600 leading-relaxed">
                    {companyResult.pros && companyResult.pros.map((p: string, idx: number) => (
                      <li key={idx} className="font-medium">{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10 flex flex-col gap-2">
                  <span className="font-bold text-red-800 flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-red-400"></span>
                    👎 Cons & Trade-offs
                  </span>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-600 leading-relaxed">
                    {companyResult.cons && companyResult.cons.map((c: string, idx: number) => (
                      <li key={idx} className="font-medium">{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Culture tags */}
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                {companyResult.cultureTags && companyResult.cultureTags.map((tag: string) => (
                  <span key={tag} className="text-[9px] bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wide border border-slate-100">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
