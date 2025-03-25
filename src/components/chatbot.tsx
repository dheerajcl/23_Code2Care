import React, { useState } from "react";

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [query, setQuery] = useState("");
  const [showChat, setShowChat] = useState(false);

  const handleSendMessage = async () => {
    if (!query.trim()) return;
  
    // Add user message to chat history
    const newMessages = [...messages, { user: query, bot: "" }];
    setMessages(newMessages);
    setQuery("");
  
    try {
      // POST request with conversation history
      const res = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,  // Pass entire chat history!
        }),
      });
  
      const data = await res.json();
      const botResponse = data.response || "I'm sorry, I couldn't find relevant events.";
  
      // Update chat with bot reply
      setMessages([...newMessages.slice(0, -1), { user: newMessages[newMessages.length - 1].user, bot: botResponse }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages([...newMessages.slice(0, -1), { user: newMessages[newMessages.length - 1].user, bot: "Error connecting to chatbot." }]);
    }
  };
  

  return (
    <div>
      {/* Floating Chatbot Button */}
      <button 
        onClick={() => setShowChat(!showChat)} 
        className="fixed bottom-20 right-10 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition"
      >
        💬 chatbot
      </button>

      {/* Chatbot UI */}
      {showChat && (
        <div className="fixed bottom-16 right-10 bg-white shadow-lg rounded-lg w-80 p-4 border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">Chatbot</h3>
            <button onClick={() => setShowChat(false)} className="text-gray-600">✖</button>
          </div>
          <div className="h-64 overflow-y-auto border p-2 mb-2">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <p className="font-bold text-red-600">You: {msg.user}</p>
                <p className="font-bold text-gray-800">Bot: {msg.bot}</p>
              </div>
            ))}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a message..."
            className="w-full border p-2 rounded"
          />
          <button 
            onClick={handleSendMessage} 
            className="mt-2 bg-red-500 text-white w-full p-2 rounded hover:bg-red-700 transition"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
