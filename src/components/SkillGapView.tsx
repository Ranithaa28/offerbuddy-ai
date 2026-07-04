import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Map, 
  BookOpen, 
  Wrench, 
  CheckSquare, 
  Loader2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  Layout 
} from "lucide-react";
import { SkillAnalysis } from "../types";

interface SkillGapViewProps {
  userId: string;
  onActivityAdded: () => void;
}

export default function SkillGapView({ userId, onActivityAdded }: SkillGapViewProps) {
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SkillAnalysis | null>(null);
  const [error, setError] = useState("");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0);

  const presets = [
    "Full Stack Engineer",
    "Frontend Architect",
    "Backend Developer",
    "AI/ML Research Engineer",
    "Data Scientist",
    "DevOps Specialist",
    "Product Manager (Tech)"
  ];

  useEffect(() => {
    fetchLatestAnalysis();
  }, [userId]);

  const fetchLatestAnalysis = async () => {
    try {
      const response = await fetch("/api/skill-gap/latest", {
        headers: { "Authorization": `Bearer ${userId}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setResult(data);
          setTargetRole(data.targetRole);
        }
      }
    } catch (err) {
      console.error("Failed to load latest analysis:", err);
    }
  };

  const handleAnalyze = async (roleToUse?: string) => {
    const role = roleToUse || targetRole;
    if (!role.trim()) {
      setError("Please specify or click a target role first.");
      return;
    }

    setError("");
    setAnalyzing(true);

    try {
      const response = await fetch("/api/skill-gap/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`,
        },
        body: JSON.stringify({ targetRole: role }),
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Failed to analyze skills (Status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze skills");
      }

      setResult(data);
      onActivityAdded();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An issue occurred during skill gap mapping.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1.5 flex items-center gap-2">
          Expert 2: Skill Gap Analyst <Compass className="h-6 w-6 text-blue-600" />
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Map your background against high-paying engineering roles. Receive automated skill gaps, 4-week roadmap schedules, and suggested projects.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Entry Panel & Presets */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base">Select Your Dream Placement Position</h3>
        
        <div className="flex flex-wrap gap-2.5">
          {presets.map((p) => (
            <button
              key={p}
              disabled={analyzing}
              onClick={() => {
                setTargetRole(p);
                handleAnalyze(p);
              }}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                targetRole === p 
                  ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" 
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <input
            type="text"
            disabled={analyzing}
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Or write custom role, e.g. Node/Express Backend Engineer"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          <button
            onClick={() => handleAnalyze()}
            disabled={analyzing}
            className="px-6 py-3 shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:scale-[1.01] transition-transform text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Comparing Gaps...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
                <span>Map Gaps & Roadmap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in-50 duration-300">
          {/* Gaps and Projects (Left columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gap and Match Ring */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base">Identified Competency Gaps</h3>
                <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${getMatchColor(result.estimatedReadinessScore)}`}>
                  {result.estimatedReadinessScore}% Alignment
                </span>
              </div>

              {result.missingSkills.length === 0 ? (
                <div className="text-center py-6 text-emerald-600 text-xs font-semibold">
                  ✓ Outstanding! Resume displays 100% core coverage for this target position.
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Based on your active resume text, our Gemini recruiter identifies the following missing keywords and core skills for <strong className="text-slate-800">{result.targetRole}</strong>:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((sk, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-50 border border-red-200/60 rounded-lg text-xs font-semibold text-red-700">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Placement Projects */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
                Suggested Placement Projects to Bridge Gaps
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add these bespoke engineering projects to your resume to demonstrate hands-on depth with the required technical skills.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {result.suggestedProjects.map((proj, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 border border-slate-100 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Layout className="h-4 w-4 text-blue-500 shrink-0" />
                        {proj.title}
                      </h4>
                      <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                      {proj.techStack.map((tech) => (
                        <span key={tech} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expandable Learning Roadmap (Right column) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-600" />
              4-Week Learning Curriculum
            </h3>

            <div className="space-y-4">
              {result.learningRoadmap.map((roadmap, idx) => {
                const isExpanded = expandedWeek === idx;
                return (
                  <div 
                    key={idx} 
                    className={`border border-slate-100 rounded-2xl overflow-hidden transition-colors ${
                      isExpanded ? "bg-slate-50/50" : "bg-white"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedWeek(isExpanded ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-slate-50/50"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-blue-600 font-mono font-bold tracking-wider uppercase block">
                          {roadmap.week}
                        </span>
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          {roadmap.topic}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed space-y-3 border-t border-slate-100">
                        <p>{roadmap.description}</p>
                        
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Study Pointers & Labs
                          </span>
                          <div className="space-y-1">
                            {roadmap.resources.map((res, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-slate-600">
                                <BookOpen className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                <span>{res}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
