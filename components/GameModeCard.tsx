
import React from 'react';

interface GameModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onSelect: () => void;
  disabled?: boolean;
}

const GameModeCard: React.FC<GameModeCardProps> = ({ title, description, icon, onSelect, disabled = false }) => {
  const cardClasses = `
    bg-navy-800/50 backdrop-blur-md border border-navy-700 rounded-xl p-8 text-center
    flex flex-col items-center
    transition-all duration-300
    ${disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : 'hover:border-cyan-glow hover:bg-navy-700/70 transform hover:-translate-y-2'
    }
  `;

  return (
    <div className={cardClasses}>
      <div className="text-cyan-glow mb-4">
        {icon}
      </div>
      <h3 className="text-2xl font-orbitron font-bold text-white mb-2 uppercase">{title}</h3>
      <p className="text-neutral-400 mb-6 flex-grow">{description}</p>
      <button
        onClick={onSelect}
        disabled={disabled}
        className={`
          w-full py-3 px-6 rounded-lg font-bold font-orbitron uppercase tracking-wider
          transition-all duration-300
          ${disabled
            ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
            : 'bg-cyan-glow text-navy-900 hover:bg-white hover:shadow-cyan'
          }
        `}
      >
        {disabled ? 'Coming Soon' : 'Select'}
      </button>
    </div>
  );
};

export default GameModeCard;
