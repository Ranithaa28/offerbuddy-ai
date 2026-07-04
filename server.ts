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
  const { email, password, name, targetRole } = req.body;
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
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);

  res.json({ user: { id: newUser.id, name: newUser.name, email: newUser.email, targetRole: newUser.targetRole } });
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

  res.json({ user: { id: user.id, name: user.name, email: user.email, targetRole: user.targetRole } });
});

app.get("/api/auth/me", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ user: { id: user.id, name: user.name, email: user.email, targetRole: user.targetRole } });
});

app.post("/api/auth/update-role", (req, res) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { targetRole } = req.body;
  if (!targetRole) return res.status(400).json({ error: "Target role is required" });

  const db = readDB();
  const userIdx = db.users.findIndex((u) => u.id === userId);
  if (userIdx === -1) return res.status(404).json({ error: "User not found" });

  db.users[userIdx].targetRole = targetRole;
  writeDB(db);

  res.json({ success: true, targetRole });
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
    recommendations.push("Enter your dream tech role to run a personalized Skill Gap roadmap.");
  } else if (skillMatchPercentage < 80) {
    recommendations.push("Start Week 1 of the generated Skill Gap learning schedule.");
  }

  if (interviewScore === 0) {
    recommendations.push("Launch a live Mock Interview to practice real-time technical & HR questions.");
  } else if (interviewScore < 70) {
    recommendations.push("Retry the Mock Interview to practice response structure and STAR methodologies.");
  }

  if (codingScore === 0) {
    recommendations.push("Complete a Coding Evaluation to benchmark your algorithmic and logic depth.");
  } else if (codingScore < 80) {
    recommendations.push("Optimise time/space complexities of your submitted code solutions.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Outstanding progress! Continue testing with alternative engineering roles to broaden placement readiness.");
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
app.post("/api/company/vibe", async (req, res) => {
  const { companyName } = req.body;
  if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
    return res.status(400).json({ error: "Company name is required" });
  }

  try {
    const prompt = `Perform a comprehensive, realistic, and slightly witty employee vibe and placement check for the tech company "${companyName}". 
Find real, up-to-date information about:
- The actual official name of the company.
- Employee satisfaction rating (an integer from 1 to 5).
- A concise, witty, honest, and realistic description of the company's culture/vibe and engineering reputation (1-2 sentences).
- 3 realistic, specific pros of working there as a software/tech engineer.
- 3 realistic, specific cons of working there as a software/tech engineer (e.g., bureaucratic layers, promotion speed, or WLB).
- Estimated starting salary range in INR LPA (Lakhs Per Annum) for freshers or junior software engineers (e.g., "₹8,00,000 - ₹12,00,000" or similar realistic format based on their actual pay in India).
- 4 fun, witty, and accurate culture hashtags starting with '#' (e.g., "#FreeLunchAlways", "#MoveFastBreakThings").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            rating: { type: Type.INTEGER },
            description: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            salary: { type: Type.STRING },
            cultureTags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["name", "rating", "description", "pros", "cons", "salary", "cultureTags"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI model");
    }

    const result = JSON.parse(text.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Company vibe check failed:", error);
    res.status(500).json({ error: "Failed to research company: " + error.message });
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
