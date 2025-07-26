import React, { useEffect, useState } from 'react';
import { ShotResult } from '../types';

interface ShotResultModalProps {
  isVisible: boolean;
  result: ShotResult | null;
  shipName?: string;
  isPlayerShot: boolean;
  onClose: () => void;
  hitDefenseBuoy?: boolean;
  turnLost?: boolean;
}

const ShotResultModal: React.FC<ShotResultModalProps> = ({ 
  isVisible, 
  result, 
  shipName, 
  isPlayerShot, 
  onClose,
  hitDefenseBuoy = false,
  turnLost = false
}) => {
  const [animationStage, setAnimationStage] = useState<'enter' | 'display' | 'exit'>('enter');

  useEffect(() => {
    if (isVisible) {
      setAnimationStage('enter');
      const enterTimer = setTimeout(() => setAnimationStage('display'), 200);
      const displayTimer = setTimeout(() => setAnimationStage('exit'), 2000);
      const exitTimer = setTimeout(() => {
        onClose();
        setAnimationStage('enter');
      }, 2500);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(displayTimer);
        clearTimeout(exitTimer);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible || !result) return null;

  const getResultMessages = (result: ShotResult, isPlayerShot: boolean) => {
    // Special case for defense buoy hits
    if (hitDefenseBuoy) {
      const buoyMessages = {
        player: ['DECOY BUOY HIT!', 'DEFENSE TRAP!', 'BUOY TRIGGERED!', 'DECOY ACTIVATED!'],
        opponent: ['ENEMY HIT DECOY!', 'DEFENSE SUCCESS!', 'BUOY TRIGGERED!', 'DECOY WORKED!']
      };
      const messageArray = buoyMessages[isPlayerShot ? 'player' : 'opponent'];
      return messageArray[Math.floor(Math.random() * messageArray.length)];
    }

    const messages = {
      hit: {
        player: ['CONTACT!', 'AFFIRMATIVE!', 'ON TARGET!', 'DIRECT HIT!'],
        opponent: ['ENEMY HIT!', 'HULL BREACH!', 'DAMAGE SUSTAINED!', 'TAKING FIRE!']
      },
      miss: {
        player: ['NEGATIVE CONTACT', 'SPLASH DOWN', 'MISSED TARGET', 'NO HIT'],
        opponent: ['ENEMY MISSED', 'EVASIVE SUCCESS', 'CLEAN MISS', 'AVOIDED']
      },
      sunk: {
        player: [`${shipName} DESTROYED!`, `${shipName} ELIMINATED!`, `${shipName} DOWN!`, 'VESSEL SUNK!'],
        opponent: [`YOUR ${shipName} LOST!`, `${shipName} DESTROYED!`, 'SHIP DOWN!', 'VESSEL LOST!']
      }
    };

    const messageArray = messages[result][isPlayerShot ? 'player' : 'opponent'];
    return messageArray[Math.floor(Math.random() * messageArray.length)];
  };

  const getAnimationClasses = () => {
    const baseClasses = "fixed inset-0 z-50 flex items-center justify-center";
    
    switch (animationStage) {
      case 'enter':
        return `${baseClasses} animate-fadeIn`;
      case 'display':
        return `${baseClasses}`;
      case 'exit':
        return `${baseClasses} animate-fadeOut`;
      default:
        return baseClasses;
    }
  };

  const getResultColor = () => {
    switch (result) {
      case 'hit':
        return isPlayerShot ? 'text-green-400' : 'text-red-400';
      case 'miss':
        return 'text-blue-400';
      case 'sunk':
        return isPlayerShot ? 'text-yellow-400' : 'text-orange-400';
      default:
        return 'text-white';
    }
  };

  const getBackgroundEffect = () => {
    switch (result) {
      case 'hit':
        return 'bg-red-900/70 animate-pulse';
      case 'miss':
        return 'bg-blue-900/50';
      case 'sunk':
        return 'bg-orange-900/70 animate-pulse';
      default:
        return 'bg-black/50';
    }
  };

  const getExplosionEffect = () => {
    if (result === 'hit' || result === 'sunk') {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-radial from-yellow-400 via-orange-500 to-red-600 animate-ping opacity-75"></div>
          <div className="absolute w-24 h-24 rounded-full bg-gradient-radial from-white via-yellow-300 to-orange-400 animate-pulse"></div>
        </div>
      );
    }
    
    if (result === 'miss') {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-radial from-blue-300 via-cyan-400 to-blue-600 animate-bounce opacity-60"></div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={getAnimationClasses()}>
      {/* Background overlay */}
      <div className={`absolute inset-0 ${getBackgroundEffect()}`} />
      
      {/* Explosion/Water splash effect */}
      {getExplosionEffect()}
      
      {/* Main content */}
      <div className="relative z-10 text-center">
        <div className={`text-6xl font-orbitron font-bold ${getResultColor()} mb-4 animate-bounce`}>
          {getResultMessages(result, isPlayerShot)}
        </div>
        
        {result === 'sunk' && shipName && (
          <div className="text-2xl font-bold text-red-300 animate-pulse">
            {shipName} ELIMINATED
          </div>
        )}

        {hitDefenseBuoy && turnLost && (
          <div className="text-3xl font-bold text-orange-400 animate-pulse mt-2">
            {isPlayerShot ? 'YOU LOSE NEXT TURN!' : 'ENEMY LOSES NEXT TURN!'}
          </div>
        )}
        
        {/* Sound effect indicator */}
        <div className="mt-4 text-sm text-gray-400 opacity-60">
          {hitDefenseBuoy && '🚩 DECOY!'}
          {!hitDefenseBuoy && result === 'hit' && '💥 BOOM!'}
          {!hitDefenseBuoy && result === 'miss' && '💧 SPLASH!'}
          {!hitDefenseBuoy && result === 'sunk' && '🔥 EXPLOSION!'}
        </div>
      </div>
    </div>
  );
};

export default ShotResultModal;