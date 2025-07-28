import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown for rendering bot responses
// Removed import './styles/App.css'; as all styles will be inlined

function App() {
  // State to store chat messages
  const [messages, setMessages] = useState([]);
  // State to store the current user input
  const [input, setInput] = useState('');
  // State to manage loading status during API calls
  const [isLoading, setIsLoading] = useState(false);
  // State to store the session ID for persistent conversations
  const [sessionId, setSessionId] = useState(() => {
    // Initialize sessionId from localStorage or generate a new one
    const storedSessionId = localStorage.getItem('chatbotSessionId');
    return storedSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  // Ref for the messages container to enable auto-scrolling
  const messagesEndRef = useRef(null);

  // Effect to save sessionId to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatbotSessionId', sessionId);
  }, [sessionId]);

  // Effect to scroll to the bottom of the chat messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to handle sending a message
  const sendMessage = async () => {
    if (input.trim() === '') return; // Don't send empty messages

    const userMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]); // Add user message to chat
    setInput(''); // Clear input field
    setIsLoading(true); // Set loading state

    try {
      // Make a POST request to the Django chatbot backend
      // Ensure this URL matches your Django project's actual endpoint
      const response = await fetch('http://127.0.0.1:8000/chat/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, chatInput: userMessage.text }),
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const botReply = await response.text(); // Expecting plain text response (potentially Markdown)
      const botMessage = { sender: 'bot', text: botReply };
      setMessages((prevMessages) => [...prevMessages, botMessage]); // Add bot reply to chat
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { sender: 'bot', text: `Error: ${error.message}. Please try again.` };
      setMessages((prevMessages) => [...prevMessages, errorMessage]); // Display error to user
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Function to handle key presses (e.g., Enter key to send message)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  // Inline component for Loading Dots
  const LoadingDots = () => (
    <div className="loading-dots-container">
      <div className="loading-dot" style={{ animationDelay: '0s' }}></div>
      <div className="loading-dot" style={{ animationDelay: '0.2s' }}></div>
      <div className="loading-dot" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );

  // Inline component for Message Bubble
  const MessageBubble = ({ sender, children }) => (
    <div
      className={`message-bubble-wrapper ${
        sender === 'user' ? 'user-message-wrapper' : 'bot-message-wrapper'
      }`}
    >
      <div
        className={`message-bubble ${
          sender === 'user' ? 'user-message' : 'bot-message'
        }`}
      >
        {/* Render content using ReactMarkdown */}
        <ReactMarkdown>{children}</ReactMarkdown>
      </div>
    </div>
  );

  return (
    // Main container for the entire chatbot interface
    <div className="app-container">
      {/* Header section - centered text */}
      <header className="app-header">
        <h1 className="header-title">Study Buddy</h1>
      </header>

      {/* Chat Body - messages area */}
      {/* This main section will grow to fill available space, and its content will scroll */}
      <main className="chat-body custom-scrollbar">
        {messages.length === 0 && (
          <div className="chat-start-message-container">
            <p className="chat-start-message">Start a conversation...</p>
          </div>
        )}

        {/* Message mapping, now using inline MessageBubble component */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} sender={msg.sender}>
            {msg.text}
          </MessageBubble>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="loading-indicator-wrapper">
            <div className="loading-indicator-bubble">
              Typing<LoadingDots /> {/* Using the inline LoadingDots component */}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Scroll target */}
      </main>

      {/* Input Section - positioned at the bottom, centered */}
      <footer className="input-footer">
        <div className="input-container">
          <input
            type="text"
            placeholder="Type a message..."
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="send-button"
          >
            Send
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="send-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </footer>

      {/* Custom Styles for all elements */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          background-color: #f3f4f6; /* gray-100 */
          color: #374151; /* gray-800 */
          font-family: sans-serif;
        }

        .app-header {
          padding: 1rem;
          background-color: #ffffff;
          border-bottom: 1px solid #e5e7eb; /* gray-200 */
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
          text-align: center;
        }

        .header-title {
          font-size: 2.25rem; /* 3xl */
          font-weight: 700; /* bold */
          color: #4f46e5; /* indigo-700 */
        }

        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem; /* p-6 */
          display: flex;
          flex-direction: column;
          align-items: center; /* items-center */
          gap: 1rem; /* space-y-4 */
        }

        .chat-start-message-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
        }

        .chat-start-message {
          text-align: center;
          color: #6b7280; /* gray-500 */
          font-size: 1.125rem; /* lg */
          margin-top: 2.5rem; /* mt-10 */
        }

        .message-bubble-wrapper {
          display: flex;
          width: 100%; /* w-full */
        }

        .user-message-wrapper {
          justify-content: flex-end; /* justify-end */
        }

        .bot-message-wrapper {
          justify-content: flex-start; /* justify-start */
        }

        .message-bubble {
          max-width: 42rem; /* max-w-xl */
          padding: 0.75rem; /* p-3 */
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
          word-break: break-words; /* break-words */
        }

        .user-message {
          background-color: #3b82f6; /* blue-500 */
          color: #ffffff; /* text-white */
          border-bottom-right-radius: 0; /* rounded-br-none */
        }

        .bot-message {
          background-color: #e5e7eb; /* gray-200 */
          color: #374151; /* text-gray-800 */
          border-bottom-left-radius: 0; /* rounded-bl-none */
        }

        .loading-indicator-wrapper {
          display: flex;
          justify-content: flex-start;
          width: 100%;
        }

        .loading-indicator-bubble {
          background-color: #e5e7eb; /* gray-200 */
          color: #374151; /* gray-800 */
          padding: 0.5rem 1rem; /* px-4 py-2 */
          border-radius: 0.5rem; /* rounded-lg */
          animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; /* animate-pulse */
          display: flex;
          align-items: center;
        }

        .loading-dots-container {
          display: flex;
          align-items: center;
          margin-left: 0.5rem; /* ml-2 */
        }

        .loading-dot {
          width: 0.5rem; /* w-2 */
          height: 0.5rem; /* h-2 */
          background-color: #6b7280; /* gray-500 */
          border-radius: 9999px; /* rounded-full */
          animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        .input-footer {
          padding: 1rem;
          background-color: #ffffff;
          border-top: 1px solid #e5e7eb; /* gray-200 */
          box-shadow: 0 -1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-inner */
        }

        .input-container {
          display: flex;
          gap: 0.75rem; /* gap-3 */
          max-width: 42rem; /* max-w-xl */
          margin-left: auto;
          margin-right: auto; /* mx-auto */
          width: 100%;
        }

        .chat-input {
          flex: 1;
          padding: 0.5rem 1rem; /* px-4 py-2 */
          border-radius: 9999px; /* rounded-full */
          background-color: #f3f4f6; /* gray-100 */
          color: #374151; /* gray-800 */
          border: 1px solid #d1d5db; /* gray-300 */
          outline: none;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .chat-input:focus {
          border-color: #3b82f6; /* blue-500 */
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25); /* focus:ring-2 focus:ring-blue-500 */
        }

        .send-button {
          background-color: #2563eb; /* blue-600 */
          color: #ffffff; /* text-white */
          padding: 0.5rem 1rem; /* px-4 py-2 */
          border-radius: 9999px; /* rounded-full */
          font-weight: 700; /* font-bold */
          transition: background-color 0.15s ease-in-out, transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-lg */
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .send-button:hover {
          background-color: #1d4ed8; /* hover:bg-blue-700 */
          transform: scale(1.05); /* hover:scale-105 */
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-icon {
          height: 1.5rem; /* h-6 */
          width: 1.5rem; /* w-6 */
          display: inline-block;
          margin-left: 0.5rem; /* ml-2 */
        }

        /* Custom scrollbar styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Pulse animation for loading dots */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
