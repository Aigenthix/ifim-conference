"use client";

import { useState, useCallback, useEffect } from "react";

interface Coin {
  id: string;
  left: number;       // Initial X position (0-100%)
  animationDuration: number; // Random fall duration (in seconds)
  delay: number;      // Random start delay
  rotation: number;   // Random initial rotation
}

import { motion } from "framer-motion";

const CoinFace = ({ translateZ, rotateY = "0deg", isEdge = false, isBackFace = false }: { translateZ: string, rotateY?: string, isEdge?: boolean, isBackFace?: boolean }) => (
  <div style={{
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: '50%',
    // Edge is solid dark gold, face is a bright gradient matching the reference
    background: isEdge 
      ? '#D97706' 
      : 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 100%)',
    transform: `rotateY(${rotateY}) translateZ(${translateZ})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: isEdge ? 'visible' : 'hidden', // Edges need to be visible, faces shouldn't show backward
    overflow: 'hidden',
    boxShadow: isEdge ? 'none' : '0 0 2px rgba(0,0,0,0.3)', // subtle shadow on face rims
  }}>
    {!isEdge && (
      <>
        {/* Inner Ring & Dollar Sign */}
        <div style={{
          position: 'absolute',
          top: '10%', left: '10%', right: '10%', bottom: '10%',
          borderRadius: '50%',
          border: '2px solid rgba(253, 230, 138, 0.6)',
          background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 12px rgba(217, 119, 6, 0.4)'
        }}>
          <span style={{
            fontSize: '0.45em',
            fontWeight: '900',
            fontFamily: '"Arial Black", Arial, sans-serif',
            color: '#F59E0B',
            textShadow: '0.5px 0.5px 0px rgba(255,255,255,0.7), -0.5px -0.5px 0px rgba(0,0,0,0.15)',
            position: 'relative',
            top: '2%', // optical centering
            transform: isBackFace ? 'scaleX(-1)' : 'none',
            display: 'inline-block'
          }}>₹</span>
        </div>
        
        {/* Diagonal Lighting Shine Overlay (Matches reference curve) */}
        <div style={{
          position: 'absolute',
          top: '-20%', left: '-20%', right: '-20%', bottom: '-20%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 35%, rgba(255,255,255,0) 50%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          transform: isBackFace ? 'scaleX(-1)' : 'none',
        }} />
      </>
    )}
  </div>
);

const GoldDollarCoin3D = ({ size = "4rem", animationSpeed = "2s" }: { size?: string, animationSpeed?: string }) => {
  const edgeLayers = 8; // Number of center divs to create thickness
  // Assume size is in rem, we want total thickness to be about 0.3rem (approx 5px)
  const layerSpacing = 1; // 1px spacing per layer
  
  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      fontSize: size, // establishes em context for children
      transformStyle: 'preserve-3d',
      animation: `spinCoin3D ${animationSpeed} linear infinite`,
      transformOrigin: 'center center',
    }}>
      {/* Edge layers to create 3D cylinder thickness */}
      {Array.from({ length: edgeLayers }).map((_, i) => {
        const zOffset = (i - (edgeLayers - 1) / 2) * layerSpacing;
        return <CoinFace key={i} translateZ={`${zOffset}px`} isEdge={true} />;
      })}
      
      {/* Front Face */}
      <CoinFace translateZ={`${(edgeLayers / 2) * layerSpacing}px`} />
      
      {/* Back Face (rotated 180deg) */}
      <CoinFace translateZ={`${(edgeLayers / 2) * layerSpacing}px`} rotateY="180deg" isBackFace={true} />
    </div>
  );
};

export function GoldCoinRain() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Cleanup: remove coins after 4 seconds to prevent memory leaks
  useEffect(() => {
    if (coins.length === 0) return;

    const timeout = setTimeout(() => {
      setCoins([]);
    }, 4000); // 4 seconds allows all coins to finish falling

    return () => clearTimeout(timeout);
  }, [coins]);

  const triggerRain = useCallback((e?: React.MouseEvent | React.TouchEvent | PointerEvent) => {
    // Don't trigger if we were just dragging
    if (isDragging) return;
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Generate 50+ random coins
    const newCoins: Coin[] = Array.from({ length: 60 }).map(() => ({
      id: Math.random().toString(36).substring(2, 9),
      left: Math.random() * 100, // 0 to 100vw
      animationDuration: 1.5 + Math.random() * 2, // 1.5s to 3.5s fall time
      delay: Math.random() * 0.5, // 0s to 0.5s staggered start
      rotation: Math.random() * 360, // initial rotation
    }));

    setCoins(newCoins);

    // Provide haptic feedback if supported on mobile
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  }, [isDragging]);

  return (
    <>
      <div className="coin-container" style={{ position: "fixed", right: "20px", zIndex: 9998, pointerEvents: "none" }}>
        {/* Central Interactive Coin - Now Draggable */}
        <motion.button
          drag
          dragMomentum={false}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => {
            // Small delay to prevent click firing immediately after drag ends
            setTimeout(() => setIsDragging(false), 100);
          }}
          onClick={triggerRain}
          onTouchEnd={(e) => {
            if (!isDragging) triggerRain(e as any);
          }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: "transparent",
            border: "none",
            cursor: isDragging ? "grabbing" : "grab",
            padding: 0,
            outline: "none",
            WebkitTapHighlightColor: "transparent",
            pointerEvents: "auto", // Re-enable pointer events for the button itself
            filter: "drop-shadow(0 8px 16px rgba(184,134,11,0.4))",
            touchAction: "none" // Prevents scrolling while dragging on mobile
          }}
          aria-label="Trigger Gold Coin Rain"
        >
          <div style={{ animation: isDragging ? "none" : "gentleBounce 2s infinite ease-in-out" }}>
            <GoldDollarCoin3D size="4rem" animationSpeed="3s" />
          </div>
        </motion.button>
      </div>

      {/* Falling Coins Container (Fixed overlay to cover whole screen) */}
      {coins.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none", // Critical: prevents blocking clicks on page elements underneath
            zIndex: 9999, // Ensure it's on top of everything
            overflow: "hidden",
            perspective: "800px" // Adds 3D perspective to falling coins
          }}
        >
          {coins.map((coin) => (
            <div
              key={coin.id}
              style={{
                position: "absolute",
                top: "-60px", // Start just above the viewport
                left: `${coin.left}%`,
                willChange: "transform, opacity", // Optimizes performance
                animation: `coinFall ${coin.animationDuration}s ${coin.delay}s linear forwards`,
                transform: `rotate(${coin.rotation}deg)`,
              }}
            >
              {/* Rain coins spin much faster and randomly based on duration */}
              <GoldDollarCoin3D size="2.5rem" animationSpeed={`${coin.animationDuration / 2}s`} />
            </div>
          ))}
        </div>
      )}

      {/* Global CSS Animation for the coins */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes coinFall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg) scale(0.8);
            opacity: 0;
          }
        }
        @keyframes spinCoin3D {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-360deg); }
        }
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .coin-container {
          bottom: 100px; /* Default desktop positioning */
        }
        @media (max-width: 768px) {
          .coin-container {
            bottom: 160px !important; /* Move higher on mobile to avoid overlapping the chat FAB */
          }
        }
      `}} />
    </>
  );
}
