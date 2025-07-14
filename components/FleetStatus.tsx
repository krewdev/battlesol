import React from 'react';
import type { Ship } from '../types';
import { SHIP_CONFIG } from '../types';
import { ShipStatusIcon } from './Icons';

interface FleetStatusProps {
    title: string;
    ships: Ship[];
    isOpponent: boolean;
}

const HealthBar: React.FC<{ ship: Ship }> = ({ ship }) => {
    const healthPercentage = (ship.length - ship.hits.length) / ship.length * 100;
    
    let barColor = 'bg-cyan-glow';
    if (healthPercentage < 60) barColor = 'bg-yellow-glow';
    if (healthPercentage < 30) barColor = 'bg-magenta-glow';

    return (
        <div className="w-full bg-navy-700 rounded-full h-2.5">
            <div 
                className={`${barColor} h-2.5 rounded-full transition-all duration-500`} 
                style={{width: `${healthPercentage}%`}}
            ></div>
        </div>
    );
};


const FleetStatus: React.FC<FleetStatusProps> = ({ title, ships, isOpponent }) => {

    const renderOpponentStatus = () => {
        return SHIP_CONFIG.map(shipConfig => {
            const sunkShip = ships.find(s => s.id === shipConfig.id);
            const status = sunkShip ? 'DESTROYED' : 'UNKNOWN';
            const textColor = sunkShip ? 'text-red-500' : 'text-neutral-500';

            return (
                 <div key={shipConfig.id} className="flex items-center justify-between text-sm py-1">
                    <span className="font-semibold">{shipConfig.name}</span>
                    <span className={`font-bold ${textColor}`}>{status}</span>
                </div>
            );
        })
    };

    const renderPlayerStatus = () => {
        if (ships.length === 0) {
            return <p className="text-neutral-400 text-sm">Awaiting deployment...</p>;
        }

        return ships.map(ship => (
            <div key={ship.id} className="py-1">
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold">{ship.name}</span>
                     <span className={`${ship.sunk ? 'text-red-500 font-bold' : 'text-neutral-300'}`}>
                        {ship.sunk ? 'DESTROYED' : `${ship.length - ship.hits.length}/${ship.length} HP`}
                    </span>
                </div>
                {!ship.sunk && <HealthBar ship={ship} />}
            </div>
        ));
    };


    return (
        <div className="bg-navy-800/60 border border-navy-700 rounded-lg p-3 mt-4 w-full max-w-sm">
            <h4 className="text-md font-orbitron font-bold text-neutral-200 uppercase flex items-center gap-2 border-b border-navy-700 pb-2 mb-2">
                <ShipStatusIcon className="w-5 h-5" />
                {title}
            </h4>
            <div className="space-y-2">
                {isOpponent ? renderOpponentStatus() : renderPlayerStatus()}
            </div>
        </div>
    );
};

export default FleetStatus;