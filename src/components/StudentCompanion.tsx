import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Sparkles, 
  Flame, 
  Coffee, 
  Send, 
  Trash2, 
  Loader2, 
  Terminal, 
  Smile, 
  Briefcase,
  ChevronUp,
  ChevronDown
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface StudentCompanionProps {
  userId: string;
  userName?: string;
  userRole?: string;
}

export default function StudentCompanion({ userId, userName = "Student", userRole = "Software Engineer" }: StudentCompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [tone, setTone] = useState<"buddy" | "recruiter" | "motivator">("buddy");
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`offerbuddy_companion_chat_${userId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
    return [
      { 
        role: "assistant", 
        content: `Yo ${userName}! 👋 I'm your AI Campus Companion. Ready to tackle placement season? Pick a mode above and let's get you placed! 🚀` 
      }
    ];
  });
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // Persist chat
  useEffect(() => {
    localStorage.setItem(`offerbuddy_companion_chat_${userId}`, JSON.stringify(messages));
  }, [messages, userId]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    if (!textToSend) {
      setInputValue("");
    }

    const updatedMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat/companion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`
        },
        body: JSON.stringify({
          messages: updatedMessages,
          tone
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI");
      }

      const data = await response.json();
      setMessages([...updatedMessages, { role: "assistant", content: data.content }]);
    } catch (err: any) {
      console.error(err);
      setMessages([...updatedMessages, { 
        role: "assistant", 
        content: "Oops, the college Wi-Fi timed out! 📶 Let me re-index my synapses and try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const initialMsg: Message = { 
      role: "assistant", 
      content: getGreeting(tone) 
    };
    setMessages([initialMsg]);
  };

  const getGreeting = (t: "buddy" | "recruiter" | "motivator") => {
    if (t === "buddy") {
      return `Yo ${userName}! Senior Brody here. 🎓 Grab a coffee ☕. Placement stuff is stressful, but I got some hacks. Ask me anything!`;
    } else if (t === "recruiter") {
      return `Alright ${userName}, let's talk real. 💼 I've reviewed 10,000+ candidate sheets. Ask me a question or paste some text, and prepare to be roasted (productively).`;
    } else {
      return `LET'S GOOO ${userName}! 🔥 You are a literal compiler of pure potential! No bugs in your code today. Ask me for a pep talk or custom hype!`;
    }
  };

  // Switch tone
  const handleToneChange = (newTone: "buddy" | "recruiter" | "motivator") => {
    setTone(newTone);
    // Add custom greeting from the new tone if thread is short or reset
    const systemGreeting: Message = {
      role: "assistant",
      content: getGreeting(newTone)
    };
    setMessages(prev => [...prev, systemGreeting]);
  };

  const quickPrompts = [
    { label: "Roast my pitch 🎤", prompt: `Give me a quick, cheeky elevator pitch critique for a ${userRole} role.` },
    { label: "Stress help 😣", prompt: "I'm feeling really anxious about placements and campus interviews. Help me calm down." },
    { label: "Code Meme 💻", prompt: "Tell me a funny engineering or algorithm meme to make me laugh." },
    { label: "SDE Cheat 🔍", prompt: "Give me an awesome cheat sheet advice for binary search and recursion." }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end selection:bg-purple-100 selection:text-purple-900">
      
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative group cursor-pointer"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 text-[8px] font-extrabold text-white items-center justify-center">1</span>
          </span>
          <MessageSquare className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
          
          {/* Tooltip */}
          <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-slate-800">
            Vibe Check & stress Buster AI 💬
          </span>
        </button>
      )}

      {/* Main Chat Panel */}
      {isOpen && (
        <div className={`w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ${isMinimized ? "h-16" : "h-[540px]"}`}>
          
          {/* Header Panel */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-lg font-bold">
                {tone === "buddy" ? "🎓" : tone === "recruiter" ? "💼" : "🔥"}
              </div>
              <div>
                <h3 className="font-extrabold text-xs tracking-wider uppercase">Campus Companion</h3>
                <span className="text-[10px] opacity-90 block font-medium">
                  {tone === "buddy" ? "Senior Brody (Chill Mode)" : tone === "recruiter" ? "Recruiter Roast Mode" : "Motivational Hype Coach"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                title="Close Companion"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Minimizable Chat Flow */}
          {!isMinimized && (
            <>
              {/* Personality Selector Tab bar */}
              <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100 p-1.5 gap-1">
                <button
                  onClick={() => handleToneChange("buddy")}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${tone === "buddy" ? "bg-white text-blue-600 shadow-sm border border-blue-50" : "text-slate-400 hover:text-slate-700"}`}
                >
                  <Coffee className="h-3.5 w-3.5 mb-0.5 text-blue-500" />
                  <span>Senior Brody</span>
                </button>
                <button
                  onClick={() => handleToneChange("recruiter")}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${tone === "recruiter" ? "bg-white text-purple-600 shadow-sm border border-purple-50" : "text-slate-400 hover:text-slate-700"}`}
                >
                  <Briefcase className="h-3.5 w-3.5 mb-0.5 text-purple-500" />
                  <span>Recruiter Roast</span>
                </button>
                <button
                  onClick={() => handleToneChange("motivator")}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${tone === "motivator" ? "bg-white text-orange-600 shadow-sm border border-orange-50" : "text-slate-400 hover:text-slate-700"}`}
                >
                  <Flame className="h-3.5 w-3.5 mb-0.5 text-orange-500" />
                  <span>Hype Coach</span>
                </button>
              </div>

              {/* Chat Threads */}
              <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-sans shadow-sm transition-all ${
                        msg.role === "user"
                          ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-tr-none"
                          : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                      {msg.role === "user" ? "You" : tone === "buddy" ? "Brody" : tone === "recruiter" ? "Recruiter" : "Coach"}
                    </span>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-center gap-2 mr-auto max-w-[85%]">
                    <div className="px-3.5 py-3 rounded-2xl border border-slate-100 bg-white text-slate-500 text-xs flex items-center gap-2 shadow-sm rounded-tl-none">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
                      <span className="italic font-sans text-[10px]">Processing response...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt suggestions for high UX */}
              {messages.length <= 2 && (
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Quick Hacks & Vibe Prompts:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((qp, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(qp.prompt)}
                        className="text-[10px] bg-white border border-slate-200/60 hover:border-purple-300 hover:text-purple-700 px-2.5 py-1 rounded-full text-slate-600 transition-colors font-medium shadow-sm cursor-pointer"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Input Area */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Reset Conversation thread"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSend();
                    }
                  }}
                  placeholder={
                    tone === "buddy" 
                      ? "Tell Brody your college stress..." 
                      : tone === "recruiter" 
                        ? "Paste some CV text to get roasted..." 
                        : "Ask coach for a code hype pep-talk..."
                  }
                  className="flex-grow bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-400"
                />

                <button
                  onClick={() => handleSend()}
                  disabled={loading || !inputValue.trim()}
                  className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white disabled:opacity-40 shadow-sm cursor-pointer shrink-0 hover:scale-105 active:scale-95 transition-transform"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
}
