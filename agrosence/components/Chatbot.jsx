import React, { useState, useEffect } from "react";
import { resource } from "../resource";
import { FaPaperPlane } from "react-icons/fa"; // Send icon
import axios from "axios";

const Chatbot = () => {
  const [isChatboxVisible, setIsChatboxVisible] = useState(false);
  const [message, setMessage] = useState(""); // Stores user's message
  const [isLoading, setIsLoading] = useState(false); // For showing the loading effect
  const [chatHistory, setChatHistory] = useState([]); // Stores the chat history

  // Show welcome message when chatbot is opened
  useEffect(() => {
    if (isChatboxVisible) {
      setChatHistory([
        { sender: "bot", message: "Welcome! How can I assist you today?" },
      ]);
    }
  }, [isChatboxVisible]);

  // Toggle the visibility of the chatbox
  const handleChatbotClick = () => {
    setIsChatboxVisible(!isChatboxVisible);
  };

  // Handle message input change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  // Handle sending the message
  const handleSendMessage = async () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, { sender: "user", message: message }]);
      setMessage("");
      setIsLoading(true);
  
      try {
        const response = await axios.post("http://localhost:5000/api/chatbot", {
          message: message,
        });
  
        const botMessage = response.data.answer;
        setChatHistory((prevChatHistory) => [
          ...prevChatHistory,
          { sender: "bot", message: botMessage },
        ]);
      } catch (error) {
        setChatHistory((prevChatHistory) => [
          ...prevChatHistory,
          { sender: "bot", message: "Sorry, I couldn't understand your question." },
        ]);
      }
  
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      {/* Chatbot Button */}
      <div className="chatbot-button" onClick={handleChatbotClick}>
        <img
          src={resource.Chatbot1.src}
          alt={resource.Chatbot1.alt}
          className="chatbot-image"
        />
      </div>

      {/* Chatbox */}
      {isChatboxVisible && (
        <div
          className="chatbox p-0 h-50 rounded"
          style={{ width: "90%", maxWidth: "300px" }}
        >
          {/* Top Section - Logo and Title */}
          <div
            className="chatbox-header p-2"
            style={{ backgroundColor: "#009444" }}
          >
            <img
              src={resource.Logo2.src}
              alt={resource.Logo2.alt}
              className="chatbox-image"
            />
            <h3 style={{fontFamily:"martel"}} className="fw-light text-white">AgroBot</h3>
          </div>
          {/* Body Section */}
          <div className="chatbox-body text-dark p-1">
            {/* Display chat history */}
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`chat-message ${
                  chat.sender === "user" ? "user-message" : "bot-message"
                }`}
              >
                {chat.sender === "bot" && (
                  <img
                    src={resource.Chatbot.src}
                    alt={resource.Chatbot.alt}
                    className="chatbox-image border border-2 border-success"
                  />
                )}
                <span>{chat.message}</span>
              </div>
            ))}
            {isLoading && <p className="loading">...</p>} {/* Show loading effect when typing */}
          </div>

          {/* Bottom Section - Input and Send Button */}
          <div className="chatbox-footer p-1">
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              placeholder="Ask about farming..."
              className="chatbox-input"
            />
            <button onClick={handleSendMessage} className="send-button">
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
