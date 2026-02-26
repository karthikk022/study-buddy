import { useState, useRef, useEffect } from "react";

const CATEGORIES = {
  "School": {
    emoji: "📚",
    color: "#ffd200",
    subjects: {
      "All Subjects": { emoji: "📚", starters: ["What is photosynthesis?", "How do I solve fractions?", "What caused World War 2?"] },
      "Math": { emoji: "🔢", starters: ["How do I solve fractions?", "What is Pythagoras theorem?", "Explain algebra basics"] },
      "Science": { emoji: "🔬", starters: ["What is photosynthesis?", "How does gravity work?", "What are atoms made of?"] },
      "History": { emoji: "🏛️", starters: ["What caused World War 2?", "Who was Napoleon?", "What was the Renaissance?"] },
      "English": { emoji: "✍️", starters: ["What is a metaphor?", "How do I write an essay?", "What is past tense?"] },
      "Geography": { emoji: "🌍", starters: ["What causes earthquakes?", "What is climate change?", "How are mountains formed?"] },
    }
  },
  "Life Skills": {
    emoji: "🌱",
    color: "#00f5a0",
    subjects: {
      "Cooking": { emoji: "🍳", starters: ["How do I boil eggs perfectly?", "What can I cook with rice and eggs?", "How do I make a simple pasta?"] },
      "Budgeting": { emoji: "💰", starters: ["How do I make a monthly budget?", "What is the 50/30/20 rule?", "How do I start saving money?"] },
      "Job Interviews": { emoji: "💼", starters: ["How do I answer 'tell me about yourself'?", "What should I wear to an interview?", "How do I handle tough interview questions?"] },
      "Health": { emoji: "💪", starters: ["How do I start exercising as a beginner?", "What is a balanced diet?", "How do I improve my sleep?"] },
      "Communication": { emoji: "🗣️", starters: ["How do I speak more confidently?", "How do I write a professional email?", "How do I handle conflict calmly?"] },
      "Money Basics": { emoji: "🏦", starters: ["What is a credit score?", "How do taxes work?", "What is an emergency fund?"] },
    }
  }
};

const SYSTEM_PROMPTS = {
  school: `You are StudyBuddy, a friendly and patient AI tutor for students of all ages. Explain school topics in simple, clear language.
- Always explain step by step
- Use simple analogies and real-life examples  
- Be encouraging — never make the student feel dumb
- For math, show your working clearly
- Keep answers focused and not too long
- Use emojis occasionally to keep things friendly 😊`,

  lifeskills: `You are LifeCoach, a warm and practical AI life skills guide for everyday people. Help with real-world skills in a simple, non-judgmental way.
- Give practical, actionable advice that anyone can follow
- Use simple language — no jargon
- Be warm and encouraging — everyone is learning at their own pace
- Break down tasks into small, doable steps
- Share quick tips and common mistakes to avoid
- Keep it conversational and friendly 😊`,
};

export default function StudyBuddy() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("School");
  const [activeSubject, setActiveSubject] = useState("All Subjects");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveSubject(Object.keys(CATEGORIES[cat].subjects)[0]);
    setMessages([]);
  };

  const handleSubjectChange = (sub) => {
    setActiveSubject(sub);
    setMessages([]);
  };

  const currentCategory = CATEGORIES[activeCategory];
  const currentSubject = currentCategory.subjects[activeSubject];
  const accentColor = currentCategory.color;
  const isLifeSkill = activeCategory === "Life Skills";

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const userMsg = { role: "user", content: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const systemPrompt = isLifeSkill
        ? SYSTEM_PROMPTS.lifeskills + `\n\nThe user is asking about: ${activeSubject}. Focus your advice on that area.`
        : SYSTEM_PROMPTS.school + (activeSubject !== "All Subjects" ? `\n\nFocus on: ${activeSubject}.` : "");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: updatedMessages,
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response. Try again!";
      setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...updatedMessages, { role: "assistant", content: "⚠️ Something went wrong. Please try again!" }]);
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0;
  const botEmoji = isLifeSkill ? "🌱" : "🎓";
  const botName = isLifeSkill ? "LifeCoach" : "StudyBuddy";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Nunito', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Mono:wght@700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 740, padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `linear-gradient(135deg, ${accentColor}aa, ${accentColor})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
              boxShadow: `0 4px 15px ${accentColor}44`,
              transition: "all 0.3s",
            }}>{botEmoji}</div>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", color: accentColor, fontSize: 18, fontWeight: 700, lineHeight: 1, transition: "color 0.3s" }}>{botName}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>
                {isLifeSkill ? "Real-world skills for everyday life" : "Your personal AI tutor"}
              </div>
            </div>
          </div>

          <div style={{
            display: "flex", gap: 4,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 12, padding: 4,
            border: "1px solid rgba(255,255,255,0.1)",
          }}>
            {Object.entries(CATEGORIES).map(([cat, data]) => (
              <button key={cat} onClick={() => handleCategoryChange(cat)} style={{
                padding: "7px 14px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                transition: "all 0.2s",
                background: activeCategory === cat ? data.color : "transparent",
                color: activeCategory === cat ? "#1a1a2e" : "rgba(255,255,255,0.5)",
              }}>
                {data.emoji} {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
          {Object.entries(currentCategory.subjects).map(([sub, data]) => (
            <button key={sub} onClick={() => handleSubjectChange(sub)} style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: `1px solid ${activeSubject === sub ? accentColor : "rgba(255,255,255,0.1)"}`,
              background: activeSubject === sub ? `${accentColor}22` : "transparent",
              color: activeSubject === sub ? accentColor : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              transition: "all 0.2s",
            }}>
              {data.emoji} {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{
        width: "100%", maxWidth: 740,
        flex: 1,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minHeight: "calc(100vh - 220px)",
        overflowY: "auto",
      }}>
        {isEmpty ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 20, paddingTop: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>{currentSubject.emoji}</div>
              <h2 style={{ color: "white", fontWeight: 900, fontSize: 22, margin: 0 }}>
                {isLifeSkill ? `Let's learn about ${activeSubject}!` : `What are we studying today?`}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 6, fontSize: 13 }}>
                {isLifeSkill ? "Ask me anything — practical advice, no judgment!" : "Ask me anything — I'll explain it simply!"}
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 520 }}>
              {currentSubject.starters.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{
                  padding: "9px 16px",
                  borderRadius: 20,
                  border: `1px solid ${accentColor}44`,
                  background: `${accentColor}11`,
                  color: accentColor,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  transition: "all 0.2s",
                }}>
                  {q} →
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: 8,
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: 30, height: 30, borderRadius: 9,
                  background: `linear-gradient(135deg, ${accentColor}88, ${accentColor})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, flexShrink: 0,
                }}>{botEmoji}</div>
              )}
              <div style={{
                maxWidth: "75%",
                padding: "11px 15px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user"
                  ? `linear-gradient(135deg, ${accentColor}cc, ${accentColor})`
                  : "rgba(255,255,255,0.07)",
                color: msg.role === "user" ? "#1a1a2e" : "rgba(255,255,255,0.9)",
                fontSize: 14,
                lineHeight: 1.7,
                fontWeight: msg.role === "user" ? 700 : 400,
                whiteSpace: "pre-wrap",
                border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}>
                {msg.content}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: `linear-gradient(135deg, ${accentColor}88, ${accentColor})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
            }}>{botEmoji}</div>
            <div style={{
              padding: "13px 16px", borderRadius: "18px 18px 18px 4px",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", gap: 5, alignItems: "center",
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: accentColor,
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ width: "100%", maxWidth: 740, padding: "0 20px 20px", position: "sticky", bottom: 0 }}>
        <div style={{
          display: "flex", gap: 10,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 14,
          padding: "8px 8px 8px 16px",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isLifeSkill ? `Ask about ${activeSubject}...` : `Ask a ${activeSubject === "All Subjects" ? "" : activeSubject + " "}question...`}
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "white", fontSize: 14, fontFamily: "'Nunito', sans-serif",
              resize: "none", lineHeight: 1.5, paddingTop: 6,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 40, height: 40, borderRadius: 10, border: "none",
              background: input.trim() && !loading ? `linear-gradient(135deg, ${accentColor}99, ${accentColor})` : "rgba(255,255,255,0.08)",
              color: input.trim() && !loading ? "#1a1a2e" : "rgba(255,255,255,0.3)",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", flexShrink: 0,
            }}
          >↑</button>
        </div>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, margin: "6px 0 0" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        textarea::placeholder { color: rgba(255,255,255,0.25); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}
