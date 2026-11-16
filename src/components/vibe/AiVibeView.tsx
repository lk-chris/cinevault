import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mic, ArrowUp, X, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ALL_LABELS, SCREENS } from '../../constants/vibeData';
import BottomNav from '../common/BottomNav';

interface FilterItem {
  key: string;
  id: string;
  label: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  filters?: FilterItem[];
  suggestions?: string[];
  isLive?: boolean;
}

interface AiVibeViewProps {
  onPickManually: () => void;
}

const INITIAL_SUGGESTIONS = [
  "Something short and funny for date night",
  "A mind-bending thriller, nothing too gory",
  "A quiet tearjerker under two hours",
  "A cozy anime for a rainy night"
];

const REFINEMENT_SUGGESTIONS = [
  "Make it darker",
  "Shorter",
  "Newer",
  "Add Sci-Fi",
  "Make it TV show instead",
  "Family safe"
];

const STORAGE_KEY_AI_MESSAGES = 'cinevault_ai_messages';

const loadSavedAiMessages = (): Message[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AI_MESSAGES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure the last AI message is marked isLive: true so chips and buttons remain interactive
        const lastIdx = parsed.length - 1;
        return parsed.map((m, idx) => ({
          ...m,
          isLive: idx === lastIdx && m.sender === 'ai'
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to load saved AI messages:', e);
  }
  return [];
};

export default function AiVibeView({ onPickManually }: AiVibeViewProps) {
  const navigate = useNavigate();
  const { sel, setSel, curateWithAI, aiLoading, hasCurated, resetVibe } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('Listening...');
  const [messages, setMessages] = useState<Message[]>(loadSavedAiMessages);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const recognitionRef = useRef<any>(null);
  const simTimerRef = useRef<any>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const latestSpeechRef = useRef<string>('');
  const hasSubmittedSpeechRef = useRef<boolean>(false);
  const selRef = useRef(sel);

  useEffect(() => {
    selRef.current = sel;
  }, [sel]);

  // Auto-resize textarea as content expands
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const nextH = Math.min(Math.max(textareaRef.current.scrollHeight, 26), 140);
      textareaRef.current.style.height = `${nextH}px`;
    }
  }, [inputVal]);

  // Persist messages in localStorage across route changes
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY_AI_MESSAGES, JSON.stringify(messages));
      } else {
        localStorage.removeItem(STORAGE_KEY_AI_MESSAGES);
      }
    } catch (e) {
      console.warn('Failed to persist AI messages:', e);
    }
  }, [messages]);

  // Extract active filters from AppContext `sel`
  const getActiveFilterItems = (currentSel = selRef.current): FilterItem[] => {
    const items: FilterItem[] = [];
    const keys = ["fmt", "mood", "genre", "time", "age", "era", "lang"];
    keys.forEach(k => {
      const set = currentSel[k];
      if (set) {
        set.forEach(id => {
          items.push({
            key: k,
            id,
            label: ALL_LABELS[id] || id
          });
        });
      }
    });
    return items;
  };

  // If already curated upon first visit and no prior chat history exists, show initial summary
  useEffect(() => {
    if (messages.length === 0 && hasCurated) {
      const items = getActiveFilterItems();
      if (items.length > 0) {
        setMessages([
          {
            id: 'init-vibe',
            sender: 'ai',
            text: "Here’s your current vibe for tonight. Remove what’s off, or tell me what you'd like to adjust.",
            filters: items,
            suggestions: REFINEMENT_SUGGESTIONS,
            isLive: true
          }
        ]);
      }
    }
  }, [hasCurated]);

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY_AI_MESSAGES);
    resetVibe();
  };

  // Auto-scroll when messages update
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiLoading]);

  // Handle removing an active filter chip
  const handleRemoveFilter = (filterKey: string, filterId: string) => {
    setSel(prev => {
      const next = { ...prev };
      if (next[filterKey]) {
        const set = new Set(next[filterKey]);
        set.delete(filterId);
        next[filterKey] = set;
      }
      return next;
    });

    setMessages(prev =>
      prev.map(msg => {
        if (msg.filters) {
          return {
            ...msg,
            filters: msg.filters.filter(f => !(f.key === filterKey && f.id === filterId))
          };
        }
        return msg;
      })
    );
  };

  // Send a prompt to AI
  const handleSendPrompt = async (textToSend?: string) => {
    const query = (textToSend ?? inputVal).trim();
    if (!query) return;

    setInputVal('');
    cancelListening();

    const userMsgId = `u-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    // Mark previous AI messages as not live
    setMessages(prev => [
      ...prev.map(m => ({ ...m, isLive: false })),
      { id: userMsgId, sender: 'user', text: query }
    ]);

    // Perform curation with AI
    const result = await curateWithAI(query);

    // After curation, update with the latest extracted filters from result or sel
    const activeFilters = result?.filters
      ? getActiveFilterItems(result.filters)
      : getActiveFilterItems();

    setMessages(prev => [
      ...prev,
      {
        id: aiMsgId,
        sender: 'ai',
        text: activeFilters.length > 0
          ? (result?.explanation || "Here’s what I picked up. Remove what’s off, or tell me more.")
          : "I couldn't quite pin that down. Are you after a movie, a series, or anime?",
        filters: activeFilters,
        suggestions: REFINEMENT_SUGGESTIONS,
        isLive: true
      }
    ]);
  };

  // Voice recognition / Mic handler
  const startListening = () => {
    if (isListening) {
      cancelListening();
      return;
    }

    setIsListening(true);
    setTranscript('Listening...');
    latestSpeechRef.current = '';
    hasSubmittedSpeechRef.current = false;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const capturedText = (finalTranscript || interimTranscript).trim();
          if (capturedText) {
            latestSpeechRef.current = capturedText;
            setTranscript(capturedText);
          }

          if (finalTranscript.trim() && !hasSubmittedSpeechRef.current) {
            hasSubmittedSpeechRef.current = true;
            setTimeout(() => {
              cancelListening();
              handleSendPrompt(finalTranscript.trim());
            }, 400);
          }
        };

        recognition.onerror = () => {
          if (!hasSubmittedSpeechRef.current && !latestSpeechRef.current.trim()) {
            fallbackSpeechSimulation();
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          if (!hasSubmittedSpeechRef.current && latestSpeechRef.current.trim()) {
            hasSubmittedSpeechRef.current = true;
            handleSendPrompt(latestSpeechRef.current.trim());
          }
        };

        recognition.start();
        return;
      } catch (e) {
        fallbackSpeechSimulation();
      }
    } else {
      fallbackSpeechSimulation();
    }
  };

  // Fallback speech simulation (works smoothly on any device without mic permissions)
  const fallbackSpeechSimulation = () => {
    const samples = [
      "Something short and funny for date night, nothing too gory",
      "A mind-bending thriller I can watch tonight",
      "A cozy anime for a rainy night",
      "Make it darker and more intense"
    ];
    const phrase = samples[Math.floor(Math.random() * samples.length)];

    let i = 0;
    clearInterval(simTimerRef.current);
    simTimerRef.current = setInterval(() => {
      i++;
      setTranscript(phrase.slice(0, i));
      if (i >= phrase.length) {
        clearInterval(simTimerRef.current);
        setTimeout(() => {
          setIsListening(false);
          handleSendPrompt(phrase);
        }, 700);
      }
    }, 36);
  };

  const cancelListening = () => {
    clearInterval(simTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setIsListening(false);
    setTranscript('Listening...');
  };

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col justify-between relative selection:bg-am selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0A0A0C]/95 backdrop-blur-md border-b border-white/[0.08] px-[18px] pt-[max(14px,env(safe-area-inset-top))] pb-3">
        <div className="w-full max-w-[760px] mx-auto flex items-center justify-between">
          <div className="text-xl font-light tracking-tight">
            Cine<b className="text-am font-bold">Vault</b>
          </div>

          <button
            onClick={onPickManually}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-t2 hover:text-white bg-s1 hover:bg-s2 border border-white/[0.08] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={13} className="text-t2" />
            <span>Pick manually</span>
          </button>
        </div>
      </header>

      {/* Main Conversation & Welcome Thread */}
      <main className="w-full max-w-[760px] mx-auto px-[18px] pt-6 pb-[200px] flex-1">
        {/* Welcome Screen when no messages */}
        {messages.length === 0 && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-[clamp(28px,6vw,40px)] font-bold leading-[1.08] tracking-tight mb-2.5 text-white">
              What are you in the mood for tonight?
            </h1>
            <p className="text-t2 text-[15px] leading-relaxed mb-6">
              Say it however you like: who’s watching, how long you’ve got, what you’re craving.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {INITIAL_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendPrompt(sug)}
                  className="px-4 py-2.5 rounded-full bg-s1 hover:bg-s2 border border-white/[0.08] hover:border-white/20 text-sm text-left text-white/90 hover:text-white transition-all cursor-pointer shadow-sm hover:translate-y-[-1px]"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Thread */}
        <div className="flex flex-col gap-5">
          {messages.map(msg => (
            <div key={msg.id} className="flex flex-col">
              {msg.sender === 'user' ? (
                // User Message Bubble
                <div className="self-end max-w-[85%] px-4 py-2.5 rounded-[20px_20px_6px_20px] bg-s2 border border-white/10 text-[15px] leading-relaxed text-white break-words shadow-md shadow-black/40">
                  {msg.text}
                </div>
              ) : (
                // AI Assistant Message Bubble
                <div className="flex flex-col gap-2 max-w-[95%]">
                  <div className="flex items-center gap-1.5 font-mono text-xs text-am font-semibold">
                    <Sparkles size={13} className="text-am" />
                    <span>CineVault AI</span>
                  </div>

                  <p className="text-[15px] leading-relaxed text-gray-200 m-0">
                    {msg.text}
                  </p>

                  {/* Picked up filter chips */}
                  {msg.filters && msg.filters.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 pb-1">
                      {msg.filters.map(chip => (
                        <span
                          key={`${chip.key}:${chip.id}`}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-am/10 border border-am/30 text-am text-xs font-medium"
                        >
                          <span>{chip.label}</span>
                          {msg.isLive && (
                            <button
                              onClick={() => handleRemoveFilter(chip.key, chip.id)}
                              aria-label={`Remove ${chip.label}`}
                              className="w-4 h-4 rounded-full grid place-items-center hover:bg-am/20 text-am transition-colors cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick refinement suggestions (only on live AI message) */}
                  {msg.isLive && msg.suggestions && (
                    <div className="flex flex-wrap gap-2 pt-1 pb-1">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendPrompt(sug)}
                          className="px-3 py-1.5 rounded-full bg-s1 hover:bg-s3 border border-white/[0.08] text-xs text-white/90 hover:text-white transition-colors cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* CTAs (only on live AI message) */}
                  {msg.isLive && (
                    <div className="flex items-center justify-between gap-3 pt-3 w-full">
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="py-2.5 px-5 rounded-full bg-s1 hover:bg-s2 border border-white/[0.08] text-xs font-mono text-gray-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                      >
                        Reset feed
                      </button>

                      <button
                        onClick={() => navigate('/tonight')}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-am hover:bg-amber-400 text-[#111] font-semibold text-sm transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                      >
                        <span>Show my picks</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* AI Thinking Animation */}
          {aiLoading && (
            <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 font-mono text-xs text-am font-semibold">
                <Sparkles size={13} className="text-am" />
                <span>CineVault AI</span>
              </div>
              <div className="flex items-center gap-1.5 py-2 text-t2">
                <i className="w-2 h-2 rounded-full bg-am animate-ai-dot-1" />
                <i className="w-2 h-2 rounded-full bg-am animate-ai-dot-2" />
                <i className="w-2 h-2 rounded-full bg-am animate-ai-dot-3" />
              </div>
            </div>
          )}

          <div ref={threadEndRef} />
        </div>
      </main>

      {/* Confirmation Modal for Resetting Feed */}
      {showResetConfirm && (
        <div
          id="confirm-reset-backdrop"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "confirm-reset-backdrop") {
              setShowResetConfirm(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-[420px] bg-s1 rounded-2xl p-6 border border-white/[0.1] shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">
              Reset your feed?
            </h3>
            <p className="text-sm text-t2 leading-relaxed mb-6">
              This will clear all your active preferences and return you to a clean slate.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-full bg-s2 border border-white/[0.08] text-xs font-mono text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-full bg-am text-[#111] text-xs font-bold font-mono hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-am/10"
              >
                Yes, reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Composer Bar */}
      <div className="fixed left-0 right-0 bottom-[calc(56px+env(safe-area-inset-bottom,0px))] px-4 pt-3 pb-3 bg-gradient-to-t from-bg via-bg/95 to-transparent flex justify-center z-30">
        <div className="relative w-full max-w-[760px] flex items-end gap-1.5 p-1.5 pl-4 rounded-[26px] bg-s1 border border-white/[0.08] focus-within:border-am/70 shadow-2xl shadow-black/80 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendPrompt();
              }
            }}
            placeholder="Describe your night"
            aria-label="Describe what you want to watch"
            disabled={aiLoading || isListening}
            className="flex-1 min-w-0 bg-transparent border-0 text-white placeholder-t2 text-[15px] leading-relaxed outline-none resize-none py-2 my-0 max-h-[140px] overflow-y-auto"
          />

          {/* Mic Button */}
          <button
            onClick={startListening}
            disabled={aiLoading || isListening}
            aria-label="Speak your vibe"
            title="Use microphone"
            className="w-10 h-10 rounded-full grid place-items-center bg-s2 hover:bg-s3 text-white transition-colors cursor-pointer shrink-0 mb-0.5 disabled:opacity-50"
          >
            <Mic size={18} />
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSendPrompt()}
            disabled={!inputVal.trim() || aiLoading || isListening}
            aria-label="Send"
            title="Send vibe prompt"
            className={`w-10 h-10 rounded-full grid place-items-center transition-all shrink-0 mb-0.5 cursor-pointer ${
              inputVal.trim() && !aiLoading && !isListening
                ? 'bg-am text-[#111] hover:bg-amber-400 active:scale-95'
                : 'bg-s2 text-t2 opacity-50 cursor-not-allowed'
            }`}
          >
            <ArrowUp size={18} />
          </button>

          {/* Listening Overlay with Soundwaves & Transcript */}
          {isListening && (
            <div className="absolute inset-0 rounded-[26px] bg-s1 border border-am/40 flex items-center gap-3 px-4 py-2 z-10 animate-in fade-in duration-150 shadow-xl">
              {/* Waveform bars */}
              <div className="flex items-center gap-1 h-6 shrink-0">
                <i className="w-1 h-1.5 rounded-full bg-am animate-wave-1" />
                <i className="w-1 h-1.5 rounded-full bg-am animate-wave-2" />
                <i className="w-1 h-1.5 rounded-full bg-am animate-wave-3" />
                <i className="w-1 h-1.5 rounded-full bg-am animate-wave-4" />
                <i className="w-1 h-1.5 rounded-full bg-am animate-wave-5" />
              </div>

              {/* Spoken transcript that wraps without cutting off */}
              <div className="flex-1 min-w-0 max-h-[120px] overflow-y-auto text-sm text-gray-200 font-mono leading-relaxed break-words py-1">
                {transcript}
              </div>

              {/* Cancel listening */}
              <button
                onClick={cancelListening}
                aria-label="Cancel speech"
                title="Cancel"
                className="w-8 h-8 rounded-full grid place-items-center bg-s2 hover:bg-s3 text-white transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
