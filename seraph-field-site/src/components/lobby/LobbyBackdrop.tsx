import React from 'react';
import { motion } from 'motion/react';
import type { LobbyUiSettings } from '../../lib/lobbySettings';

interface LobbyBackdropProps {
  backgroundImageSrc: string;
  uiSettings: LobbyUiSettings;
}

export const LobbyBackdrop: React.FC<LobbyBackdropProps> = ({
  backgroundImageSrc,
  uiSettings,
}) => (
  <motion.div
    initial={{ scale: 1.1, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 2 }}
    className="absolute inset-0 z-0"
  >
    <img
      src={backgroundImageSrc}
      alt="Lobby Background"
      className="h-full w-full object-cover opacity-56 grayscale contrast-125 brightness-118"
      referrerPolicy="no-referrer"
    />
    <div
      className="absolute inset-0"
      style={{ backgroundColor: `rgba(6, 14, 18, ${uiSettings.overlayDim})` }}
    />
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity: uiSettings.hudTint * 1.15 }}
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{
            opacity: [0, 0.5, 0],
            scaleY: [1, 1.2, 1],
            top: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
          }}
          transition={{
            duration: 0.2 + Math.random() * 0.3,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
          className="absolute left-0 right-0 h-px bg-neon-cyan shadow-[0_0_10px_var(--color-neon-cyan)]"
        />
      ))}

      {Array.from({ length: 12 }).map((_, index) => (
        <motion.div
          key={`noise-${index}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.3, 0],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 100 + 20}px`,
            height: `${Math.random() * 2 + 1}px`,
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
          }}
          className="absolute bg-neon-cyan/40"
        />
      ))}
    </div>
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(90deg, rgba(25,184,190,${uiSettings.hudTint}) 0%, rgba(25,184,190,${uiSettings.hudTint * 0.4}) 50%, rgba(25,184,190,${uiSettings.hudTint * 1.5}) 100%)`,
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(180deg, rgba(25,184,190,0) 0%, rgba(25,184,190,${uiSettings.hudTint * 0.33}) 68%, rgba(14,16,18,${uiSettings.overlayDim + 0.025}) 100%)`,
      }}
    />
    <div
      className="absolute inset-0"
      style={{ backgroundColor: `rgba(8, 24, 28, ${uiSettings.hudTint * 0.6})` }}
    />
    <div className="scanlines z-50" style={{ opacity: uiSettings.scanlines }} />
    <div className="vignette z-40" style={{ opacity: uiSettings.vignette }} />
  </motion.div>
);
