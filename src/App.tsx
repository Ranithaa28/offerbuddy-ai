import React, { useState, useEffect } from "react";
import { 
  Compass, 
  FileText, 
  MessageSquareCode, 
  Code2, 
  LayoutDashboard, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Info,
  Sun,
  Moon,
  Palette
} from "lucide-react";
import { User, DashboardStats } from "./types";

// Import custom views
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import DashboardView from "./components/DashboardView";
import ResumeReviewView from "./components/ResumeReviewView";
import SkillGapView from "./components/SkillGapView";
import MockInterviewView from "./components/MockInterviewView";
import CodingEvaluationView from "./components/CodingEvaluationView";
import ProfileView from "./components/ProfileView";
import SettingsView from "./components/SettingsView";
import StudentCompanion from "./components/StudentCompanion";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("landing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("offerbuddy_theme") || "light");

  // Stats State initialized with pristine default placement metrics
  const [stats, setStats] = useState<DashboardStats>({
    overallPlacementReadiness: 0,
    resumeScore: 0,
    skillMatchPercentage: 0,
    interviewScore: 0,
    codingScore: 0,
    weeklyImprovement: [
      { week: "Week 1", score: 0 },
      { week: "Week 2", score: 0 },
      { week: "Week 3", score: 0 },
      { week: "Week 4", score: 0 },
    ],
    recommendations: [
      "Upload or paste your resume text to begin scoring ATS parameters.",
      "Analyze your missing skills against a target SDE/Backend role."
    ],
    recentActivities: [],
  });

  // Read session from localStorage on startup
  useEffect(() => {
    const cachedId = localStorage.getItem("offerbuddy_user_id");
    if (cachedId) {
      const cachedName = localStorage.getItem("offerbuddy_user_name") || "Student";
      const cachedEmail = localStorage.getItem("offerbuddy_user_email") || "";
      const cachedRole = localStorage.getItem("offerbuddy_user_role") || "Software Engineer";
      
      const sessionUser: User = {
        id: cachedId,
        email: cachedEmail,
        name: cachedName,
        targetRole: cachedRole,
        createdAt: new Date().toISOString(),
      };
      
      setUser(sessionUser);
      setCurrentTab("dashboard");
    }
  }, []);

  // Fetch telemetry whenever dashboard becomes active
  useEffect(() => {
    if (user && currentTab === "dashboard") {
      fetchDashboardStats();
    }
  }, [user, currentTab]);

  const fetchDashboardStats = async () => {
    if (!user) return;
    setLoadingStats(true);
    try {
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          "Authorization": `Bearer ${user.id}`,
        }
      });
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setStats(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard telemetry:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setCurrentTab("landing");
  };

  const handleResetAll = () => {
    setUser(null);
    setCurrentTab("landing");
  };

  const menuItems = [
    { id: "dashboard", label: "Readiness Stats", icon: LayoutDashboard },
    { id: "resume", label: "ATS Resume Expert", icon: FileText },
    { id: "skill_gap", label: "Skill Gap Analyst", icon: Compass },
    { id: "interview", label: "Mock Recruiter", icon: MessageSquareCode },
    { id: "coding", label: "Code Evaluator", icon: Code2 },
    { id: "profile", label: "Student Profile", icon: UserIcon },
    { id: "settings", label: "Platform Settings", icon: SettingsIcon },
  ];

  // Router dispatcher
  const renderTabContent = () => {
    if (!user) {
      if (currentTab === "auth") {
        return <AuthPage onAuthSuccess={handleAuthSuccess} onNavigateHome={() => setCurrentTab("landing")} />;
      }
      return <LandingPage onNavigate={setCurrentTab} onStartAuth={() => setCurrentTab("auth")} />;
    }

    switch (currentTab) {
      case "dashboard":
        return <DashboardView stats={stats} loading={loadingStats} onNavigate={setCurrentTab} user={user} />;
      case "resume":
        return <ResumeReviewView userId={user.id} user={user} onActivityAdded={fetchDashboardStats} />;
      case "skill_gap":
        return <SkillGapView userId={user.id} onActivityAdded={fetchDashboardStats} />;
      case "interview":
        return <MockInterviewView userId={user.id} onActivityAdded={fetchDashboardStats} />;
      case "coding":
        return <CodingEvaluationView userId={user.id} onActivityAdded={fetchDashboardStats} />;
      case "profile":
        return <ProfileView user={user} onUpdateUser={setUser} />;
      case "settings":
        return (
          <SettingsView 
            userId={user.id} 
            onResetAll={handleResetAll} 
            theme={theme} 
            onChangeTheme={(newTheme) => {
              setTheme(newTheme);
              localStorage.setItem("offerbuddy_theme", newTheme);
            }} 
          />
        );
      default:
        return <DashboardView stats={stats} loading={loadingStats} onNavigate={setCurrentTab} user={user} />;
    }
  };

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("offerbuddy_theme", newTheme);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white theme-${theme} bg-slate-950 text-slate-100 transition-colors duration-300`}>
      {!user ? (
        // Unauthenticated Flow
        <main className="flex-grow">{renderTabContent()}</main>
      ) : (
        // Authenticated Dashboard Layout
        <div className="flex flex-col md:flex-row min-h-screen">
          
          {/* Mobile Navigation Header */}
          <header className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                O
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-800">
                OfferBuddy AI
              </span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </header>

          {/* Sidebar Panel (Desktop & Mobile drawer overlay) */}
          <aside className={`
            fixed md:sticky top-0 left-0 bottom-0 z-40 
            w-64 bg-slate-900 border-r border-slate-800/80 p-5 
            flex flex-col justify-between shrink-0
            transform transition-transform duration-300 md:transform-none
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}>
            <div className="space-y-6">
              {/* Logo */}
              <div className="hidden md:flex flex-col gap-3 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    O
                  </div>
                  <div>
                    <span className="font-bold text-base tracking-tight text-slate-800">
                      OfferBuddy AI
                    </span>
                    <span className="block text-[9px] font-mono font-bold text-blue-600 uppercase">
                      CSE PLACEMENT HUB
                    </span>
                  </div>
                </div>

                {/* Quick Theme Switcher right below the brand name */}
                <div className="mt-1 px-3 py-2 bg-slate-100 border border-slate-200/60 rounded-xl flex items-center justify-between gap-2 shadow-sm">
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Canvas Theme</span>
                  <div className="flex items-center gap-1 bg-slate-200/50 p-0.5 rounded-lg">
                    <button
                      onClick={() => changeTheme("light")}
                      title="Sleek Light Mode"
                      className={`p-1.5 rounded-md cursor-pointer transition-all ${theme === "light" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      <Sun className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => changeTheme("dark")}
                      title="Cosmic Dark Mode"
                      className={`p-1.5 rounded-md cursor-pointer transition-all ${theme === "dark" ? "bg-slate-900 text-purple-400 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      <Moon className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => changeTheme("emerald")}
                      title="Emerald Forest Mode"
                      className={`p-1.5 rounded-md cursor-pointer transition-all ${theme === "emerald" ? "bg-emerald-100 text-emerald-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      <Palette className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide cursor-pointer transition-all
                        ${isActive 
                          ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600 font-bold" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}
                      `}
                    >
                      <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Footer Logout info */}
            <div className="border-t border-slate-800 pt-4 space-y-3.5">
              <div className="flex items-center gap-3 px-1">
                <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                  {user.name ? user.name[0].toUpperCase() : "S"}
                </div>
                <div className="truncate min-w-0">
                  <h5 className="font-bold text-xs text-slate-800 truncate">{user.name}</h5>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">{user.email}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5 text-red-500 shrink-0" />
                <span>Logout Session</span>
              </button>
            </div>
          </aside>

          {/* Backdrop Overlay for mobile drawer */}
          {mobileMenuOpen && (
            <div 
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
            />
          )}

          {/* Primary View Main Scroll Area */}
          <main className="flex-grow p-6 sm:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
            {renderTabContent()}
          </main>

          {/* AI Student Companion floating widget */}
          <StudentCompanion userId={user.id} userName={user.name} userRole={user.targetRole} />

        </div>
      )}
    </div>
  );
}
