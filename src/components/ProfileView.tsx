import React, { useState, useEffect } from "react";
import { 
  User, 
  ShieldCheck, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Loader2, 
  Sparkles, 
  Link as LinkIcon, 
  Globe, 
  Award, 
  CheckSquare, 
  Linkedin, 
  ExternalLink, 
  FileText, 
  Cpu, 
  Layers, 
  Terminal, 
  CheckCircle, 
  Target, 
  Plus, 
  X, 
  Trophy, 
  BookOpen, 
  Zap,
  Building,
  Star,
  CheckCircle2
} from "lucide-react";

interface ProfileViewProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
}

export const SECTOR_ROLES: { [sector: string]: string[] } = {
  "Tech & IT": [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Data Scientist",
    "Full Stack Developer"
  ],
  "Healthcare & BioSciences": [
    "Bioinformatics Specialist",
    "Biotechnologist",
    "Clinical Trial Specialist",
    "Biomedical Engineer"
  ],
  "Finance & Business": [
    "Financial Analyst",
    "Investment Banker",
    "Management Consultant",
    "Business Operations Analyst"
  ],
  "Creative Arts & Design": [
    "UI/UX Designer",
    "Graphic Designer",
    "Creative Director",
    "Marketing Strategist"
  ],
  "Core Engineering & Operations": [
    "Mechanical Engineer",
    "Civil Project Manager",
    "Robotics Engineer",
    "Chemical Process Engineer"
  ]
};

export const DEFAULT_SKILLS_FOR_DOMAINS: { [domain: string]: string[] } = {
  "Tech & IT": ["React", "TypeScript", "Node.js", "Python", "Data Structures", "Algorithms", "SQL", "System Design"],
  "Healthcare & BioSciences": ["Bioinformatics", "Python", "R Programming", "Genomics", "Clinical Trials", "Biochemistry", "Data Analysis", "Pharma Regulations"],
  "Finance & Business": ["Financial Modeling", "Excel", "Python", "SQL", "Business Strategy", "Data Analysis", "Risk Management", "Market Analysis"],
  "Creative Arts & Design": ["Figma", "UI/UX Design", "Typography", "Wireframing", "User Research", "Prototyping", "HTML/CSS", "Visual Design"],
  "Core Engineering & Operations": ["AutoCAD", "MATLAB", "Thermodynamics", "Robotics", "Project Management", "Quality Control", "SolidWorks", "Process Optimization"]
};

export const DOMAIN_DEFAULTS: {
  [domain: string]: {
    degree: string;
    major: string;
    jobType: string;
    targetCompanies: string;
    resumeText: string;
  };
} = {
  "Tech & IT": {
    degree: "B.Tech Computer Science",
    major: "Computer Science & Engineering",
    jobType: "Full-time SDE",
    targetCompanies: "Google, Microsoft, Stripe, NVIDIA",
    resumeText: "Jane Smith\nSDE Candidate | State Institute of Technology\n\nEXPERIENCE:\n- Frontend Intern at TechCorp (React & Tailwind optimization)\n\nPROJECTS:\n- AlgoViz: Interactive algorithm simulator utilizing D3.js and state charts.\n- AuthSecure: Fully encrypted microservices portal using TypeScript and OAuth2."
  },
  "Healthcare & BioSciences": {
    degree: "M.Sc Bioinformatics",
    major: "Bioinformatics & Computational Biology",
    jobType: "Bioinformatics Analyst",
    targetCompanies: "Pfizer, Novartis, Biocon, Apollo Hospitals",
    resumeText: "Sarah Jenkins\nBioinformatics Specialist | Institute of Life Sciences\n\nEXPERIENCE:\n- Research Intern at BioGen Labs (Phylogenetic sequence analysis)\n\nPROJECTS:\n- GenMap: Dynamic DNA sequence visualization and mutation tracker using Python.\n- BioClin: Clinical trial metadata database optimizing gene expression querying."
  },
  "Finance & Business": {
    degree: "MBA Finance",
    major: "Financial Analyst & Strategy",
    jobType: "Financial Analyst",
    targetCompanies: "Goldman Sachs, JPMorgan Chase, McKinsey, Deloitte",
    resumeText: "David Vance\nFinancial Analyst Candidate | Business Graduate School\n\nEXPERIENCE:\n- Wealth Management Intern at Capital Trust (Asset allocation modeling)\n\nPROJECTS:\n- FinRisk: Portfolio risk simulator analyzing Monte Carlo simulations in Excel and Python.\n- MarketTrend: Predictive time-series model of sector stock indexes using SQL."
  },
  "Creative Arts & Design": {
    degree: "B.Des UI/UX",
    major: "User Experience Design",
    jobType: "UI/UX Designer",
    targetCompanies: "Adobe, Figma, Ogilvy, Canva, Landor",
    resumeText: "Elena Rostova\nUI/UX Designer | Academy of Fine Arts\n\nEXPERIENCE:\n- Product Design Intern at CreativeStudio (Design system architecture)\n\nPROJECTS:\n- CalmMind: Full mobile app high-fidelity wireframes and user flow in Figma.\n- BrandIdentity: Redesigned interactive landing portal with responsive layout patterns."
  },
  "Core Engineering & Operations": {
    degree: "B.E. Mechanical",
    major: "Mechanical & Robotics Engineering",
    jobType: "Robotics Engineer",
    targetCompanies: "Tesla, Boeing, Larsen & Toubro, GE, Siemens",
    resumeText: "Vikram Mehta\nMechanical & Robotics Engineer | National Technology Institute\n\nEXPERIENCE:\n- CAD Design Intern at AutoParts Corp (Automated stress-testing modeling)\n\nPROJECTS:\n- MechArm: Designed and programmed a 4-axis robotic arm using Arduino and MATLAB.\n- ThermoSim: Heat transfer finite element analysis model for turbine blades."
  }
};

export default function ProfileView({ user, onUpdateUser }: ProfileViewProps) {
  // Core Account Details
  const [name, setName] = useState(user?.name || "");
  const [domain, setDomain] = useState(() => localStorage.getItem("offerbuddy_user_domain") || user?.domain || "Tech & IT");
  const [targetRole, setTargetRole] = useState(user?.targetRole || "Software Engineer");
  const [degree, setDegree] = useState(user?.degree || "B.Tech Computer Science");
  
  // Advanced Academic Profile
  const [university, setUniversity] = useState(() => localStorage.getItem("offerbuddy_university") || "State Institute of Technology");
  const [cgpa, setCgpa] = useState(() => localStorage.getItem("offerbuddy_cgpa") || "8.8/10.0");
  const [gradYear, setGradYear] = useState(() => localStorage.getItem("offerbuddy_grad_year") || "2027");
  const [major, setMajor] = useState(() => localStorage.getItem("offerbuddy_major") || "Computer Science & Engineering");

  // Professional presence
  const [linkedinUrl, setLinkedinUrl] = useState(() => localStorage.getItem("offerbuddy_linkedin") || "https://linkedin.com/in/janesmith");
  const [portfolioUrl, setPortfolioUrl] = useState(() => localStorage.getItem("offerbuddy_portfolio") || "https://janesmith.dev");

  // External Coding Platforms
  const [leetcodeUsername, setLeetcodeUsername] = useState(() => localStorage.getItem("offerbuddy_leetcode_username") || "");
  const [hackerrankUsername, setHackerrankUsername] = useState(() => localStorage.getItem("offerbuddy_hackerrank_username") || "");
  const [codechefUsername, setCodechefUsername] = useState(() => localStorage.getItem("offerbuddy_codechef_username") || "");
  const [githubUsername, setGithubUsername] = useState(() => localStorage.getItem("offerbuddy_github_username") || "");

  // Preference & Tech Stack
  const [jobType, setJobType] = useState(() => localStorage.getItem("offerbuddy_job_type") || "Full-time SDE");
  const [targetCompaniesInput, setTargetCompaniesInput] = useState(() => localStorage.getItem("offerbuddy_target_companies") || "Google, Microsoft, Stripe, NVIDIA");
  
  // Custom skills state initialized from localStorage
  const [skills, setSkills] = useState<string[]>(() => {
    const saved = localStorage.getItem("offerbuddy_skills_list");
    return saved ? JSON.parse(saved) : ["React", "TypeScript", "Node.js", "Python", "Data Structures", "Algorithms", "SQL", "System Design"];
  });
  const [newSkill, setNewSkill] = useState("");

  // Resume Context text block
  const [resumeText, setResumeText] = useState(() => localStorage.getItem("offerbuddy_resume_raw_text") || "Jane Smith\nSDE Candidate | State Institute of Technology\n\nEXPERIENCE:\n- Frontend Intern at TechCorp (React & Tailwind optimization)\n\nPROJECTS:\n- AlgoViz: Interactive algorithm simulator utilizing D3.js and state charts.\n- AuthSecure: Fully encrypted microservices portal using TypeScript and OAuth2.");

  // Reminders / Consistency
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(() => localStorage.getItem("offerbuddy_enable_email_alerts") !== "false");

  // UI state
  const [activeTab, setActiveTab] = useState<"academic" | "coding" | "preference" | "resume">("academic");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Dynamic Profile Completeness Computation
  const [completionScore, setCompletionScore] = useState(0);

  useEffect(() => {
    let score = 0;
    if (name) score += 10;
    if (degree) score += 10;
    if (university) score += 10;
    if (cgpa) score += 10;
    if (linkedinUrl) score += 10;
    if (leetcodeUsername) score += 10;
    if (githubUsername) score += 10;
    if (hackerrankUsername || codechefUsername) score += 10;
    if (skills.length > 3) score += 10;
    if (resumeText.length > 50) score += 10;
    setCompletionScore(score);
  }, [name, degree, university, cgpa, linkedinUrl, leetcodeUsername, githubUsername, hackerrankUsername, codechefUsername, skills, resumeText]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      setNewSkill("");
      localStorage.setItem("offerbuddy_skills_list", JSON.stringify(updated));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter(s => s !== skillToRemove);
    setSkills(updated);
    localStorage.setItem("offerbuddy_skills_list", JSON.stringify(updated));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          targetRole,
          domain,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile settings.");
      }

      const updated = {
        ...user,
        name,
        targetRole,
        domain,
        degree,
        university,
        cgpa,
        gradYear,
        major,
        linkedinUrl,
        portfolioUrl,
        jobType,
        targetCompanies: targetCompaniesInput,
        skills,
        resumeText,
      };

      // Store basic user fields locally
      localStorage.setItem("offerbuddy_user_name", name);
      localStorage.setItem("offerbuddy_user_role", targetRole);
      localStorage.setItem("offerbuddy_user_domain", domain);
      
      // Store advanced fields locally
      localStorage.setItem("offerbuddy_university", university);
      localStorage.setItem("offerbuddy_cgpa", cgpa);
      localStorage.setItem("offerbuddy_grad_year", gradYear);
      localStorage.setItem("offerbuddy_major", major);
      localStorage.setItem("offerbuddy_linkedin", linkedinUrl);
      localStorage.setItem("offerbuddy_portfolio", portfolioUrl);
      localStorage.setItem("offerbuddy_job_type", jobType);
      localStorage.setItem("offerbuddy_target_companies", targetCompaniesInput);
      localStorage.setItem("offerbuddy_skills_list", JSON.stringify(skills));
      localStorage.setItem("offerbuddy_resume_raw_text", resumeText);

      // Save platform accounts
      localStorage.setItem("offerbuddy_leetcode_username", leetcodeUsername.trim());
      localStorage.setItem("offerbuddy_hackerrank_username", hackerrankUsername.trim());
      localStorage.setItem("offerbuddy_codechef_username", codechefUsername.trim());
      localStorage.setItem("offerbuddy_github_username", githubUsername.trim());
      localStorage.setItem("offerbuddy_enable_email_alerts", enableEmailAlerts.toString());

      // Trigger user state update
      onUpdateUser(updated);
      setSuccess(true);
      
      // Scroll to top to see success alert
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      
      {/* Real-World Header with Profile completeness tracker */}
      <div className="relative bg-gradient-to-tr from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-indigo-900/30 shadow-lg text-white overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-12 h-48 w-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] font-extrabold rounded-full uppercase tracking-wider border border-blue-500/30">
                Premium Student Portfolio
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-mono">Verified candidate profile</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              Candidate Placement Specifications <ShieldCheck className="h-6 w-6 text-blue-400" />
            </h1>
            <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed max-w-xl">
              Keep your academic credentials, target roles, and connected portfolios current. Our AI agents sync this data globally to audit resume ATS scores, map out custom roadmaps, and personalize code reviews.
            </p>
          </div>

          {/* Dynamic Interactive Progress Gauge */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="transparent" />
                <circle cx="32" cy="32" r="28" stroke="#10b981" strokeWidth="6" fill="transparent"
                  strokeDasharray={175}
                  strokeDashoffset={175 - (175 * completionScore) / 100}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute text-xs font-black font-mono text-emerald-400">{completionScore}%</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Completeness Score</span>
              <span className="text-sm font-extrabold block text-white">
                {completionScore === 100 ? "👑 Profile Perfect!" : completionScore >= 80 ? "🔥 Highly Optimized" : "⭐ Needs More Details"}
              </span>
              <span className="text-[9px] text-slate-300 block font-mono">
                {completionScore < 100 ? "Add links & resume to reach 100%" : "Ready for campus interview drives"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in duration-200">
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>✓ Your global student profile specifications and verified external platform coordinates have been saved successfully!</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200/60 overflow-x-auto gap-2 pb-0.5">
        <button
          onClick={() => setActiveTab("academic")}
          className={`px-4.5 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "academic" 
              ? "border-blue-600 text-blue-700" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Academic Profile</span>
        </button>
        <button
          onClick={() => setActiveTab("coding")}
          className={`px-4.5 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "coding" 
              ? "border-blue-600 text-blue-700" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Connected Platforms</span>
        </button>
        <button
          onClick={() => setActiveTab("preference")}
          className={`px-4.5 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "preference" 
              ? "border-blue-600 text-blue-700" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Target className="h-4 w-4" />
          <span>Tech Stack & Targets</span>
        </button>
        <button
          onClick={() => setActiveTab("resume")}
          className={`px-4.5 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "resume" 
              ? "border-blue-600 text-blue-700" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Resume & ATS Text</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form Fields Left Pane */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* TAB 1: ACADEMIC CREDENTIALS */}
            {activeTab === "academic" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <GraduationCap className="h-4.5 w-4.5 text-blue-500" />
                    <span>Academic & Basic Info</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] leading-normal mt-0.5">
                    Configure your high-level education details to align custom roadmaps and job role qualifications.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Student Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Student Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Jane Smith"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5 opacity-70">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Email Address (Protected)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        disabled
                        value={user?.email || "student@college.edu"}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* College/University name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      College / University Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. State Institute of Technology"
                      />
                    </div>
                  </div>

                  {/* Major / Specialization */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Major Specialization
                    </label>
                    <div className="relative">
                      <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Computer Science & Engineering"
                      />
                    </div>
                  </div>

                  {/* Cumulative GPA / CGPA */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Cumulative GPA / CGPA
                    </label>
                    <div className="relative">
                      <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. 8.8/10.0 or 3.8/4.0"
                      />
                    </div>
                  </div>

                  {/* Graduation Year */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Graduation Year
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. 2027"
                      />
                    </div>
                  </div>

                  {/* Degree Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Academic Degree Type
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Bachelor of Science"
                      />
                    </div>
                  </div>

                  {/* Domain Sector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Career Domain Sector
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        value={domain}
                        onChange={(e) => {
                          const selectedDomain = e.target.value;
                          setDomain(selectedDomain);
                          const roles = SECTOR_ROLES[selectedDomain] || [];
                          if (roles.length > 0) {
                            setTargetRole(roles[0]);
                          }
                          const defaultSkills = DEFAULT_SKILLS_FOR_DOMAINS[selectedDomain] || [];
                          setSkills(defaultSkills);
                          localStorage.setItem("offerbuddy_skills_list", JSON.stringify(defaultSkills));

                          // Apply sector-specific profile alignment defaults
                          const defaults = DOMAIN_DEFAULTS[selectedDomain];
                          if (defaults) {
                            setDegree(defaults.degree);
                            setMajor(defaults.major);
                            setJobType(defaults.jobType);
                            setTargetCompaniesInput(defaults.targetCompanies);
                            setResumeText(defaults.resumeText);
                          }
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer focus:outline-none"
                      >
                        {Object.keys(SECTOR_ROLES).map((sector) => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Target Job Role */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Target Job Role
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer focus:outline-none"
                      >
                        {(SECTOR_ROLES[domain] || []).map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONNECTED PLATFORMS */}
            {activeTab === "coding" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Globe className="h-4.5 w-4.5 text-blue-500" />
                    <span>Connected Coding & Social Handles</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] leading-normal mt-0.5">
                    Linking these allows AI tools to reference your profiles, analyze coding activity, and customize logic/style feedback.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* LinkedIn Profile */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      LinkedIn Profile URL
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                      <span className="pl-3.5 flex items-center"><Linkedin className="h-4 w-4 text-blue-600" /></span>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full pl-2.5 pr-4 py-2.5 bg-transparent text-slate-700 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Portfolio Website */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Personal Portfolio URL
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                      <span className="pl-3.5 flex items-center"><LinkIcon className="h-4 w-4 text-indigo-500" /></span>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://janesmith.dev"
                        className="w-full pl-2.5 pr-4 py-2.5 bg-transparent text-slate-700 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* LeetCode Username */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      LeetCode Username
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                      <span className="pl-3.5 text-xs font-black text-orange-500 font-mono">LC</span>
                      <input
                        type="text"
                        value={leetcodeUsername}
                        onChange={(e) => setLeetcodeUsername(e.target.value)}
                        placeholder="e.g. janesmith_lc"
                        className="w-full pl-3.5 pr-4 py-2.5 bg-transparent text-slate-700 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* GitHub Username */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      GitHub Username
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                      <span className="pl-3.5 text-xs font-black text-slate-800 font-mono">GH</span>
                      <input
                        type="text"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        placeholder="e.g. janesmith_dev"
                        className="w-full pl-3.5 pr-4 py-2.5 bg-transparent text-slate-700 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* HackerRank Username */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      HackerRank Username
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                      <span className="pl-3.5 text-xs font-black text-emerald-600 font-mono">HR</span>
                      <input
                        type="text"
                        value={hackerrankUsername}
                        onChange={(e) => setHackerrankUsername(e.target.value)}
                        placeholder="e.g. janesmith_hr"
                        className="w-full pl-3.5 pr-4 py-2.5 bg-transparent text-slate-700 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* CodeChef Username */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      CodeChef Username
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                      <span className="pl-3.5 text-xs font-black text-amber-700 font-mono">CC</span>
                      <input
                        type="text"
                        value={codechefUsername}
                        onChange={(e) => setCodechefUsername(e.target.value)}
                        placeholder="e.g. janesmith_cc"
                        className="w-full pl-3.5 pr-4 py-2.5 bg-transparent text-slate-700 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TECH STACK & TARGETS */}
            {activeTab === "preference" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Target className="h-4.5 w-4.5 text-blue-500" />
                    <span>Tech Stack & Placement Preferences</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] leading-normal mt-0.5">
                    Specify preferred career alignments, dream employers, and core technological tools in your toolkit.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Job Type Preference */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Job Type Preference
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:border-blue-500 transition-colors appearance-none cursor-pointer focus:outline-none"
                      >
                        <option value="Full-time SDE">Full-time SDE (SDE-1 Roles)</option>
                        <option value="SDE Internship">Summer SDE Internship</option>
                        <option value="Co-op Placement">Co-op / Semester Internship</option>
                        <option value="Research Fellow">ML Research Fellow / Systems Intern</option>
                      </select>
                    </div>
                  </div>

                  {/* Target companies */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Target Employers (Comma separated)
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={targetCompaniesInput}
                        onChange={(e) => setTargetCompaniesInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Google, Microsoft, Stripe, OpenAI"
                      />
                    </div>
                  </div>
                </div>

                {/* Interactive Multi-tag Skills Checklist */}
                <div className="space-y-3 bg-slate-50/50 border border-slate-200/50 p-4 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Cpu className="h-4 w-4 text-blue-500 animate-pulse" />
                      <span>Skill Arsenal Checklist</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Your technical tool stack. These are utilized in the ATS Resume reviews and Skill Gap trackers.
                    </p>
                  </div>

                  {/* Add skill row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      className="flex-grow px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                      placeholder="Add a new technical tool or concept (e.g. Docker, GraphQL)..."
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Display list of skill tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 shadow-xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: RESUME TEXT */}
            {activeTab === "resume" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="h-4.5 w-4.5 text-blue-500" />
                    <span>Plain-Text Resume Reference</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] leading-normal mt-0.5">
                    Paste your core raw resume content. The AI Agent pulls this reference when scoring your overall placement telemetry.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Plain-Text Resume Content
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={12}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-mono text-xs leading-normal focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Paste plain text of your resume (Contact Info, Education, Experience, Projects, etc.)..."
                  />
                </div>

                <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/50 flex items-start gap-3 text-slate-600 text-xs leading-relaxed text-left font-sans">
                  <Zap className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span className="font-extrabold text-slate-800 block text-xs">💡 Pro-Tip for ATS Optimizations</span>
                    <span>Keep your resume parsing structured into clearly marked sections (e.g., EDUCATION, EXPERIENCE, PROJECTS, SKILLS). Our background analyzer matches these tags against {domain === "Tech & IT" ? "SDE" : domain} job descriptions.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Consistency newsletter Alerts */}
            <div className="border-t border-slate-100 pt-6 space-y-4 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-purple-500" />
                  <span>Consistency Drives & Email Digests</span>
                </h3>
                <p className="text-slate-400 text-[11px] leading-normal mt-0.5">
                  Maintain streaks and keep study goals on schedule. Subscribe to mock placement newsletters to get study triggers.
                </p>
              </div>

              <label className="flex items-start gap-3 p-4 bg-purple-50/40 border border-purple-100 rounded-2xl cursor-pointer hover:bg-purple-50 transition-colors select-none text-left">
                <input
                  type="checkbox"
                  checked={enableEmailAlerts}
                  onChange={(e) => setEnableEmailAlerts(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Enable Mock Placement Progress Digests & Streaks Reminders
                  </p>
                  <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed font-sans">
                    We'll mock-send study triggers, bonus placement hacks, and profile consistency metrics to <strong className="text-purple-600">{user?.email || "your email"}</strong> to keep your preparation streak highly active.
                  </p>
                </div>
              </label>
            </div>

            {/* Action controls button */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                {domain === "Tech & IT" ? "SDE" : domain} Placement Assistant Core v4.1
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] transition-transform text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Synchronizing credentials...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-white" />
                    <span>Apply Portfolio Specifications</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </form>

        {/* Real-World Quick View Student Card Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-6 text-left">
            
            {/* High-Fidelity Candidate ID Badge */}
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-150 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 font-black text-slate-100 text-6xl select-none font-mono tracking-tighter">ID</div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-white text-base font-black shadow-sm">
                    {name ? name[0].toUpperCase() : "S"}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 leading-none">{name || "Jane Smith"}</h4>
                    <span className="text-[10px] text-blue-600 font-bold block mt-1 uppercase tracking-wide">{targetRole || "Candidate"}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/70 pt-3 space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 font-semibold uppercase">GPA Metric</span>
                    <span className="text-slate-700 font-extrabold font-mono">{cgpa || "8.8/10.0"}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 font-semibold uppercase">Univ Ref</span>
                    <span className="text-slate-700 font-extrabold truncate max-w-[130px]">{university || "State Institute of Tech"}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 font-semibold uppercase">Preference</span>
                    <span className="text-slate-700 font-extrabold">{jobType || "Full-time SDE"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Verification Checklist</span>
              </h4>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 bg-slate-50/50 rounded-xl text-[11px]">
                  <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${leetcodeUsername ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}>
                    {leetcodeUsername ? "✓" : "1"}
                  </span>
                  <div className="flex-grow">
                    <span className="font-bold text-slate-700 block leading-none">LeetCode Integration</span>
                    <span className="text-slate-400 text-[9px] block mt-0.5">{leetcodeUsername ? `Linked: @${leetcodeUsername}` : "Complete handle to fetch DSA activity"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-slate-50/50 rounded-xl text-[11px]">
                  <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${githubUsername ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}>
                    {githubUsername ? "✓" : "2"}
                  </span>
                  <div className="flex-grow">
                    <span className="font-bold text-slate-700 block leading-none">GitHub Portfolio Link</span>
                    <span className="text-slate-400 text-[9px] block mt-0.5">{githubUsername ? `Linked: @${githubUsername}` : "Connect projects repo context"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-slate-50/50 rounded-xl text-[11px]">
                  <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${skills.length >= 5 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}>
                    {skills.length >= 5 ? "✓" : "3"}
                  </span>
                  <div className="flex-grow">
                    <span className="font-bold text-slate-700 block leading-none">Core Tool Stack</span>
                    <span className="text-slate-400 text-[9px] block mt-0.5">{skills.length >= 5 ? `${skills.length} Technical skills declared` : "Include at least 5 core technologies"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-slate-50/50 rounded-xl text-[11px]">
                  <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${resumeText.length > 80 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}>
                    {resumeText.length > 80 ? "✓" : "4"}
                  </span>
                  <div className="flex-grow">
                    <span className="font-bold text-slate-700 block leading-none">ATS Resume Parse</span>
                    <span className="text-slate-400 text-[9px] block mt-0.5">{resumeText.length > 80 ? "Resume block configured successfully" : "Paste raw details for ATS optimization"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick social shortcuts */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Online Portfolios Shortcuts</span>
              <div className="grid grid-cols-2 gap-2">
                {linkedinUrl ? (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-50 hover:bg-blue-100/70 text-blue-700 text-[10px] font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
                  >
                    <Linkedin className="h-3 w-3 shrink-0" />
                    <span className="truncate">LinkedIn</span>
                    <ExternalLink className="h-2 w-2 shrink-0" />
                  </a>
                ) : (
                  <span className="p-2 bg-slate-50 text-slate-400 text-[10px] text-center rounded-xl font-medium">No LinkedIn</span>
                )}

                {portfolioUrl ? (
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-indigo-50 hover:bg-indigo-100/70 text-indigo-700 text-[10px] font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
                  >
                    <LinkIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">Portfolio</span>
                    <ExternalLink className="h-2 w-2 shrink-0" />
                  </a>
                ) : (
                  <span className="p-2 bg-slate-50 text-slate-400 text-[10px] text-center rounded-xl font-medium">No Website</span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
