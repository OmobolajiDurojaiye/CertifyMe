import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { SERVER_BASE_URL } from "../config";
import toast from "react-hot-toast";

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "👋 Hi there! How can we help you today with ProofDeck?", sender: "bot" }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { user } = useUser();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // validation for email if not logged in
    if (!user && !email.trim()) {
       toast.error("Please enter your email so we can reply.");
       return;
    }

    const msgText = newMessage;
    setNewMessage(""); // Clear input immediately for UX

    // Add user message to state
    setMessages(prev => [...prev, { id: Date.now(), text: msgText, sender: "user" }]);

    setIsSending(true);
    try {
      const baseURL = SERVER_BASE_URL.endsWith('/') ? SERVER_BASE_URL.slice(0, -1) : SERVER_BASE_URL;
      
      await axios.post(`${baseURL}/api/support/message`, {
        email,
        message: msgText,
        user_id: user?.id
      });

      // Simulate bot reply or confirmation
      setTimeout(() => {
          setMessages(prev => [...prev, { 
              id: Date.now() + 1, 
              text: "Thanks! We've received your message and will get back to you shortly via email.", 
              sender: "bot" 
          }]);
      }, 1000);

    } catch (error) {
      console.error("Support message error:", error);
      toast.error("Failed to send message. Please try again.");
      // Optionally remove the message from UI if failed, or show error state
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div
        className={`bg-white w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right mb-4 pointer-events-auto border border-gray-100 flex flex-col ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-10 pointer-events-none h-0"
        }`}
        style={{ height: isOpen ? '500px' : '0' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex-shrink-0 relative">
          <button 
             onClick={toggleOpen}
             className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
             <X size={20} />
          </button>
          
          <div className="flex items-center gap-3">
             <div className="relative">
                <img 
                  src="/support-avatar.jpg" 
                  alt="Support" 
                  className="w-10 h-10 rounded-full border-2 border-white/20 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
             </div>
             <div>
                <h3 className="font-bold text-base">Chat with us</h3>
                <p className="text-blue-100 text-xs">
                   We reply immediately
                </p>
             </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
                <div 
                   key={msg.id} 
                   className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div 
                       className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                           msg.sender === 'user' 
                           ? 'bg-blue-600 text-white rounded-br-none' 
                           : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
                       }`}
                    >
                        {msg.text}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="bg-white p-3 border-t border-gray-100 flex-shrink-0">
             {!user && messages.length < 3 && (
                 <div className="mb-2 px-1">
                     <input 
                       type="email" 
                       required
                       placeholder="Enter your email..."
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs transition-all bg-gray-50"
                     />
                 </div>
             )}
             <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input 
                   type="text"
                   required
                   placeholder="Send a message..."
                   value={newMessage}
                   onChange={(e) => setNewMessage(e.target.value)}
                   className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all bg-gray-50"
                />
                <button
                   type="submit"
                   disabled={isSending || !newMessage.trim()}
                   className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                   <Send size={18} className={isSending ? "animate-pulse" : ""} />
                </button>
             </form>
             <div className="text-center mt-2">
                <a href="/" className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
                   Powered by <strong>ProofDeck</strong>
                </a>
             </div>
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={toggleOpen}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-110 ${
          isOpen ? "bg-gray-800 text-white rotate-90" : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default SupportWidget;
