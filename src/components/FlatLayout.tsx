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
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentVideoRef = useRef<HTMLVideoElement>(null);
  
  // Debug mode - add ?debug=1 to URL to see hotspot positions
  const isDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';
  
  // Debug crop control (only active in debug mode)
  const [debugCropX, setDebugCropX] = useState(50); // 0-100 horizontal position
  const [debugCropY, setDebugCropY] = useState(50); // 0-100 vertical position
  const [debugScale, setDebugScale] = useState(100); // 100 = normal, 150 = 1.5x zoom out
  const [debugContain, setDebugContain] = useState(false); // true = letterbox mode
  
  // Debug hotspot dragging
  const [debugTapePositions, setDebugTapePositions] = useState<number[]>([
    8.2, 14.2, 19.9, 25.5, 31.7, 37.5, 43.4, 49.3, 55.6, 61.9, 68.1, 74.3, 80.4, 87.1
  ]);
  const [debugTapeRight, setDebugTapeRight] = useState<number[]>(
    Array(14).fill(0.5) // all start at right: 0.5%
  );
  const [debugTapeWidth, setDebugTapeWidth] = useState<number[]>(
    Array(14).fill(12.5) // all start at width: 12.5%
  );
  const [debugTapeHeight, setDebugTapeHeight] = useState<number[]>(
    Array(14).fill(5) // all start at height: 5%
  );
  const [draggingTape, setDraggingTape] = useState<{ index: number; mode: 'move' | 'resize' } | null>(null);
  const [tapeDragStart, setTapeDragStart] = useState({ x: 0, y: 0, top: 0, right: 0, width: 0, height: 0 });
  
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
    video.setAttribute('autoplay', '');
    video.muted = true;
    video.defaultMuted = true;
    
    const tryPlay = () => {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise) {
          playPromise.catch(() => {});
        }
      }
    };
    
    // Try immediately
    tryPlay();
    
    // Keep trying every 500ms until it plays
    const interval = setInterval(() => {
      if (!video.paused) {
        clearInterval(interval);
      } else {
        tryPlay();
      }
    }, 500);
    
    // Also clear interval after 10 seconds regardless
    setTimeout(() => clearInterval(interval), 10000);
    
    // Retry when video is ready
    video.addEventListener('canplay', tryPlay);
    video.addEventListener('loadeddata', tryPlay);
    video.addEventListener('loadedmetadata', tryPlay);
    
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
      clearInterval(interval);
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('loadedmetadata', tryPlay);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('touchstart', interactionHandler);
      document.removeEventListener('click', interactionHandler);
    };
  }, []);
  
  const [tvPos, setTvPos] = useState({ top: 20.5, left: 27.0, width: 38.9, height: 55.5 }); // Scaled up ~3% to cover static
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

  // Handle tape hotspot dragging in debug mode
  useEffect(() => {
    if (!isDebug || !draggingTape) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const dx = ((e.clientX - tapeDragStart.x) / window.innerWidth) * 100;
      const dy = ((e.clientY - tapeDragStart.y) / window.innerHeight) * 100;
      const i = draggingTape.index;
      
      if (draggingTape.mode === 'move') {
        setDebugTapePositions(prev => {
          const newPositions = [...prev];
          newPositions[i] = Math.round((tapeDragStart.top + dy) * 10) / 10;
          return newPositions;
        });
        setDebugTapeRight(prev => {
          const newRight = [...prev];
          // Moving right means subtracting dx (right is measured from right edge)
          newRight[i] = Math.round((tapeDragStart.right - dx) * 10) / 10;
          return newRight;
        });
      } else if (draggingTape.mode === 'resize') {
        setDebugTapeWidth(prev => {
          const newWidths = [...prev];
          newWidths[i] = Math.max(2, Math.round((tapeDragStart.width + dx) * 10) / 10);
          return newWidths;
        });
        setDebugTapeHeight(prev => {
          const newHeights = [...prev];
          newHeights[i] = Math.max(1, Math.round((tapeDragStart.height + dy) * 10) / 10);
          return newHeights;
        });
      }
    };
    const handleMouseUp = () => setDraggingTape(null);
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDebug, draggingTape, tapeDragStart]);

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
      {/* Mobile portrait overlay - fully opaque to hide everything */}
      {isMobilePortrait && (
        <div style={{
          position: "fixed",
          top: "-50px", // Extend beyond viewport to cover any browser chrome
          left: 0,
          width: "100vw",
          height: "calc(100vh + 100px)", // Extra height to fully cover
          background: "#000",
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

      {/* Header overlay - hidden when rotation screen shows */}
      {!isMobilePortrait && <div style={{ 
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
      </div>}

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
                onCanPlay={() => {
                  if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
                  setIsVideoLoading(false);
                  setShowLoadingIndicator(false);
                }}
                onWaiting={() => {
                  setIsVideoLoading(true);
                  // Start delayed indicator for buffering too
                  if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
                  loadingTimeoutRef.current = setTimeout(() => setShowLoadingIndicator(true), 2000);
                }}
                onPlaying={() => {
                  if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
                  setIsVideoLoading(false);
                  setShowLoadingIndicator(false);
                }}
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
              {/* Loading indicator - animated dots (only after 1s delay) */}
              {showLoadingIndicator && (
                <div style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  fontFamily: "'VT323', monospace",
                  fontSize: "24px",
                  color: "#fff",
                  textShadow: "0 0 10px rgba(255,255,255,0.5)",
                }}>
                  <span>Loading</span>
                  <span className="loading-dots" style={{ display: "inline-block", width: "24px", textAlign: "left" }} />
                </div>
              )}
              <style>{`
                @keyframes dots {
                  0% { content: '.'; }
                  33% { content: '..'; }
                  66% { content: '...'; }
                  100% { content: '.'; }
                }
                .loading-dots::after {
                  content: '.';
                  animation: dots 1.5s steps(1) infinite;
                }
              `}</style>
              {!isPlaying && !isVideoLoading && (
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
                onLoad={() => {
                  if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
                  setIsVideoLoading(false);
                  setShowLoadingIndicator(false);
                }}
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  filter: "contrast(1.1) saturate(0.9)",
                }}
              />
              {/* Loading indicator for images - animated dots (only after 1s delay) */}
              {showLoadingIndicator && (
                <div style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  fontFamily: "'VT323', monospace",
                  fontSize: "24px",
                  color: "#fff",
                  textShadow: "0 0 10px rgba(255,255,255,0.5)",
                }}>
                  <span>Loading</span>
                  <span className="loading-dots" style={{ display: "inline-block", width: "24px", textAlign: "left" }} />
                </div>
              )}
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

      {/* Info bar when tape selected - left vertical panel on both mobile and desktop */}
      {selectedTape && (!isPhoneTape(selectedTape.id) || phonePhase === 'showing') && (
        <>
          {/* Desktop: left side panel */}
          <div className="info-panel-desktop" style={{
            position: "absolute",
            left: "32px",
            top: "100px", // Below header
            background: "rgba(0,0,0,0.88)",
            padding: "14px 18px",
            borderRadius: "8px",
            textAlign: "left",
            zIndex: 100,
            maxWidth: "280px",
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
          }}>
            <div style={{ color: selectedTape.color, fontSize: "24px", fontWeight: "bold" }}>
              {selectedTape.content.title}
            </div>
            <div style={{ color: "#EEE", fontSize: "15px", marginTop: "8px", lineHeight: 1.5 }}>
              {selectedTape.content.description}
            </div>
          </div>
          {/* Mobile: left vertical panel - positioned well below header */}
          <div className="info-panel-mobile" style={{
            position: "absolute",
            left: "4%",
            top: "120px", // Well below the header
            background: "rgba(0,0,0,0.88)",
            padding: "10px 14px",
            borderRadius: "8px",
            textAlign: "left",
            zIndex: 100,
            maxWidth: "160px",
            maxHeight: "calc(100vh - 200px)", // Account for header and footer
            overflowY: "auto",
          }}>
            <div style={{ color: selectedTape.color, fontSize: "18px", fontWeight: "bold" }}>
              {selectedTape.content.title}
            </div>
            <div style={{ color: "#EEE", fontSize: "13px", marginTop: "6px", lineHeight: 1.4 }}>
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
          onClick={(e) => {
            // In debug mode, don't trigger tape selection when dragging
            if (isDebug && draggingTape) return;
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
              setIsVideoLoading(true);
              setShowLoadingIndicator(false); // Don't show immediately
              // Only show loading indicator after 1 second delay
              if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = setTimeout(() => {
                setShowLoadingIndicator(true);
              }, 2000);
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
          onMouseDown={(e) => {
            if (!isDebug) return;
            e.preventDefault();
            e.stopPropagation();
            setDraggingTape({ index: i, mode: 'move' });
            setTapeDragStart({
              x: e.clientX,
              y: e.clientY,
              top: debugTapePositions[i],
              right: debugTapeRight[i],
              width: debugTapeWidth[i],
              height: debugTapeHeight[i],
            });
          }}
          style={{
            position: "absolute",
            right: isDebug ? `${debugTapeRight[i]}%` : "0.5%",
            top: isDebug ? `${debugTapePositions[i]}%` : `${tapePositions[i]}%`,
            width: isDebug ? `${debugTapeWidth[i]}%` : "12.5%",
            height: isDebug ? `${debugTapeHeight[i]}%` : "5%",
            cursor: isDebug ? "move" : "pointer",
            zIndex: 250, // Above phone overlay (200)
            background: isDebug ? "rgba(255,0,0,0.3)" : "transparent",
            border: isDebug ? "2px solid red" : "none",
            color: isDebug ? "white" : "transparent",
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: isDebug ? "none" : undefined,
          }}
          title={tape.label}
        >
          {isDebug && (
            <>
              <span style={{ pointerEvents: "none" }}>{tape.label}</span>
              {/* Resize handle in bottom-right corner */}
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDraggingTape({ index: i, mode: 'resize' });
                  setTapeDragStart({
                    x: e.clientX,
                    y: e.clientY,
                    top: debugTapePositions[i],
                    right: debugTapeRight[i],
                    width: debugTapeWidth[i],
                    height: debugTapeHeight[i],
                  });
                }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "12px",
                  height: "12px",
                  background: "lime",
                  cursor: "nwse-resize",
                }}
              />
            </>
          )}
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

      {/* Debug hotspot positions panel */}
      {isDebug && (
        <div style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          background: "rgba(0,0,0,0.95)",
          padding: "16px",
          borderRadius: "8px",
          zIndex: 500,
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "11px",
          maxWidth: "320px",
          maxHeight: "50vh",
          overflowY: "auto",
        }}>
          <div style={{ marginBottom: "12px", fontWeight: "bold", fontSize: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>📍 Hotspot Positions</span>
            <button
              onClick={() => {
                const code = `const tapePositions = [\n${debugTapePositions.map((pos, i) => `  ${pos},   // ${tapeData[i].label}`).join('\n')}\n];`;
                navigator.clipboard.writeText(code);
                alert('Copied to clipboard!');
              }}
              style={{
                background: "#4CAF50",
                border: "none",
                borderRadius: "4px",
                padding: "4px 8px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              Copy Code
            </button>
          </div>
          <div style={{ fontSize: "10px", color: "#888", marginBottom: "8px" }}>
            Drag hotspots to move • Green corner to resize
          </div>
          {tapeData.map((tape, i) => (
            <div key={tape.id} style={{ 
              marginBottom: "4px", 
              padding: "4px",
              background: draggingTape?.index === i ? "rgba(255,255,0,0.2)" : "transparent",
              borderRadius: "4px",
            }}>
              <span style={{ color: tape.color, fontWeight: "bold" }}>{tape.label}:</span>
              <span style={{ color: "#aaa" }}> top:{debugTapePositions[i]}% right:{debugTapeRight[i]}%</span>
              <span style={{ color: "#666" }}> ({debugTapeWidth[i]}×{debugTapeHeight[i]})</span>
            </div>
          ))}
        </div>
      )}

      {/* Social links - bottom center - hidden when rotation screen shows */}
      {!isMobilePortrait && <div style={{
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
      </div>}
    </div>
  );
};

export default FlatLayout;
