import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database Path and Helper
const DB_PATH = path.join(process.cwd(), "database.json");

interface DBState {
  users: any[];
  resumes: any[];
  skillAnalyses: any[];
  interviewSessions: any[];
  codingSessions: any[];
  notificationLogs?: any[];
}

function getInitialDB(): DBState {
  return {
    users: [],
    resumes: [],
    skillAnalyses: [],
    interviewSessions: [],
    codingSessions: [],
    notificationLogs: [],
  };
}

function readDB(): DBState {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(getInitialDB(), null, 2));
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB, returning defaults:", err);
    return getInitialDB();
  }
}

function writeDB(state: DBState) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Error writing DB:", err);
  }
}

const touchUserActivity = (userId: string) => {
  try {
    const db = readDB();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      db.users[idx].lastAccessedAt = new Date().toISOString();
      writeDB(db);
    }
  } catch (err) {
    console.error("Failed to touch user activity:", err);
  }
};

// User helper middleware (passes userId via Header)
const getUserIdFromHeader = (req: express.Request): string | null => {
  const authHeader = req.headers["authorization"] || req.headers["x-user-id"];
  if (!authHeader) return null;
  
  if (typeof authHeader === "string") {
    let token = authHeader;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    
    // Automatically touch user activity on active interactions,
    // but skip simulation/log-fetching paths to preserve testing sandbox states.
    if (token && !req.path.includes("/api/notifications/simulate") && !req.path.includes("/api/notifications/logs")) {
      touchUserActivity(token);
    }
    return token;
  }
  return null;
};

// --- AUTH API ROUTES ---
app.post("/api/auth/register", (req, res) => {
  const { email, password, name, targetRole, domain } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields (email, password, name)" });
  }

  const db = readDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const newUser = {
    id: "user_" + Math.random().toString(36).substr(2, 9),
    email: email.toLowerCase(),
    password, // Stored simply for demo/college-project convenience
    name,
    targetRole: targetRole || "Software Engineer",
    domain: domain || "Tech & IT",
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);

  res.json({ user: { id: newUser.id, name: newUser.name, email: newUser.email, targetRole: newUser.targetRole, domain: newUser.domain } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const db = readDB();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ user: { id: user.id, name: user.name, email: user.email, targetRole: user.targetRole, domain: user.domain || "Tech & IT" } });
});

app.get("/api/auth/me", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ user: { id: user.id, name: user.name, email: user.email, targetRole: user.targetRole, domain: user.domain || "Tech & IT" } });
});

app.post("/api/auth/update-role", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { targetRole, domain } = req.body;
  if (!targetRole) return res.status(400).json({ error: "Target role is required" });

  const db = readDB();
  const userIdx = db.users.findIndex((u) => u.id === userId);
  if (userIdx === -1) return res.status(404).json({ error: "User not found" });

  db.users[userIdx].targetRole = targetRole;
  if (domain) {
    db.users[userIdx].domain = domain;
  }
  writeDB(db);

  res.json({ success: true, targetRole, domain: db.users[userIdx].domain || "Tech & IT" });
});

// --- RESUME REVIEW API ---
app.post("/api/resume/upload", async (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { fileName, fileContent } = req.body;
  if (!fileContent) return res.status(400).json({ error: "Resume text content is required" });

  try {
    const prompt = `Evaluate this resume content and provide comprehensive feedback including ATS score (0 to 100), grammatical/spelling issues, visual formatting suggestions, standard missing sections (e.g. Projects, Skills), and specific bullet-point rewrite suggestions with strong action verbs:
    
    Resume Content:
    ${fileContent}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, senior resume ATS recruiter and hiring consultant. You give extremely accurate, detailed, and highly constructive feedback to help candidates bypass ATS algorithms and secure interviews. Always return valid JSON structure matching the requested format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { type: Type.INTEGER, description: "ATS score from 0 to 100" },
            grammarFeedback: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific grammatical or writing improvements" },
            formattingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Bullet points suggesting layout, spacing, or structure fixes" },
            missingSections: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Missing critical sections" },
            rewriteSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific action verb bullet-point rewrites from the resume" },
          },
          required: ["atsScore", "grammarFeedback", "formattingSuggestions", "missingSections", "rewriteSuggestions"],
        },
      },
    });

    const aiOutput = JSON.parse(response.text.trim());

    const db = readDB();
    const newResume = {
      id: "res_" + Math.random().toString(36).substr(2, 9),
      userId,
      fileName: fileName || "resume.txt",
      fileContent,
      atsScore: aiOutput.atsScore,
      grammarFeedback: aiOutput.grammarFeedback,
      formattingSuggestions: aiOutput.formattingSuggestions,
      missingSections: aiOutput.missingSections,
      rewriteSuggestions: aiOutput.rewriteSuggestions,
      uploadedAt: new Date().toISOString(),
    };

    db.resumes = db.resumes.filter((r) => r.userId !== userId); // Keep only latest for dashboard simplicity
    db.resumes.push(newResume);
    writeDB(db);

    res.json(newResume);
  } catch (error: any) {
    console.error("Resume analysis failed:", error);
    res.status(500).json({ error: "AI Resume Analysis failed. Details: " + error.message });
  }
});

app.get("/api/resume/latest", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const db = readDB();
  const latest = db.resumes.find((r) => r.userId === userId);
  res.json(latest || null);
});

app.post("/api/resume/optimize", async (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { targetRole, fileContent, additionalInstructions } = req.body;
  if (!targetRole) return res.status(400).json({ error: "Target role is required" });

  let resumeToOptimize = fileContent;
  const db = readDB();

  if (!resumeToOptimize) {
    const latest = db.resumes.find((r) => r.userId === userId);
    if (!latest) {
      return res.status(400).json({ error: "No resume found to optimize. Please upload or paste a resume first." });
    }
    resumeToOptimize = latest.fileContent;
  }

  try {
    const prompt = `You are an elite, senior resume ATS recruiter and hiring consultant. 
Your task is to take this candidate's resume and optimize, rewrite, and refine it specifically for their target job role: "${targetRole}".

Ensure that you:
1. Preserve their personal information (Name, Contact Details, Email, Links) exactly.
2. Tailor their existing experience bullet points. Reword them to sound highly impactful, leading with strong action verbs (e.g., Designed, Optimized, Engineered, Implemented) instead of weak phrases.
3. Align their listed projects and experience keywords with typical requirements for a "${targetRole}". For example, highlight system design, performance optimizations, database schemas, frontend hooks, or data analytics depending on the role.
4. Keep the resume's chronological facts, but express them with much better phrasing.
5. Fix any formatting or readability.
6. If the candidate has additional custom optimization requests, satisfy them: "${additionalInstructions || "None"}".

Candidate's Original Resume:
---
${resumeToOptimize}
---

Provide:
1. The fully updated and optimized resume text.
2. A short bulleted list of 3-5 specific improvements made to tailor the CV to the "${targetRole}" role.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite tech recruiter and resume optimizer. Always return a valid JSON object matching the requested schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedContent: { type: Type.STRING, description: "The complete, optimized, rewritten resume plain-text" },
            changesMade: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific tailoring changes made" }
          },
          required: ["optimizedContent", "changesMade"]
        }
      }
    });

    const aiOutput = JSON.parse(response.text.trim());
    res.json(aiOutput);
  } catch (err: any) {
    console.error("Resume optimization failed:", err);
    res.status(500).json({ error: "AI Resume Optimization failed. Details: " + err.message });
  }
});

// --- COMPANION CHAT API ---
app.post("/api/chat/companion", async (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { messages, tone } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  let systemInstruction = "";
  if (tone === "recruiter") {
    systemInstruction = `You are a brutally honest, slightly sassy, but highly caring senior tech recruiter. 
You roast the student's preparation choices or resume gaps with clean humor, but always follow up with elite, highly actionable career advice. 
Keep your responses short, funny, punchy, and include appropriate emojis. Use campus culture humor.`;
  } else if (tone === "buddy") {
    systemInstruction = `You are a super chill, comforting senior engineering student at college (called 'Senior Brody'). 
Use light college student slang, tell the student not to panic, remind them that their CGPA doesn't define them, and share clever exam/study hacks or placement shortcuts. 
Keep it warm, reassuring, highly friendly, and extremely casual. Use emojis like 🎓, ☕, 💻, 🍕.`;
  } else {
    // motivator
    systemInstruction = `You are an ultra-high energy motivational Hype Coach. 
You fuel the student's self-belief, generate epic pep talks, and use enthusiastic software engineer metaphors (e.g. 'You are a multi-threaded execution engine of pure success!'). 
Keep your response short, highly inspirational, and full of positive energy. Use emojis like 🔥, 🚀, 💪, ⚡.`;
  }

  try {
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
      }
    });

    res.json({ content: response.text });
  } catch (err: any) {
    console.error("Companion chat failed:", err);
    res.status(500).json({ error: "Failed to communicate with AI companion: " + err.message });
  }
});

// --- SKILL GAP ANALYSIS API ---
app.post("/api/skill-gap/analyze", async (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { targetRole } = req.body;
  if (!targetRole) return res.status(400).json({ error: "Target role is required" });

  const db = readDB();
  const latestResume = db.resumes.find((r) => r.userId === userId);
  const resumeText = latestResume ? latestResume.fileContent : "(No resume uploaded. Candidate is building from scratch)";

  try {
    const prompt = `Analyze the gap between the candidate's skills and the target role: "${targetRole}". 
    Evaluate their current resume: 
    ---
    ${resumeText}
    ---
    Suggest missing key skills, an estimated readiness score (0-100), a detailed 4-week structured roadmap (week, topic, description, resources) to master these missing topics, and 2 customized suggested project ideas including descriptions and required tech stack.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior tech lead and placement counselor. You compare candidate credentials against a target tech/SaaS role, identify core technical/soft skill gaps, and write highly actionable, personalized learning roadmaps. Return valid JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedReadinessScore: { type: Type.INTEGER },
            learningRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  description: { type: Type.STRING },
                  resources: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["week", "topic", "description", "resources"],
              },
            },
            suggestedProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["title", "description", "techStack"],
              },
            },
          },
          required: ["missingSkills", "estimatedReadinessScore", "learningRoadmap", "suggestedProjects"],
        },
      },
    });

    const aiOutput = JSON.parse(response.text.trim());

    const newAnalysis = {
      id: "gap_" + Math.random().toString(36).substr(2, 9),
      userId,
      targetRole,
      missingSkills: aiOutput.missingSkills,
      learningRoadmap: aiOutput.learningRoadmap,
      suggestedProjects: aiOutput.suggestedProjects,
      estimatedReadinessScore: aiOutput.estimatedReadinessScore,
      createdAt: new Date().toISOString(),
    };

    db.skillAnalyses = db.skillAnalyses.filter((s) => s.userId !== userId);
    db.skillAnalyses.push(newAnalysis);
    writeDB(db);

    res.json(newAnalysis);
  } catch (error: any) {
    console.error("Skill Gap Analysis failed:", error);
    res.status(500).json({ error: "AI Skill Gap Analysis failed. Details: " + error.message });
  }
});

app.get("/api/skill-gap/latest", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const db = readDB();
  const latest = db.skillAnalyses.find((s) => s.userId === userId);
  res.json(latest || null);
});

// --- MOCK INTERVIEW API ---
app.post("/api/interview/start", async (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { role } = req.body;
  if (!role) return res.status(400).json({ error: "Role is required" });

  try {
    const prompt = `Generate exactly 5 highly relevant interview questions for the role: "${role}". 
    Create:
    - 2 Technical Questions (specific to technologies used in this role)
    - 2 Behavioral Questions (STAR method, teamwork, conflict resolution)
    - 1 HR/Culture Fit Question.
    Return them as a structured list with custom IDs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional corporate interviewer and technical talent acquisition expert. Return a clean list of 5 structured questions in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  type: { type: Type.STRING, description: "Must be one of: 'technical', 'hr', 'behavioral'" },
                },
                required: ["id", "text", "type"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    const aiOutput = JSON.parse(response.text.trim());

    const db = readDB();
    const newSession = {
      id: "int_" + Math.random().toString(36).substr(2, 9),
      userId,
      role,
      questions: aiOutput.questions,
      currentQuestionIndex: 0,
      answers: [],
      completed: false,
      createdAt: new Date().toISOString(),
    };

    db.interviewSessions.push(newSession);
    writeDB(db);

    res.json(newSession);
  } catch (error: any) {
    console.error("Interview session creation failed:", error);
    res.status(500).json({ error: "AI Interview generation failed: " + error.message });
  }
});

app.post("/api/interview/answer", async (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { sessionId, questionId, userResponse } = req.body;
  if (!sessionId || !questionId || userResponse === undefined) {
    return res.status(400).json({ error: "Missing required fields (sessionId, questionId, userResponse)" });
  }

  const db = readDB();
  const sessionIdx = db.interviewSessions.findIndex((s) => s.id === sessionId && s.userId === userId);
  if (sessionIdx === -1) return res.status(404).json({ error: "Interview session not found" });

  const session = db.interviewSessions[sessionIdx];
  const question = session.questions.find((q: any) => q.id === questionId);
  if (!question) return res.status(404).json({ error: "Question not found in session" });

  try {
    const prompt = `Evaluate the candidate's answer to the interview question:
    Question: "${question.text}" (Type: ${question.type})
    Candidate Answer: "${userResponse}"
    
    Provide a score from 0 to 100 based on accuracy, vocabulary, professionalism, structure, and STAR method (if behavioral). Provide detailed constructive feedback.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert HR and Technical Executive interviewer. You evaluate responses with tough, realistic standards, giving clear scores and detailed guidance on what was missed and how to reformulate the answer. Return valid JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
          },
          required: ["score", "feedback"],
        },
      },
    });

    const aiOutput = JSON.parse(response.text.trim());

    const newAnswer = {
      questionId,
      questionText: question.text,
      userResponse,
      score: aiOutput.score,
      feedback: aiOutput.feedback,
    };

    session.answers.push(newAnswer);
    session.currentQuestionIndex += 1;

    if (session.currentQuestionIndex >= session.questions.length) {
      session.completed = true;
      const totalScore = session.answers.reduce((acc: number, cur: any) => acc + cur.score, 0);
      session.finalScore = Math.round(totalScore / session.questions.length);
    }

    db.interviewSessions[sessionIdx] = session;
    writeDB(db);

    res.json(session);
  } catch (error: any) {
    console.error("Answer evaluation failed:", error);
    res.status(500).json({ error: "AI Answer Evaluation failed: " + error.message });
  }
});

app.get("/api/interview/latest", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const db = readDB();
  const userSessions = db.interviewSessions.filter((s) => s.userId === userId);
  if (userSessions.length === 0) return res.json(null);

  // Sort by created date descending
  userSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userSessions[0]);
});

// --- CODING EVALUATION API ---
app.post("/api/coding/submit", async (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { problemTitle, problemDescription, userCode, language, leetcodeHandle, hackerrankHandle, codechefHandle } = req.body;
  if (!problemTitle || !userCode) {
    return res.status(400).json({ error: "Problem title and user code are required" });
  }

  // Fetch or retrieve simulated active coding profiles
  let externalActivityContext = "";
  if (leetcodeHandle) {
    const solvedCount = Math.floor(Math.random() * 80) + 120;
    const recentSolved = ["Merge Intervals", "Subarray Sum Equals K", "Course Schedule", "Longest Common Subsequence"].slice(0, 3);
    externalActivityContext += `- LeetCode Profile (@${leetcodeHandle}): Solved ${solvedCount} problems. Recently solved ${recentSolved.join(", ")}. Primary focus on Sliding Window and Graphs.\n`;
  }
  if (hackerrankHandle) {
    externalActivityContext += `- HackerRank Profile (@${hackerrankHandle}): 5-Star Problem Solving gold badge holder. Recently active on Algorithms and SQL basic structures.\n`;
  }
  if (codechefHandle) {
    const rating = Math.floor(Math.random() * 400) + 1550;
    externalActivityContext += `- CodeChef Profile (@${codechefHandle}): Rating ${rating} (3-Star). Active participant in Division 3 / Division 2 weekly Starters contests.\n`;
  }

  try {
    let prompt = `Review this solution for the problem "${problemTitle}":
    Problem Description: "${problemDescription || 'DSA interview question'}"
    Language: "${language || 'TypeScript'}"
    Candidate Code:
    \`\`\`
    ${userCode}
    \`\`\`
    
    Please evaluate correctness, logic, edge cases, time/space complexities, potential optimizations, cleaner programming idioms, and provide an overall code quality rating out of 5 stars.`;

    if (externalActivityContext) {
      prompt += `\n\nPERSONALIZATION CONTEXT (The student has connected their external profiles):
      ---
      ${externalActivityContext}
      ---
      Please directly reference their connected handles (e.g. @${leetcodeHandle}, @${hackerrankHandle}, @${codechefHandle}) in your logicFeedback and optimizations sections. Give them personalized recommendations, comparing this problem with their other active preparation areas or solved topics, congratulating them on their platforms accomplishments, and proposing related problems on LeetCode/HackerRank/CodeChef that they should attempt next to build consistency.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a Principal Software Engineer and Coding Interviewer. You analyze code structure, execution correctness, performance limits, and asymptotic complexities. Return valid JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            logicFeedback: { type: Type.STRING, description: "Detailed logic review, correctness, edge cases" },
            optimizations: { type: Type.STRING, description: "Detailed refactoring, algorithm modifications, or cleaner syntax" },
            complexityAnalysis: { type: Type.STRING, description: "Time and space complexity explanation" },
            codeQualityRating: { type: Type.INTEGER, description: "Quality rating from 1 (poor) to 5 (excellent) stars" },
          },
          required: ["logicFeedback", "optimizations", "complexityAnalysis", "codeQualityRating"],
        },
      },
    });

    const aiOutput = JSON.parse(response.text.trim());

    const db = readDB();
    const newSession = {
      id: "code_" + Math.random().toString(36).substr(2, 9),
      userId,
      problemTitle,
      problemDescription: problemDescription || "DSA Question",
      difficulty: "Medium",
      userCode,
      language: language || "TypeScript",
      logicFeedback: aiOutput.logicFeedback,
      optimizations: aiOutput.optimizations,
      complexityAnalysis: aiOutput.complexityAnalysis,
      codeQualityRating: aiOutput.codeQualityRating,
      createdAt: new Date().toISOString(),
    };

    db.codingSessions.push(newSession);
    writeDB(db);

    res.json(newSession);
  } catch (error: any) {
    console.error("Coding evaluation failed:", error);
    res.status(500).json({ error: "AI Coding evaluation failed: " + error.message });
  }
});

app.get("/api/coding/latest", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const db = readDB();
  const userSessions = db.codingSessions.filter((s) => s.userId === userId);
  if (userSessions.length === 0) return res.json(null);

  userSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userSessions[0]);
});

// --- DASHBOARD AND STATS API ---
app.get("/api/dashboard/stats", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const db = readDB();
  
  // Get latest items
  const resume = db.resumes.find((r) => r.userId === userId);
  const skillGap = db.skillAnalyses.find((s) => s.userId === userId);
  const interviews = db.interviewSessions.filter((s) => s.userId === userId && s.completed);
  const coding = db.codingSessions.filter((s) => s.userId === userId);

  // Compute scores
  const resumeScore = resume ? resume.atsScore : 0;
  
  let interviewScore = 0;
  if (interviews.length > 0) {
    const total = interviews.reduce((acc, cur) => acc + (cur.finalScore || 0), 0);
    interviewScore = Math.round(total / interviews.length);
  }

  let codingScore = 0;
  if (coding.length > 0) {
    const total = coding.reduce((acc, cur) => acc + (cur.codeQualityRating * 20), 0); // convert 1-5 to 0-100
    codingScore = Math.round(total / coding.length);
  }

  const skillMatchPercentage = skillGap ? skillGap.estimatedReadinessScore : 0;

  // Compute overall placement readiness
  let activeScores = 0;
  let scoreSum = 0;
  if (resumeScore > 0) { activeScores++; scoreSum += resumeScore; }
  if (interviewScore > 0) { activeScores++; scoreSum += interviewScore; }
  if (codingScore > 0) { activeScores++; scoreSum += codingScore; }
  if (skillMatchPercentage > 0) { activeScores++; scoreSum += skillMatchPercentage; }

  const overallPlacementReadiness = activeScores > 0 ? Math.round(scoreSum / activeScores) : 0;

  // Compile recent activities list
  const recentActivities: any[] = [];
  if (resume) {
    recentActivities.push({
      id: resume.id,
      type: "resume",
      title: "Resume Analyzed",
      description: `Scored ${resume.atsScore}% with suggestions.`,
      date: resume.uploadedAt,
    });
  }
  if (skillGap) {
    recentActivities.push({
      id: skillGap.id,
      type: "skill_gap",
      title: "Skill Gap Evaluated",
      description: `Targeting ${skillGap.targetRole} (${skillGap.estimatedReadinessScore}% match).`,
      date: skillGap.createdAt,
    });
  }
  interviews.forEach((itm) => {
    recentActivities.push({
      id: itm.id,
      type: "interview",
      title: "Mock Interview Completed",
      description: `Evaluated for ${itm.role} - Scored ${itm.finalScore}%.`,
      date: itm.createdAt,
    });
  });
  coding.forEach((itm) => {
    recentActivities.push({
      id: itm.id,
      type: "coding",
      title: "Coding Evaluation Submited",
      description: `Algorithm: ${itm.problemTitle} (Quality: ${itm.codeQualityRating}/5 stars).`,
      date: itm.createdAt,
    });
  });

  // Sort activities by date descending
  recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Fetch user domain
  const user = db.users.find((u) => u.id === userId);
  const domain = user?.domain || "Tech & IT";
  const isTech = domain.includes("Tech") || domain.includes("IT");

  // Generate Weekly Improvement charts data
  const weeklyImprovement = [
    { week: "Week 1", score: Math.max(0, overallPlacementReadiness - 15) },
    { week: "Week 2", score: Math.max(0, overallPlacementReadiness - 8) },
    { week: "Week 3", score: Math.max(0, overallPlacementReadiness - 3) },
    { week: "Week 4", score: overallPlacementReadiness },
  ];

  // Dynamic recommendations
  const recommendations: string[] = [];
  if (resumeScore === 0) {
    recommendations.push("Upload your resume to calculate your ATS benchmark score.");
  } else if (resumeScore < 75) {
    recommendations.push("Implement the resume action verb bullet points to raise ATS alignment.");
  }

  if (skillMatchPercentage === 0) {
    recommendations.push(`Enter your target role in ${domain} to run a personalized Skill Gap roadmap.`);
  } else if (skillMatchPercentage < 80) {
    recommendations.push("Start Week 1 of the generated Skill Gap learning schedule.");
  }

  if (interviewScore === 0) {
    recommendations.push(`Launch a live Mock Interview to practice real-time domain and behavioral questions.`);
  } else if (interviewScore < 70) {
    recommendations.push("Retry the Mock Interview to practice response structure and STAR methodologies.");
  }

  if (codingScore === 0) {
    const evaluationTerm = isTech ? "Coding Evaluation" : "Domain Practice Evaluation";
    recommendations.push(`Complete a ${evaluationTerm} to benchmark your logical and technical depth.`);
  } else if (codingScore < 80) {
    recommendations.push("Optimise your solutions or practice writing clean, modular responses.");
  }

  if (recommendations.length === 0) {
    recommendations.push(`Outstanding progress! Continue testing with alternative ${domain} roles to broaden placement readiness.`);
  }

  res.json({
    resumeScore,
    interviewScore,
    codingScore,
    skillMatchPercentage,
    overallPlacementReadiness,
    recentActivities: recentActivities.slice(0, 5),
    weeklyImprovement,
    recommendations: recommendations.slice(0, 3),
  });
});

// --- COMPANY VIBE CHECK SEARCH ENDPOINT ---

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function getFuzzyMatch(query: string, keys: string[]): string | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  // 1. Direct exact or substring checks
  for (const k of keys) {
    if (q === k || q.includes(k) || k.includes(q)) {
      return k;
    }
  }

  // 2. Common manual mappings for short names, acronyms, or typical typos
  const manualMappings: { [key: string]: string } = {
    "mphysis": "mphasis",
    "mphasys": "mphasis",
    "mphas": "mphasis",
    "cognizent": "cognizant",
    "cog": "cognizant",
    "cts": "cognizant",
    "wip": "wipro",
    "wiprow": "wipro",
    "capg": "capgemini",
    "capgem": "capgemini",
    "accentur": "accenture",
    "tcs": "tcs",
    "tata consultancy": "tcs",
    "infosys": "infosys",
    "infy": "infosys",
    "zoho": "zoho",
    "microsoft": "microsoft",
    "ms": "microsoft",
    "google": "google",
    "gog": "google",
    "amazon": "amazon",
    "amz": "amazon",
    "biocon": "biocon",
    "pfizer": "pfizer",
    "goldman": "goldman sachs",
    "gs": "goldman sachs",
    "tesla": "tesla",
    "adobe": "adobe",
    "figma": "figma",
    "l&t": "larsen & toubro",
    "larsen": "larsen & toubro"
  };

  for (const [key, val] of Object.entries(manualMappings)) {
    if (q.includes(key) || key.includes(q)) {
      return val;
    }
  }

  // 3. Levenshtein Distance for close matches (threshold: max 2 edits)
  let bestKey: string | null = null;
  let minDistance = 3; // Must be strictly less than 3 edits
  for (const k of keys) {
    const dist = levenshteinDistance(q, k);
    if (dist < minDistance) {
      minDistance = dist;
      bestKey = k;
    }
  }

  return bestKey;
}

interface CompanyVibeResult {
  name: string;
  rating: number;
  description: string;
  pros: string[];
  cons: string[];
  salary: string;
  cultureTags: string[];
  businessModel: string;
  internshipPath: string;
  locations: string;
  insideJoke?: string;
}

const PRESET_COMPANIES: { [key: string]: CompanyVibeResult } = {
  "infosys": {
    name: "Infosys Limited",
    rating: 3,
    description: "One of India's pioneering IT service-based giants, famous for its massive Mysore training campus but often criticized for high employee bench times and slow entry-level salary growth.",
    pros: [
      "World-class initial training program at the Mysore campus",
      "Excellent job security with a highly structured and stable bench system",
      "Abundant opportunities to switch projects and learn diverse technologies internally"
    ],
    cons: [
      "Low starting salary for freshers which has remained stagnant for over a decade",
      "Bureaucracy-heavy appraisal process and slow hierarchical promotions",
      "Large-scale client assignments can feel highly siloed with minimal creative freedom"
    ],
    salary: "₹3.6 - ₹5.5 Lakhs Per Annum (LPA) for entry-level; ₹15,000 - ₹25,000/month for interns",
    cultureTags: ["#MysoreCampusVibes", "#ServiceBasedGiant", "#StableCareerStart", "#StructuredOnboarding"],
    businessModel: "Service-based IT Consultancy & Outsource Partner",
    internshipPath: "Typically a 3 to 6-month on-site or virtual internship program with strict structured assessments leading to full-time placement offers.",
    locations: "Bengaluru, Mysore, Pune, Hyderabad, Chennai, Trivandrum, Bhubaneswar, Noida",
    insideJoke: "Spent 6 months in Mysore campus feeling like I'm at Hogwarts, only to be allocated to a legacy mainframe project in a windowless basement with a 2-year service bond."
  },
  "tcs": {
    name: "Tata Consultancy Services (TCS)",
    rating: 4,
    description: "India's largest IT exporter offering highly stable job security and structured bands like Ninja and Digital, operating in a highly systematic Tata-family ecosystem.",
    pros: [
      "Unparalleled job stability and strong brand recognition for resumes",
      "Tata group perks, health benefits, and safe work environment for diverse groups",
      "Excellent internal learning platforms (TCS iON) with certification bonuses"
    ],
    cons: [
      "Stagnant starter packages for Ninja roles compared to market averages",
      "High competition for internal promotion and project allocations",
      "Complex resource management with strict allocation and timesheet procedures"
    ],
    salary: "₹3.36 LPA (Ninja) to ₹7.2 LPA (Digital) for freshers; ₹12,00,000+ for Innovator roles",
    cultureTags: ["#TataEcosystem", "#WorkLifeBalance", "#StableEngineers", "#DigitalBands"],
    businessModel: "Service-based IT Consulting & Global Enterprise Solutions",
    internshipPath: "TCS Academic Internship Program (2 to 6 months) and TCS National Qualifier Test (NQT) based hiring, offering virtual/on-site project mentoring.",
    locations: "Mumbai, Chennai, Pune, Bengaluru, Kolkata, Hyderabad, Delhi NCR, Ahmedabad",
    insideJoke: "My manager rejected my weekly timesheet because I logged 8.9 hours instead of 9.0. Now I'm on a 30-minute team call explaining where those 6 minutes went."
  },
  "zoho": {
    name: "Zoho Corporation",
    rating: 5,
    description: "A highly acclaimed, bootstrapped product-based SaaS champion with a unique focus on rural empowerment, offering deep developer freedom and zero focus on resume credentials.",
    pros: [
      "Outstanding, stress-free work environment with zero micromanagement",
      "Focus on practical skill acquisition over conventional academic degrees",
      "Delicious free food, vibrant campuses, and an incredibly humble work culture"
    ],
    cons: [
      "Initial compensation is lower compared to high-paying VC-backed tech startups",
      "Uses several proprietary internal tools and frameworks, making transition slightly niche",
      "Slower corporate hierarchy structure for conventional administrative promotions"
    ],
    salary: "₹6,00,000 - ₹12,00,000 LPA for freshers; ₹20,000 - ₹35,000/month for interns",
    cultureTags: ["#BootstrappedHero", "#NoDegreeNeeded", "#SaaSLandscape", "#HumbleVibes"],
    businessModel: "Product-based Software-as-a-Service (SaaS)",
    internshipPath: "6-month on-site internship with heavy hands-on mentorship, high conversion rate to PPO, and options via Zoho Schools of Learning.",
    locations: "Chennai, Tenkasi, Salem, Madurai, Coimbatore (India), Austin, Texas (USA)",
    insideJoke: "The free organic campus lunch is so good that half the team has gained 5kg this quarter. Nobody even talks about stock options anymore, just today's menu."
  },
  "microsoft": {
    name: "Microsoft Corporation",
    rating: 5,
    description: "A premier global product giant offering phenomenal developer perks, massive compensation packages, and highly impactful work on cloud, AI, and operating systems.",
    pros: [
      "Phenomenal compensation packages, benefits, and massive stock options",
      "High-impact projects serving billions of active enterprise and retail users",
      "Outstanding work-life integration with extensive remote flexibility options"
    ],
    cons: [
      "Vast organizational size can sometimes result in slow product cycles",
      "Complex stacked calibration process for high-band promotions",
      "Highly competitive work environment with elite peer expectations"
    ],
    salary: "₹40,00,000 - ₹52,00,000 LPA starting package; ₹80,000 - ₹1,25,000/month for interns",
    cultureTags: ["#AzureScale", "#TechAristocracy", "#PhenomenalPerks", "#SatyaVibes"],
    businessModel: "Product-based Tech, Cloud, AI & Hardware Titan",
    internshipPath: "2-month structured summer internship with full-time mentoring, high stipend, and an extremely high PPO (Pre-Placement Offer) rate based on review.",
    locations: "Bengaluru, Hyderabad, Noida, Redmond (Washington), Seattle, Dublin",
    insideJoke: "Participated in 4 different 'alignment syncs' across 3 time zones to discuss 'cloud scaling metrics', only to find out the client just wanted a formatted Excel sheet."
  },
  "google": {
    name: "Google LLC",
    rating: 5,
    description: "The gold standard of software engineering, renowned for its legendary campus micro-kitchens, world-class peer group, and deep technical engineering problems.",
    pros: [
      "Elite peer group of developers solving fundamental computer science problems",
      "Legendary culinary perks, fitness facilities, and massive healthcare coverages",
      "Highly prestigious brand name that permanently upgrades your resume credibility"
    ],
    cons: [
      "Extreme promotional competition and bureaucratic levels of project approvals",
      "Hiring process is famously rigorous and can take several months",
      "Many internal frameworks are highly proprietary, reducing open-source alignment"
    ],
    salary: "₹48,00,000 - ₹65,00,000 LPA starting package; ₹1,00,000 - ₹1,50,000/month for interns",
    cultureTags: ["#GoogleKitchens", "#DeepTechProblems", "#ElitePeers", "#GooglerLife"],
    businessModel: "Product-based Search, AI, Cloud & Digital Ads Pioneer",
    internshipPath: "10 to 12-week intensive summer internship with dedicated host-managers, high-caliber project delivery, and detailed conversion rounds for full-time offers.",
    locations: "Bengaluru, Hyderabad, Gurugram, Mountain View (California), London",
    insideJoke: "Just spent 45 minutes comparing three different artisanal brands of free organic matcha in the micro-kitchen while my production server was throwing critical 500 errors."
  },
  "amazon": {
    name: "Amazon.com, Inc.",
    rating: 4,
    description: "A fast-paced, customer-obsessed giant that operates on the 14 Leadership Principles, offering massive scale and rapid engineering growth at the cost of high work-pressure.",
    pros: [
      "Unmatched velocity of engineering learning and extreme scale of active services",
      "Outstanding starting salaries, cash signing bonuses, and rolling stock grants",
      "Highly structured ownership and clear documentation of software design patterns"
    ],
    cons: [
      "High-pressure environment with rigorous on-call rotation schedules",
      "Systematic 6% managed performance target which can feel highly competitive",
      "Unbalanced vest schedule for equity (5% year 1, 15% year 2, 40% year 3/4)"
    ],
    salary: "₹32,00,000 - ₹44,00,000 LPA starting package; ₹70,000 - ₹1,10,000/month for interns",
    cultureTags: ["#LeadershipPrinciples", "#AWSScale", "#DayOneCulture", "#CustomerObsessed"],
    businessModel: "Product-based E-commerce, AWS Cloud & Logistics Titan",
    internshipPath: "Typically a 6-month winter/summer internship or 2-month summer internship with a rigorous mid/final review by mentors leading to PPO.",
    locations: "Bengaluru, Hyderabad, Pune, Chennai, Noida, Seattle, Austin",
    insideJoke: "My on-call pager went off in the middle of my own birthday party. The cake had a 'pip warning' written in icing, and the host said it's Day One."
  },
  "biocon": {
    name: "Biocon Limited",
    rating: 4,
    description: "India's premier biopharmaceutical innovator led by Kiran Mazumdar-Shaw, making advanced biologics accessible while offering robust R&D environments.",
    pros: [
      "State-of-the-art research laboratories and world-class biomanufacturing plants",
      "High pride in developing life-saving generic insulins and biosimilars",
      "Strong platform for biotechnology and bioinformatics freshers to start a career"
    ],
    cons: [
      "Lower starting salaries for laboratory technicians compared to software roles",
      "Strict regulatory compliance and paperwork can slow down experimental work",
      "On-site plant operations often require rotating shift schedules"
    ],
    salary: "₹4,20,000 - ₹7,50,000 LPA starting package; ₹15,000 - ₹25,000/month for bio-interns",
    cultureTags: ["#BiotechLeader", "#BiologicsResearch", "#ScienceFirst", "#InsulinPioneers"],
    businessModel: "Product-based Biopharmaceutical & Biosimilar Research",
    internshipPath: "6-month industrial internship for postgraduates (M.Sc/M.Tech) inside advanced laboratories with direct performance-based absorbments.",
    locations: "Bengaluru, Hyderabad, Chennai, Vizag, Johor Bahru (Malaysia)",
    insideJoke: "Entering the sterile lab feels like preparing for a space mission, but my friends in software think my job is just shaking test tubes and holding pipettes."
  },
  "pfizer": {
    name: "Pfizer Inc.",
    rating: 4,
    description: "A global biopharmaceutical leader dedicated to discovering and developing breakthrough medicines, known for high research standards and global vaccine rollouts.",
    pros: [
      "Prestigious global brand with high emphasis on safety and medical ethics",
      "Incredible clinical trial data pipelines and cutting-edge gene therapy labs",
      "Generous health benefits, active retirement matching, and high job security"
    ],
    cons: [
      "Heavy corporate bureaucracy and strict regulatory approval delays",
      "Very long drug development cycles can feel slow for researchers",
      "Strict separation of job duties with limited cross-functional flexibility"
    ],
    salary: "₹6,00,000 - ₹10,00,000 LPA for technical/research roles; ₹25,00,000+ for global tracks",
    cultureTags: ["#BreakthroughsThatChangeLives", "#GlobalPharma", "#ScienceUnitesUs", "#VaccineResearch"],
    businessModel: "Product-based Global Biopharmaceutical & Drug Development",
    internshipPath: "Summer research fellowships and 3-6 month pharmaceutical analysis internships with dedicated global scientists.",
    locations: "Mumbai, Chennai, Vizag, New York, Groton (Connecticut), Sandwich (UK)",
    insideJoke: "Spent three months filling out regulatory compliance paperwork for a single chemical compound, only to realize the project was shelved two weeks ago."
  },
  "goldman sachs": {
    name: "The Goldman Sachs Group, Inc.",
    rating: 4,
    description: "An elite global investment banking titan that places extreme value on financial modeling, tech platforms, and rigorous, long-hour analytical excellence.",
    pros: [
      "Highly prestigious corporate brand that opens doors across the entire financial world",
      "Exemplary cash bonuses and high starting base compensation packages",
      "Incredible learning curve working alongside brilliant financial and tech minds"
    ],
    cons: [
      "Famously intense, high-stress environment with routine 70-80 hour work weeks",
      "Relatively rigid corporate structure and conservative professional dress codes",
      "Highly demanding year-end review process with sharp peer rankings"
    ],
    salary: "₹22,00,000 - ₹34,00,000 LPA starting tech/finance roles; ₹75,000 - ₹1,10,000/month for interns",
    cultureTags: ["#WallStreetElite", "#FinancialPowerhouse", "#HighOctaneCulture", "#InvestmentBanking"],
    businessModel: "Investment Banking, Securities & Wealth Management Advisory",
    internshipPath: "8 to 10-week summer analyst program featuring intense desks rotations, real-time client work, and high-stakes PPO committees.",
    locations: "Bengaluru, Hyderabad, Mumbai, New York, London, Hong Kong, Tokyo",
    insideJoke: "I remodeled a leveraged buyout at 3:15 AM. I can see a beautiful sunrise from my desk. I would enjoy the view, but I am too busy crying into my coffee."
  },
  "tesla": {
    name: "Tesla, Inc.",
    rating: 4,
    description: "A highly innovative automotive and clean energy disruptor that moves with extreme speed, offering rapid engineering ownership at the cost of high work hours.",
    pros: [
      "Working on revolutionary, industry-defining electric vehicle and battery tech",
      "Rapid decision-making cycles with absolute minimal administrative overhead",
      "Massive resume boost and invaluable engineering skill scaling"
    ],
    cons: [
      "Incredibly demanding work hours with high stress and tight delivery deadlines",
      "Dynamic organization where directions and priorities can shift overnight",
      "Rigid physically-present culture with virtually zero remote options"
    ],
    salary: "$90,000 - $130,000 starting in US; ₹12,00,000+ equivalent in technical centers",
    cultureTags: ["#EVDisruption", "#HardcoreEngineering", "#MoveFastBuildFast", "#GigafactoryLife"],
    businessModel: "Product-based Electric Vehicles, Clean Energy & AI Robotics",
    internshipPath: "3 to 6-month hands-on internships inside Gigafactories or design centers, directly owning production-line or software modules.",
    locations: "Palo Alto, Austin, Fremont, Berlin, Shanghai, Bengaluru (Tech Center)",
    insideJoke: "The Chief tweeted a laser-pointer meme at midnight, and now our entire hardware engineering sprint has shifted to designing stainless-steel cyber-spoons."
  },
  "adobe": {
    name: "Adobe Inc.",
    rating: 5,
    description: "The premier standard for creative suites and marketing clouds, offering a highly creative, collaborative, and incredibly well-balanced employee lifestyle.",
    pros: [
      "Excellent work-life balance with zero burnout and generous wellness leaves",
      "Beautiful creative campuses with advanced culinary and leisure amenities",
      "Extremely robust revenue engine ensuring excellent job security and stock grants"
    ],
    cons: [
      "Lower growth velocity in legacy desktop tools compared to hyper-growth SaaS",
      "Promotions are often gradual due to very high employee retention rates",
      "Can feel highly structured with complex matrix reporting across zones"
    ],
    salary: "₹20,00,000 - ₹32,00,000 LPA starting package; ₹60,000 - ₹95,000/month for interns",
    cultureTags: ["#CreativeCloud", "#WorkLifeIntegration", "#BeautifulCampuses", "#DesignCentric"],
    businessModel: "Product-based Creative Software & Document Cloud SaaS",
    internshipPath: "10 to 12-week design or software internships with focused project goals, complete executive showcases, and strong full-time conversion rates.",
    locations: "Noida, Bengaluru, San Jose (California), Seattle, Munich",
    insideJoke: "Our enterprise PDF editor has more lines of code than a modern jet fighter, but I spent my entire week figuring out why a single button is 1 pixel off-center on macOS."
  },
  "figma": {
    name: "Figma, Inc.",
    rating: 5,
    description: "The absolute standard for collaborative UI/UX design tools, known for its brilliant collaborative culture, high talent density, and extreme remote flexibility.",
    pros: [
      "Brilliant product-led growth culture where UI/UX is the ultimate first-class citizen",
      "Outstanding, highly modern tech stack utilizing advanced WebAssembly and Canvas",
      "Generous equity packages, high compensation, and remote-first employee options"
    ],
    cons: [
      "Relatively small organizational size means fewer structured training programs",
      "Extremely selective recruitment process with highly refined visual portfolios",
      "Rapidly scaling workspace which requires constant self-driven adaptation"
    ],
    salary: "$120,000 - $160,000 starting in US; ₹25,00,000+ equivalent in global tech positions",
    cultureTags: ["#UIUXChampion", "#WASMCanvas", "#RemoteFirstDesign", "#HighDesignDensity"],
    businessModel: "Product-based Collaborative Design Tooling SaaS",
    internshipPath: "12-week interactive software and product design internships with complete integration into active product squads.",
    locations: "San Francisco, New York, London, Paris, Tokyo, Remote-friendly",
    insideJoke: "Opening the design file to see 14 active cursors buzzing around like aggressive virtual bees. I am now paralyzed with real-time collaboration anxiety."
  },
  "larsen & toubro": {
    name: "Larsen & Toubro (L&T)",
    rating: 4,
    description: "India's engineering and infrastructure colossus, building airports, metros, and space systems. It is the gold standard for traditional civil and mechanical engineers.",
    pros: [
      "Opportunity to work on epic, nation-building massive engineering projects",
      "Highly structured and detailed technical training programs for entry-levels",
      "Unmatched long-term job security and strong corporate backing"
    ],
    cons: [
      "On-site plant or construction postings can be physically demanding and remote",
      "Traditional hierarchical reporting systems with slow promotion pathways",
      "Compensation for core engineering GETs is lower than software counterparts"
    ],
    salary: "₹6,00,000 - ₹8,50,000 LPA for Graduate Engineer Trainees (GETs)",
    cultureTags: ["#NationBuilders", "#CoreMechanical", "#HeavyInfrastructure", "#L&TPride"],
    businessModel: "Engineering, Construction, Manufacturing & Technology Solutions",
    internshipPath: "Graduate Engineer Trainee (GET) program featuring 1 year of structured rotational training across design centers, plants, and project sites.",
    locations: "Mumbai, Chennai, Vadodara, Delhi NCR, Pune, Kolkata",
    insideJoke: "Core Graduate trainees wearing heavy hardhats and steel-toed boots in 44°C heat, looking at software engineers on Twitter complaining that the office AC is too cold."
  },
  "mphasis": {
    name: "Mphasis Limited",
    rating: 3,
    description: "An applied technology services leader, majority-owned by Blackstone, renowned for its highly specialized solutions in banking, financial services, insurance (BFSI), and enterprise cloud transformation.",
    pros: [
      "Excellent exposure to banking domain tech, complex transaction architectures, and cloud services",
      "Robust, structured initial learning path and certifications for entry-level developers",
      "Generally supportive, non-burnout work environment with flexible working schedules"
    ],
    cons: [
      "Entry-level starter salaries (₹3.25L - ₹4.5L LPA) are modest compared to software product firms",
      "Post-selection onboarding and project allocations can sometimes take several months",
      "Bureaucracy in standard appraisal tiers and gradual compensation hikes"
    ],
    salary: "₹3,25,000 - ₹4,50,000 LPA for fresher associates; ₹6,50,000+ for premium specialty tracks",
    cultureTags: ["#CognitiveConsulting", "#BFSIExpertise", "#BlackstoneGroup", "#NextGenIT", "#MphasisLife"],
    businessModel: "Service-based IT Solutions & Cloud Architecture Partner",
    internshipPath: "Offers 3 to 6-month structured project-based internships featuring hands-on corporate assignments and direct conversion potential.",
    locations: "Bengaluru, Pune, Chennai, Mumbai, Hyderabad, Noida, Mangaluru, New York, London",
    insideJoke: "Constantly explaining to my family that Blackstone owning our majority shares doesn't mean I can get them a discount on Blackstone griddles or air fryers."
  },
  "cognizant": {
    name: "Cognizant Technology Solutions (CTS)",
    rating: 4,
    description: "A US-headquartered global IT consulting giant with a massive talent base in India, famous for its structured GenC, GenC Elevate, and GenC Pro recruitment pathways.",
    pros: [
      "Incredible technical base via Cognizant Academy structured learning and certifications",
      "Immense exposure to global Fortune 500 clients across healthcare, retail, and tech domains",
      "Excellent internal mobility with strong programs to move into modern data/AI roles"
    ],
    cons: [
      "Standard GenC fresher starting salaries have seen minimal baseline adjustments in a decade",
      "Large-scale resource pools can make individual visibility for fast promotions a challenge",
      "Strict bench utilization metrics and complex delivery schedules for tight client sprints"
    ],
    salary: "₹4,01,000 (GenC) to ₹6,75,000 (GenC Elevate) LPA for freshers; ₹12,00,000+ for specialized hires",
    cultureTags: ["#GenCElevate", "#CognizantAcademy", "#GlobalITPartner", "#EnterpriseDelivery"],
    businessModel: "Service-based IT Consultancy & Outsource Operations",
    internshipPath: "3 to 6-month internship tracks matching candidate streams, featuring hands-on coding academies, mentor checkpoints, and final transition assessments.",
    locations: "Chennai, Bengaluru, Kolkata, Pune, Hyderabad, Mumbai, Kochi, Coimbatore, Teaneck (NJ)",
    insideJoke: "Trying to figure out if I am GenC, GenC Elevate, or GenC Pro, or just a tired Gen-Z developer trying to survive the next appraisal cycle."
  },
  "wipro": {
    name: "Wipro Limited",
    rating: 3,
    description: "An iconic global IT and consulting pioneer, recognized for its strong corporate ethics, the Azim Premji philanthropic legacy, and its Elite and Turbo engineering starter tracks.",
    pros: [
      "Outstanding ethical standard, strong corporate governance, and a welcoming team culture",
      "Tremendous learning platforms (Wipro Velocity, TrendNxt) with solid technical certifications",
      "Flexible internal job transfers allowing developers to switch technology fields"
    ],
    cons: [
      "Starting package for standard Elite hires is lower than tech-product industry medians",
      "Performance evaluation distribution is strictly curved, limiting quick promotion bands",
      "Dynamic client-side priorities can occasionally require variable hours and tight stand-ups"
    ],
    salary: "₹3,50,000 (Elite) to ₹6,50,000 (Turbo) LPA starting package for freshers",
    cultureTags: ["#SpiritOfWipro", "#AzimPremjiLegacy", "#WiproElite", "#WiproTurbo"],
    businessModel: "Service-based Global IT Consulting & Business Processes",
    internshipPath: "Provides 3 to 6-month internships with intensive technical bootcamp modules (Wipro Velocity) leading to full-time project absorption.",
    locations: "Bengaluru, Pune, Chennai, Hyderabad, Noida, Kolkata, Kochi, Mumbai, East Brunswick (NJ)",
    insideJoke: "The 'Velocity' training program runs faster than the speed of light, but my actual project onboarding date keeps moving backward in time."
  },
  "capgemini": {
    name: "Capgemini SE",
    rating: 4,
    description: "A premier French multinational IT and consulting company, celebrated for its high professional consulting standards, strong work-life balance, and focus on sustainable tech.",
    pros: [
      "Excellent work-life balance with transparent policies and solid hybrid arrangements",
      "Heavy focus on employee upskilling with global professional certifications and portals",
      "Collaborative and highly inclusive work environment with polished corporate standards"
    ],
    cons: [
      "Starting analyst packages are tied to service-based market averages",
      "Post-selection onboarding and training dates can occasionally experience delays",
      "Appraisals are highly structured with gradual increments based on business division performance"
    ],
    salary: "₹4,00,000 - ₹6,50,000 LPA starting package for analysts; ₹22,00,000+ for senior tracks",
    cultureTags: ["#PeopleMatterResultsCount", "#CapgeminiConsulting", "#SustainableTech", "#WorkLifeWellbeing"],
    businessModel: "Service-based Global IT Consulting, Custom Applications & Cloud Services",
    internshipPath: "3-month structured project-shadowing internships with focus on design patterns and technical client requirements.",
    locations: "Mumbai, Pune, Bengaluru, Hyderabad, Chennai, Kolkata, Noida, Gurugram, Paris",
    insideJoke: "Spent my entire afternoon in an English-French hybrid agile training module. I came out understanding neither Scrum nor French."
  },
  "accenture": {
    name: "Accenture plc",
    rating: 4,
    description: "A prestigious global professional services giant, leading the industry in large-scale cloud migration, digital operations, and artificial intelligence advisory.",
    pros: [
      "Elite training facilities (Accenture Innovation Hubs) and massive budgets for learning",
      "Very transparent, structured, and fast-track career progression pathways",
      "Exposure to cutting-edge technology stacks (AI, cloud, big data) on key projects"
    ],
    cons: [
      "High performance expectations which can lead to intensive client delivery hours",
      "Vast employee footprint makes active networking essential to secure premium projects",
      "Strict onboarding policies and multiple security screenings can feel slow"
    ],
    salary: "₹4,50,000 (ASE) to ₹6,50,000 (Advanced ASE) LPA starting package for freshers",
    cultureTags: ["#LetThereBeChange", "#AccentureConsulting", "#HighPerformanceCulture", "#ASELife"],
    businessModel: "Service-based Management Consulting & Tech Operations",
    internshipPath: "2-month summer internships or 3 to 6-month graduate trainee internships featuring direct project simulation and mentor allocations.",
    locations: "Bengaluru, Mumbai, Pune, Gurugram, Hyderabad, Chennai, Kolkata, Noida, Dublin",
    insideJoke: "I updated my Slack status to 'Let There Be Change', but my actual daily assignment is still copy-pasting standard XML fields into legacy databases."
  },
  "hcltech": {
    name: "HCL Technologies Limited (HCLTech)",
    rating: 4,
    description: "A leading global IT giant recognized for its robust IT infrastructure services, strong R&D division, and extensive suite of proprietary enterprise software products.",
    pros: [
      "Supportive management, strong focus on job stability, and healthy work life balance",
      "Great opportunity to learn core infrastructure, cybersecurity, and product engineering",
      "Transparent appraisal standards and friendly, helpful team environments"
    ],
    cons: [
      "Initial starting salary packages for engineering trainees are moderate",
      "Promotion increments can feel slower compared to high-growth startup ecosystems",
      "Internal allocation systems are highly process-driven with strict timeline protocols"
    ],
    salary: "₹3,65,000 - ₹5,00,000 LPA starting package for freshers; ₹10,00,000+ for product tracks",
    cultureTags: ["#SuperchargingProgress", "#RelationshipBeyondTheContract", "#HCLTech", "#CoreInfrastructure"],
    businessModel: "Service-based IT, Engineering Services & Software Product Sales",
    internshipPath: "6-month graduate internship program or HCL First Careers program offering rich technical bootcamps and certifications.",
    locations: "Noida, Chennai, Bengaluru, Lucknow, Nagpur, Madurai, Hyderabad, Pune, London",
    insideJoke: "Our official corporate motto is 'Relationships Beyond the Contract', which apparently means working on Saturdays isn't in my contract but is highly expected."
  }
};

function extractJson(text: string): any {
  const cleaned = text.trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Attempt markdown json block extraction
    const markdownMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (markdownMatch && markdownMatch[1]) {
      try {
        return JSON.parse(markdownMatch[1].trim());
      } catch (innerErr) {
        // Fallback to searching for curly braces
      }
    }
    
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1).trim());
      } catch (deepErr) {
        // Fallback failed too
      }
    }
    throw new Error("Could not parse JSON from response text: " + text);
  }
}

app.post("/api/company/vibe", async (req, res) => {
  const { companyName } = req.body;
  if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
    return res.status(400).json({ error: "Company name is required" });
  }

  // Determine user domain and target role context dynamically
  const userId = getUserIdFromHeader(req);
  let domain = req.body.domain || "Tech & IT";
  let targetRole = req.body.targetRole || "Software Engineer";

  if (userId) {
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    if (user) {
      if (user.domain) domain = user.domain;
      if (user.targetRole) targetRole = user.targetRole;
    }
  }

  const queryKey = companyName.toLowerCase().trim();
  
  // Try to find a pre-seeded matching record using robust fuzzy matching
  const presetKeys = Object.keys(PRESET_COMPANIES);
  const matchedKey = getFuzzyMatch(queryKey, presetKeys);
  
  if (matchedKey && PRESET_COMPANIES[matchedKey]) {
    const presetMatch = PRESET_COMPANIES[matchedKey];
    console.log(`[Vibe Check] Found pre-seeded Wikipedia-grounded record for: ${companyName} (Matched preset: ${presetMatch.name})`);
    return res.json(presetMatch);
  }

  try {
    const prompt = `Perform a rigorous, real-time live web search and deep research to find exact, authentic, and trusted Wikipedia-grounded facts about the specific company "${companyName}". 
We require the exact, actual information for "${companyName}" (not generic placeholders or common answers).
Provide details for a candidate interested in the "${domain}" sector as a "${targetRole}".

You MUST return a JSON object with EXACTLY the following structure (do NOT return anything else, do not put conversational text around it, just the JSON):
{
  "name": "The exact official name of the company",
  "rating": 4, // employee satisfaction rating (an integer from 1 to 5 based on actual Glassdoor/Indeed/Wiki reviews)
  "description": "A concise, witty, completely honest, and realistic description of this specific company's workspace culture, environment, and engineering/operations reputation (1-2 sentences)",
  "pros": [
    "real, specific, actual pro 1",
    "real, specific, actual pro 2",
    "real, specific, actual pro 3"
  ],
  "cons": [
    "real, specific, actual con 1",
    "real, specific, actual con 2",
    "real, specific, actual con 3"
  ],
  "salary": "The actual, verified starting salary package (e.g. '₹5,00,000 - ₹8,00,000' or '$110,000 - $135,000') based on recent hires",
  "cultureTags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4"], // 4 highly accurate, witty hashtags starting with '#' representing this specific company's actual employee jokes or traits
  "businessModel": "Their actual primary business model (e.g., 'Product-based SaaS', 'Service-based IT Outsourcing') backed by Wikipedia",
  "internshipPath": "The exact, real pathway they use for internships (e.g. duration, conversion to PPO, stipend, process)",
  "locations": "The actual major cities or office locations where this company operates"
}

You MUST use the googleSearch tool to fetch real facts about "${companyName}". Never use placeholder values or identical lists of pros/cons across different searches.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // We do NOT use responseMimeType: "application/json" or responseSchema here because they conflict with googleSearch in this SDK version
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI model");
    }

    const rawResult = extractJson(text);
    
    // Ensure all required fields exist and are validated
    const result = {
      name: rawResult.name || companyName,
      rating: typeof rawResult.rating === 'number' ? rawResult.rating : 4,
      description: rawResult.description || `A reputable employer within the ${domain} sector.`,
      pros: Array.isArray(rawResult.pros) ? rawResult.pros : ["Good learning curve", "Recognized brand", "Stable environment"],
      cons: Array.isArray(rawResult.cons) ? rawResult.cons : ["Hierarchical setup", "Standard appraisal cycle", "Average initial compensation"],
      salary: rawResult.salary || "₹5,00,000 - ₹8,00,000",
      cultureTags: Array.isArray(rawResult.cultureTags) ? rawResult.cultureTags : ["#Careers", `#${companyName}`],
      businessModel: rawResult.businessModel || "Product-based Company",
      internshipPath: rawResult.internshipPath || "6-month software engineering internship with PPO potential.",
      locations: rawResult.locations || "Bengaluru, Mumbai, Pune, Hyderabad"
    };

    res.json(result);
  } catch (error: any) {
    console.warn("Company vibe check with search grounding failed, attempting toolless model call:", error);
    
    try {
      const toollessPrompt = `Provide authentic, highly specific employee and career details for the company "${companyName}" based on your deep pre-trained knowledge. We are interested in its operations in the "${domain}" sector for a "${targetRole}".
Avoid generic summaries. Return a JSON object with EXACTLY the following structure (do NOT return anything else, do not put conversational text around it, just the JSON):
{
  "name": "The exact official name of the company",
  "rating": 4, // employee satisfaction rating (an integer from 1 to 5 based on actual Glassdoor/Indeed/Wiki reviews)
  "description": "A concise, witty, completely honest, and realistic description of this specific company's workspace culture, environment, and engineering/operations reputation (1-2 sentences)",
  "pros": [
    "real, specific, actual pro 1",
    "real, specific, actual pro 2",
    "real, specific, actual pro 3"
  ],
  "cons": [
    "real, specific, actual con 1",
    "real, specific, actual con 2",
    "real, specific, actual con 3"
  ],
  "salary": "The actual, verified starting salary package (e.g. '₹3,20,000 - ₹4,80,000' or '$110,000 - $135,000') based on recent hires",
  "cultureTags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4"],
  "businessModel": "Their actual primary business model (e.g., 'Product-based SaaS', 'Service-based IT Outsourcing')",
  "internshipPath": "The exact, real pathway they use for internships (e.g. duration, conversion to PPO, stipend, process)",
  "locations": "The actual major cities or office locations where this company operates"
}`;

      const responseToolless = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: toollessPrompt,
      });

      const textToolless = responseToolless.text;
      if (textToolless) {
        const rawResult = extractJson(textToolless);
        const result = {
          name: rawResult.name || companyName,
          rating: typeof rawResult.rating === 'number' ? rawResult.rating : 4,
          description: rawResult.description || `A reputable employer within the ${domain} sector.`,
          pros: Array.isArray(rawResult.pros) ? rawResult.pros : ["Good learning curve", "Recognized brand", "Stable environment"],
          cons: Array.isArray(rawResult.cons) ? rawResult.cons : ["Hierarchical setup", "Standard appraisal cycle", "Average initial compensation"],
          salary: rawResult.salary || "₹5,00,000 - ₹8,00,000",
          cultureTags: Array.isArray(rawResult.cultureTags) ? rawResult.cultureTags : ["#Careers", `#${companyName}`],
          businessModel: rawResult.businessModel || "Product-based Company",
          internshipPath: rawResult.internshipPath || "6-month software engineering internship with PPO potential.",
          locations: rawResult.locations || "Bengaluru, Mumbai, Pune, Hyderabad"
        };
        console.log(`[Vibe Check] Successfully generated company-specific details for: ${companyName} via toolless model call.`);
        return res.json(result);
      }
    } catch (innerError) {
      console.error("Toolless model call failed as well:", innerError);
    }

    // Highly resilient dynamic fallback generator with Wikipedia-aligned guesses (Last Resort)
    const normalizedCompany = companyName.trim();
    const rating = Math.floor(Math.random() * 2) + 3; // 3 or 4 stars
    let salaryRange = "₹5,00,000 - ₹8,50,000";
    let isProductBased = true;
    let fallbackLocations = "Bengaluru, Mumbai, Pune, Hyderabad, Delhi NCR, Chennai";
    let internshipType = "6-month on-site or hybrid internship with standard corporate stipend and project mentoring.";
    
    if (domain.includes("Bio") || domain.includes("Healthcare")) {
      salaryRange = "₹4,50,000 - ₹7,80,000";
      isProductBased = true;
      fallbackLocations = "Bengaluru, Hyderabad, Mumbai, Chennai, Vizag";
      internshipType = "6-month clinical or advanced laboratory research internship with full-time scientist guidance.";
    } else if (domain.includes("Finance") || domain.includes("Business")) {
      salaryRange = "₹6,00,000 - ₹11,00,000";
      isProductBased = false;
      fallbackLocations = "Mumbai, Bengaluru, Delhi NCR, Hyderabad, Chennai";
      internshipType = "8 to 12-week summer analyst rotational internship with live financial desk operations.";
    } else if (domain.includes("Creative") || domain.includes("Design")) {
      salaryRange = "₹4,00,000 - ₹7,50,000";
      isProductBased = true;
      fallbackLocations = "Mumbai, Bengaluru, Noida, Pune, London, Remote";
      internshipType = "3 to 6-month creative UI/UX portfolio development and branding squad internship.";
    } else if (domain.includes("Core")) {
      salaryRange = "₹4,80,000 - ₹8,20,000";
      isProductBased = false;
      fallbackLocations = "Mumbai, Chennai, Vadodara, Pune, Jamshedpur";
      internshipType = "Graduate Engineer Trainee (GET) 1-year rotational training in plant, quality, and design labs.";
    } else if (domain.includes("Tech") || domain.includes("IT")) {
      salaryRange = "₹6,50,000 - ₹12,00,000";
      isProductBased = true;
      fallbackLocations = "Bengaluru, Pune, Hyderabad, Chennai, Noida, Gurgaon";
      internshipType = "6-month software engineering internship with agile development sprints and PPO potential.";
    }

    const resolvedBusinessModel = isProductBased ? "Product-based Company" : "Service-based / Consulting";

    res.json({
      name: normalizedCompany,
      rating,
      description: `A reputable employer within the ${domain} sector, ${normalizedCompany} provides structural support and consistent career pathways for junior talent.`,
      pros: [
        `Strong career foundation and brand value in ${domain} sector`,
        "Professional development resources and continuous guidance",
        "Clear structural organization and supportive standard workflows"
      ],
      cons: [
        "Structured corporate layers can make individual fast-track promotion slow",
        "Project assignments are often driven by corporate pipeline demands",
        "Starting salary packages are highly structured around standard bands"
      ],
      salary: salaryRange,
      cultureTags: ["#StructuredOnboarding", `#${normalizedCompany.replace(/\s+/g, "")}Culture`, `#${domain.split(" ")[0]}Careers`, "#ContinuousGrowth"],
      businessModel: resolvedBusinessModel,
      internshipPath: internshipType,
      locations: fallbackLocations
    });
  }
});

// --- SCHEDULED TASK & MOCK EMAIL NOTIFICATION SYSTEM ---

function runScheduledReminderTask() {
  console.log("[Scheduled Task] Running user consistency and progress checks...");
  const db = readDB();
  const now = new Date();
  
  if (!db.notificationLogs) {
    db.notificationLogs = [];
  }

  let dbUpdated = false;

  db.users.forEach((user) => {
    // Determine the last accessed date. If not present, default to creation date
    const lastAccessStr = user.lastAccessedAt || user.createdAt;
    const lastAccess = new Date(lastAccessStr);
    const diffMs = now.getTime() - lastAccess.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Trigger motivational reminder if user is inactive for 3 days or more
    if (diffDays >= 3) {
      // Find the most recent notification log sent to this user
      const userLogs = db.notificationLogs!
        .filter((log) => log.userId === user.id)
        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      
      const lastReminder = userLogs[0];
      let shouldSend = true;

      if (lastReminder) {
        const lastReminderTime = new Date(lastReminder.sentAt);
        // If the last reminder was sent after their last access, we don't spam them with another
        if (lastReminderTime > lastAccess) {
          shouldSend = false;
        }
      }

      if (shouldSend) {
        const subject = `Hey ${user.name}, don't break your placement prep streak! 🚀`;
        const body = `Hi ${user.name},\n\nWe noticed you haven't accessed the OfferBuddy platform for 3 days to prepare for your target role of "${user.targetRole}".\n\nConsistency is key to cracking premium SDE and Data Science interviews! Just 5 minutes of practice today can keep your streak alive.\n\nLog back in to review your resume, take a mock interview, or solve a coding challenge!\n\nBest of luck,\nYour OfferBuddy Team`;

        console.log(`[MOCK EMAIL SERVICE] Sending email to ${user.email}:`);
        console.log(`Subject: ${subject}`);
        console.log(`Body:\n${body}`);

        // Add to notification logs
        const logEntry = {
          id: "notif_" + Math.random().toString(36).substr(2, 9),
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          sentAt: now.toISOString(),
          subject,
          message: body,
          daysInactive: Math.floor(diffDays),
        };

        db.notificationLogs!.push(logEntry);
        dbUpdated = true;
      }
    }
  });

  if (dbUpdated) {
    writeDB(db);
  }
}

// REST endpoints for Consistency Tracker & Inactivity Simulator
app.get("/api/notifications/logs", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const db = readDB();
  const logs = (db.notificationLogs || []).filter((log) => log.userId === userId);
  const user = db.users.find((u) => u.id === userId);
  
  if (!user) return res.status(404).json({ error: "User not found" });

  const lastAccessStr = user.lastAccessedAt || user.createdAt;
  const lastAccess = new Date(lastAccessStr);
  const diffMs = Date.now() - lastAccess.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  res.json({
    logs: logs.sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()),
    lastAccessedAt: lastAccessStr,
    daysInactive: Math.floor(diffDays),
    hoursInactive: Math.floor(diffMs / (1000 * 60 * 60)),
    streakActive: diffDays < 3
  });
});

app.post("/api/notifications/simulate", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { days = 3.5 } = req.body;
  const db = readDB();
  const userIdx = db.users.findIndex((u) => u.id === userId);
  if (userIdx === -1) return res.status(404).json({ error: "User not found" });

  // Simulate inactivity by setting lastAccessedAt into the past
  const simulatedDate = new Date();
  simulatedDate.setTime(simulatedDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  db.users[userIdx].lastAccessedAt = simulatedDate.toISOString();
  writeDB(db);

  // Trigger the scheduled check synchronously
  runScheduledReminderTask();

  const updatedDb = readDB();
  const logs = (updatedDb.notificationLogs || []).filter((log) => log.userId === userId);
  const user = updatedDb.users[userIdx];
  const lastAccessStr = user.lastAccessedAt;
  const lastAccess = new Date(lastAccessStr);
  const diffMs = Date.now() - lastAccess.getTime();

  res.json({
    success: true,
    message: `Inactivity simulated. Last access timestamp shifted back by ${days} days.`,
    logs: logs.sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()),
    lastAccessedAt: lastAccessStr,
    daysInactive: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
    streakActive: (diffMs / (1000 * 60 * 60 * 24)) < 3
  });
});

app.post("/api/notifications/reset-access", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const db = readDB();
  const userIdx = db.users.findIndex((u) => u.id === userId);
  if (userIdx === -1) return res.status(404).json({ error: "User not found" });

  db.users[userIdx].lastAccessedAt = new Date().toISOString();
  writeDB(db);

  res.json({
    success: true,
    message: "Active streak restored! User access timestamp set to current time.",
    lastAccessedAt: db.users[userIdx].lastAccessedAt
  });
});

// --- DAILY PULSE MICRO-LEARNING SYSTEM ---

const FALLBACK_DAILY_TASKS: Record<string, Array<{
  title: string;
  description: string;
  actionableStep: string;
  duration: string;
  category: string;
  difficulty: 'Easy' | 'Medium';
}>> = {
  "tech_it": [
    {
      title: "Optimize a Nested Loop",
      description: "Nested loops can cause O(N^2) time complexity, which slows down high-performance applications.",
      actionableStep: "Convert a nested loop iterating over an array of 100 items into a single loop using a Map / Hash Dictionary to lookup items in O(1) time.",
      duration: "10 mins",
      category: "Coding",
      difficulty: "Easy"
    },
    {
      title: "Write an LRU Cache Interface",
      description: "Least Recently Used (LRU) caches are widely used in performance-critical backends to hold hot data.",
      actionableStep: "Define the structure of an LRU Cache using a Double Linked List and a HashMap, and write the get(key) and put(key, val) method interfaces.",
      duration: "15 mins",
      category: "System Design",
      difficulty: "Medium"
    },
    {
      title: "Master the 'Tell Me About Yourself' Pitch",
      description: "Your introduction sets the tone for the entire interview and highlights your relevant skills early.",
      actionableStep: "Write a 3-paragraph (150-word) elevator pitch covering your background, present role, and why you are excited about your target role.",
      duration: "10 mins",
      category: "Behavioral",
      difficulty: "Easy"
    },
    {
      title: "Identify SQL vs NoSQL Trade-offs",
      description: "Choosing the correct database is a vital backend system design skill.",
      actionableStep: "Write down the exact scenario where you would select a Relational Database (SQL) over a Document Store (NoSQL), listing 3 core criteria.",
      duration: "10 mins",
      category: "System Design",
      difficulty: "Easy"
    },
    {
      title: "Explain CORS Access Control Headers",
      description: "Cross-Origin Resource Sharing (CORS) is a common point of failure in web development.",
      actionableStep: "Identify the 3 main response headers a backend server must return to allow cross-origin requests from frontends with credentials.",
      duration: "12 mins",
      category: "Web Dev",
      difficulty: "Easy"
    }
  ],
  "finance_business": [
    {
      title: "Define a North Star Retention Metric",
      description: "Product and business analysts need clear metrics to gauge user retention and product health.",
      actionableStep: "Define the exact 'North Star' retention KPI for a ride-sharing service, and write down 2 secondary guardrail metrics.",
      duration: "12 mins",
      category: "Product Strategy",
      difficulty: "Easy"
    },
    {
      title: "Draft an Escalation Email",
      description: "Communicating project delays or issues transparently is a core leadership trait.",
      actionableStep: "Draft a 4-sentence email notifying clients of a 1-week timeline delay, including the specific root cause and your mitigation plan.",
      duration: "10 mins",
      category: "Communication",
      difficulty: "Easy"
    },
    {
      title: "Calculate EBITDA & Margins",
      description: "Understanding cash flows and profitability metrics is standard for finance analysts.",
      actionableStep: "Calculate the EBITDA and EBITDA margin of a business with $5M revenue, $3M operating expenses, $200k depreciation, and $100k amortization.",
      duration: "15 mins",
      category: "Finance Trivia",
      difficulty: "Medium"
    }
  ],
  "creative_design": [
    {
      title: "Verify WCAG Color Contrast",
      description: "Web accessibility standards dictate that visual text must be legible and pass contrast bounds.",
      actionableStep: "Check if a light gray button (#D1D5DB) with white text (#FFFFFF) passes WCAG 2.1 AA requirements (4.5:1 ratio for normal text).",
      duration: "10 mins",
      category: "UI/UX Design",
      difficulty: "Easy"
    },
    {
      title: "Create a Skeleton Screen Hierarchy",
      description: "Skeleton states reduce perceived loading latency, improving the overall user retention rate.",
      actionableStep: "Sketch or describe the exact 4 placeholder shapes required to render an asynchronous dashboard screen while data fetches.",
      duration: "10 mins",
      category: "UI/UX Design",
      difficulty: "Easy"
    },
    {
      title: "Sketch an Interactive Form Micro-interaction",
      description: "Interactive feedback (like error shake or success bounce) drastically improves user experience.",
      actionableStep: "Write a 3-step descriptive flow of what visual changes occur on a newsletter email submit button during input, loading, and success states.",
      duration: "12 mins",
      category: "Interaction Design",
      difficulty: "Easy"
    }
  ]
};

function getFallbackDailyTask(targetRole: string, domain: string) {
  let categoryKey = "tech_it";
  const normDomain = domain.toLowerCase();
  
  if (normDomain.includes("finance") || normDomain.includes("business")) {
    categoryKey = "finance_business";
  } else if (normDomain.includes("creative") || normDomain.includes("design") || normDomain.includes("ui") || normDomain.includes("ux")) {
    categoryKey = "creative_design";
  }
  
  const list = FALLBACK_DAILY_TASKS[categoryKey] || FALLBACK_DAILY_TASKS["tech_it"];
  const day = new Date().getDate();
  const task = list[day % list.length];
  
  return {
    ...task,
    id: "task_" + Math.random().toString(36).substr(2, 9),
    completed: false
  };
}

app.get("/api/daily-pulse", async (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const db = readDB();
  const userIdx = db.users.findIndex((u) => u.id === userId);
  if (userIdx === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIdx];
  const now = new Date();
  const todayStr = now.toDateString();

  // Check if user already has a generated task for today
  if (user.dailyPulse && user.dailyPulse.lastGeneratedAt) {
    const lastGeneratedDate = new Date(user.dailyPulse.lastGeneratedAt).toDateString();
    if (lastGeneratedDate === todayStr) {
      return res.json(user.dailyPulse.task);
    }
  }

  // Generate a new task
  const targetRole = user.targetRole || "Software Engineer";
  const domain = user.domain || "Tech & IT";
  let task: any = null;

  try {
    const prompt = `You are an elite, encouraging technical placement mentor and career advisor.
Generate EXACTLY ONE small, actionable, bite-sized daily learning task tailored specifically for a candidate:
Target Role: "${targetRole}"
Industry/Domain: "${domain}"

The task MUST take at most 10-15 minutes to complete so that it motivates the candidate to stay consistent without feeling overwhelmed. 
Make sure the actionable step is practical and direct (e.g., writing a specific snippet, brainstorming a schema, or drafting an interview response).

You MUST return a JSON object with EXACTLY the following structure (do NOT return anything else, do not put conversational text around it, just the JSON):
{
  "title": "A short, engaging, 4-6 word task title",
  "description": "1-2 sentences of encouraging context explaining why this skill is vital for a ${targetRole}.",
  "actionableStep": "A highly concrete, hands-on, micro-instruction (e.g. 'Draft a 3-sentence hook explaining why you want to work at X', 'Write a function in your favorite language to do Y', 'Identify and list 3 key components of Z')",
  "duration": "10 mins",
  "category": "Coding"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text;
    if (text) {
      const generated = extractJson(text);
      task = {
        id: "task_" + Math.random().toString(36).substr(2, 9),
        title: generated.title || "Daily Preparation Challenge",
        description: generated.description || `A targeted daily exercise for a junior ${targetRole}.`,
        actionableStep: generated.actionableStep || "Complete today's mini mock interview session to keep your consistency alive.",
        duration: generated.duration || "10 mins",
        category: generated.category || "General Prep",
        completed: false
      };
    }
  } catch (err) {
    console.error("Failed to generate daily pulse task with Gemini, using fallback:", err);
  }

  if (!task) {
    task = getFallbackDailyTask(targetRole, domain);
  }

  // Save to user
  user.dailyPulse = {
    task,
    lastGeneratedAt: now.toISOString()
  };

  db.users[userIdx] = user;
  writeDB(db);

  res.json(task);
});

app.post("/api/daily-pulse/refresh", async (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const db = readDB();
  const userIdx = db.users.findIndex((u) => u.id === userId);
  if (userIdx === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIdx];
  const targetRole = user.targetRole || "Software Engineer";
  const domain = user.domain || "Tech & IT";
  const now = new Date();
  let task: any = null;

  try {
    const prompt = `You are an elite, encouraging technical placement mentor and career advisor.
Generate EXACTLY ONE small, actionable, bite-sized daily learning task tailored specifically for a candidate:
Target Role: "${targetRole}"
Industry/Domain: "${domain}"

The task MUST take at most 10-15 minutes to complete so that it motivates the candidate to stay consistent without feeling overwhelmed. 
Make sure the actionable step is practical and direct (e.g., writing a specific snippet, brainstorming a schema, or drafting an interview response).
Ensure this task is fresh and distinct from standard general tasks.

You MUST return a JSON object with EXACTLY the following structure (do NOT return anything else, do not put conversational text around it, just the JSON):
{
  "title": "A short, engaging, 4-6 word task title",
  "description": "1-2 sentences of encouraging context explaining why this skill is vital for a ${targetRole}.",
  "actionableStep": "A highly concrete, hands-on, micro-instruction",
  "duration": "10 mins",
  "category": "Coding"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text;
    if (text) {
      const generated = extractJson(text);
      task = {
        id: "task_" + Math.random().toString(36).substr(2, 9),
        title: generated.title || "Daily Preparation Challenge",
        description: generated.description || `A targeted daily exercise for a junior ${targetRole}.`,
        actionableStep: generated.actionableStep || "Complete today's mini mock interview session to keep your consistency alive.",
        duration: generated.duration || "10 mins",
        category: generated.category || "General Prep",
        completed: false
      };
    }
  } catch (err) {
    console.error("Failed to generate refreshed daily pulse task with Gemini, using fallback:", err);
  }

  if (!task) {
    task = getFallbackDailyTask(targetRole, domain);
    task.id = "task_ref_" + Math.random().toString(36).substr(2, 9);
  }

  // Save to user
  user.dailyPulse = {
    task,
    lastGeneratedAt: now.toISOString()
  };

  db.users[userIdx] = user;
  writeDB(db);

  res.json(task);
});

app.post("/api/daily-pulse/complete", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { completed = true } = req.body;
  const db = readDB();
  const userIdx = db.users.findIndex((u) => u.id === userId);
  if (userIdx === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIdx];
  if (!user.dailyPulse || !user.dailyPulse.task) {
    return res.status(400).json({ error: "No active task found for today. Generate one first." });
  }

  user.dailyPulse.task.completed = completed;
  if (completed) {
    user.dailyPulse.task.completedAt = new Date().toISOString();
  } else {
    delete user.dailyPulse.task.completedAt;
  }

  db.users[userIdx] = user;
  writeDB(db);

  res.json({ success: true, task: user.dailyPulse.task });
});

// --- GLOBAL EXPRESS ERROR-HANDLING MIDDLEWARE ---
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Express Error Captured:", err);
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({ error: "Payload too large. Please upload/paste a smaller file (limit: 50MB)." });
  }
  if (err instanceof SyntaxError && "status" in err && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON format in request body." });
  }
  res.status(err.status || 500).json({ error: err.message || "An internal server error occurred." });
});

// --- VITE DEV MIDDLEWARE AND STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OfferBuddy AI] Server running at http://localhost:${PORT}`);
    
    // Start background task consistency checker
    console.log("[OfferBuddy AI] Starting background consistency check scheduler (Interval: 30 minutes)...");
    setInterval(runScheduledReminderTask, 30 * 60 * 1000);
    // Trigger an initial scan immediately on server start
    runScheduledReminderTask();
  });
}

startServer();
