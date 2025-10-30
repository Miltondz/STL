import React, { useState, useEffect } from 'react';
import { EventCardData, EventOption, PlayerState, EventConsequenceResult } from '../types';
import { ALL_CARDS } from '../data/cards';

interface EventCardProps {
  card: EventCardData;
  playerState: PlayerState;
  onOptionSelect: (option: EventOption) => void;
  onComplete: () => void;
  eventResult: EventConsequenceResult | null;
}

const DEFAULT_EVENT_IMAGE = 'https://i.ibb.co/8gy7gQn4/evento-00-placeholder.jpg';

export const EventCard: React.FC<EventCardProps> = ({ card, playerState, onOptionSelect, onComplete, eventResult }) => {
  const [textStep, setTextStep] = useState(0);
  const [imgSrc, setImgSrc] = useState(card.image || DEFAULT_EVENT_IMAGE);

  // Resetea el paso del texto y la imagen si la carta cambia
  useEffect(() => {
    setTextStep(0);
    setImgSrc(card.image || DEFAULT_EVENT_IMAGE);
  }, [card.id, card.image]);

  const handleImageError = () => {
    setImgSrc(DEFAULT_EVENT_IMAGE);
  };

  const handleNextText = () => {
    if (textStep < card.introText.length - 1) {
      setTextStep(prev => prev + 1);
    }
  };

  const showOptions = textStep >= card.introText.length - 1;

  // Comprueba si el jugador cumple los requisitos para una opción.
  const checkRequirements = (option: EventOption): { met: boolean; reason?: string } => {
    if (option.requirements) {
      if (option.requirements.credits && playerState.credits < option.requirements.credits) {
        return { met: false, reason: `Créditos Insuficientes (${playerState.credits}/${option.requirements.credits})`};
      }
      if (option.requirements.crew && playerState.crew < option.requirements.crew) {
        return { met: false, reason: `Tripulación Insuficiente (${playerState.crew}/${option.requirements.crew})`};
      }
    }
    if (option.crewRequirement) {
        if (!playerState.deck.some(cardInstance => cardInstance.cardId === option.crewRequirement)) {
            const requiredCrewCard = ALL_CARDS[option.crewRequirement];
            return { met: false, reason: `Requiere: ${requiredCrewCard?.name || 'Tripulante Desconocido'}` };
        }
    }
    if (option.narrativeFlagRequirement) {
        if (!playerState.narrativeFlags[option.narrativeFlagRequirement]) {
            return { met: false, reason: 'Condición no cumplida' };
        }
    }
    return { met: true };
  };

  const renderDecisionView = () => (
    <>
      <div>
        <p className="text-gray-300 text-lg leading-relaxed mb-6 font-mono h-36 overflow-y-auto">
          {card.introText.slice(0, textStep + 1).map((text, i) => <span key={i} className="block animate-fade-in-up">{text}</span>)}
        </p>

        {showOptions ? (
          <p className="text-cyan-200 text-xl font-bold text-center mb-6 animate-fade-in-up border-y-2 border-cyan-500/20 py-3">
            {card.promptText}
          </p>
        ) : (
          <div className="h-16" /> // Placeholder to prevent layout shift
        )}
      </div>

      <div className="space-y-3">
        {showOptions ? (
          card.options.map((option, index) => {
            const { met, reason } = checkRequirements(option);
            return (
              <button
                key={index}
                onClick={() => met && onOptionSelect(option)}
                disabled={!met}
                className={`w-full text-left p-4 rounded-md border-2 transition-all duration-200 animate-fade-in-up
                    ${met 
                    ? 'bg-gray-700/50 border-cyan-600/50 hover:bg-cyan-500/20 hover:border-cyan-400' 
                    : 'bg-gray-800/50 border-gray-600/50 text-gray-500 cursor-not-allowed opacity-70'}`}
                style={{ animationDelay: `${index * 100}ms`}}
              >
                <p className="font-semibold text-lg">{option.text}</p>
                {reason && (
                  <p className="text-xs text-red-400 font-semibold mt-1">
                    BLOQUEADO: {reason}
                  </p>
                )}
              </button>
            );
          })
        ) : (
          <button
            onClick={handleNextText}
            className="w-full font-orbitron text-lg p-3 rounded-md border bg-cyan-700/80 border-cyan-500/70 hover:bg-cyan-600/80"
          >
            Siguiente &gt;
          </button>
        )}
      </div>
    </>
  );

  const renderResultView = () => (
    <div className="flex flex-col justify-center items-center h-full text-center">
        <h3 className="font-orbitron text-2xl text-cyan-300 mb-4">Resultado del Evento</h3>
        <div className="bg-black/30 p-4 rounded-lg w-full max-w-lg mb-6 text-left">
            {eventResult?.reactionText && (
                <p className="text-yellow-300 italic mb-2 animate-fade-in-up">💬 {eventResult.reactionText}</p>
            )}
            <p className="text-gray-200 animate-fade-in-up" style={{ animationDelay: '100ms'}}>&gt; {eventResult?.log}</p>
        </div>
        <button
            onClick={onComplete}
            className="w-48 font-orbitron text-lg p-3 rounded-md border bg-cyan-700/80 border-cyan-500/70 hover:bg-cyan-600/80 animate-fade-in-up"
            style={{ animationDelay: '200ms'}}
        >
            Continuar
        </button>
    </div>
  );
  
  return (
    <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 max-w-4xl w-full h-[90vh] max-h-[700px] flex flex-col animate-zoom-in-fade overflow-hidden">
        {/* Sección de Imagen y Título */}
        <div className="relative h-2/5 flex-shrink-0">
            <img 
              src={imgSrc} 
              alt={card.title} 
              onError={handleImageError}
              className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
                <h2 className="text-4xl font-orbitron text-cyan-300 drop-shadow-lg">{card.title}</h2>
            </div>
        </div>

        {/* Sección de Contenido Narrativo */}
        <div className="flex-grow p-6 flex flex-col justify-between overflow-y-auto">
            {eventResult ? renderResultView() : renderDecisionView()}
        </div>
    </div>
  );
};