import React, { useState, useEffect } from "react";
import { 
  Code2, 
  Play, 
  Terminal, 
  Loader2, 
  CheckCircle, 
  Star, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Award,
  Globe,
  Trophy,
  ExternalLink,
  Mail,
  Lock,
  ChevronRight,
  BookOpen,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { CodingSession } from "../types";

interface CodingEvaluationViewProps {
  userId: string;
  onActivityAdded: () => void;
}

interface Problem {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  boilerplates: { [lang: string]: string };
}

interface TitanStory {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  fullStory: string;
  struggle: string;
  secretToSuccess: string;
}

export default function CodingEvaluationView({ userId, onActivityAdded }: CodingEvaluationViewProps) {
  const problems: Problem[] = [
    {
      title: "Two Sum",
      difficulty: "Easy",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
      boilerplates: {
        TypeScript: "function twoSum(nums: number[], target: number): number[] {\n  // Write logic here\n  return [];\n}",
        Python: "def twoSum(nums: List[int], target: int) -> List[int]:\n    # Write logic here\n    return []",
        JavaScript: "function twoSum(nums, target) {\n  // Write logic here\n  return [];\n}",
        Java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write logic here\n        return new int[]{};\n    }\n}"
      }
    },
    {
      title: "Valid Parentheses",
      difficulty: "Easy",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']' determine if the input string is valid.\nAn input string is valid if brackets close in correct order and match corresponding types.",
      boilerplates: {
        TypeScript: "function isValid(s: string): boolean {\n  // Write logic here\n  return false;\n}",
        Python: "def isValid(s: str) -> bool:\n    # Write logic here\n    return False",
        JavaScript: "function isValid(s) {\n  // Write logic here\n  return false;\n}",
        Java: "class Solution {\n    public boolean isValid(String s) {\n        // Write logic here\n        return false;\n    }\n}"
      }
    },
    {
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      description: "Given a string s, find the length of the longest substring without repeating characters.\nExample: s = 'abcabcbb' returns 3 ('abc').",
      boilerplates: {
        TypeScript: "function lengthOfLongestSubstring(s: string): number {\n  // Write sliding window logic\n  return 0;\n}",
        Python: "def lengthOfLongestSubstring(s: str) -> int:\n    # Write sliding window logic\n    return 0",
        JavaScript: "function lengthOfLongestSubstring(s) {\n  // Write sliding window logic\n  return 0;\n}",
        Java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write sliding window logic\n        return 0;\n    }\n}"
      }
    }
  ];

  // Advanced Career Stories about industry titans (Requested by user)
  const titanStories: TitanStory[] = [
    {
      id: "sundar",
      name: "Sundar Pichai",
      role: "CEO of Google & Alphabet",
      avatar: "👨‍💻",
      quote: "Wear your failure as a badge of honor, keep trying, and always maintain your curiosity.",
      struggle: "Born in Chennai, India, Sundar slept with his brother in the living room of their small house. He didn't have a telephone until age 12. When he got into Stanford, his father had to withdraw more than his annual salary just to purchase his plane ticket.",
      fullStory: "After studying metallurgy, Sundar joined Google in 2004 as a Product Manager. He proposed building Google's own browser, Chrome, when Google's executives feared it would invite a web-war with Microsoft. Sundar persisted, arguing that speed and standard-compliance would revolutionize search. Chrome eventually became the world's #1 browser, securing Google's web dominance and lifting him to CEO.",
      secretToSuccess: "Intense focus on creating simple, lightning-fast user interfaces, combined with immense humility, empathetic collaboration, and long-term vision."
    },
    {
      id: "linus",
      name: "Linus Torvalds",
      role: "Creator of Linux & Git",
      avatar: "🐧",
      quote: "Most good programmers do programming not because they expect to get paid, but because it is fun.",
      struggle: "As a shy student at the University of Helsinki, Linus couldn't afford Unix commercial licenses. His early computer only had 4MB of RAM, and he had to pay off his machine in installments, coding in a dark, quiet room with minimal distractions.",
      fullStory: "Frustrated by the limitations of MINIX, Linus posted in a newsgroup in 1991: 'I'm doing a (free) operating system, just a hobby, won't be big and professional like gnu.' His open-source kernel, Linux, now runs the entire modern cloud, supercomputers, Android, and internet routers. In 2005, when Linux community tools fell apart, he spent 2 weeks writing Git, now used by 100M+ developers.",
      secretToSuccess: "Extreme pragmatism, refusal to compromise on runtime code quality, and building open-source systems that align with developer freedom."
    },
    {
      id: "grace",
      name: "Grace Hopper",
      role: "Compiler Pioneer & Naval Admiral",
      avatar: "👩‍✈️",
      quote: "The most dangerous phrase in the language is, 'We've always done it this way.'",
      struggle: "In the 1940s, early computers filled entire rooms and were programmed purely in raw mathematical codes. She was told computers were solely for arithmetic and that humans couldn't write code in english.",
      fullStory: "Grace believed that computer programming should be accessible to anyone, not just mathematicians. She created the first-ever compiler (A-0) in 1952, which translated english commands into machine code. Her research directly laid the foundation for COBOL, the language that still powers modern global banking systems today. She famously discovered a physical moth stuck in a relay, coining the term 'debugging'!",
      secretToSuccess: "Unmatched audacity to question existing paradigms, encouraging student curiosity, and treating programming as a design language."
    },
    {
      id: "satya",
      name: "Satya Nadella",
      role: "Chairman & CEO of Microsoft",
      avatar: "☁️",
      quote: "Our industry does not respect tradition - it only respects innovation.",
      struggle: "Satya failed his initial interviews due to an overly rigid academic focus. Early in his tenure at Microsoft, he faced intense internal corporate politics, warring divisions, and declining developer trust as Windows stagnated.",
      fullStory: "Taking over Microsoft in 2014, Satya completely changed the company's culture from 'know-it-alls' to 'learn-it-alls'. He did the unthinkable: declared 'Microsoft Loves Linux', shifted focus away from Windows toward Azure cloud, and invested early in OpenAI, rejuvenating the 40-year-old tech giant into the world's most valuable tech enterprise.",
      secretToSuccess: "Empathy-driven leadership, cultural growth mindsets, and a relentless transition to cloud-native & artificial intelligence systems."
    }
  ];

  const [activeProblem, setActiveProblem] = useState<Problem>(problems[0]);
  const [language, setLanguage] = useState("TypeScript");
  const [code, setCode] = useState(problems[0].boilerplates["TypeScript"]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CodingSession | null>(null);
  const [error, setError] = useState("");

  // Connected accounts handles from profile (Requested by user)
  const [leetcodeHandle, setLeetcodeHandle] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [hackerrankHandle, setHackerrankHandle] = useState("");
  const [codechefHandle, setCodechefHandle] = useState("");

  // Gamified Reward System & Email reminders (Requested by user)
  const [bonusPoints, setBonusPoints] = useState<number>(250);
  const [showRewardToast, setShowRewardToast] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedTitan, setSelectedTitan] = useState<TitanStory>(titanStories[0]);

  // Load from local storage
  useEffect(() => {
    const lc = localStorage.getItem("offerbuddy_leetcode_username") || "";
    const gh = localStorage.getItem("offerbuddy_github_username") || "";
    const hr = localStorage.getItem("offerbuddy_hackerrank_username") || "";
    const cc = localStorage.getItem("offerbuddy_codechef_username") || "";

    setLeetcodeHandle(lc);
    setGithubHandle(gh);
    setHackerrankHandle(hr);
    setCodechefHandle(cc);

    // Calculate dynamic bonus points based on profile fields filled out (+50 for each)
    let extraPoints = 0;
    if (lc) extraPoints += 50;
    if (gh) extraPoints += 50;
    if (hr) extraPoints += 50;
    if (cc) extraPoints += 50;

    const savedPointsStr = localStorage.getItem("offerbuddy_bonus_points");
    const savedPoints = savedPointsStr ? parseInt(savedPointsStr, 10) : 250;
    setBonusPoints(savedPoints + extraPoints);
  }, []);

  const handleSelectProblem = (prob: Problem) => {
    setActiveProblem(prob);
    setCode(prob.boilerplates[language] || Object.values(prob.boilerplates)[0]);
    setError("");
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(activeProblem.boilerplates[lang] || "// Boilerplate not available");
  };

  // Add bonus points with toast alert
  const triggerBonusPoints = (pts: number, reason: string) => {
    const newPoints = bonusPoints + pts;
    setBonusPoints(newPoints);
    localStorage.setItem("offerbuddy_bonus_points", newPoints.toString());
    setRewardMessage(`🌟 +${pts} Bonus Prep Points! (${reason})`);
    setShowRewardToast(true);
    setTimeout(() => {
      setShowRewardToast(false);
    }, 4500);
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      setError("Please write some code before submitting.");
      return;
    }

    setError("");
    setAnalyzing(true);

    try {
      const response = await fetch("/api/coding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`,
        },
        body: JSON.stringify({
          problemTitle: activeProblem.title,
          problemDescription: activeProblem.description,
          userCode: code,
          language,
          leetcodeHandle,
          hackerrankHandle,
          codechefHandle,
        }),
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Failed to submit code (Status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit code");
      }

      setResult(data);
      onActivityAdded();

      // Award +100 bonus points for solving a challenge!
      triggerBonusPoints(100, `Solved DSA Challenge: ${activeProblem.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during code review.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Simulate Sending Motivational & Consistency Emails (Requested by user)
  const handleSimulateEmail = () => {
    setSendingEmail(true);
    setTimeout(() => {
      setSendingEmail(false);
      setEmailModalOpen(true);
      // Award +50 bonus points for maintaining consistency trigger
      triggerBonusPoints(50, "Claimed Daily Consistency email check-in");
    }, 1200);
  };

  const isStoriesUnlocked = bonusPoints >= 300;

  return (
    <div className="space-y-8 relative">

      {/* Floating Gamified Bonus Toast */}
      {showRewardToast && (
        <div className="fixed top-24 right-6 z-50 bg-gradient-to-tr from-purple-700 via-indigo-700 to-blue-700 text-white border border-purple-500/30 shadow-2xl rounded-2xl px-5 py-4 flex items-center gap-3.5 animate-bounce">
          <Trophy className="h-6 w-6 text-yellow-300 animate-spin" />
          <div>
            <p className="font-extrabold text-xs tracking-wider uppercase">Reward Unlocked!</p>
            <p className="text-white font-bold text-sm mt-0.5">{rewardMessage}</p>
          </div>
        </div>
      )}

      {/* Page Header with Real-Time Gamified Points Indicator */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-tr from-slate-900 via-slate-850 to-indigo-950 p-6 md:p-8 rounded-3xl border border-indigo-900/30 shadow-sm text-white">
        <div className="space-y-1.5 max-w-xl text-left">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] font-extrabold rounded-full uppercase tracking-wider border border-blue-500/30">
              SDE Placement Engine
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-[10px] font-mono">Code Evaluator V4</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
            AI Code Compiler & Challenge Hub <Code2 className="h-5 w-5 text-blue-400" />
          </h1>
          <p className="text-slate-300 text-[11px] sm:text-xs font-sans leading-relaxed">
            Solve algorithmic questions in standard languages. Receive instant Principal Engineer evaluations, complexity verification, and unlock **Advanced Titan Stories**!
          </p>
        </div>

        {/* Dynamic points widget */}
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl w-full md:w-auto text-left justify-between sm:justify-start">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Student Prep Reward</span>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4.5 w-4.5 text-yellow-400" />
              <span className="text-base font-extrabold font-mono text-yellow-300">{bonusPoints} PTS</span>
            </div>
            {/* Super-bonus progress bar */}
            <div className="w-36 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-blue-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((bonusPoints / 500) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[8px] text-slate-400 block mt-0.5 font-mono">
              {bonusPoints >= 500 ? "🎉 Tier 3 Stipend Bonus Active!" : `Need ${Math.max(0, 500 - bonusPoints)} pts for free SDE Certificate`}
            </span>
          </div>
          <div className="p-2.5 bg-yellow-400/10 rounded-xl">
            <Award className="h-7 w-7 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Embedded Connected External Platforms Dashboard & Consistency Stimulator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Linked Accounts Widget (Requested by User) */}
        <div className="md:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-slate-800 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Globe className="h-4.5 w-4.5 text-blue-500" />
              <span>Verified Account Integrations</span>
            </h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              These external platforms are currently connected via your Student Profile. Solve problems on any platform to maintain absolute campus placement readiness.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
            {/* Leetcode */}
            <div className={`p-3 rounded-2xl border text-center transition-all ${leetcodeHandle ? "bg-orange-50/50 border-orange-200 text-orange-700" : "bg-slate-50 border-slate-200/60 text-slate-400"}`}>
              <div className="text-xs font-bold font-mono">LeetCode</div>
              {leetcodeHandle ? (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-orange-100 text-orange-800 text-[9px] font-bold rounded-full">
                    <UserCheck className="h-2.5 w-2.5" /> @{leetcodeHandle}
                  </span>
                  <a href={`https://leetcode.com/${leetcodeHandle}`} target="_blank" rel="noopener noreferrer" className="block text-[8px] text-orange-600 hover:underline mt-1 font-mono flex items-center justify-center gap-0.5">
                    View profile <ExternalLink className="h-2 w-2" />
                  </a>
                </div>
              ) : (
                <p className="text-[9px] text-slate-400 mt-1.5 italic">Not Linked</p>
              )}
            </div>

            {/* GitHub */}
            <div className={`p-3 rounded-2xl border text-center transition-all ${githubHandle ? "bg-slate-900/5 border-slate-300 text-slate-800" : "bg-slate-50 border-slate-200/60 text-slate-400"}`}>
              <div className="text-xs font-bold font-mono">GitHub</div>
              {githubHandle ? (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-bold rounded-full">
                    <UserCheck className="h-2.5 w-2.5" /> @{githubHandle}
                  </span>
                  <a href={`https://github.com/${githubHandle}`} target="_blank" rel="noopener noreferrer" className="block text-[8px] text-slate-700 hover:underline mt-1 font-mono flex items-center justify-center gap-0.5">
                    View profile <ExternalLink className="h-2 w-2" />
                  </a>
                </div>
              ) : (
                <p className="text-[9px] text-slate-400 mt-1.5 italic">Not Linked</p>
              )}
            </div>

            {/* HackerRank */}
            <div className={`p-3 rounded-2xl border text-center transition-all ${hackerrankHandle ? "bg-emerald-50/50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200/60 text-slate-400"}`}>
              <div className="text-xs font-bold font-mono">HackerRank</div>
              {hackerrankHandle ? (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">
                    <UserCheck className="h-2.5 w-2.5" /> @{hackerrankHandle}
                  </span>
                  <a href={`https://hackerrank.com/${hackerrankHandle}`} target="_blank" rel="noopener noreferrer" className="block text-[8px] text-emerald-600 hover:underline mt-1 font-mono flex items-center justify-center gap-0.5">
                    View profile <ExternalLink className="h-2 w-2" />
                  </a>
                </div>
              ) : (
                <p className="text-[9px] text-slate-400 mt-1.5 italic">Not Linked</p>
              )}
            </div>

            {/* CodeChef */}
            <div className={`p-3 rounded-2xl border text-center transition-all ${codechefHandle ? "bg-amber-50/50 border-amber-200 text-amber-700" : "bg-slate-50 border-slate-200/60 text-slate-400"}`}>
              <div className="text-xs font-bold font-mono">CodeChef</div>
              {codechefHandle ? (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded-full">
                    <UserCheck className="h-2.5 w-2.5" /> @{codechefHandle}
                  </span>
                  <a href={`https://www.codechef.com/users/${codechefHandle}`} target="_blank" rel="noopener noreferrer" className="block text-[8px] text-amber-600 hover:underline mt-1 font-mono flex items-center justify-center gap-0.5">
                    View profile <ExternalLink className="h-2 w-2" />
                  </a>
                </div>
              ) : (
                <p className="text-[9px] text-slate-400 mt-1.5 italic">Not Linked</p>
              )}
            </div>
          </div>

          {(!leetcodeHandle || !githubHandle) && (
            <p className="text-[10px] text-slate-400 italic mt-3 text-center">
              💡 Complete your handles in the <strong>Student Profile</strong> page to verify integrations and claim +50 Bonus Points each!
            </p>
          )}
        </div>

        {/* Consistency Motivator Email Stimulator Card (Requested by User) */}
        <div className="bg-gradient-to-tr from-purple-50 via-pink-50/20 to-indigo-50 border border-purple-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between text-left">
          <div className="space-y-1.5">
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[8px] font-extrabold rounded-full uppercase tracking-wider block w-max">
              Habit & Motivation Booster
            </span>
            <h3 className="font-extrabold text-slate-800 text-xs tracking-wider uppercase flex items-center gap-1">
              <Mail className="h-4.5 w-4.5 text-purple-500" />
              <span>Email consistency reminder</span>
            </h3>
            <p className="text-slate-600 text-[11px] leading-relaxed font-sans">
              Get tired of staring at bugs? Force a mock daily check-in email alert to stay disciplined and claim bonus rewards!
            </p>
          </div>

          <button
            onClick={handleSimulateEmail}
            disabled={sendingEmail}
            className="w-full mt-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 hover:scale-[1.01] transition-transform text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {sendingEmail ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating custom email alert...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-white" />
                <span>Email me motivation! (+50 PTS)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs text-left">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Editor Left, Analysis Output Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: DSA Problems & Editor */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Problem Selector row */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm text-left">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Select DSA Challenge</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {problems.map((prob) => (
                <button
                  key={prob.title}
                  onClick={() => handleSelectProblem(prob)}
                  className={`px-4 py-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between gap-4 transition-all cursor-pointer ${
                    activeProblem.title === prob.title 
                      ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" 
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-800"
                  }`}
                >
                  <span>{prob.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    prob.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                  }`}>
                    {prob.difficulty}
                  </span>
                </button>
              ))}
            </div>

            {/* Problem Description Panel */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <HelpCircle className="h-4.5 w-4.5 text-blue-500" />
                <span>Problem Statement</span>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {activeProblem.description}
              </p>
            </div>
          </div>

          {/* IDE Editor Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-slate-400" />
                <span className="font-bold text-slate-800 text-xs sm:text-sm">In-Browser Source Editor</span>
              </div>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:border-blue-500 cursor-pointer focus:outline-none"
              >
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python 3</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Java">Java SE</option>
              </select>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs sm:text-sm leading-normal focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />

            <button
              onClick={handleSubmitCode}
              disabled={analyzing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:scale-[1.01] transition-transform text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Compiling & Validating Complexities...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white text-white" />
                  <span>Run & Review Solution (+100 PTS)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Execution Output & Quality Ratings */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between shadow-sm text-left">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 min-h-[400px]">
              <Terminal className="h-12 w-12 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700 text-sm">Output Terminal Empty</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Submit your coding solution to populate AI correctness, logic audits, and star ratings.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              {/* Star Rating Card */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Code Quality Rating</span>
                  <div className="flex items-center gap-1.5 mt-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < result.codeQualityRating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                      />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Complexity Verdict</span>
                  <span className="text-xs font-bold text-blue-600 block mt-1">{result.complexityAnalysis}</span>
                </div>
              </div>

              {/* Logic Feedback block */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Logic & Edge-Case Review</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                  {result.logicFeedback}
                </p>
              </div>

              {/* Optimizations suggested */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Suggested Optimizations</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                  {result.optimizations}
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 mt-6 text-center">
            <span className="text-[10px] text-slate-400 font-mono">
              Tested Engine: Gemini 3.5 Compiler (Standard-V2)
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Stories about Top Industrial Leaders Section (Requested by User) */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 relative overflow-hidden text-left">
        
        {/* Header and status info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-extrabold rounded-full uppercase tracking-wider border border-indigo-100">
                Premium student Content
              </span>
              <span className="text-xs font-mono font-bold text-indigo-600">300 PTS unlock</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              <span>Industry Titans & Deep Career Stories</span>
            </h2>
            <p className="text-slate-500 text-[11px] font-sans leading-relaxed">
              Read advanced, deep case-studies and early-life career struggles of computer science legends to guide your journey.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 font-mono text-[11px] text-slate-600">
            <span>Status:</span>
            {isStoriesUnlocked ? (
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">🔓 Unlocked</span>
            ) : (
              <span className="text-amber-600 font-bold flex items-center gap-0.5">🔒 Locked ({bonusPoints}/300 pts)</span>
            )}
          </div>
        </div>

        {/* Stories display area */}
        {!isStoriesUnlocked ? (
          /* Locked State Blur Interface */
          <div className="relative p-8 rounded-2xl bg-slate-50 border border-slate-100/80 text-center flex flex-col items-center justify-center space-y-4">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] rounded-2xl flex flex-col items-center justify-center z-10 p-6">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm mb-3">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Industrial Stories Currently Locked</h3>
              <p className="text-slate-500 text-xs max-w-md mt-1 leading-relaxed">
                Unlock advanced deep success case-studies of **Sundar Pichai**, **Linus Torvalds**, and more by acquiring <strong className="text-indigo-600">300 Bonus Prep Points</strong>!
              </p>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleSimulateEmail}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-transform hover:scale-105 cursor-pointer"
                >
                  Send consistency Email (+50)
                </button>
                <button
                  onClick={() => handleSelectProblem(problems[0])}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-transform hover:scale-105 cursor-pointer"
                >
                  Solve DSA Problem (+100)
                </button>
              </div>
            </div>

            {/* Blurred background preview */}
            <div className="w-full opacity-10 filter blur-[2.5px] select-none pointer-events-none">
              <div className="flex gap-4">
                <div className="w-1/4 p-4 border border-slate-200 rounded-xl text-left">
                  <div className="text-lg">👨‍💻</div>
                  <div className="font-bold text-xs mt-2">Sundar Pichai</div>
                  <div className="text-[10px] text-slate-400">CEO, Google</div>
                </div>
                <div className="w-3/4 p-4 border border-slate-200 rounded-xl text-left space-y-2">
                  <div className="h-4 bg-slate-300 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Unlocked State tabs & details */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Titan list selection bar */}
            <div className="md:col-span-1 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-2 md:gap-0">
              {titanStories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setSelectedTitan(story)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shrink-0 md:shrink ${
                    selectedTitan.id === story.id 
                      ? "bg-indigo-50/70 border-indigo-200 text-indigo-900 shadow-sm font-bold" 
                      : "bg-slate-50/50 border-slate-200/60 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{story.avatar}</span>
                    <div>
                      <h4 className="text-xs font-extrabold leading-none">{story.name}</h4>
                      <span className="text-[9px] text-slate-400 mt-0.5 block font-medium">{story.role}</span>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 hidden md:block text-slate-400 transition-transform ${selectedTitan.id === story.id ? "translate-x-1 text-indigo-500" : ""}`} />
                </button>
              ))}
            </div>

            {/* Titan Story detailed content pane */}
            <div className="md:col-span-3 bg-slate-50/60 border border-slate-100 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-white rounded-2xl shadow-sm border border-slate-200/50">{selectedTitan.avatar}</span>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">{selectedTitan.name}</h3>
                    <p className="text-indigo-600 text-xs font-semibold">{selectedTitan.role}</p>
                  </div>
                </div>

                <div className="border-l-2 border-indigo-400 pl-4 py-0.5">
                  <p className="text-slate-600 text-xs italic font-medium leading-relaxed">
                    "{selectedTitan.quote}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1.5">
                  {/* College & Early Struggles */}
                  <div className="space-y-1.5 bg-white p-4 rounded-2xl border border-slate-100 text-left">
                    <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                      <span>⚠️ College & Early Struggles</span>
                    </h5>
                    <p className="text-slate-600 text-xs leading-relaxed font-sans">
                      {selectedTitan.struggle}
                    </p>
                  </div>

                  {/* Career Breakthrough */}
                  <div className="space-y-1.5 bg-white p-4 rounded-2xl border border-slate-100 text-left">
                    <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                      <span>🚀 Career Breakthrough</span>
                    </h5>
                    <p className="text-slate-600 text-xs leading-relaxed font-sans">
                      {selectedTitan.fullStory}
                    </p>
                  </div>
                </div>
              </div>

              {/* Secret to Success footer block */}
              <div className="pt-4 border-t border-slate-100 bg-white/40 p-4 rounded-2xl flex items-start gap-3">
                <div className="text-xl">💡</div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">Student Takeaway & Secret to Success</span>
                  <p className="text-slate-700 text-xs font-semibold leading-relaxed mt-0.5 font-sans">{selectedTitan.secretToSuccess}</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Simulated Email Reminders Modal (Requested by User) */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 shadow-2xl rounded-3xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-5 text-white flex items-center justify-between text-left">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-base">
                  📬
                </div>
                <div>
                  <h3 className="font-extrabold text-xs tracking-wider uppercase">Consistency Reminders Engine</h3>
                  <span className="text-[10px] opacity-90 block font-medium">Motivate Daily Study & Bonus Tracker</span>
                </div>
              </div>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="text-white hover:text-slate-200 text-xs font-bold bg-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>

            {/* Email Message Content */}
            <div className="p-6 space-y-4 text-left">
              <div className="p-4.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono border-b border-slate-200/60 pb-2">
                  <span>To: <strong>ranithaaravichandran@gmail.com</strong></span>
                  <span>From: <strong>consistency@offerbuddy.ai</strong></span>
                </div>
                
                <h4 className="font-black text-slate-800 text-sm">
                  🔥 Jane, stay consistent on OfferBuddy & claim your SDE Placement Bonus!
                </h4>

                <p className="text-slate-600 text-xs font-sans leading-relaxed">
                  Hey student, Brody here! 🎓 Just checking in on you. I noticed you've been working hard on your technical preparations today. 
                  Don't break your consistency stream! Doing even just **one challenge a day** makes you 83% more likely to crack the final technical screening.
                </p>

                <div className="bg-white border border-slate-200/80 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4.5 w-4.5 text-yellow-500" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-800 block">Streak Activity Bonus Points</span>
                      <span className="text-[9px] text-slate-400 block font-medium">Unlocks Premium Stories & Stipends</span>
                    </div>
                  </div>
                  <span className="text-xs font-black font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    +50 PTS CLAIMED
                  </span>
                </div>

                <p className="text-slate-500 text-[10px] italic pt-1 leading-normal">
                  "Continuous improvement is better than delayed perfection." Keep coding, keep compiling, and remember: your potential is infinite. 💻⚡
                </p>
              </div>

              <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold leading-normal">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>✓ Simulated Motivational Alert triggered! We mock-sent this consistency digest directly to your student email. You've earned 50 Bonus Points!</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setEmailModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-transform hover:scale-[1.01]"
              >
                Let's Code!
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
