import React, { useState } from "react";

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [query, setQuery] = useState("");
  const [showChat, setShowChat] = useState(false);

  const handleSendMessage = async () => {
    if (!query.trim()) return;

    // Add user message to the chat history
    const newMessages = [...messages, { user: query, bot: "" }];
    setMessages(newMessages); // Update UI
    setQuery(""); // Clear input

    try {
      const res = await fetch(`http://localhost:8000/search/?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      // Extract bot response from API
      const botResponse = data.chatbot_response || "I'm sorry, I couldn't find relevant events.";

      // Update the last message with bot response
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
        className="fixed bottom-10 right-10 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        💬
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
                <p className="font-bold text-blue-600">You: {msg.user}</p>
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
            className="mt-2 bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
