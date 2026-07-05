import React, { useState } from "react";
import { 
  FileText, 
  MessageSquareCode, 
  Code2, 
  Compass, 
  ChevronRight, 
  TrendingUp, 
  Calendar, 
  Award,
  AlertCircle,
  Clock,
  Sparkles,
  Flame,
  Trophy,
  Quote,
  RefreshCw,
  Coffee,
  Smile,
  Star,
  CheckCircle2,
  ThumbsUp,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Terminal,
  Check,
  Eye,
  Info,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DashboardStats } from "../types";

interface DashboardViewProps {
  stats: DashboardStats;
  loading: boolean;
  onNavigate: (page: string) => void;
  user: any;
}

export default function DashboardView({ stats, loading, onNavigate, user }: DashboardViewProps) {
  // Read motivational settings from local storage
  const streaksEnabled = localStorage.getItem("offerbuddy_streaks") !== "false";
  const milestonesEnabled = localStorage.getItem("offerbuddy_milestones") !== "false";

  // Scheduled notification & streak states
  const [notificationState, setNotificationState] = useState<{
    logs: any[];
    lastAccessedAt: string;
    daysInactive: number;
    hoursInactive: number;
    streakActive: boolean;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Daily Pulse States & Handlers
  const [dailyTask, setDailyTask] = useState<{
    id: string;
    title: string;
    description: string;
    actionableStep: string;
    duration: string;
    category: string;
    completed: boolean;
    completedAt?: string;
  } | null>(null);
  const [dailyTaskLoading, setDailyTaskLoading] = useState(false);
  const [dailyTaskRefreshing, setDailyTaskRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchDailyTask = React.useCallback(async () => {
    if (!user) return;
    setDailyTaskLoading(true);
    try {
      const response = await fetch("/api/daily-pulse", {
        headers: {
          "Authorization": `Bearer ${user.id}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDailyTask(data);
      }
    } catch (err) {
      console.error("Failed to fetch daily task:", err);
    } finally {
      setDailyTaskLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchDailyTask();
  }, [fetchDailyTask]);

  const handleCompleteTask = async (completed: boolean) => {
    if (!user || !dailyTask) return;
    try {
      setDailyTask(prev => prev ? { ...prev, completed } : null);
      if (completed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
      
      const response = await fetch("/api/daily-pulse/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`,
        },
        body: JSON.stringify({ completed }),
      });
      if (response.ok) {
        const data = await response.json();
        setDailyTask(data.task);
        fetchNotificationLogs();
      }
    } catch (err) {
      console.error("Failed to update daily task status:", err);
    }
  };

  const handleRefreshTask = async () => {
    if (!user) return;
    setDailyTaskRefreshing(true);
    try {
      const response = await fetch("/api/daily-pulse/refresh", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.id}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDailyTask(data);
      }
    } catch (err) {
      console.error("Failed to refresh daily task:", err);
    } finally {
      setDailyTaskRefreshing(false);
    }
  };

  const fetchNotificationLogs = React.useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch("/api/notifications/logs", {
        headers: {
          "Authorization": `Bearer ${user.id}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotificationState(data);
      }
    } catch (err) {
      console.error("Failed to fetch notification logs:", err);
    }
  }, [user]);

  React.useEffect(() => {
    fetchNotificationLogs();
  }, [fetchNotificationLogs]);

  const handleSimulateInactivity = async (days: number) => {
    if (!user) return;
    setIsSimulating(true);
    setSimulationMessage("");
    try {
      const response = await fetch("/api/notifications/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`,
        },
        body: JSON.stringify({ days }),
      });
      if (response.ok) {
        const data = await response.json();
        setNotificationState({
          logs: data.logs,
          lastAccessedAt: data.lastAccessedAt,
          daysInactive: data.daysInactive,
          hoursInactive: Math.floor(data.daysInactive * 24),
          streakActive: data.streakActive
        });
        setSimulationMessage(`Successfully set inactivity to ${days} days and triggered the scheduled task!`);
        setTimeout(() => setSimulationMessage(""), 5000);
      }
    } catch (err) {
      console.error(err);
      setSimulationMessage("Failed to simulate inactivity.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetAccess = async () => {
    if (!user) return;
    setIsSimulating(true);
    setSimulationMessage("");
    try {
      const response = await fetch("/api/notifications/reset-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSimulationMessage("Active streak restored! User access timestamp set to current time.");
        setTimeout(() => setSimulationMessage(""), 5000);
        fetchNotificationLogs();
      }
    } catch (err) {
      console.error(err);
      setSimulationMessage("Failed to reset access.");
    } finally {
      setIsSimulating(false);
    }
  };

  const quotes = [
    { text: "The best way to predict the future is to create it.", author: "Alan Kay" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
    { text: "Your talent determines what you can do. Your motivation determines how much you are willing to do.", author: "Lou Holtz" },
    { text: "Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence.", author: "Helen Keller" },
    { text: "Opportunities don't happen, you create them.", author: "Chris Grosser" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Consistency is what transforms average into excellence.", author: "Anonymous" }
  ];

  const [quoteIdx, setQuoteIdx] = useState(() => {
    return Math.floor(Math.random() * quotes.length);
  });

  const rollQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % quotes.length);
  };

  // Feedback and Trail state variables
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [stars, setStars] = useState(5);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackName, setFeedbackName] = useState(user?.name || "Student");
  const [feedbackRole, setFeedbackRole] = useState(user?.targetRole || "Software Engineer");
  const [feedbackSubmittedSuccessfully, setFeedbackSubmittedSuccessfully] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  // Security Guard and Session Authorization States
  const [mfaEnabled, setMfaEnabled] = useState(() => {
    return localStorage.getItem("offerbuddy_mfa") === "true";
  });
  const [strongPasswordEnabled, setStrongPasswordEnabled] = useState(() => {
    return localStorage.getItem("offerbuddy_strong_password") !== "false";
  });
  const [tokenTimeLeft, setTokenTimeLeft] = useState(2844); // simulated high-fidelity ticking session timer
  const [jwtSignature, setJwtSignature] = useState(() => {
    return "sig_" + Math.random().toString(36).substring(2, 14).toUpperCase() + "_SECURE";
  });
  const [isRotatingToken, setIsRotatingToken] = useState(false);
  const [showTokenRotateSuccess, setShowTokenRotateSuccess] = useState(false);
  const [isJwtPayloadVisible, setIsJwtPayloadVisible] = useState(true);
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState("");

  // Live session token timer ticking
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTokenTimeLeft((prev) => (prev > 1 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMfa = () => {
    const newValue = !mfaEnabled;
    setMfaEnabled(newValue);
    localStorage.setItem("offerbuddy_mfa", newValue ? "true" : "false");
    setSecuritySuccessMsg(newValue 
      ? "MFA Policy Enforced! Your next login will require dynamic academic verification code: 4125." 
      : "MFA Policy Disabled. Account is now secured by single-factor credentials."
    );
    setTimeout(() => setSecuritySuccessMsg(""), 5000);
  };

  const handleToggleStrongPassword = () => {
    const newValue = !strongPasswordEnabled;
    setStrongPasswordEnabled(newValue);
    localStorage.setItem("offerbuddy_strong_password", newValue ? "true" : "false");
    setSecuritySuccessMsg(newValue
      ? "Strong Password policy enforced! registration now validates symbol, case, and complex bounds."
      : "Standard complexity constraint restored."
    );
    setTimeout(() => setSecuritySuccessMsg(""), 5000);
  };

  const handleRotateToken = () => {
    setIsRotatingToken(true);
    setShowTokenRotateSuccess(false);
    setTimeout(() => {
      setJwtSignature("sig_" + Math.random().toString(36).substring(2, 14).toUpperCase() + "_SECURE");
      setTokenTimeLeft(3600);
      setIsRotatingToken(false);
      setShowTokenRotateSuccess(true);
      setTimeout(() => setShowTokenRotateSuccess(false), 3000);
    }, 1200);
  };

  const formatTokenTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const hasResume = stats.resumeScore > 0;
  const hasSkillGap = stats.skillMatchPercentage > 0;
  const hasInterview = stats.interviewScore > 0;
  const hasCoding = stats.codingScore > 0;

  const completedStepsCount = [hasResume, hasSkillGap, hasInterview, hasCoding].filter(Boolean).length;
  const trailProgressPercent = Math.round((completedStepsCount / 4) * 100);

  // Dynamic Security Posture Rating
  let calculatedSecurityScore = 30; // base secure connection
  if (mfaEnabled) calculatedSecurityScore += 35;
  if (strongPasswordEnabled) calculatedSecurityScore += 25;
  if (user?.id) calculatedSecurityScore += 10; // active authenticated session token

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError("");
    if (!feedbackMsg.trim()) {
      setFeedbackError("Please provide a short feedback message about your preparation trail.");
      return;
    }

    const newFeedbackItem = {
      id: "feedback_" + Date.now(),
      name: feedbackName,
      role: feedbackRole,
      stars: stars,
      feedback: feedbackMsg.trim(),
      avatarInitials: feedbackName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "ST",
      date: new Date().toISOString()
    };

    try {
      // Fetch existing submitted feedbacks
      const saved = localStorage.getItem("offerbuddy_submitted_feedback");
      let currentFeedbacks = [];
      if (saved) {
        try {
          currentFeedbacks = JSON.parse(saved);
        } catch (err) {
          console.error(err);
        }
      }

      const updatedFeedbacks = [newFeedbackItem, ...currentFeedbacks];
      localStorage.setItem("offerbuddy_submitted_feedback", JSON.stringify(updatedFeedbacks));
      localStorage.setItem("offerbuddy_trail_completed_feedback", "true");

      setFeedbackSubmittedSuccessfully(true);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSubmittedSuccessfully(false);
        setFeedbackMsg("");
      }, 2500);
    } catch (err) {
      setFeedbackError("Failed to submit feedback. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-900 border border-slate-800 rounded-2xl w-2/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-slate-900 border border-slate-800 rounded-2xl lg:col-span-2"></div>
          <div className="h-96 bg-slate-900 border border-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Determine feedback based on Overall Placement Readiness score
  const getReadinessTier = (score: number) => {
    if (score >= 85) return { label: "Job Ready (Elite)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 65) return { label: "Developing (Good)", color: "text-blue-700 bg-blue-50 border-blue-200" };
    if (score > 0) return { label: "Needs Polish (Early)", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "Incomplete CV", color: "text-slate-500 bg-slate-100 border-slate-200" };
  };

  const tier = getReadinessTier(stats.overallPlacementReadiness);

  // Framer Motion Animation Variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.4, 
        when: "beforeChildren",
        staggerChildren: 0.08 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 15 } }
  };

  return (
    <motion.div 
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header Greeting Card */}
      <motion.div 
        variants={itemVariants}
        className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-slate-100 shadow-sm rounded-3xl p-6 overflow-hidden"
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <Award className="h-32 w-32 text-blue-500/10" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1.5 flex items-center gap-2">
              Hey, {user?.name || "Student"}! <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
            </h1>
            <p className="text-slate-500 text-sm max-w-xl">
              Target Role: <strong className="text-slate-800">{user?.targetRole || "Software Engineer"}</strong>. Your unified placement readiness statistics are computed dynamically below.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {streaksEnabled && (
              <div className="px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-sm animate-pulse">
                <Flame className="h-4 w-4 text-orange-500 animate-bounce" />
                <span>3-Day Consistency Streak!</span>
              </div>
            )}
            <div className={`px-4 py-2 rounded-xl border text-xs font-semibold ${tier.color} text-center shrink-0`}>
              {tier.label}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Placement Preparation Trail Tracker */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-200/60 shadow-sm rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                My Career Route
              </span>
              {localStorage.getItem("offerbuddy_trail_completed_feedback") === "true" && (
                <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Verified Trail Graduate
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-slate-800">My Placement Preparation Trail Checklist</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Complete the 4 preparation tasks to unlock your campus readiness certification and submit your verified student feedback!
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-slate-500">Trail Completion:</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-32 rounded-full bg-slate-100 overflow-hidden border border-slate-200/30">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500" 
                  style={{ width: `${trailProgressPercent}%` }}
                ></div>
              </div>
              <span className="text-xs font-black text-blue-600">{trailProgressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Trail Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-6">
          
          <div 
            onClick={() => onNavigate("resume")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              hasResume 
                ? "bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50/40" 
                : "bg-slate-50/50 border-slate-200/50 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
              hasResume ? "bg-emerald-100 text-emerald-600" : "bg-slate-200/80 text-slate-400"
            }`}>
              <CheckCircle2 className={`h-5 w-5 ${hasResume ? "fill-emerald-100" : ""}`} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800">1. Resume Analysis</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {hasResume ? `Score: ${stats.resumeScore}/100 ✓` : "Scan and benchmark CV"}
              </p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("skills")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              hasSkillGap 
                ? "bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50/40" 
                : "bg-slate-50/50 border-slate-200/50 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
              hasSkillGap ? "bg-emerald-100 text-emerald-600" : "bg-slate-200/80 text-slate-400"
            }`}>
              <CheckCircle2 className={`h-5 w-5 ${hasSkillGap ? "fill-emerald-100" : ""}`} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800">2. Skill Gap Roadmap</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {hasSkillGap ? `Match: ${stats.skillMatchPercentage}% ✓` : "Map technical syllabus"}
              </p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("interview")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              hasInterview 
                ? "bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50/40" 
                : "bg-slate-50/50 border-slate-200/50 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
              hasInterview ? "bg-emerald-100 text-emerald-600" : "bg-slate-200/80 text-slate-400"
            }`}>
              <CheckCircle2 className={`h-5 w-5 ${hasInterview ? "fill-emerald-100" : ""}`} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800">3. Mock Recruiter</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {hasInterview ? `Score: ${stats.interviewScore}/100 ✓` : "Take a chat trial interview"}
              </p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("code-eval")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              hasCoding 
                ? "bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50/40" 
                : "bg-slate-50/50 border-slate-200/50 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
              hasCoding ? "bg-emerald-100 text-emerald-600" : "bg-slate-200/80 text-slate-400"
            }`}>
              <CheckCircle2 className={`h-5 w-5 ${hasCoding ? "fill-emerald-100" : ""}`} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800">4. Code Evaluation</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {hasCoding ? `Score: ${stats.codingScore}/100 ✓` : "Analyze programming logic"}
              </p>
            </div>
          </div>

        </div>

        {/* Trail Bottom Notification Actions */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping shrink-0"></span>
            <p className="text-slate-600 text-xs">
              {completedStepsCount === 4 
                ? "🏆 Spectacular! You have fully finished the placement trail milestones!"
                : `Progress: ${completedStepsCount}/4 steps finished. Finish remaining sections or submit early review below!`
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            {completedStepsCount < 4 && (
              <button 
                onClick={() => {
                  setShowFeedbackModal(true);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                Fast-Track Feedback
              </button>
            )}
            <button
              onClick={() => {
                setShowFeedbackModal(true);
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-[0.98] text-xs font-bold transition-all shadow-md shadow-blue-500/10 shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>Submit Trail Feedback</span>
            </button>
          </div>
        </div>

      </motion.div>

      {/* Stats Cards Section */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* CV Review Score Card */}
        <div 
          onClick={() => onNavigate("resume")}
          className="group bg-white hover:bg-slate-50/50 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resume Score</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800">
                {stats.resumeScore > 0 ? `${stats.resumeScore}%` : "Incomplete"}
              </span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                className="bg-blue-600 h-1.5 rounded-full" 
                initial={{ width: 0 }} 
                animate={{ width: `${stats.resumeScore > 0 ? stats.resumeScore : 0}%` }} 
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} 
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1">
            {stats.resumeScore > 0 ? "✓ Optimized with ATS grammar" : "Click to review resume text"} 
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Skill Gap Match Card */}
        <div 
          onClick={() => onNavigate("skill_gap")}
          className="group bg-white hover:bg-slate-50/50 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skill Match %</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800">
                {stats.skillMatchPercentage > 0 ? `${stats.skillMatchPercentage}%` : "No Data"}
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                className="bg-emerald-500 h-1.5 rounded-full" 
                initial={{ width: 0 }} 
                animate={{ width: `${stats.skillMatchPercentage > 0 ? stats.skillMatchPercentage : 0}%` }} 
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }} 
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1">
            {stats.skillMatchPercentage > 0 ? "✓ Personalized roadmap ready" : "Evaluate target engineering gaps"}
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Mock Interview Score Card */}
        <div 
          onClick={() => onNavigate("interview")}
          className="group bg-white hover:bg-slate-50/50 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interview Score</span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquareCode className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800">
                {stats.interviewScore > 0 ? `${stats.interviewScore}%` : "Not Tested"}
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                className="bg-purple-600 h-1.5 rounded-full" 
                initial={{ width: 0 }} 
                animate={{ width: `${stats.interviewScore > 0 ? stats.interviewScore : 0}%` }} 
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }} 
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1">
            {stats.interviewScore > 0 ? "✓ Evaluated by AI recruiter" : "Start 5-question mock test"}
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Coding Evaluator Card */}
        <div 
          onClick={() => onNavigate("coding")}
          className="group bg-white hover:bg-slate-50/50 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Coding Score</span>
              <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Code2 className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800">
                {stats.codingScore > 0 ? `${stats.codingScore}%` : "No Submissions"}
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                className="bg-orange-500 h-1.5 rounded-full" 
                initial={{ width: 0 }} 
                animate={{ width: `${stats.codingScore > 0 ? stats.codingScore : 0}%` }} 
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }} 
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1">
            {stats.codingScore > 0 ? "✓ Tested logic complexity" : "Submit problem for review"}
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>
      </motion.div>

      {/* Placement Milestones & Achievement Badges */}
      {milestonesEnabled && (
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>Unlocked Placement Badges & Milestones</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Gamified Career Progress</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {/* Badge 1: FAANG Pioneer */}
            <motion.div 
              variants={badgeVariants}
              className="flex flex-col items-center text-center p-4 bg-slate-50 border border-slate-200/50 rounded-2xl"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md relative">
                🚀
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-extrabold">✓</div>
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2.5">FAANG Pioneer</span>
              <span className="text-[9px] text-slate-400 mt-1">Joined Placement Hub</span>
            </motion.div>

            {/* Badge 2: ATS Resume Expert */}
            <motion.div 
              variants={badgeVariants}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border ${
                stats.resumeScore > 0 
                  ? "bg-slate-50 border-slate-200/50" 
                  : "bg-slate-50/40 border-dashed border-slate-200 opacity-60"
              }`}
            >
              <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold shadow-md relative ${
                stats.resumeScore > 0 ? "bg-gradient-to-tr from-blue-400 to-cyan-500 text-white" : "bg-slate-200 text-slate-400 shadow-none"
              }`}>
                📄
                {stats.resumeScore > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-extrabold">✓</div>
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2.5">ATS Champion</span>
              <span className="text-[9px] text-slate-400 mt-1">
                {stats.resumeScore > 0 ? `Optimized (${stats.resumeScore}%)` : "Upload Resume"}
              </span>
            </motion.div>

            {/* Badge 3: Skill Gap Analyst */}
            <motion.div 
              variants={badgeVariants}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border ${
                stats.skillMatchPercentage > 0 
                  ? "bg-slate-50 border-slate-200/50" 
                  : "bg-slate-50/40 border-dashed border-slate-200 opacity-60"
              }`}
            >
              <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold shadow-md relative ${
                stats.skillMatchPercentage > 0 ? "bg-gradient-to-tr from-emerald-400 to-teal-500 text-white" : "bg-slate-200 text-slate-400 shadow-none"
              }`}>
                🧭
                {stats.skillMatchPercentage > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-extrabold">✓</div>
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2.5">Skill Aligned</span>
              <span className="text-[9px] text-slate-400 mt-1">
                {stats.skillMatchPercentage > 0 ? `Map Cleared (${stats.skillMatchPercentage}%)` : "Run Gap Analysis"}
              </span>
            </motion.div>

            {/* Badge 4: Mock Interview Champ */}
            <motion.div 
              variants={badgeVariants}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border ${
                stats.interviewScore > 0 
                  ? "bg-slate-50 border-slate-200/50" 
                  : "bg-slate-50/40 border-dashed border-slate-200 opacity-60"
              }`}
            >
              <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold shadow-md relative ${
                stats.interviewScore > 0 ? "bg-gradient-to-tr from-purple-500 to-pink-500 text-white" : "bg-slate-200 text-slate-400 shadow-none"
              }`}>
                🎤
                {stats.interviewScore > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-extrabold">✓</div>
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2.5">Interview Master</span>
              <span className="text-[9px] text-slate-400 mt-1">
                {stats.interviewScore > 0 ? `Scored (${stats.interviewScore}%)` : "Pass Mock Test"}
              </span>
            </motion.div>

            {/* Badge 5: Elite Algorist */}
            <motion.div 
              variants={badgeVariants}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border ${
                stats.codingScore > 0 
                  ? "bg-slate-50 border-slate-200/50" 
                  : "bg-slate-50/40 border-dashed border-slate-200 opacity-60"
              }`}
            >
              <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold shadow-md relative ${
                stats.codingScore > 0 ? "bg-gradient-to-tr from-orange-400 to-red-500 text-white" : "bg-slate-200 text-slate-400 shadow-none"
              }`}>
                💻
                {stats.codingScore > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-extrabold">✓</div>
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2.5">Algorithm Titan</span>
              <span className="text-[9px] text-slate-400 mt-1">
                {stats.codingScore > 0 ? `Completed (${stats.codingScore}%)` : "Submit Code Logic"}
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Daily Pulse: Actionable Micro-Learning Task Widget */}
      <motion.div
        variants={itemVariants}
        className="relative bg-white border border-slate-100 shadow-sm rounded-3xl p-6 overflow-hidden mb-8"
      >
        {/* Decorative background gradients */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-blue-50/40 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 w-64 h-64 rounded-full bg-violet-50/30 blur-3xl pointer-events-none" />

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Column: Task Header & Context */}
          <div className="flex-1 space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-full px-3 py-1 text-amber-700 text-[11px] font-bold tracking-wider uppercase animate-pulse">
                <Flame className="h-3.5 w-3.5" />
                <span>Daily Pulse</span>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] text-slate-400 font-medium">Bite-sized prep to combat overwhelm</span>
            </div>

            {dailyTaskLoading ? (
              <div className="space-y-2 py-2">
                <div className="h-6 w-2/3 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
              </div>
            ) : dailyTask ? (
              <div className="space-y-1.5">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <h3 className={`font-extrabold text-xl font-sans tracking-tight ${dailyTask.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {dailyTask.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/60 rounded text-[10px] text-slate-500 font-semibold font-mono">
                      ⏱️ {dailyTask.duration}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-600 font-bold font-mono">
                      {dailyTask.category}
                    </span>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed max-w-xl ${dailyTask.completed ? 'text-slate-400' : 'text-slate-500'}`}>
                  {dailyTask.description}
                </p>
              </div>
            ) : (
              <p className="text-slate-500 text-xs">No active daily challenge available. Roll a new task below!</p>
            )}
          </div>

          {/* Middle Section: Actionable Instruction Card */}
          <div className="flex-1 md:max-w-md bg-slate-50/70 border border-slate-100/80 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1.5 block">
              Today's Actionable Step:
            </span>
            {dailyTaskLoading ? (
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-4/5 bg-slate-100 rounded animate-pulse" />
              </div>
            ) : dailyTask ? (
              <p className={`text-xs font-medium leading-relaxed ${dailyTask.completed ? 'text-slate-400 font-normal italic' : 'text-slate-700'}`}>
                {dailyTask.actionableStep}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No challenge details. Click Refresh below to load.</p>
            )}
          </div>

          {/* Right Section: Complete Trigger & Refresh */}
          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-center gap-3 shrink-0">
            {dailyTask ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCompleteTask(!dailyTask.completed)}
                disabled={dailyTaskLoading}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs shadow-xs transition-all duration-300 cursor-pointer ${
                  dailyTask.completed
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-none'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'
                }`}
              >
                {dailyTask.completed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 animate-bounce" />
                    <span>Completed!</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 shrink-0 text-blue-400" />
                    <span>Done for Today</span>
                  </>
                )}
              </motion.button>
            ) : null}

            <button
              onClick={handleRefreshTask}
              disabled={dailyTaskLoading || dailyTaskRefreshing}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-[11px] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 shrink-0 ${dailyTaskRefreshing ? 'animate-spin' : ''}`} />
              <span>{dailyTaskRefreshing ? 'Rolling...' : 'Roll New Task'}</span>
            </button>
          </div>
        </div>

        {/* Confetti Visual Feedback */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50 overflow-hidden">
              {/* Left Burst */}
              <motion.div
                initial={{ x: -100, y: 100, opacity: 1, scale: 0.2 }}
                animate={{ x: [-100, -250, -350], y: [100, -100, 200], scale: [0.2, 1.2, 0.5], opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="absolute text-2xl"
              >
                🎉 ✨ 🌟 🚀 👏
              </motion.div>
              {/* Right Burst */}
              <motion.div
                initial={{ x: 100, y: 100, opacity: 1, scale: 0.2 }}
                animate={{ x: [100, 250, 350], y: [100, -100, 200], scale: [0.2, 1.2, 0.5], opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.1 }}
                className="absolute text-2xl"
              >
                🎓 🌟 ⚡ ✨ 🎈
              </motion.div>
              {/* Top Spray */}
              <motion.div
                initial={{ y: 150, opacity: 1, scale: 0.2 }}
                animate={{ y: [150, -150, -50], x: [0, -50, 50], scale: [0.2, 1.4, 0.8], opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute text-3xl"
              >
                🌟 🏆 🌈 ✨ 🎯
              </motion.div>
              {/* Complete Overlay Message */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-emerald-500/90 backdrop-blur-xs text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md flex items-center gap-2 animate-bounce"
              >
                <Award className="h-4 w-4 shrink-0 text-amber-300 animate-spin" />
                <span>Preparation streak maintained! Keep up the daily pulse!</span>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Stats Graphs & AI Recommendations block */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Section: Progress Graph */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Weekly Readiness Velocity</h3>
              <p className="text-slate-500 text-xs">Tracking cumulative improvements in target roles match</p>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-xs font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Overall: {stats.overallPlacementReadiness}%</span>
            </div>
          </div>

          {/* High-quality Responsive SVG Line Chart */}
          <div className="h-64 flex items-end justify-center relative pt-4 pb-2">
            {stats.overallPlacementReadiness === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl">
                <AlertCircle className="h-10 w-10 text-slate-400 mb-2" />
                <span className="font-semibold text-slate-700 text-sm">No Active Submissions Yet</span>
                <span className="text-[11px] text-slate-400 max-w-xs mt-1">Upload a resume or solve coding problems to begin rendering preparation telemetry.</span>
              </div>
            ) : (
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeDasharray="5,5" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeDasharray="5,5" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeDasharray="5,5" />

                {/* Area under line */}
                <path
                  d={`M 50,150 L 150,${200 - stats.weeklyImprovement[0].score * 1.6} L 250,${200 - stats.weeklyImprovement[1].score * 1.6} L 350,${200 - stats.weeklyImprovement[2].score * 1.6} L 450,${200 - stats.weeklyImprovement[3].score * 1.6} L 450,200 L 50,200 Z`}
                  fill="url(#chart-glow)"
                />

                {/* Line path */}
                <motion.path
                  d={`M 50,150 L 150,${200 - stats.weeklyImprovement[0].score * 1.6} L 250,${200 - stats.weeklyImprovement[1].score * 1.6} L 350,${200 - stats.weeklyImprovement[2].score * 1.6} L 450,${200 - stats.weeklyImprovement[3].score * 1.6}`}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />

                {/* Data point circles & texts */}
                {stats.weeklyImprovement.map((pt, idx) => {
                  const x = 50 + idx * 100 + 100;
                  const y = 200 - pt.score * 1.6;
                  return (
                    <g key={idx}>
                      <motion.circle 
                        cx={x} 
                        cy={y} 
                        r="5" 
                        fill="#ffffff" 
                        stroke="#2563eb" 
                        strokeWidth="2.5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + idx * 0.1, duration: 0.3 }}
                      />
                      <motion.text 
                        x={x} 
                        y={y - 10} 
                        fill="#1e293b" 
                        fontSize="10" 
                        textAnchor="middle" 
                        fontWeight="bold"
                        initial={{ opacity: 0, y: y - 5 }}
                        animate={{ opacity: 1, y: y - 10 }}
                        transition={{ delay: 1.0 + idx * 0.1, duration: 0.3 }}
                      >
                        {pt.score}%
                      </motion.text>
                      <text x={x} y="195" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="semibold">
                        {pt.week}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Right Section: Stacked AI Recommendations & Quote Panel */}
        <div className="space-y-6 flex flex-col">
          {/* AI Recommendations */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col justify-between flex-grow">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span>AI Buddy Insights</span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">Active Advices</span>
              </div>
              
              <div className="space-y-3.5">
                {stats.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/60">
                    <span className="h-5.5 w-5.5 rounded bg-blue-50 text-blue-600 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-slate-600 text-xs leading-relaxed font-sans">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-5 text-center">
              <span className="text-[10px] text-slate-400 font-mono">
                Expert Model: Gemini 3.5 Ultra
              </span>
            </div>
          </div>

          {/* New Interactive: Student Stress Buster & Vibe Check Promo */}
          <div className="relative bg-gradient-to-tr from-purple-50 via-pink-50/30 to-indigo-50 border border-purple-100 shadow-sm rounded-3xl p-6 overflow-hidden">
            <div className="absolute right-3 top-3 opacity-15 pointer-events-none animate-pulse">
              <Sparkles className="h-10 w-10 text-purple-600" />
            </div>
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                  New student Vibe Hack
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                AI Placement Stress Buster ☕
              </h4>
              <p className="text-slate-600 text-[11px] leading-relaxed font-sans">
                Feeling burnt out or anxious? Expand your <strong className="text-purple-700">AI Campus Companion</strong> chat bubble in the bottom right corner of the screen!
              </p>
              
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <div className="p-2 bg-white rounded-xl border border-slate-100 text-center">
                  <span className="block text-base">🎓</span>
                  <span className="text-[9px] font-bold text-slate-600 block mt-0.5">Brody Mode</span>
                  <span className="text-[8px] text-slate-400 block font-medium">Chill & Casual</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-100 text-center">
                  <span className="block text-base">💼</span>
                  <span className="text-[9px] font-bold text-slate-600 block mt-0.5">Roast Mode</span>
                  <span className="text-[8px] text-slate-400 block font-medium">Funny & Honest</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-100 text-center">
                  <span className="block text-base">🔥</span>
                  <span className="text-[9px] font-bold text-slate-600 block mt-0.5">Hype Coach</span>
                  <span className="text-[8px] text-slate-400 block font-medium">Pure Energy</span>
                </div>
              </div>
              
              <p className="text-[10px] text-slate-400 italic text-center pt-1 font-mono">
                ✨ Click the floating chat bubble below to try it!
              </p>
            </div>
          </div>

          {/* Inspirational Tech Prep Quote of the Day */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/40 border border-slate-100 shadow-sm rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 text-purple-200/10 pointer-events-none">
              <Quote className="h-24 w-24 transform rotate-180" />
            </div>

            <div className="flex items-center justify-between mb-3 border-b border-purple-100/30 pb-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <Quote className="h-4 w-4 text-indigo-600" />
                <span>Placement Quote of the Day</span>
              </div>
              <button
                onClick={rollQuote}
                title="Roll a new inspirational advice"
                className="p-1 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-indigo-600 cursor-pointer animate-spin-hover"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3 relative z-10 h-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-x-0"
                >
                  <p className="text-slate-600 text-xs italic font-sans leading-relaxed">
                    "{quotes[quoteIdx].text}"
                  </p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] font-bold text-indigo-700 font-mono">
                      — {quotes[quoteIdx].author}
                    </span>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                      Motivation
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SafeShield Session Authorization & Encryption Guard */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6"
      >
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 fill-blue-50" />
                Crypto Secure Zone
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-bold font-mono">SSL Secure Connection</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Shield className="h-5.5 w-5.5 text-blue-600" />
              <span>SafeShield™ Authentication & Authorization Guard</span>
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xl font-sans">
              Your academic records, mock interview recordings, and code solutions are fully encrypted and protected by standard role-based access tokens.
            </p>
          </div>

          {/* Overall Security Rating Meter */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-sm">
            <div className="relative h-14 w-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                <motion.circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  stroke={calculatedSecurityScore >= 90 ? "#10b981" : calculatedSecurityScore >= 65 ? "#f59e0b" : "#3b82f6"}
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="150"
                  initial={{ strokeDashoffset: 150 }}
                  animate={{ strokeDashoffset: 150 - (150 * calculatedSecurityScore) / 100 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-800 font-mono">{calculatedSecurityScore}%</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-mono block uppercase font-bold">POSTURE STATUS</span>
              <span className={`text-xs font-extrabold block ${
                calculatedSecurityScore >= 90 ? "text-emerald-600" : calculatedSecurityScore >= 65 ? "text-amber-600" : "text-blue-600"
              }`}>
                {calculatedSecurityScore >= 90 ? "🛡️ Military Grade" : calculatedSecurityScore >= 65 ? "🔑 Secure Guard" : "⚡ Standard Protection"}
              </span>
              <span className="text-[10px] text-slate-500 block font-sans">Configured Policies checked</span>
            </div>
          </div>
        </div>

        {/* Global Policy Flash Message */}
        <AnimatePresence>
          {securitySuccessMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-center gap-2.5 text-xs font-sans font-medium"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{securitySuccessMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid: Settings vs. Decoded Payload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Security Policy Configuration */}
          <div className="space-y-5">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Security Access Controls</h4>
            
            <div className="space-y-3.5">
              {/* Policy 1: Strong Password Policy Enforcer */}
              <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-100 rounded-2xl transition-all">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Key className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span>Strong Password Requirement</span>
                      <span className="px-1.5 py-0.5 bg-blue-100/60 text-blue-700 text-[8px] font-bold rounded">Active</span>
                    </h5>
                    <p className="text-slate-400 text-[10px] font-sans leading-relaxed mt-0.5">
                      Forces complex student registrations (special chars, uppercase, 8+ characters). Prevents standard brute-force exploits.
                    </p>
                  </div>
                </div>
                
                {/* Custom Toggle switch */}
                <button 
                  onClick={handleToggleStrongPassword}
                  className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 focus:outline-none ${
                    strongPasswordEnabled ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                    strongPasswordEnabled ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Policy 2: MFA Multi-Factor Authentication */}
              <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-100 rounded-2xl transition-all">
                <div className="flex gap-3 max-w-[80%]">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                    mfaEnabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    <Fingerprint className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span>Multi-Factor Authentication (MFA)</span>
                      {mfaEnabled ? (
                        <span className="px-1.5 py-0.5 bg-emerald-100/60 text-emerald-700 text-[8px] font-bold rounded">Highly Secured</span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-amber-100/60 text-amber-700 text-[8px] font-bold rounded">Optional</span>
                      )}
                    </h5>
                    <p className="text-slate-400 text-[10px] font-sans leading-relaxed mt-0.5">
                      Toggles verification code validation during login attempts. Protects placement history from device handoffs.
                    </p>
                  </div>
                </div>

                {/* Custom Toggle switch */}
                <button 
                  onClick={handleToggleMfa}
                  className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 focus:outline-none ${
                    mfaEnabled ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                    mfaEnabled ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Policy 3: Active connection audit list */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2.5">Active Guard Session Parameters</span>
                <div className="grid grid-cols-2 gap-3 text-[11px] font-sans">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400 font-medium">Session Role</span>
                    <span className="font-bold text-slate-700 font-mono">{user?.targetRole || "Software Engineer"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400 font-medium">RBAC Status</span>
                    <span className="font-bold text-emerald-600 font-mono">AUTHORIZED</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                    <span className="text-slate-400 font-medium">IP Address</span>
                    <span className="font-bold text-slate-700 font-mono">192.168.1.134</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                    <span className="text-slate-400 font-medium">TLS Protocol</span>
                    <span className="font-bold text-slate-700 font-mono">TLS v1.3 AES_GCM</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Authorization Token Viewer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-slate-400" />
                <span>Authorized Bearer Token claims</span>
              </h4>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsJwtPayloadVisible(!isJwtPayloadVisible)}
                  className="px-2 py-1 text-[10px] font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                >
                  {isJwtPayloadVisible ? "Hide Decoded Claims" : "View Decoded Claims"}
                </button>
              </div>
            </div>

            {/* Simulated Live Token block */}
            <div className="bg-slate-900 text-slate-300 border border-slate-800 rounded-2xl overflow-hidden shadow-inner p-4 relative font-mono text-[11px]">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">JWT_SESSION_SIGNATURE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-sans">EXPIRING IN:</span>
                  <span className="px-2 py-0.5 bg-blue-950 border border-blue-900 text-blue-400 text-[10px] font-bold rounded font-mono">
                    {formatTokenTime(tokenTimeLeft)}
                  </span>
                </div>
              </div>

              {/* JWT JSON payload */}
              <AnimatePresence mode="wait">
                {isJwtPayloadVisible ? (
                  <motion.pre 
                    key="payload"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-x-auto text-blue-300 text-[10.5px] leading-relaxed max-h-40 selection:bg-blue-800 selection:text-white"
                  >
                    {JSON.stringify({
                      alg: "HS256",
                      typ: "JWT",
                      iss: "offerbuddy.auth.service",
                      sub: user?.id || "user_anonymous_student",
                      aud: "offerbuddy-placement-client",
                      name: user?.name || "Student Prep",
                      role: user?.targetRole || "Software Engineer",
                      mfa_active: mfaEnabled,
                      client_hash: "HMAC_SHA256_STABLE_VERIFY",
                      claims: [
                        "resume:ats-evaluation",
                        "roadmap:skill-gap-analysis",
                        "mock:ai-interviewer",
                        "code:complexity-audit"
                      ],
                      secure_signature: jwtSignature
                    }, null, 2)}
                  </motion.pre>
                ) : (
                  <motion.div 
                    key="masked"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2"
                  >
                    <Lock className="h-6 w-6 text-slate-600" />
                    <span className="text-[10px]">Claims payload is hidden. Click "View Decoded Claims" to audit.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Notification overlay */}
              <AnimatePresence>
                {showTokenRotateSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-blue-950/95 flex flex-col items-center justify-center text-center p-4 z-10"
                  >
                    <ShieldCheck className="h-8 w-8 text-blue-400 mb-1 animate-bounce" />
                    <span className="font-extrabold text-white text-xs block">JWT Bearer Token Rotated Successfully!</span>
                    <span className="text-[9px] text-blue-300 font-sans max-w-xs leading-relaxed mt-0.5">
                      New dynamic HMAC-SHA256 signature generated. Client access control session headers refreshed.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Token rotation button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1 items-stretch sm:items-center justify-between">
              <span className="text-[10px] text-slate-400 max-w-[70%] font-sans leading-normal">
                🛡️ Rotate your session token to refresh the authorization credentials key on demand. This invalidates old headers.
              </span>
              <button
                onClick={handleRotateToken}
                disabled={isRotatingToken}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.99] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all disabled:opacity-50"
              >
                {isRotatingToken ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Signing Token...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Rotate session Token</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </motion.div>

      {/* Placement Consistency & Scheduled Nudge Center */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-200/60 shadow-sm rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <span className="px-2.5 py-0.5 bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
              ⏱️ Placement consistency engine
            </span>
            <h2 className="text-lg font-black text-slate-800 mt-1">Consistency Streak & Scheduled Reminder logs</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Tracks user activity. If inactive for 3+ days, background cron triggers a mock email reminding you to practice.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {notificationState?.streakActive ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 shrink-0">
                <Flame className="h-4 w-4 text-emerald-500 animate-bounce" />
                <span>Streak Active (Logged-In Today)</span>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5 shrink-0 animate-pulse">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>Streak Broken ({notificationState?.daysInactive} Days Inactive)</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">User Status</span>
              <p className="text-sm font-black text-slate-800 mt-1">
                {user?.name} ({user?.targetRole})
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Last checked: <span className="font-mono">{notificationState?.lastAccessedAt ? new Date(notificationState.lastAccessedAt).toLocaleString() : "Never"}</span>
              </p>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 leading-normal">
              Any progress actions (like uploading resumes, mock interviews) dynamically refreshes your active timestamp.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Background Scheduled Task</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold text-slate-700">Cron Daemon Active (Every 30m)</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Automated check verifies user database to send motivational alerts if inactivity exceeds 72 hours.
              </p>
            </div>
            <p className="text-[10px] text-slate-400 mt-4">
              Checks done: 100% server-side, preserving offline consistency logs.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheduler Simulation Sandbox</span>
              <p className="text-xs text-slate-500 mt-1">
                Test the 3-day scheduled check trigger instantly. Shift your timeline back or restore activity:
              </p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleSimulateInactivity(3.5)}
                  className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-[1.01] transition-transform font-bold text-[11px] rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  {isSimulating ? "Simulating..." : "Simulate 3.5 Days Inactive"}
                </button>
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={handleResetAccess}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-[11px] rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  Reset Active (Reset Access)
                </button>
              </div>
            </div>
            {simulationMessage && (
              <p className="text-[10px] text-indigo-600 font-bold mt-2 animate-pulse">{simulationMessage}</p>
            )}
          </div>
        </div>

        {/* Email Nudges Log */}
        <div className="border-t border-slate-100 pt-5">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-orange-500" />
            <span>Mock Consistency Outbox Email Logs ({notificationState?.logs?.length || 0})</span>
          </h3>

          {!notificationState?.logs || notificationState.logs.length === 0 ? (
            <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No reminders triggered yet. Shift your inactivity back above 3 days in the Sandbox to trigger a mock email.
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {notificationState.logs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div key={log.id} className="border border-slate-200/80 rounded-2xl p-4 hover:border-slate-300 transition-all bg-slate-50/40">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-bold font-mono">
                          EMAIL SENT
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {log.subject}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.sentAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-1.5 font-mono">
                      <span>To: {log.userEmail}</span>
                      <span>•</span>
                      <span>Trigger: Inactive for {log.daysInactive} days</span>
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                      >
                        {isExpanded ? "Hide Email Body" : "View Email Body"}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-4 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                          {log.message}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Activities ledger */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6"
      >
        <h3 className="font-bold text-lg text-slate-800 mb-4">Recent Preparation History</h3>
        
        {stats.recentActivities.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No history recorded. Complete a resume upload, mock interview, or coding evaluation to see logs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider pb-3">
                  <th className="pb-3">Action Type</th>
                  <th className="pb-3">Activity description</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {stats.recentActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-semibold">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full uppercase text-[9px] font-bold ${
                        act.type === "resume" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        act.type === "skill_gap" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        act.type === "interview" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                        "bg-orange-50 text-orange-700 border border-orange-100"
                      }`}>
                        {act.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 leading-normal text-slate-700">{act.description}</td>
                    <td className="py-3.5 text-slate-400 flex items-center gap-1.5 font-mono">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      {new Date(act.date).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3.5 text-right">
                      <button 
                        onClick={() => onNavigate(act.type)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer text-xs font-semibold"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Dynamic Feedback Popup Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFeedbackModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 shadow-xl rounded-3xl w-full max-w-lg overflow-hidden relative z-10 p-6 sm:p-8 pointer-events-auto"
            >
              {feedbackSubmittedSuccessfully ? (
                <div className="py-10 text-center space-y-4">
                  <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm animate-bounce">
                    <CheckCircle2 className="h-8 w-8 fill-emerald-50" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 animate-pulse">Feedback Submitted Successfully!</h3>
                  <p className="text-slate-500 text-xs font-sans max-w-xs mx-auto leading-relaxed">
                    Thank you! Your verified student feedback and review have been synchronized to the Placement Success Stories board!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-bold rounded-full uppercase tracking-wider">
                      Verify Your Experience
                    </span>
                    <h3 className="text-lg font-black text-slate-800 mt-1">Placement Trail Experience Review</h3>
                    <p className="text-slate-500 text-xs mt-0.5 font-sans leading-relaxed">
                      Let other MCA & engineering students know how OfferBuddy's mock recruiter, resume scans, and coding modules helped your preparation trail.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Stars selector */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Your Experience Rating</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((s) => {
                          const isActive = s <= stars;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setStars(s)}
                              className="focus:outline-none cursor-pointer hover:scale-110 transition-transform"
                            >
                              <Star className={`h-6 w-6 ${isActive ? "text-amber-400 fill-amber-400 font-bold" : "text-slate-200"}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Feedback message */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Your Detailed Review</label>
                      <textarea
                        placeholder="Detail exactly which features (like Mock Recruiter Roast Mode or Resume Suggestion) helped you and your current placement progress..."
                        value={feedbackMsg}
                        onChange={(e) => setFeedbackMsg(e.target.value)}
                        className="w-full h-24 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-sans resize-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Your Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Rohan Sharma"
                          value={feedbackName}
                          onChange={(e) => setFeedbackName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      {/* Placed Role */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Placed Role / Target College</label>
                        <input
                          type="text"
                          placeholder="e.g. Placed @ Zoho, Biocon, or HDFC"
                          value={feedbackRole}
                          onChange={(e) => setFeedbackRole(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {feedbackError && (
                    <p className="text-[11px] text-red-600 font-bold text-center">{feedbackError}</p>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackModal(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-xs hover:scale-[1.01] transition-transform cursor-pointer shadow-md shadow-blue-500/10"
                    >
                      Submit Verified Review
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
