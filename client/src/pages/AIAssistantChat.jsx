import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const AIAssistantChat = () => {
  const { token } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  // Add initial welcome message
  useEffect(() => {
    setMessages([
      {
        text: "Hello! I'm your AI health assistant. How can I help you today?",
        sender: 'assistant'
      }
    ]);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Check if user is logged in
    if (!token) {
      toast.error('Please login to use the chat assistant');
      return;
    }
    
    // Add user message to chat
    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setLoading(true);
    
    try {
      // Make API call to chat endpoint
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`, {
        message: userMessage,
        sessionId
      });
      
      if (response.data.success) {
        // Add AI response to chat
        setMessages(prev => [...prev, { 
          text: response.data.data.message, 
          sender: 'assistant' 
        }]);
        
        // Save session ID for conversation continuity
        if (response.data.data.sessionId) {
          setSessionId(response.data.data.sessionId);
        }
      } else {
        // Handle error in response
        toast.error(response.data.message || 'Failed to get response');
        setMessages(prev => [...prev, { 
          text: "I'm sorry, I'm having trouble responding right now. Please try again later.", 
          sender: 'assistant' 
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
      setMessages(prev => [...prev, { 
        text: "I'm sorry, I experienced an error. Please try again later.", 
        sender: 'assistant' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!sessionId) {
      setMessages([{
        text: "Hello! I'm your AI health assistant. How can I help you today?",
        sender: 'assistant'
      }]);
      return;
    }
    
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat/clear`, { sessionId });
      setSessionId('');
      setMessages([{
        text: "Chat history cleared. How can I help you today?",
        sender: 'assistant'
      }]);
      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Failed to clear chat history');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-semibold text-gray-800">AI Health Assistant</h2>
        <button
          onClick={clearChat}
          className="px-3 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-sm"
        >
          Clear Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-3">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] px-4 py-3 rounded-lg ${
                msg.sender === 'user' 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="break-words">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-3 bg-gray-100 text-gray-800 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your health question..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
      
      <div className="mt-2 text-xs text-gray-500">
        <p>⚠️ <strong>Disclaimer:</strong> This AI assistant provides general information only, not medical advice.</p>
      </div>
    </div>
  );
};

export default AIAssistantChat; 