import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'hi', name: 'हिंदी (Hindi)', label: 'HI' },
  { code: 'mr', name: 'मराठी (Marathi)', label: 'MR' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', label: 'KN' },
];

const GREETINGS = {
  en: "Hello! I'm your Verde packaging expert. Ask me about materials, FSSAI compliance, or machinery troubleshooting.",
  hi: "नमस्ते! मैं आपका वर्डे पैकेजिंग विशेषज्ञ हूं। सामग्री, FSSAI नियमों या मशीनरी के बारे में मुझसे कुछ भी पूछें।",
  mr: "नमस्कार! मी तुमचा वर्डे पॅकेजिंग तज्ञ आहे. सामग्री किंवा FSSAI नियमांबद्दल मला काहीही विचारा.",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ವರ್ಡೆ ಪ್ಯಾಕೇಜಿಂಗ್ ತಜ್ಞ. ಪ್ಯಾಕೇಜಿಂಗ್ ಸಾಮಗ್ರಿಗಳು ಅಥವಾ FSSAI ನಿಯಮಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ."
};

const MOCK_REPLIES = {
  en: "That's a great question! Based on local supply chains, I'd recommend checking the supplier's minimum order quantity (MOQ) first. Would you like me to find alternatives?",
  hi: "यह एक बहुत अच्छा सवाल है! स्थानीय आपूर्ति श्रृंखलाओं के आधार पर, मैं सबसे पहले MOQ की जांच करने की सलाह दूंगा। क्या मैं विकल्प खोजूं?",
  mr: "हा एक चांगला प्रश्न आहे! स्थानिक पुरवठ्यानुसार, मी प्रथम MOQ तपासण्याची शिफारस करेन. मी पर्याय शोधू का?",
  kn: "ಇದು ಉತ್ತಮ ಪ್ರಶ್ನೆ! ಸ್ಥಳೀಯ ಪೂರೈಕೆ ಆಧಾರದ ಮೇಲೆ, ನಾನು ಮೊದಲು MOQ ಪರಿಶೀಲಿಸಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ. ನಾನು ಪರ್ಯಾಯಗಳನ್ನು ಹುಡುಕಲೇ?"
};

export function ChatDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([{ id: 1, text: GREETINGS['en'], sender: 'bot' }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleLanguageChange = (code) => {
    setLanguage(code);
    // Add a system message indicating language change
    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: GREETINGS[code], sender: 'bot' }
    ]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking and replying
    setTimeout(() => {
      const newBotMsg = { id: Date.now() + 1, text: MOCK_REPLIES[language], sender: 'bot' };
      setMessages(prev => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 w-[340px] sm:w-[380px] h-[500px] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-950/50 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <h3 className="font-semibold text-white text-sm">Verde Assistant</h3>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Language Selector */}
                <select 
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-gray-800 text-xs text-gray-300 border border-gray-700 rounded-md px-2 py-1 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>

                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] text-sm px-4 py-2.5 rounded-2xl ${
                      msg.sender === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-sm' 
                        : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 text-gray-400 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-gray-950/50 border-t border-white/10">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about packaging..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-full pl-4 pr-12 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-1.5 p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button with slow subtle bounce when closed */}
      <motion.button
        animate={
          isOpen 
            ? { y: 0, x: 0 } 
            : { y: [0, -12, 0], x: [0, 2, -2, 0] }
        }
        transition={
          isOpen 
            ? { duration: 0.3 } 
            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg shadow-black/40 border transition-colors duration-300 ${
          isOpen 
            ? 'bg-gray-800 border-gray-700 text-gray-300' 
            : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
        }`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
            <span className="text-sm font-semibold tracking-wide">Expert Chat</span>
          </>
        )}
      </motion.button>

    </div>
  );
}
