import React, { useState, useEffect } from "react";
import { 
  MessageSquareCode, 
  Play, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Star, 
  Mic, 
  MicOff, 
  Sparkles, 
  AlertTriangle,
  Award,
  ChevronRight
} from "lucide-react";
import { InterviewSession } from "../types";

interface MockInterviewViewProps {
  userId: string;
  onActivityAdded: () => void;
}

export default function MockInterviewView({ userId, onActivityAdded }: MockInterviewViewProps) {
  const [role, setRole] = useState("Software Engineer");
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [userResponse, setUserResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Simulated Speech-to-Text state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  useEffect(() => {
    fetchLatestSession();
  }, [userId]);

  // Interval for recording seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
        // Simulate speech transcription incrementing
        if (recordingSeconds === 2) {
          setUserResponse((prev) => prev + (prev ? " " : "") + "In my last team project, I spearheaded the frontend architecture.");
        } else if (recordingSeconds === 5) {
          setUserResponse((prev) => prev + (prev ? " " : "") + " We leveraged React and integrated state synchronization, which accelerated page loading speeds by 40%.");
        } else if (recordingSeconds === 8) {
          setUserResponse((prev) => prev + (prev ? " " : "") + " I resolved conflicts by using structured design reviews and benchmarking statistics.");
        }
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording, recordingSeconds]);

  const fetchLatestSession = async () => {
    try {
      const response = await fetch("/api/interview/latest", {
        headers: { "Authorization": `Bearer ${userId}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSession(data);
          setRole(data.role);
        }
      }
    } catch (err) {
      console.error("Failed to load interview session:", err);
    }
  };

  const handleStartInterview = async () => {
    if (!role.trim()) {
      setError("Please specify an interview role.");
      return;
    }

    setError("");
    setLoading(true);
    setSession(null);

    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`,
        },
        body: JSON.stringify({ role }),
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Failed to start interview (Status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to start interview");
      }

      setSession(data);
      setUserResponse("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An issue occurred while spinning up mock questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session) return;
    if (!userResponse.trim()) {
      setError("Please write down or record an answer response before submitting.");
      return;
    }

    setError("");
    setLoading(true);
    setIsRecording(false);

    const activeQuestion = session.questions[session.currentQuestionIndex];

    try {
      const response = await fetch("/api/interview/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`,
        },
        body: JSON.stringify({
          sessionId: session.id,
          questionId: activeQuestion.id,
          userResponse,
        }),
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Failed to submit answer (Status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit answer");
      }

      setSession(data);
      setUserResponse("");
      onActivityAdded();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while evaluating your answer.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const activeQuestion = session && !session.completed 
    ? session.questions[session.currentQuestionIndex] 
    : null;

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1.5 flex items-center gap-2">
          Expert 3: Mock Interview Trainer <MessageSquareCode className="h-6 w-6 text-purple-600" />
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Simulate a real-world technical and behavioral interview for your dream company. Speak or write answers and receive direct score evaluations.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Landing: Start Session */}
      {(!session || session.completed) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Start Card */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-base">Initialize AI Corporate Recruiter</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The recruiter will construct a tough 5-question curriculum: <strong className="text-slate-800">2 Technical</strong> queries, <strong className="text-slate-800">2 Behavioral</strong> STAR-method topics, and <strong className="text-slate-800">1 Culture-Fit</strong> question specifically matching your target role.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Target Interview Position
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. SDE-1 (Java Backend)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={loading}
              className="w-full py-3.5 mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:scale-[1.01] transition-transform text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Seeding Recruiter Prompt...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Start Live Mock Interview</span>
                </>
              )}
            </button>
          </div>

          {/* Last Interview Report Card */}
          {session && session.completed && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span>Last Interview Report</span>
                </div>

                <div className="text-center py-6 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Final Cumulative Score</span>
                  <span className="text-5xl font-extrabold text-purple-600 block mt-1">
                    {session.finalScore}%
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200 rounded-full inline-block mt-3">
                    {session.finalScore && session.finalScore >= 75 ? "Placement Clearance Approved" : "Training Recommended"}
                  </span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 font-mono">
                Evaluated for {session.role} on {new Date(session.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Session: Interview Panel */}
      {session && !session.completed && activeQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Interview Panel */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-sm">
            {/* Status bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider font-semibold">
                Question {session.currentQuestionIndex + 1} of {session.questions.length}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] uppercase font-bold">
                {activeQuestion.type}
              </span>
            </div>

            {/* Recruiter Question Bubble */}
            <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="h-9 w-9 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                AI
              </div>
              <p className="text-slate-700 text-sm leading-relaxed font-sans pt-1">
                {activeQuestion.text}
              </p>
            </div>

            {/* Answer Input and Speech Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Your Answer Response</span>
                {isRecording && (
                  <span className="flex items-center gap-1.5 text-red-600 font-mono animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    Simulating Voice Capture: {recordingSeconds}s
                  </span>
                )}
              </div>

              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Structure your answer clearly. For behavioral questions, consider using the STAR method: Situation, Task, Action, and Result..."
                className="w-full h-44 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm leading-relaxed focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors focus:outline-none"
              />

              <div className="flex items-center justify-between gap-4">
                {/* Simulated mic */}
                <button
                  onClick={toggleRecording}
                  disabled={loading}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                    isRecording 
                      ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 text-red-600" />
                      <span>Stop Voice Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 text-slate-500" />
                      <span>Simulate Speech-to-Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:scale-[1.01] transition-transform text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Evaluating answer...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <Send className="h-3.5 w-3.5 text-white" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Previous Questions feedback sidebar */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 overflow-y-auto max-h-[500px] shadow-sm">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Recruiter Evaluations
            </h3>

            {session.answers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No answers evaluated in this session yet.</p>
            ) : (
              <div className="space-y-4">
                {session.answers.map((ans, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 border border-slate-100 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Question {idx + 1}</span>
                      <span className="text-purple-600">{ans.score}% Score</span>
                    </div>
                    <p className="text-slate-600 text-xs italic font-sans leading-normal">
                      "{ans.questionText}"
                    </p>
                    <p className="text-[10px] text-slate-500 leading-normal border-t border-slate-200/60 pt-2 font-sans">
                      <strong>AI Recruiter Feedback:</strong> {ans.feedback}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
