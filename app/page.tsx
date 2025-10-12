'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle,
  faSun,
  faMoon,
  faEnvelope,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { DndContext, useDraggable, DragEndEvent } from '@dnd-kit/core';
import Wave from 'react-wavify';
import classNames from 'classnames';
import { Tooltip } from 'react-tooltip';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@fontsource-variable/roboto';
import '@fontsource-variable/roboto-mono';
import '@fontsource/zen-kaku-gothic-new';
import 'react-tooltip/dist/react-tooltip.css';

function RainEffect({ darkMode }: { darkMode: boolean }) {
  const [raindrops, setRaindrops] = useState<Array<{id: number, left: number, delay: number, duration: number}>>([]);

  useEffect(() => {
    // Generate raindrops only on client side to avoid hydration mismatch
    const drops = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 1 + Math.random() * 1
    }));
    setRaindrops(drops);
  }, []);

  const rainColor = darkMode ? '#da931e' : '#e1c8a3';

  return (
    <div className="fixed inset-0 pointer-events-none z-5 overflow-hidden">
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
          }
        }
      `}</style>
      {raindrops.map((drop) => (
        <div
          key={drop.id}
          className="absolute w-1 h-12"
          style={{
            left: `${drop.left}%`,
            top: '-48px',
            background: `linear-gradient(to bottom, ${rainColor}80, transparent)`,
            animation: `fall ${drop.duration}s linear ${drop.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function DraggableCard({ children, darkMode, position }: { children: React.ReactNode; darkMode: boolean; position: { x: number; y: number } }) {
  const { setNodeRef, transform } = useDraggable({
    id: 'draggable-card',
  });

  const style = {
    transform: `translate3d(${position.x + (transform?.x || 0)}px, ${position.y + (transform?.y || 0)}px, 0)`,
  };

  const cardClasses = classNames(
    'relative max-w-4xl w-full mx-4 rounded-3xl shadow-2xl overflow-hidden',
    {
      'bg-[#1d1d1d]': darkMode,
      'bg-gradient-to-br from-[#b7bff1] to-[#f7caff]': !darkMode
    }
  );

  return (
    <div ref={setNodeRef} style={style} className={`${cardClasses} z-10`}>
      {children}
    </div>
  );
}

function DragHandle({ children, darkMode }: { children: React.ReactNode; darkMode: boolean }) {
  const { attributes, listeners } = useDraggable({
    id: 'draggable-card',
  });

  const headerClasses = classNames(
    'px-6 py-4 flex items-center gap-2',
    {
      'bg-[#1d1d1d]': darkMode,
      'bg-[#b7bff1]': !darkMode
    }
  );

  return (
    <div className={headerClasses} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

export default function Portfolio() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [contactMessage, setContactMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{text: string, sender: 'user' | 'bot'}>>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setCardPosition((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  };

  const handleClick = (section: string) => {
    setActiveModal(section);
  };

  const closeModal = () => {
    setActiveModal(null);
    setContactMessage('');
    setChatMessages([]);
  };

  const handleSendMessage = () => {
    if (contactMessage.trim()) {
      const newUserMessage = { text: contactMessage, sender: 'user' as const };
      const updatedMessages = [...chatMessages, newUserMessage];
      
      setChatMessages(updatedMessages);
      setContactMessage('');
      
      // Count user messages in the updated array
      const userMessageCount = updatedMessages.filter(msg => msg.sender === 'user').length;
      
      // Wait 2 seconds before showing typing indicator
      setTimeout(() => {
        setIsTyping(true);
        
        // Show typing indicator for 2 seconds, then send response
        setTimeout(() => {
          setIsTyping(false);
          
          // Determine response based on message count
          let botResponse = '';
          if (userMessageCount === 1) {
            botResponse = "Sorry, this is fake. Get pranked lol. If you want to reach me, try going through LinkedIn";
          } else if (userMessageCount === 2) {
            botResponse = "Seriously, I'm not real.";
          } else {
            botResponse = "bruh why r u so desperate";
          }
          
          setChatMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
        }, 2000);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const navButtons = [
    { id: 'about', label: 'about', icon: faInfoCircle },
    { id: 'contact', label: 'contact', icon: faEnvelope }
  ];

  const mainContainerClasses = classNames(
    'min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500',
    {
      'bg-[#755334]': darkMode,
      'bg-[#cc9793]': !darkMode
    }
  );

  const contentClasses = classNames(
    'px-12 py-16 text-center',
    {
      'text-white': darkMode,
      'text-gray-900': !darkMode
    }
  );

  return (
    <div className={mainContainerClasses} style={{ fontFamily: 'Roboto Variable, sans-serif' }}>
      <SpeedInsights />

      {/* Theme Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={classNames(
          'fixed top-6 left-6 p-3 rounded-full shadow-lg transition-all hover:scale-110 z-50',
          {
            'bg-[#da931e] text-gray-900': darkMode,
            'bg-[#e1c8a3] text-gray-800': !darkMode
          }
        )}
        data-tooltip-id="theme-tip"
        data-tooltip-content={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        <FontAwesomeIcon icon={darkMode ? faSun : faMoon} size="lg" />
      </button>

      {/* Rain Effect */}
      <RainEffect darkMode={darkMode} />

      {/* Draggable Main Card */}
      <DndContext onDragEnd={handleDragEnd}>
        <DraggableCard darkMode={darkMode} position={cardPosition}>
          {/* Browser-like Header - Drag Handle */}
          <DragHandle darkMode={darkMode}>
            <div className={classNames(
            )}
            >
            </div>
          </DragHandle>

          {/* Content */}
          <div className={contentClasses}>
            {/* Hero Text */}
            <h1 className="text-6xl md:text-7xl font-bold mb-4">
              hello, <span className={classNames(
                'text-transparent bg-clip-text',
                {
                  'bg-gradient-to-r from-orange-400 to-yellow-500': darkMode,
                  'bg-gradient-to-r from-blue-400 to-cyan-500': !darkMode
                }
              )}>and welcome</span>
            </h1>
            <p className={classNames(
              'text-xl mb-12',
              {
                'text-gray-100': darkMode,
                'text-gray-700': !darkMode
              }
            )}>
              3rd year CS student and caffeine + game addict
            </p>

            {/* Navigation Icons */}
            <div className="flex justify-center gap-8 mb-12">
              {navButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleClick(btn.id)}
                  className="flex flex-col items-center gap-2 group transition-transform hover:scale-110"
                  data-tooltip-id={`nav-${btn.id}`}
                  data-tooltip-content={`View ${btn.label}`}
                >
                  <div className={classNames(
                    'w-16 h-16 rounded-2xl flex items-center justify-center transition-all',
                    {
                      'bg-[#d0d0d0] group-hover:bg-gray-400': darkMode,
                      'bg-white group-hover:bg-gray-50': !darkMode
                    }
                  )}>
                    <FontAwesomeIcon 
                      icon={btn.icon} 
                      size="2x" 
                      className={darkMode ? 'text-[#1d1d1d]' : 'text-gray-700'}
                    />
                  </div>
                  <span className={classNames(
                    'text-sm font-medium',
                    {
                      'text-gray-100': darkMode,
                      'text-gray-700': !darkMode
                    }
                  )}>
                    {btn.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={classNames(
            'px-12 py-6 border-t',
            {
              'bg-[#1d1d1d] border-[#d0d0d0]': darkMode,
              'bg-[#f7caff] border-[#b7bff1]': !darkMode
            }
          )}>
            <div className="flex justify-center gap-6 mb-4">
              <a 
                href="https://www.linkedin.com/in/yinbochen/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={classNames(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110',
                  {
                    'bg-[#d0d0d0] hover:bg-blue-600': darkMode,
                    'bg-white hover:bg-blue-500': !darkMode
                  }
                )}
                data-tooltip-id="linkedin-tip"
                data-tooltip-content="LinkedIn Profile"
              >
                <FontAwesomeIcon icon={faLinkedin} size="lg" className={darkMode ? 'text-[#1d1d1d]' : 'text-gray-700'} />
              </a>
              <a 
                href="https://github.com/citiniS" 
                target="_blank" 
                rel="noopener noreferrer"
                className={classNames(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110',
                  {
                    'bg-[#d0d0d0] hover:bg-gray-800': darkMode,
                    'bg-white hover:bg-gray-700': !darkMode
                  }
                )}
                data-tooltip-id="github-tip"
                data-tooltip-content="GitHub Profile"
              >
                <FontAwesomeIcon icon={faGithub} size="lg" className={darkMode ? 'text-[#1d1d1d]' : 'text-gray-700'} />
              </a>
            </div>
            <p className={classNames(
              'text-center text-sm',
              {
                'text-gray-200': darkMode,
                'text-gray-600': !darkMode
              }
            )}>
              why are you here? theres nothing. Design inspired by <a href="https://www.sharyap.com/">sharyap.com/</a>
            </p>
          </div>
        </DraggableCard>
      </DndContext>

      {/* Wave Background - Bottom Half */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0" style={{ height: '50vh' }}>
        <Wave
          fill={darkMode ? "#da931e" : "#e1c8a3"}
          paused={false}
          style={{ 
            display: 'flex',
            height: '100%',
            width: '100%'
          }}
          options={{
            height: 20,
            amplitude: 30,
            speed: 0.2,
            points: 4
          }}
        />
      </div>

      {/* Modal */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn"
          onClick={closeModal}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes popIn {
              0% { transform: scale(0.8); opacity: 0; }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes bounce {
              0%, 60%, 100% { transform: translateY(0); }
              30% { transform: translateY(-10px); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.2s ease-out;
            }
            .animate-popIn {
              animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            .dot-bounce {
              animation: bounce 1.4s infinite ease-in-out;
            }
            .dot-bounce:nth-child(1) {
              animation-delay: 0s;
            }
            .dot-bounce:nth-child(2) {
              animation-delay: 0.2s;
            }
            .dot-bounce:nth-child(3) {
              animation-delay: 0.4s;
            }
          `}</style>
          
          <div 
            className={classNames(
              'max-w-2xl w-full mx-4 rounded-2xl shadow-2xl p-8 animate-popIn relative overflow-visible',
              {
                'bg-[#1d1d1d] text-white': darkMode,
                'bg-gradient-to-br from-[#b7bff1] to-[#f7caff] text-gray-900': !darkMode
              }
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold capitalize">{activeModal}</h2>
              <button
                onClick={closeModal}
                className={classNames(
                  'text-2xl font-bold w-10 h-10 rounded-full transition-colors',
                  {
                    'hover:bg-[#381C34]': darkMode,
                    'hover:bg-white': !darkMode
                  }
                )}
              >
                ×
              </button>
            </div>

            <div className={darkMode ? 'text-gray-100' : 'text-gray-700'}>
              {activeModal === 'about' && (
                <div className="space-y-4">
                  <p className="leading-relaxed">
                    Hi, I am Yin Bo Chen. 
                    <br /> I&apos;m a<strong> Chinese Malaysian</strong> born in the US.
                  </p>
                  <p className="leading-relaxed">
                    Currently Studying for: <strong>Bachelor of Science in Computer Science at Champlain College</strong><br />
                  </p>
                  <p className="leading-relaxed">
                    I have am fluent in <strong>English</strong>, 
                    and can speak decently in <strong>Mandarin Chinese/中文</strong>. 
                    <br />I can also speak <strong>Cantonese Chinese</strong> at a very low level.
                  </p>
                </div>
              )}

              {activeModal === 'contact' && (
                <div className="flex flex-col h-96">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={classNames(
                          'flex',
                          msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={classNames(
                            'max-w-xs px-4 py-2 rounded-2xl',
                            {
                              'bg-[#d0d0d0] text-[#1d1d1d] rounded-br-none': msg.sender === 'user' && darkMode,
                              'bg-[#b7bff1] text-gray-900 rounded-br-none': msg.sender === 'user' && !darkMode,
                              'bg-[#1d1d1d] text-white rounded-bl-none': msg.sender === 'bot' && darkMode,
                              'bg-white text-gray-900 rounded-bl-none border border-[#b7bff1]': msg.sender === 'bot' && !darkMode
                            }
                          )}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div
                          className={classNames(
                            'px-4 py-3 rounded-2xl rounded-bl-none flex gap-1',
                            {
                              'bg-[#1d1d1d]': darkMode,
                              'bg-white border border-[#b7bff1]': !darkMode
                            }
                          )}
                        >
                          <div className={classNames('w-2 h-2 rounded-full dot-bounce', darkMode ? 'bg-[#d0d0d0]' : 'bg-[#b7bff1]')} />
                          <div className={classNames('w-2 h-2 rounded-full dot-bounce', darkMode ? 'bg-[#d0d0d0]' : 'bg-[#b7bff1]')} />
                          <div className={classNames('w-2 h-2 rounded-full dot-bounce', darkMode ? 'bg-[#d0d0d0]' : 'bg-[#b7bff1]')} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className={classNames(
                    'pt-4 border-t',
                    darkMode ? 'border-[#95C8D8]' : 'border-[#b7bff1]'
                  )}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className={classNames(
                          'flex-1 px-4 py-3 rounded-full border-2 focus:outline-none focus:ring-2 transition-all',
                          {
                            'bg-[#1d1d1d] border-[#d0d0d0] text-white placeholder-gray-400 focus:ring-[#d0d0d0]': darkMode,
                            'bg-white border-[#b7bff1] text-gray-900 placeholder-gray-400 focus:ring-[#b7bff1]': !darkMode
                          }
                        )}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!contactMessage.trim()}
                        className={classNames(
                          'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                          {
                            'bg-[#d0d0d0] text-[#1d1d1d] hover:bg-gray-400 hover:scale-110': darkMode && contactMessage.trim(),
                            'bg-gradient-to-r from-[#b7bff1] to-[#f7caff] text-gray-900 hover:scale-110': !darkMode && contactMessage.trim(),
                            'opacity-50 cursor-not-allowed': !contactMessage.trim()
                          }
                        )}
                      >
                        <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tooltips */}
      <Tooltip id="theme-tip" />
      <Tooltip id="linkedin-tip" />
      <Tooltip id="github-tip" />
      {navButtons.map(btn => <Tooltip key={btn.id} id={`nav-${btn.id}`} />)}
    </div>
  );
}
