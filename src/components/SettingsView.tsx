import React, { useState } from "react";
import { Settings, Shield, Bell, Trash2, Loader2, RefreshCw, Sun, Moon, Palette, Lock, Trophy, Sparkles, Check } from "lucide-react";

interface SettingsViewProps {
  userId: string;
  onResetAll: () => void;
  theme: string;
  onChangeTheme: (theme: string) => void;
}

export default function SettingsView({ userId, onResetAll, theme, onChangeTheme }: SettingsViewProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [profilePublic, setProfilePublic] = useState(false);

  // Advanced Auth Toggles
  const [mfaEnabled, setMfaEnabled] = useState(() => localStorage.getItem("offerbuddy_mfa") === "true");
  const [strongPassword, setStrongPassword] = useState(() => localStorage.getItem("offerbuddy_strong_password") !== "false");

  // Motivation settings
  const [milestonesEnabled, setMilestonesEnabled] = useState(() => localStorage.getItem("offerbuddy_milestones") !== "false");
  const [streaksEnabled, setStreaksEnabled] = useState(() => localStorage.getItem("offerbuddy_streaks") !== "false");

  const toggleMfa = () => {
    const nextVal = !mfaEnabled;
    setMfaEnabled(nextVal);
    localStorage.setItem("offerbuddy_mfa", String(nextVal));
  };

  const toggleStrongPassword = () => {
    const nextVal = !strongPassword;
    setStrongPassword(nextVal);
    localStorage.setItem("offerbuddy_strong_password", String(nextVal));
  };

  const toggleMilestones = () => {
    const nextVal = !milestonesEnabled;
    setMilestonesEnabled(nextVal);
    localStorage.setItem("offerbuddy_milestones", String(nextVal));
  };

  const toggleStreaks = () => {
    const nextVal = !streaksEnabled;
    setStreaksEnabled(nextVal);
    localStorage.setItem("offerbuddy_streaks", String(nextVal));
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear your local testing database? This deletes all resume scans, interview results, roadmaps, and coding sessions. You will be logged out.")) {
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      localStorage.clear();
      onResetAll();
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1.5 flex items-center gap-2">
          Platform Settings <Settings className="h-6 w-6 text-blue-600 animate-spin" style={{ animationDuration: "12s" }} />
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Customize active theme profiles, toggle advanced MFA authentication simulations, configure daily placement motivational triggers, or wipe assessment parameters.
        </p>
      </div>

      {/* Theme and Background Selector Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Palette className="h-4.5 w-4.5 text-blue-600" />
          Interactive Canvas Theme & Background
        </h3>
        <p className="text-slate-500 text-xs leading-normal">
          Toggle between beautiful, high-contrast, eye-safe workspace layouts immediately:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Light Theme Card */}
          <button
            onClick={() => onChangeTheme("light")}
            className={`flex flex-col items-start p-4 rounded-2xl border text-left cursor-pointer transition-all ${
              theme === "light"
                ? "bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/10"
                : "bg-slate-50 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                <Sun className="h-4 w-4" />
              </span>
              {theme === "light" && <Check className="h-4 w-4 text-blue-600" />}
            </div>
            <span className="font-bold text-slate-800 text-xs">Sleek Light</span>
            <span className="text-[10px] text-slate-500 mt-1">Default soft white workspace</span>
          </button>

          {/* Dark Theme Card */}
          <button
            onClick={() => onChangeTheme("dark")}
            className={`flex flex-col items-start p-4 rounded-2xl border text-left cursor-pointer transition-all ${
              theme === "dark"
                ? "bg-slate-900 border-purple-500 ring-2 ring-purple-500/15"
                : "bg-slate-50 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-purple-400 border border-slate-800 shadow-sm">
                <Moon className="h-4 w-4" />
              </span>
              {theme === "dark" && <Check className="h-4 w-4 text-purple-400" />}
            </div>
            <span className="font-bold text-slate-800 text-xs">Cosmic Dark</span>
            <span className="text-[10px] text-slate-500 mt-1">Deep interstellar dark canvas</span>
          </button>

          {/* Emerald Theme Card */}
          <button
            onClick={() => onChangeTheme("emerald")}
            className={`flex flex-col items-start p-4 rounded-2xl border text-left cursor-pointer transition-all ${
              theme === "emerald"
                ? "bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/15"
                : "bg-slate-50 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
                <Palette className="h-4 w-4" />
              </span>
              {theme === "emerald" && <Check className="h-4 w-4 text-emerald-600" />}
            </div>
            <span className="font-bold text-slate-800 text-xs">Emerald Forest</span>
            <span className="text-[10px] text-slate-500 mt-1">Organic soothing green shades</span>
          </button>
        </div>
      </div>

      {/* Advanced Authentication Configuration Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Lock className="h-4.5 w-4.5 text-blue-600" />
          Advanced Authentication & Security
        </h3>

        {/* Row 1: simulated MFA */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1 pr-4">
            <h4 className="font-bold text-slate-800 text-sm">
              Simulated Multi-Factor Auth (MFA)
            </h4>
            <p className="text-slate-500 text-xs leading-normal">
              For high-security university login simulations, prompt for a 4-digit verification code sent to your registered email on next sign-in.
            </p>
          </div>
          <input
            type="checkbox"
            checked={mfaEnabled}
            onChange={toggleMfa}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 bg-slate-50 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Row 2: password strength meter */}
        <div className="flex items-center justify-between pb-2">
          <div className="space-y-1 pr-4">
            <h4 className="font-bold text-slate-800 text-sm">
              Enforce Strong Passwords
            </h4>
            <p className="text-slate-500 text-xs leading-normal">
              Validate that new student password updates contain at least 8 characters, numbers, and custom special symbols, displaying real-time feedback meters.
            </p>
          </div>
          <input
            type="checkbox"
            checked={strongPassword}
            onChange={toggleStrongPassword}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 bg-slate-50 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Motivational Streams Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Trophy className="h-4.5 w-4.5 text-amber-500" />
          Motivation & Milestone Achievements
        </h3>

        {/* Row 1: Daily streaks */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1 pr-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Daily Career Streaks Tracker
            </h4>
            <p className="text-slate-500 text-xs leading-normal">
              Track contiguous preparation days in your main dashboard using interactive flame graphics to boost daily consistency and focus.
            </p>
          </div>
          <input
            type="checkbox"
            checked={streaksEnabled}
            onChange={toggleStreaks}
            className="w-5 h-5 rounded border-slate-300 text-amber-500 bg-slate-50 focus:ring-1 focus:ring-amber-500 cursor-pointer"
          />
        </div>

        {/* Row 2: Celebration popups */}
        <div className="flex items-center justify-between pb-2">
          <div className="space-y-1 pr-4">
            <h4 className="font-bold text-slate-800 text-sm">
              Milestone Badges & Celebration popups
            </h4>
            <p className="text-slate-500 text-xs leading-normal">
              Unlock graphical placement badges (like "ATS Champion" or "Code Wizard") with animations when your telemetry scores cross top thresholds.
            </p>
          </div>
          <input
            type="checkbox"
            checked={milestonesEnabled}
            onChange={toggleMilestones}
            className="w-5 h-5 rounded border-slate-300 text-amber-500 bg-slate-50 focus:ring-1 focus:ring-amber-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Default Alerts Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Row 1: Email Alert */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-blue-600" />
              Placement Email Notifications
            </h4>
            <p className="text-slate-500 text-xs leading-normal">
              Receive notifications on interview feedback and review deadlines.
            </p>
          </div>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={() => setEmailAlerts(!emailAlerts)}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 bg-slate-50 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Row 2: Recruiter Visibility */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-emerald-600" />
              University Recruiter Visibility
            </h4>
            <p className="text-slate-500 text-xs leading-normal">
              Allow matched college recruiters and corporate partners to search and view your optimized ATS resumes.
            </p>
          </div>
          <input
            type="checkbox"
            checked={profilePublic}
            onChange={() => setProfilePublic(!profilePublic)}
            className="w-5 h-5 rounded border-slate-300 text-emerald-600 bg-slate-50 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          />
        </div>

        {/* Danger zone: Clear data */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <h4 className="font-bold text-red-800 text-sm flex items-center gap-2">
              <Trash2 className="h-4.5 w-4.5 text-red-600" />
              College Grade / Reset Simulator
            </h4>
            <p className="text-red-700/80 text-xs leading-normal">
              Use this option to purge the testing database. It deletes the active state representation, logs out the user, and re-primes the system. Extremely useful for testing fresh college preparation submissions.
            </p>
          </div>

          <button
            onClick={handleClearData}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Wiping database...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 text-white animate-pulse" />
                <span>Reset Testing Session & Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
