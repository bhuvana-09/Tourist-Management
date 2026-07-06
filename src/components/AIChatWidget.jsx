import { useState, useRef, useEffect } from "react";
import { backendApi as api } from "../api/axiosInstance";

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! I am your AI travel assistant. How can I help you plan your next journey today?",
      sender: "bot"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    setRateLimited(false);

    // Append user message immediately
    const updatedMessages = [...messages, { text: userMessage, sender: "user" }];
    setMessages(updatedMessages);

    try {
      // Map history format: { text, sender: 'user' | 'bot' }
      const history = updatedMessages.map((m) => ({
        text: m.text,
        sender: m.sender
      }));

      const res = await api.post("/ai/chat", {
        messageHistory: history.slice(0, -1), // skip current message since it is passed separately
        userMessage
      });

      if (res.aiUnavailable && res.message && res.message.includes("limit")) {
        setRateLimited(true);
        setMessages((prev) => [
          ...prev,
          {
            text: res.message,
            sender: "bot",
            isWarning: true
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text: res.data || "I couldn't process that request. Try again shortly.",
            sender: "bot"
          }
        ]);
      }
    } catch (err) {
      console.error("Chat message delivery failed:", err);
      // Check for 429 rate limit
      if (err.response?.status === 429) {
        setRateLimited(true);
        setMessages((prev) => [
          ...prev,
          {
            text: "Rate limit reached. Please wait 15 minutes before sending more messages.",
            sender: "bot",
            isWarning: true
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, I am having trouble connecting to support. Try again shortly.",
            sender: "bot"
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat window */}
      {isOpen && (
        <div className="w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-4 animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                ✈️
              </div>
              <div>
                <h3 className="font-bold text-sm">Travel Assistant</h3>
                <p className="text-[10px] text-blue-200">Online & ready to advise</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                      : m.isWarning
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3 text-xs text-slate-500 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={rateLimited ? "Chat rate limit reached..." : "Ask about locations, tours, tips..."}
              className="flex-1 input-field py-2 px-3 text-xs"
              disabled={loading || rateLimited}
            />
            <button
              type="submit"
              className="btn-primary p-2 px-4 text-xs font-semibold rounded-xl flex items-center justify-center"
              disabled={loading || rateLimited || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all text-2xl text-white hover:shadow-blue-500/30"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          "💬"
        )}
      </button>
    </div>
  );
}
