import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  Info, 
  Clipboard, 
  FileWarning, 
  AlertCircle,
  Wand2,
  Copy,
  Check,
  Briefcase,
  ChevronRight,
  RefreshCw,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Resume } from "../types";

interface ResumeReviewViewProps {
  userId: string;
  onActivityAdded: () => void;
  user?: any;
}

export default function ResumeReviewView({ userId, onActivityAdded, user }: ResumeReviewViewProps) {
  // Main States
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Resume | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"grammar" | "formatting" | "missing" | "rewrites">("rewrites");

  // Right Side Segment: "ats" or "optimize"
  const [rightPanelTab, setRightPanelTab] = useState<"ats" | "optimize">("ats");

  // AI Resume Tailoring States
  const [selectedRole, setSelectedRole] = useState(user?.targetRole || "Software Engineer");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState("");
  const [optimizedChanges, setOptimizedChanges] = useState<string[]>([]);
  const [optimizationSuccess, setOptimizationSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [optimizerError, setOptimizerError] = useState("");

  useEffect(() => {
    fetchLatestResume();
  }, [userId]);

  useEffect(() => {
    if (user?.targetRole) {
      setSelectedRole(user.targetRole);
    }
  }, [user]);

  const fetchLatestResume = async () => {
    try {
      const response = await fetch("/api/resume/latest", {
        headers: { "Authorization": `Bearer ${userId}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setResult(data);
          setResumeText(data.fileContent || "");
          setFileName(data.fileName || "");
        }
      }
    } catch (err) {
      console.error("Failed to load latest resume:", err);
    }
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setResumeText(text);
    };
    reader.readAsText(file);
  };

  const handlePasteSample = () => {
    const sample = `John Doe\nEmail: john.doe@email.com | Phone: 999-888-7777\n\nOBJECTIVE\nAmbitious college graduate looking to join a team as SDE-1.\n\nEXPERIENCE\nCollege Projects (2025)\n- Created a simple todo application in HTML/CSS\n- Worked on a database group project for college cataloging\n\nSKILLS\n- Java, basic HTML, MySQL, Microsoft Word`;
    setResumeText(sample);
    setFileName("sample_cv.txt");
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError("Please paste or upload your resume text to begin.");
      return;
    }

    setError("");
    setAnalyzing(true);

    try {
      const response = await fetch("/api/resume/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`,
        },
        body: JSON.stringify({
          fileName: fileName || "pasted_cv.txt",
          fileContent: resumeText,
        }),
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Failed to analyze resume (Status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      setResult(data);
      onActivityAdded();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during ATS scanning.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    if (!resumeText.trim()) {
      setOptimizerError("Please enter or paste your resume text on the left first.");
      return;
    }

    setOptimizerError("");
    setOptimizing(true);
    setOptimizationSuccess(false);

    try {
      const response = await fetch("/api/resume/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`,
        },
        body: JSON.stringify({
          targetRole: selectedRole,
          fileContent: resumeText,
          additionalInstructions
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to optimize resume");
      }

      const data = await response.json();
      setOptimizedResume(data.optimizedContent || "");
      setOptimizedChanges(data.changesMade || []);
      setOptimizationSuccess(true);
    } catch (err: any) {
      console.error(err);
      setOptimizerError(err.message || "Something went wrong during resume optimization.");
    } finally {
      setOptimizing(false);
    }
  };

  const handleApplyOptimization = () => {
    if (optimizedResume) {
      setResumeText(optimizedResume);
      setFileName("optimized_" + (fileName || "cv.txt"));
      // Switch back to ATS panel so they can immediately evaluate the optimized text
      setRightPanelTab("ats");
      setResult(null); // Clear previous results to prompt recalculation
    }
  };

  const handleCopyOptimized = () => {
    if (optimizedResume) {
      navigator.clipboard.writeText(optimizedResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 border-emerald-200 bg-emerald-50";
    if (score >= 60) return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-red-600 border-red-200 bg-red-50";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Overview Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1.5 flex items-center gap-2">
            Expert 1: ATS Resume Evaluator & Tailor <FileText className="h-6.5 w-6.5 text-blue-600" />
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Optimize and rewrite your CV specifically for your target job role. Bypass ATS parsing bottlenecks, fix grammar, and highlight target tech stacks.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-semibold">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Target: {user?.targetRole || "Software Engineer"}</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Editor Left, Segmented Analyzer/Optimizer Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (5/12 or 6/12): Upload / Paste Editor */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-6 bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base">Paste or Upload CV Text</h3>
            <button 
              onClick={handlePasteSample}
              className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Clipboard className="h-3.5 w-3.5" />
              Use Demo Text
            </button>
          </div>

          {/* Selector / Drag area */}
          <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-6 text-center cursor-pointer transition-colors group">
            <input 
              type="file" 
              accept=".txt,.md,.pdf,.doc,.docx"
              onChange={handleUploadFile}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="h-8 w-8 text-slate-400 group-hover:text-slate-500 mx-auto mb-2 transition-transform group-hover:-translate-y-0.5" />
            <p className="text-xs font-semibold text-slate-600">
              {fileName ? `Loaded: ${fileName}` : "Drag resume file here or click to browse"}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Supports standard text/PDF templates (auto-extracting plain characters)</p>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="John Doe&#10;Email: john.doe@email.com&#10;Phone: ...&#10;&#10;EXPERIENCE...&#10;SKILLS..."
            className="w-full h-96 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs sm:text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:scale-[1.01] transition-all text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Scanning ATS Metrics...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
                <span>Calculate ATS Alignment Score</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Right Column (6/12): Segmented Controller for Evaluation & Optimizer */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-6 bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between min-h-[500px]"
        >
          <div>
            {/* SEGMENTED CONTROL TAB HEADER */}
            <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-xl mb-6 gap-1">
              <button
                onClick={() => setRightPanelTab("ats")}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${rightPanelTab === "ats" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                <span>ATS Feedback Report</span>
              </button>
              <button
                onClick={() => setRightPanelTab("optimize")}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${rightPanelTab === "optimize" ? "bg-white text-slate-800 shadow-sm animate-none" : "text-slate-500 hover:text-slate-800"}`}
              >
                <Wand2 className="h-3.5 w-3.5 text-purple-500" />
                <span>AI Resume Tailor & Optimizer</span>
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold scale-90">AI</span>
              </button>
            </div>

            {/* TAB CONTENT 1: ATS EVALUATION */}
            {rightPanelTab === "ats" && (
              <>
                {!result ? (
                  <div className="h-96 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <FileWarning className="h-12 w-12 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">Awaiting Resume Scan</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">Please enter your resume details on the left and click "Calculate ATS Alignment Score" to parse metrics.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* ATS SCORE RING & DYNAMIC PROGRESS BAR */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50 w-full">
                      <div className="relative flex items-center justify-center shrink-0">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="34" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                          <motion.circle 
                            cx="40" 
                            cy="40" 
                            r="34" 
                            stroke={result.atsScore >= 80 ? "#10b981" : result.atsScore >= 60 ? "#f59e0b" : "#ef4444"} 
                            strokeWidth="6" 
                            fill="transparent"
                            strokeDasharray={213.6}
                            initial={{ strokeDashoffset: 213.6 }}
                            animate={{ strokeDashoffset: 213.6 - (213.6 * result.atsScore) / 100 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-base font-black text-slate-800">{result.atsScore}%</span>
                          <span className="text-[7px] font-bold uppercase text-slate-400">Score</span>
                        </div>
                      </div>
                      <div className="flex-grow space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm">ATS Benchmark Score</h4>
                        {/* Visual linear progress bar */}
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5 relative">
                          <motion.div 
                            className={`h-2 rounded-full ${result.atsScore >= 80 ? "bg-emerald-500" : result.atsScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${result.atsScore}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal pt-1">
                          Your CV has been parsed against recruiter profiles. Aim for <strong className="text-emerald-600">80+</strong> to secure callbacks.
                        </p>
                      </div>
                    </div>

                    {/* SUB-TABS */}
                    <div className="flex border-b border-slate-100 text-xs font-semibold overflow-x-auto pb-0.5 gap-2">
                      <button 
                        onClick={() => setActiveTab("rewrites")}
                        className={`px-3 py-2 cursor-pointer transition-colors border-b-2 rounded-t-lg shrink-0 ${activeTab === "rewrites" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"}`}
                      >
                        Bullet Rewrites ({result.rewriteSuggestions.length})
                      </button>
                      <button 
                        onClick={() => setActiveTab("missing")}
                        className={`px-3 py-2 cursor-pointer transition-colors border-b-2 rounded-t-lg shrink-0 ${activeTab === "missing" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"}`}
                      >
                        Missing Skills ({result.missingSections.length})
                      </button>
                      <button 
                        onClick={() => setActiveTab("formatting")}
                        className={`px-3 py-2 cursor-pointer transition-colors border-b-2 rounded-t-lg shrink-0 ${activeTab === "formatting" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"}`}
                      >
                        Layout & Format ({result.formattingSuggestions.length})
                      </button>
                      <button 
                        onClick={() => setActiveTab("grammar")}
                        className={`px-3 py-2 cursor-pointer transition-colors border-b-2 rounded-t-lg shrink-0 ${activeTab === "grammar" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"}`}
                      >
                        Grammar Check ({result.grammarFeedback.length})
                      </button>
                    </div>

                    {/* SUB-TAB CONTENT WITH TRANSITIONS */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-3"
                        >
                          {activeTab === "rewrites" && (
                            <>
                              <p className="text-[11px] text-slate-500 leading-relaxed flex items-center gap-1.5 bg-blue-50/50 p-2 rounded-lg border border-blue-50">
                                <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                ATS engines index resumes higher when descriptions contain action verbs and core metrics.
                              </p>
                              {result.rewriteSuggestions.map((item, idx) => (
                                <motion.div 
                                  key={idx}
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2.5"
                                >
                                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </motion.div>
                              ))}
                            </>
                          )}

                          {activeTab === "missing" && (
                            <>
                              <p className="text-[11px] text-slate-500 leading-relaxed flex items-center gap-1.5 bg-blue-50/50 p-2 rounded-lg border border-blue-50">
                                <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                Core technical credentials recruiters look for in SDE, frontend, or backend roles.
                              </p>
                              {result.missingSections.length === 0 ? (
                                <p className="text-xs text-emerald-600 font-semibold p-4 text-center">✓ Excellent! No missing sections found.</p>
                              ) : (
                                result.missingSections.map((item, idx) => (
                                  <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-3 bg-red-50/60 border border-red-100 rounded-xl text-xs text-red-700 leading-relaxed flex items-start gap-2.5"
                                  >
                                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </motion.div>
                                ))
                              )}
                            </>
                          )}

                          {activeTab === "formatting" && (
                            <>
                              <p className="text-[11px] text-slate-500 leading-relaxed flex items-center gap-1.5 bg-blue-50/50 p-2 rounded-lg border border-blue-50">
                                <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                Visual cleanliness guidelines to improve reading speed for recruiters.
                              </p>
                              {result.formattingSuggestions.map((item, idx) => (
                                <motion.div 
                                  key={idx}
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2.5"
                                >
                                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </motion.div>
                              ))}
                            </>
                          )}

                          {activeTab === "grammar" && (
                            <>
                              <p className="text-[11px] text-slate-500 leading-relaxed flex items-center gap-1.5 bg-blue-50/50 p-2 rounded-lg border border-blue-50">
                                <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                Grammatical and vocabulary check.
                              </p>
                              {result.grammarFeedback.length === 0 ? (
                                <p className="text-xs text-emerald-600 font-semibold p-4 text-center">✓ Fantastic! Your CV is grammatically spotless.</p>
                              ) : (
                                result.grammarFeedback.map((item, idx) => (
                                  <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2.5"
                                  >
                                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </motion.div>
                                ))
                              )}
                            </>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB CONTENT 2: AI RESUME TAILOR / OPTIMIZER */}
            {rightPanelTab === "optimize" && (
              <div className="space-y-5">
                {optimizerError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-700 text-xs leading-relaxed">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <span>{optimizerError}</span>
                  </div>
                )}

                {/* STEP 1: SELECT TARGET ROLE & OPTIONAL PARAMETERS */}
                <div className="space-y-3.5 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">1</span>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Configure Optimization Goal</h4>
                  </div>

                  {/* Target Role selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Target Job Role to Align With
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer"
                    >
                      <option value="Software Engineer">Software Engineer (Generalist)</option>
                      <option value="Frontend Developer">Frontend Developer (React/Vue)</option>
                      <option value="Backend Developer">Backend Engineer (Node/Python)</option>
                      <option value="Data Scientist">Data Scientist / AI Engineer</option>
                      <option value="Full Stack Developer">Full Stack Engineer</option>
                    </select>
                  </div>

                  {/* Optional customized guidelines */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Custom Guidelines (Optional)
                    </label>
                    <textarea
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      placeholder="e.g. 'Emphasize my SQL performance optimizations', 'Highlight React Hook knowledge', 'Focus on metric-driven bullet points'"
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                    />
                  </div>

                  <button
                    onClick={handleOptimize}
                    disabled={optimizing}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {optimizing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Tailoring with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3.5 w-3.5" />
                        <span>Optimize & Tailor for {selectedRole.split(" ")[0]} Role</span>
                      </>
                    )}
                  </button>
                </div>

                {/* STEP 2: DISPLAY OPTIMIZED RESUME & CHANGES */}
                {optimizationSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="space-y-4 border border-slate-100 rounded-xl p-4 bg-purple-50/10"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">2</span>
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                          Tailored Output Generated <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        </h4>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyOptimized}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Copy to clipboard"
                        >
                          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          <span>{copied ? "Copied!" : "Copy CV"}</span>
                        </button>
                        <button
                          onClick={handleApplyOptimization}
                          className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Apply optimized text to left editor for score calculation"
                        >
                          <RefreshCw className="h-3 w-3 text-white" />
                          <span>Apply to Editor</span>
                        </button>
                      </div>
                    </div>

                    {/* Changes summary */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Improvements List:</p>
                      <ul className="space-y-1.5 mt-1">
                        {optimizedChanges.map((change, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                            <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Preview of optimized CV */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Optimized CV Preview:</p>
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto h-44 overflow-y-auto border border-slate-800">
                        {optimizedResume}
                      </pre>
                    </div>

                    {/* Recommendation hint */}
                    <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-700 leading-relaxed flex items-start gap-1.5">
                      <HelpCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
                      <span>
                        Click <strong className="text-blue-800">"Apply to Editor"</strong> to move this optimized text into your draft, then click <strong className="text-blue-800">"Calculate ATS Alignment Score"</strong> on the left to see your new benchmark score!
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6 text-center">
            <span className="text-[10px] text-slate-400 font-mono">
              Last Parsed: {result?.uploadedAt ? new Date(result.uploadedAt).toLocaleString() : "Never"}
            </span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
