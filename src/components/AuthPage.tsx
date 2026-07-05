import React, { useState } from "react";
import { Compass, Key, Mail, User as UserIcon, Briefcase, ArrowRight, Loader2, ShieldAlert, Eye, EyeOff, Lock, FileText } from "lucide-react";
import { User } from "../types";
import { SECTOR_ROLES, DEFAULT_SKILLS_FOR_DOMAINS } from "./ProfileView";

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  onNavigateHome: () => void;
}

export default function AuthPage({ onAuthSuccess, onNavigateHome }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("Tech & IT");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Advanced Auth UX
  const [showPassword, setShowPassword] = useState(false);
  
  // Simulated MFA Step
  const [showOtpPrompt, setShowOtpPrompt] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingUser, setPendingUser] = useState<any>(null);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "None", color: "bg-slate-200", textColor: "text-slate-400" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: "Weak ⚠️", color: "bg-red-500", textColor: "text-red-500" };
    if (score <= 4) return { score, label: "Good 👍", color: "bg-amber-500", textColor: "text-amber-500" };
    return { score, label: "Strong 💪", color: "bg-emerald-500", textColor: "text-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const completeSignIn = (u: User) => {
    localStorage.setItem("offerbuddy_user_id", u.id);
    localStorage.setItem("offerbuddy_user_name", u.name);
    localStorage.setItem("offerbuddy_user_email", u.email);
    localStorage.setItem("offerbuddy_user_role", u.targetRole || "");
    localStorage.setItem("offerbuddy_user_domain", u.domain || "Tech & IT");
    if (bio) {
      localStorage.setItem("offerbuddy_user_bio", bio);
    }
    // Set dynamic default skills for the chosen domain
    const chosenDomain = u.domain || "Tech & IT";
    const defaultSkills = DEFAULT_SKILLS_FOR_DOMAINS[chosenDomain] || [];
    localStorage.setItem("offerbuddy_skills_list", JSON.stringify(defaultSkills));

    onAuthSuccess(u);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    // If Strong password rule is requested by settings, check strength
    const enforceStrong = localStorage.getItem("offerbuddy_strong_password") !== "false";
    if (!isLogin && enforceStrong && strength.score <= 2) {
      setError("Security Rule: A stronger password is required. Please include symbols, uppercase, and at least 8 characters.");
      setLoading(false);
      return;
    }

    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin 
      ? { email, password } 
      : { email, password, name, targetRole, domain };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Authentication failed with status ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (!isLogin) {
        // Successful registration: Redirect to login page
        setIsLogin(true);
        setPassword("");
        setSuccessMessage("Account created successfully! Your placement companion is ready. Please log in using your new credentials.");
        setError("");
        setLoading(false);
        return;
      }

      // Check if simulated MFA is enabled
      const mfaEnabled = localStorage.getItem("offerbuddy_mfa") === "true";
      if (mfaEnabled) {
        setPendingUser(data.user);
        setShowOtpPrompt(true);
        setLoading(false);
        return; // Pause completion until OTP code input
      }

      completeSignIn(data.user);
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An unexpected issue occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otpCode.trim() !== "4125") {
      setError("Verification code incorrect. For demo purposes, please use the code: 4125");
      return;
    }
    if (pendingUser) {
      completeSignIn(pendingUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-slate-800 flex flex-col justify-center items-center px-6 relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Top logo */}
      <div className="flex items-center gap-3 mb-8 cursor-pointer relative z-10" onClick={onNavigateHome}>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-md">
          <Compass className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-slate-800">
          OfferBuddy AI
        </span>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl relative z-10">
        
        {/* Render Multi-Factor Challenge Screen */}
        {showOtpPrompt ? (
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-flex h-12 w-12 rounded-full bg-blue-50 text-blue-600 items-center justify-center mb-3">
                <Lock className="h-6 w-6 animate-pulse" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-800 mb-1">Security Check Required</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                Simulation Multi-Factor Authentication is active. Enter the 4-digit verification code sent to your academic device.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-700 text-xs leading-relaxed">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 text-center">
                  MFA Code (Demo: <strong className="text-blue-600">4125</strong>)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 4125"
                  className="w-full text-center py-3.5 tracking-[1em] text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:tracking-normal placeholder:text-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Verify & Unlock</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => {
                  setShowOtpPrompt(false);
                  setPendingUser(null);
                  setError("");
                }}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium underline"
              >
                Go back to credentials
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
              {isLogin ? "Welcome Back Student" : "Create Placement Account"}
            </h2>
            <p className="text-slate-400 text-xs text-center mb-6 leading-relaxed">
              {isLogin 
                ? "Sign in to resume resume reviews, roadmaps, and mock interviews" 
                : "Register to unlock professional ATS resume evaluations and DSA coding tests"}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs leading-relaxed">
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-700 text-xs leading-relaxed">
                <div className="h-5 w-5 shrink-0 text-emerald-500 font-bold flex items-center justify-center">✓</div>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Priyan Sharma"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                   {/* Career Domain Selector */}
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                       Career Domain Sector
                     </label>
                     <div className="relative">
                       <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                       <select
                         value={domain}
                         onChange={(e) => {
                           const selectedDomain = e.target.value;
                           setDomain(selectedDomain);
                           const roles = SECTOR_ROLES[selectedDomain] || [];
                           if (roles.length > 0) {
                             setTargetRole(roles[0]);
                           }
                         }}
                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer focus:outline-none"
                       >
                         {Object.keys(SECTOR_ROLES).map((sector) => (
                           <option key={sector} value={sector}>{sector}</option>
                         ))}
                       </select>
                     </div>
                   </div>

                   {/* Target Role Selector */}
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                       Target Job Role
                     </label>
                     <div className="relative">
                       <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                       <select
                         value={targetRole}
                         onChange={(e) => setTargetRole(e.target.value)}
                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer focus:outline-none"
                       >
                         {(SECTOR_ROLES[domain] || []).map((role) => (
                           <option key={role} value={role}>{role}</option>
                         ))}
                       </select>
                     </div>
                   </div>

                  {/* Career Bio field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Short Career Bio (Optional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="e.g. Final year B.Tech student aiming for Frontend roles with solid React skills."
                        rows={2}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password field with Visibility Toggler & Strength Meter */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>Password</span>
                  {!isLogin && password && (
                    <span className={`text-[10px] font-bold ${strength.textColor}`}>
                      Strength: {strength.label}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Real-time Strength Meter bar */}
                {!isLogin && password && (
                  <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:scale-[1.01] hover:shadow-lg hover:shadow-emerald-500/10 transition-all font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Register Now"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center text-xs text-slate-400">
              {isLogin ? "First time preparing here?" : "Already registered?"} {" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccessMessage("");
                }}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                {isLogin ? "Create student account" : "Login instead"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
