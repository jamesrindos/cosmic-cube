import { useState, useRef, useEffect } from "react";

// Phone animation disabled for now - using TV display with custom crop instead
const PHONE_CONFIG: Record<string, any> = {};
const PHONE_TAPES: string[] = [];

// Tape data - order matches the video from top to bottom
const tapeData = [
  { id: "dirtea", label: "DIRTEA", color: "#4CAF50", content: {
    title: "Dirtea", subtitle: "UK → US Launch",
    description: "nootropics brand in the UK looking to take a big swing with a US launch. was able to help out with one of their instagram reels. this seems simple enough but unfortunately took so much time with the tools that i had at my disposal lol. the physics were so hard to nail down!!",
    videoSrc: "https://files.catbox.moe/adbveb.mp4",
  }},
  { id: "moes", label: "MOE'S", color: "#FF5722", content: {
    title: "Moe's", subtitle: "Veo Spec Ad",
    description: "another spec ad. weird one. veo had been out for maybe a week. and i was rawdogging these prompts trying to get these animals to act like people and look somewhat consistent in between scenes. what a nightmare. kind of holds up though.",
    videoSrc: "https://files.catbox.moe/khpbp5.mp4",
  }},
  { id: "mte", label: "MTE", color: "#00BCD4", content: {
    title: "GetMTE", subtitle: "Repurposed Ad",
    description: "one of my friends was making this ad and got let go, so i was tasked with repurposing it. i guess i think the hook came out cool.",
    videoSrc: "https://files.catbox.moe/x626l0.mp4",
  }},
  { id: "bolde", label: "BOLDE", color: "#9C27B0", content: {
    title: "BoldeBottle", subtitle: "NanoBanana Pro",
    description: "got this assignment right around the launch of nanobanana pro. learned that providing start frame and end frame is absolutely the move. they paid me with one of their shaker cups. i haven't used it yet though.",
    videoSrc: "https://files.catbox.moe/da2q01.mp4",
  }},
  { id: "dsc", label: "DSC", color: "#3F51B5", content: {
    title: "DSC", subtitle: "Twin Lacrosse Players",
    description: "weird one. named the characters after my brothers, twin lacrosse players. don't think its a winner at all but it makes me laugh.",
    videoSrc: "https://files.catbox.moe/6ofgy1.mp4",
  }},
  { id: "mudwtr", label: "MUD\\WTR", color: "#795548", content: {
    title: "MUD/WTR", subtitle: "AI Video",
    description: "my favorite video i've made probably ever? just so fucking cool. opened my eyes to what was possible with ai video despite veo being out for only a few weeks. i've directed i think 4 more like it with similar characters. but this one will always take the cake.",
    videoSrc: "https://files.catbox.moe/53kbrr.mp4",
  }},
  { id: "moziwash", label: "MOZI WASH", color: "#FFD700", content: {
    title: "MoziWash", subtitle: "First Billboard",
    description: "my first billboard! i turned this around in 48 hours. no sleep, fueled by a few big gulps and breakfast burritos. got to work on it with one of my best friends which made it extra special.",
    videoSrc: "https://files.catbox.moe/rnkqtz.mp4",
    videoFit: "contain", // Letterbox - show full vertical video with black bars
  }},
  { id: "kalshi", label: "KALSHI", color: "#E91E63", content: {
    title: "Kalshi", subtitle: "Wimbledon Spec Ad",
    description: "what a blast. my friend nate and i locked ourselves in a room the day before wimbledon and made this ad for kalshi as a spec ad. we were spamming our connect while she was seeing a movie until she passed it on to her higher ups. was really cool to follow up pj ace's great work on his kalshi ads with this wimbledon spot.",
    videoSrc: "https://files.catbox.moe/6874b3.mp4",
  }},
  { id: "political", label: "POLITICAL", color: "#0D47A1", content: {
    title: "Political Media", subtitle: "Biden • DNC • State Campaigns",
    description: "i worked with mzl media and z tribeca for a year producing political campaign content for presidents, senators, congresspeople, and mayoral candidates across 12+ states. incredible experience!!",
    imageSrc: "/images/politics_web.jpg",
  }},
  { id: "bigface", label: "BIGFACE", color: "#222", content: {
    title: "BigFace", subtitle: "48 Hour Sprint",
    description: "another sleepless 48 hour period. did a ton of brand research. spent a ton of time making it look and sound like HIM but in a way that farms aura.",
    videoSrc: "https://files.catbox.moe/l766fu.mp4",
  }},
  { id: "sunflower1", label: "SUNFLOWER Vol.1", color: "#FFC107", content: {
    title: "Sunflower Vol 1", subtitle: "Sobriety Remix",
    description: "this brand asked for like 40 videos in a month on top of everything else i was creating. when i was tapped out of new concepts i turned to remixing some of my favorite iconic ad campaigns around sobriety. really like how this one came out!",
    videoSrc: "https://files.catbox.moe/7gmkk0.mp4",
    videoFit: "contain", // Letterbox - show full vertical video with black bars
  }},
  { id: "sunflower2", label: "SUNFLOWER Vol.2", color: "#FF9800", content: {
    title: "Sunflower Vol 2", subtitle: "Pixar Style",
    description: "people in the office told me this one hit emotionally but i just think the art style carried.",
    videoSrc: "https://files.catbox.moe/c1t0vc.mp4",
  }},
  { id: "audien", label: "AUDIEN HEARING", color: "#2196F3", content: {
    title: "Audien Hearing", subtitle: "AI CTV Ads",
    description: "this hearing aid company saw early potential for ai ctv ads and this is just one of many many ideas that we experimented with.",
    videoSrc: "https://files.catbox.moe/ijczhr.mp4",
  }},
  { id: "about", label: "ABOUT ME", color: "#FFF", content: {
    title: "James Rindos", subtitle: "Creative Technologist",
    description: "transparently, i'm in a bit of a discovery phase. i spent the last year building AI creative and agent-based systems. putting ads on everything from Instagram to Times Square billboards. the year before that i was in political media, producing campaign content for congresspeople, senators, and a president. competition runs in my veins. whatever we work on together, i want us to win... and selfishly i hope to learn more about myself on the way.\n\nlets chat: jamesrindos1@gmail.com",
    imageSrc: "/images/james-about.jpg",
    links: { 
      twitter: { handle: "@slimjimm318", url: "https://twitter.com/slimjimm318" },
      linkedin: { handle: "james-rindos", url: "https://linkedin.com/in/james-rindos-489a29245" },
    }
  }},
];

const FlatLayout = () => {
  const [selectedTape, setSelectedTape] = useState<typeof tapeData[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentVideoRef = useRef<HTMLVideoElement>(null);
  
  // Debug mode - add ?debug=1 to URL to see hotspot positions
  const isDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';
  
  // Debug crop control (only active in debug mode)
  const [debugCropX, setDebugCropX] = useState(50); // 0-100 horizontal position
  const [debugCropY, setDebugCropY] = useState(50); // 0-100 vertical position
  const [debugScale, setDebugScale] = useState(100); // 100 = normal, 150 = 1.5x zoom out
  const [debugContain, setDebugContain] = useState(false); // true = letterbox mode
  
  // Tape click sound
  const playTapeSound = () => {
    const audio = new Audio('/sounds/tape-click.mp3');
    audio.volume = 0.7;
    audio.play().catch(() => {});
  };
  
  // Ambient sound - plays when no tape is selected
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create ambient audio element once
    if (!ambientRef.current) {
      ambientRef.current = new Audio('/sounds/ambient.mp3');
      ambientRef.current.loop = true;
      ambientRef.current.volume = 0.15;
    }
    
    const ambient = ambientRef.current;
    
    if (!selectedTape) {
      // No tape selected - play ambient
      ambient.play().catch(() => {});
    } else {
      // Tape selected - pause ambient
      ambient.pause();
    }
    
    return () => {
      // Cleanup on unmount
      ambient.pause();
    };
  }, [selectedTape]);
  
  // Phone animation state
  const [phonePhase, setPhonePhase] = useState<'none' | 'entering' | 'showing' | 'exiting'>('none');
  const phoneVideoRef = useRef<HTMLVideoElement>(null);
  const phoneContentRef = useRef<HTMLVideoElement>(null);
  
  // Check if tape should use phone animation
  const isPhoneTape = (tapeId: string) => PHONE_TAPES.includes(tapeId);
  
  // Handle phone animation sequence
  const handlePhoneAnimationEnd = () => {
    console.log('Video ended, phase:', phonePhase);
    if (phonePhase === 'entering') {
      console.log('Transitioning to showing');
      setPhonePhase('showing');
    } else if (phonePhase === 'exiting') {
      console.log('Transitioning to none');
      setPhonePhase('none');
      setSelectedTape(null);
    } else {
      console.log('onEnded fired during', phonePhase, '- this should not happen if loop is true');
    }
  };
  
  // Get phone video source based on phase and selected tape
  // Note: 'showing' phase doesn't use this - content is overlaid separately
  const getPhoneVideoSrc = () => {
    if (!selectedTape || !PHONE_CONFIG[selectedTape.id]) return '';
    const config = PHONE_CONFIG[selectedTape.id];
    switch (phonePhase) {
      case 'entering': return config.out;
      case 'exiting': return config.away;
      default: return '';
    }
  };
  
  // Get phone screen position for content overlay
  const getPhoneScreenStyle = () => {
    if (!selectedTape || !PHONE_CONFIG[selectedTape.id]) return {};
    const { screen } = PHONE_CONFIG[selectedTape.id];
    return {
      position: 'absolute' as const,
      left: `${screen.left}%`,
      top: `${screen.top}%`,
      width: `${screen.width}%`,
      height: `${screen.height}%`,
      zIndex: 210,
      borderRadius: '20px',
      overflow: 'hidden',
    };
  };
  
  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsMobilePortrait(isMobile && isPortrait);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Force background video to play on mobile
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.muted = true;
    video.defaultMuted = true;
    
    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    };
    
    // Try immediately
    tryPlay();
    
    // Retry when video is ready
    video.addEventListener('canplay', tryPlay);
    video.addEventListener('loadeddata', tryPlay);
    
    // Retry on visibility change (tab focus)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tryPlay();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    
    // Retry on any user interaction
    const interactionHandler = () => {
      tryPlay();
      document.removeEventListener('touchstart', interactionHandler);
      document.removeEventListener('click', interactionHandler);
    };
    document.addEventListener('touchstart', interactionHandler);
    document.addEventListener('click', interactionHandler);
    
    return () => {
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('loadeddata', tryPlay);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('touchstart', interactionHandler);
      document.removeEventListener('click', interactionHandler);
    };
  }, []);
  
  const [tvPos, setTvPos] = useState({ top: 21.9, left: 27.6, width: 37.7, height: 52.3 });
  const [tvDragging, setTvDragging] = useState<'move' | 'resize' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, ...tvPos });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!tvDragging) return;
      const dx = ((e.clientX - dragStart.x) / window.innerWidth) * 100;
      const dy = ((e.clientY - dragStart.y) / window.innerHeight) * 100;
      
      if (tvDragging === 'move') {
        setTvPos({
          ...tvPos,
          top: Math.round((dragStart.top + dy) * 10) / 10,
          left: Math.round((dragStart.left + dx) * 10) / 10,
        });
      } else if (tvDragging === 'resize') {
        setTvPos({
          ...tvPos,
          width: Math.max(10, Math.round((dragStart.width + dx) * 10) / 10),
          height: Math.max(10, Math.round((dragStart.height + dy) * 10) / 10),
        });
      }
    };
    const handleMouseUp = () => setTvDragging(null);
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [tvDragging, dragStart, tvPos]);

  const logTvPos = () => {
    alert(`TV Position:\ntop: ${tvPos.top}%\nleft: ${tvPos.left}%\nwidth: ${tvPos.width}%\nheight: ${tvPos.height}%`);
  };

  useEffect(() => {
    setIsPlaying(true);
  }, [selectedTape]);

  const tapePositions = [
    8.2,   // DIRTEA
    14.2,  // MOE'S
    19.9,  // MTE
    25.5,  // BOLDE
    31.7,  // DSC
    37.5,  // MUD\WTR
    43.4,  // MOZI WASH
    49.3,  // KALSHI
    55.6,  // POLITICAL
    61.9,  // BIGFACE
    68.1,  // SUNFLOWER Vol.1
    74.3,  // SUNFLOWER Vol.2
    80.4,  // AUDIEN HEARING
    87.1,  // ABOUT ME
  ];

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#000",
      overflow: "hidden",
      position: "relative",
      fontFamily: "'VT323', monospace",
    }}>
      {/* Mobile portrait overlay */}
      {isMobilePortrait && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.95)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "40px",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "64px",
            marginBottom: "24px",
            animation: "rotate-hint 2s ease-in-out infinite",
          }}>
            📱
          </div>
          <div style={{
            color: "#FFF",
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "12px",
          }}>
            ROTATE YOUR PHONE
          </div>
          <div style={{
            color: "#888",
            fontSize: "14px",
            maxWidth: "280px",
            lineHeight: 1.5,
          }}>
            This portfolio is best viewed in landscape orientation
          </div>
          <style>{`
            @keyframes rotate-hint {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(15deg); }
              75% { transform: rotate(-15deg); }
            }
          `}</style>
        </div>
      )}
      
      {/* Background: looping video */}
      <video
        ref={videoRef}
        src="https://files.catbox.moe/jyg0zn.mp4"
        poster="/images/tv-bg.png"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onTouchStart={(e) => {
          const video = e.currentTarget;
          if (video.paused) video.play();
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
        }}
      />

      {/* Dark edge overlays - fade out the bright edges on mobile */}
      <div className="edge-overlay-left" style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "15%",
        height: "100%",
        background: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
        zIndex: 2,
        pointerEvents: "none",
      }} />
      <div className="edge-overlay-right" style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "15%",
        height: "100%",
        background: "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
        zIndex: 2,
        pointerEvents: "none",
      }} />
      <style>{`
        @media (min-width: 1024px) {
          .edge-overlay-left, .edge-overlay-right { display: none !important; }
        }
      `}</style>

      {/* Header overlay */}
      <div style={{ 
        position: "absolute",
        top: "20px",
        left: "32px",
        zIndex: 100,
      }}>
        <div style={{ fontSize: "28px", letterSpacing: "3px", color: "rgba(232,220,200,0.9)", fontWeight: "bold" }}>
          JAMES RINDOS
        </div>
        <div style={{ fontSize: "14px", color: "rgba(200,200,200,1)", letterSpacing: "4px" }}>
          CREATIVE PORTFOLIO
        </div>
      </div>

      {/* Phone animation - new overlay architecture */}
      {/* Phone out/away video (hand animation) */}
      {(phonePhase === 'entering' || phonePhase === 'exiting') && (
        <video
          key={`phone-anim-${selectedTape?.id}-${phonePhase}`}
          ref={phoneVideoRef}
          src={getPhoneVideoSrc()}
          autoPlay
          playsInline
          muted
          onEnded={handlePhoneAnimationEnd}
          onError={(e) => {
            console.error('Phone video failed to load:', getPhoneVideoSrc(), e);
            setPhonePhase('none');
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 200,
            pointerEvents: "none",
          }}
        />
      )}
      
      {/* Static phone frame during 'showing' - last frame of phone-out */}
      {phonePhase === 'showing' && selectedTape && PHONE_CONFIG[selectedTape.id] && (
        <img
          src={PHONE_CONFIG[selectedTape.id].frame}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 200,
            pointerEvents: "none",
          }}
        />
      )}
      
      {/* Content video overlay on phone screen */}
      {(phonePhase === 'entering' || phonePhase === 'showing') && selectedTape && PHONE_CONFIG[selectedTape.id] && (
        <video
          ref={phoneContentRef}
          src={PHONE_CONFIG[selectedTape.id].content}
          autoPlay
          loop
          playsInline
          muted={phonePhase === 'entering'} // Mute during hand animation, unmute when showing
          style={{
            ...getPhoneScreenStyle(),
            opacity: phonePhase === 'showing' ? 1 : 0, // Hidden during entering, visible during showing
            border: isDebug ? '3px solid lime' : 'none', // Debug: show overlay bounds
          }}
        />
      )}

      {/* TV Screen overlay - hidden when phone animation is active */}
      {selectedTape && !isPhoneTape(selectedTape.id) && (
        <div style={{
          position: "absolute",
          top: `${tvPos.top}%`,
          left: `${tvPos.left}%`,
          width: `${tvPos.width}%`,
          height: `${tvPos.height}%`,
          overflow: "hidden",
          borderRadius: "4px",
          zIndex: 50,
        }}>
          {/* CRT effects overlay */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            background: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px)`,
            pointerEvents: "none",
            zIndex: 10,
          }}/>
          
          {/* Video/Image content */}
          {selectedTape.content.videoSrc ? (
            <div 
              onClick={() => {
                if (contentVideoRef.current) {
                  if (contentVideoRef.current.paused) {
                    contentVideoRef.current.play();
                    setIsPlaying(true);
                  } else {
                    contentVideoRef.current.pause();
                    setIsPlaying(false);
                  }
                }
              }}
              style={{ width: "100%", height: "100%", cursor: "pointer", position: "relative" }}
            >
              <video
                ref={contentVideoRef}
                src={selectedTape.content.videoSrc}
                autoPlay
                loop
                playsInline
                style={{ 
                  width: isDebug ? `${debugScale}%` : "100%", 
                  height: isDebug ? `${debugScale}%` : "100%", 
                  objectFit: isDebug ? (debugContain ? "contain" : "cover") : ((selectedTape.content as any).videoFit || "cover"),
                  objectPosition: isDebug ? `${debugCropX}% ${debugCropY}%` : ((selectedTape.content as any).videoCrop || "center center"),
                  imageRendering: "pixelated",
                  background: (isDebug ? debugContain : (selectedTape.content as any).videoFit === "contain") ? "#000" : "transparent",
                  position: "absolute",
                  left: isDebug ? `${(100 - debugScale) / 2}%` : 0,
                  top: isDebug ? `${(100 - debugScale) / 2}%` : 0,
                }}
              />
              {!isPlaying && (
                <div style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "48px",
                  color: "rgba(255,255,255,0.7)",
                  textShadow: "0 0 20px rgba(0,0,0,0.8)",
                  pointerEvents: "none",
                }}>▶</div>
              )}
            </div>
          ) : selectedTape.content.imageSrc ? (
            <div 
              onClick={() => setSelectedTape(null)}
              style={{
                width: "100%", 
                height: "100%",
                position: "relative",
                background: "#000",
                cursor: "pointer",
              }}
            >
              <img 
                src={selectedTape.content.imageSrc}
                alt={selectedTape.content.title}
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  filter: "contrast(1.1) saturate(0.9)",
                }}
              />
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                opacity: 0.15,
                mixBlendMode: "overlay",
                pointerEvents: "none",
              }}/>
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)`,
                pointerEvents: "none",
              }}/>
            </div>
          ) : (
            <div 
              onClick={() => setSelectedTape(null)}
              style={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.9)", color: "#555", fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {selectedTape.content.title}
            </div>
          )}
        </div>
      )}

      {/* Info bar when tape selected - left vertical panel on mobile, bottom center on desktop */}
      {selectedTape && (!isPhoneTape(selectedTape.id) || phonePhase === 'showing') && (
        <>
          {/* Desktop: bottom center */}
          <div className="info-panel-desktop" style={{
            position: "absolute",
            bottom: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.88)",
            padding: "10px 20px",
            borderRadius: "8px",
            textAlign: "center",
            zIndex: 100,
            maxWidth: "600px",
          }}>
            <div style={{ color: selectedTape.color, fontSize: "26px", fontWeight: "bold" }}>
              {selectedTape.content.title}
            </div>
            <div style={{ color: "#EEE", fontSize: "17px", marginTop: "6px", lineHeight: 1.5 }}>
              {selectedTape.content.description}
            </div>
          </div>
          {/* Mobile: left vertical panel */}
          <div className="info-panel-mobile" style={{
            position: "absolute",
            left: "4%",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.88)",
            padding: "10px 14px",
            borderRadius: "8px",
            textAlign: "left",
            zIndex: 100,
            maxWidth: "160px",
            maxHeight: "70vh",
            overflowY: "auto",
          }}>
            <div style={{ color: selectedTape.color, fontSize: "20px", fontWeight: "bold" }}>
              {selectedTape.content.title}
            </div>
            <div style={{ color: "#EEE", fontSize: "14px", marginTop: "6px", lineHeight: 1.5 }}>
              {selectedTape.content.description}
            </div>
          </div>
          <style>{`
            @media (min-width: 1280px) {
              .info-panel-mobile { display: none !important; }
            }
            @media (max-width: 1279px) {
              .info-panel-desktop { display: none !important; }
            }
          `}</style>
        </>
      )}

      {/* Tape hotspots - clickable above phone overlay */}
      {tapeData.map((tape, i) => (
        <div
          key={tape.id}
          onClick={() => {
            playTapeSound();
            console.log('Tape clicked:', tape.id, 'current phase:', phonePhase);
            if (selectedTape?.id === tape.id) {
              // Clicking same tape - deselect
              if (isPhoneTape(tape.id) && phonePhase === 'showing') {
                setPhonePhase('exiting');
              } else {
                setSelectedTape(null);
                setPhonePhase('none');
              }
            } else {
              // Clicking a different tape
              if (isPhoneTape(tape.id)) {
                // New tape uses phone animation
                setSelectedTape(tape);
                setPhonePhase('entering');
              } else {
                // New tape is regular (not phone)
                // If phone was showing, just clear it immediately
                setPhonePhase('none');
                setSelectedTape(tape);
              }
            }
          }}
          style={{
            position: "absolute",
            right: "0.5%",
            top: `${tapePositions[i]}%`,
            width: "12.5%",
            height: "5%",
            cursor: "pointer",
            zIndex: 250, // Above phone overlay (200)
            background: isDebug ? "rgba(255,0,0,0.3)" : "transparent",
            border: isDebug ? "2px solid red" : "none",
            color: isDebug ? "white" : "transparent",
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={tape.label}
        >
          {isDebug && tape.label}
        </div>
      ))}

      {/* Debug crop controls */}
      {isDebug && selectedTape && (selectedTape.content as any).videoSrc && (
        <div style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "rgba(0,0,0,0.9)",
          padding: "16px",
          borderRadius: "8px",
          zIndex: 500,
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "13px",
          minWidth: "250px",
        }}>
          <div style={{ marginBottom: "12px", fontWeight: "bold", fontSize: "14px" }}>
            🎬 {selectedTape.id}
          </div>
          
          <div style={{ marginBottom: "4px" }}>X: {debugCropX}%</div>
          <input
            type="range"
            min="0"
            max="100"
            value={debugCropX}
            onChange={(e) => setDebugCropX(Number(e.target.value))}
            style={{ width: "100%", marginBottom: "8px" }}
          />
          
          <div style={{ marginBottom: "4px" }}>Y: {debugCropY}%</div>
          <input
            type="range"
            min="0"
            max="100"
            value={debugCropY}
            onChange={(e) => setDebugCropY(Number(e.target.value))}
            style={{ width: "100%", marginBottom: "8px" }}
          />
          
          <div style={{ marginBottom: "4px" }}>Scale: {debugScale}%</div>
          <input
            type="range"
            min="50"
            max="200"
            value={debugScale}
            onChange={(e) => setDebugScale(Number(e.target.value))}
            style={{ width: "100%", marginBottom: "8px" }}
          />
          
          <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={debugContain}
              onChange={(e) => setDebugContain(e.target.checked)}
            />
            Letterbox (black bars)
          </label>
          
          <div style={{ fontSize: "11px", color: "#888", borderTop: "1px solid #444", paddingTop: "8px" }}>
            {debugContain 
              ? `videoFit: "contain"` 
              : `videoCrop: "${debugCropX}% ${debugCropY}%"`}
            {debugScale !== 100 && `, scale: ${debugScale}%`}
          </div>
        </div>
      )}

      {/* Social links - bottom center */}
      <div style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "28px",
        zIndex: 100,
        alignItems: "center",
      }}>
        <a href="https://twitter.com/slimjimm318" target="_blank" rel="noopener noreferrer" 
           style={{ color: "rgba(220,220,220,0.85)", textDecoration: "none", fontSize: "24px", fontWeight: "500" }}>𝕏</a>
        <a href="https://instagram.com/jamesrindos" target="_blank" rel="noopener noreferrer"
           style={{ color: "rgba(220,220,220,0.85)", textDecoration: "none", fontSize: "18px", fontWeight: "500" }}>Instagram</a>
        <a href="https://linkedin.com/in/james-rindos-489a29245" target="_blank" rel="noopener noreferrer"
           style={{ color: "rgba(220,220,220,0.85)", textDecoration: "none", fontSize: "18px", fontWeight: "500" }}>LinkedIn</a>
        <a href="https://youtube.com/@jackacetalks" target="_blank" rel="noopener noreferrer"
           style={{ color: "rgba(220,220,220,0.85)", textDecoration: "none", fontSize: "18px", fontWeight: "500" }}>YouTube</a>
        <a href="mailto:jamesrindos1@gmail.com" 
           style={{ color: "rgba(220,220,220,0.85)", textDecoration: "none", fontSize: "18px", fontWeight: "500" }}>Email</a>
      </div>
    </div>
  );
};

export default FlatLayout;
