import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '@/lib/authContext'

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [query, setQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();

  // Replace with your dynamic volunteer ID logic (e.g., from auth context)
  // console.log(auth)
  const volunteerId = auth.user.id // Placeholder: fetch from auth or props

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!query.trim()) return;

    const newMessages = [...messages, { user: query, bot: "" }];
    setMessages(newMessages);
    setQuery("");
    setIsLoading(true);
    setError(null); // Reset error state

    try {
    const res = await fetch(`http://localhost:8000/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ 
        messages: newMessages,
        volunteer_id: volunteerId  // Explicitly include volunteer_id
      }),
    });

      // Check if response is successful
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Server responded with ${res.status}: ${res.statusText}. Details: ${errorText}`
        );
      }

      const data = await res.json();

      // Validate response structure
      if (!data.response || typeof data.response !== "string") {
        throw new Error("Invalid response format from server");
      }

      const botResponse = data.response;

      setMessages([
        ...newMessages.slice(0, -1),
        { user: newMessages[newMessages.length - 1].user, bot: botResponse },
      ]);
    } catch (error: any) {
      console.error("Chatbot error:", {
        message: error.message,
        stack: error.stack,
        request: { url: "http://localhost:8000/chat/", body: newMessages },
      });

      let userFriendlyError = "Something went wrong while connecting to the chatbot.";
      if (error.message.includes("401")) {
        userFriendlyError = "Authentication failed. Please log in again.";
      } else if (error.message.includes("404")) {
        userFriendlyError = "Chatbot service not found. Please try later.";
      } else if (error.message.includes("500")) {
        userFriendlyError = "Server error. Please try again later.";
      }

      setError(userFriendlyError);
      setMessages([
        ...newMessages.slice(0, -1),
        { user: newMessages[newMessages.length - 1].user, bot: userFriendlyError },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) handleSendMessage();
  };

  return (
    <div className="font-sans">
      {/* Floating Chatbot Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-20 right-10 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105 focus:outline-none z-50"
        aria-label="Toggle Chatbot"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      {/* Chatbot UI */}
      {showChat && (
        <div className="fixed bottom-24 right-10 w-96 bg-white shadow-2xl rounded-lg border border-gray-200 flex flex-col max-h-[80vh] animate-slide-up z-50">
          {/* Header */}
          <div className="bg-red-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold">Volunteer Chatbot</h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label="Close Chatbot"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center italic">Start a conversation!</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-end">
                    <p className="bg-red-100 text-red-800 p-2 rounded-lg max-w-[80%] break-words">
                      <span className="font-bold">You: </span>{msg.user}
                    </p>
                  </div>
                  {msg.bot && (
                    <div className="flex justify-start mt-1">
                      <p className="bg-gray-200 text-gray-800 p-2 rounded-lg max-w-[80%] break-words">
                        <span className="font-bold">Bot: </span>{msg.bot}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <p className="text-gray-500 italic flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h-8z"
                    />
                  </svg>
                  Bot is typing...
                </p>
              </div>
            )}
            {error && (
              <p className="text-red-600 text-center mt-2">{error}</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className={`p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h-8z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 010-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

// Tailwind Animation
const styles = `
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`;
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}