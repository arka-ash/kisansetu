import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, CheckCircle2, IndianRupee, ShieldCheck, ArrowRight } from 'lucide-react';
import { QualityGrade } from '../types';

interface AiAssistantProps {
  currentCrop?: string;
  cropName?: string;
  currentQuantity?: number;
  quantityKg?: number;
  currentGrade?: QualityGrade;
  qualityGrade?: QualityGrade;
  currentLocation?: string;
  farmerLocation?: string;
  farmerCoordinates?: { lat: number; lng: number } | null;
  farmerCoords?: { lat: number; lng: number } | null;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
  timestamp: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  currentCrop: propCrop,
  cropName,
  currentQuantity: propQuantity,
  quantityKg,
  currentGrade: propGrade,
  qualityGrade,
  currentLocation: propLoc,
  farmerLocation,
  farmerCoordinates,
  farmerCoords,
}) => {
  const currentCrop = propCrop || cropName || 'Onion';
  const currentQuantity = propQuantity || quantityKg || 500;
  const currentGrade = propGrade || qualityGrade || 'Grade A';
  const currentLocation = propLoc || farmerLocation || 'My Farm Gate';
  const activeCoordinates = farmerCoordinates || farmerCoords || null;
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Namaste! I am your **KisanMitra AI Assistant**. I provide **AI-Powered Decision Support** by analyzing platform-listed buyer prices, logistics freight calculations, and quality specifications to help you assess expected net returns.

You can ask me questions like:
- *"Where should I sell my ${currentQuantity} kg ${currentCrop} from ${currentLocation}?"*
- *"How is the estimated transport freight deducted from my revenue?"*
- *"Which buyer gives me the highest net payout for ${currentGrade} produce?"*`,
      source: 'rule-based-engine',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const QUICK_QUESTIONS = [
    `Where should I sell my ${currentQuantity} kg ${currentCrop}?`,
    `Why is FreshMart Agro or local mandi better for net return?`,
    `How does transport distance affect my final profit?`,
    `What are the quality requirements for ${currentGrade} ${currentCrop}?`,
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputText;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: promptToSend,
          cropName: currentCrop,
          quantityKg: currentQuantity,
          qualityGrade: currentGrade,
          farmerLocation: currentLocation,
          farmerCoordinates: activeCoordinates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI advice');
      }

      const data = await response.json();
      const aiMsg: Message = {
        sender: 'assistant',
        text: data.answer,
        source: data.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `I couldn't retrieve the latest market benchmark. Please compare the available buyer prices above to assess the estimated net return for your ${currentQuantity} kg ${currentCrop} (${currentGrade}).`,
          source: 'rule-based-engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[560px]">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold font-sans tracking-tight">KisanMitra AI Decision Support</h3>
              <span className="text-[10px] bg-emerald-700/80 text-emerald-100 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                Decision Support
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Grounded on platform-listed buyer data & transparent freight formulas • Decision support tool
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/60 max-h-[420px]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
              <div
                className={`text-[10px] mt-2 flex items-center justify-between ${
                  msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.source && (
                  <span className="font-mono text-[9px] uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {msg.source === 'gemini-3.7-flash' ? '✨ Gemini AI' : '⚙️ Rule Engine'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-slate-500 bg-white p-3.5 rounded-2xl border border-slate-200 max-w-xs animate-pulse">
            <Bot className="w-4 h-4 text-emerald-700 animate-spin" />
            <span>Calculating net returns across buyers...</span>
          </div>
        )}
      </div>

      {/* Quick Questions Chips */}
      <div className="px-5 pt-3 pb-2 bg-white border-t border-slate-100">
        <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
          Suggested Farmer Questions:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer disabled:opacity-50 text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask about selling ${currentQuantity} kg ${currentCrop} or transport costs...`}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
