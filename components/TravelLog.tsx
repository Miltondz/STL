import React, { useRef, useEffect } from 'react';

interface TravelLogProps {
  logs: string[];
}

// Componente para mostrar el registro de eventos del viaje.
// Ayuda al jugador a seguir el hilo de la narrativa y los resultados de sus acciones.
export const TravelLog: React.FC<TravelLogProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Hace scroll automático al final del log cuando se añade un nuevo mensaje.
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-gray-900/70 backdrop-blur-sm p-4 rounded-lg border border-cyan-500/20 h-48 md:h-full">
      <h3 className="font-orbitron text-lg text-cyan-400 mb-2 border-b border-cyan-500/20 pb-2">Bitácora de Viaje</h3>
      <div ref={logContainerRef} className="h-[calc(100%-2.5rem)] overflow-y-auto pr-2 text-sm space-y-2">
        {logs.map((log, index) => {
          let logClass = "text-gray-300";
          let logContent = log;
          let icon = '>';

          if (log.startsWith('💬')) {
            logClass = "text-yellow-300 italic";
            logContent = log.substring(1).trim();
          } else if (log.startsWith('🏆')) {
            logClass = "text-yellow-400 font-bold";
            logContent = log; // Mantener el ícono
            icon = '';
          } else if (
              log.toLowerCase().includes('ganas') || 
              log.toLowerCase().includes('añadido') || 
              log.toLowerCase().includes('victoria') ||
              log.toLowerCase().includes('éxito')) {
            logClass = "text-green-400";
          } else if (
              log.toLowerCase().includes('daño') || 
              log.toLowerCase().includes('pierdes') || 
              log.toLowerCase().includes('destruida') ||
              log.toLowerCase().includes('fracaso')) {
            logClass = "text-red-400 font-semibold";
          }

          return (
            <p key={index} className={`${logClass} leading-snug animate-fade-in-up`}>
              {icon && <span className="text-cyan-400/70 mr-2">{icon}</span>} {logContent}
            </p>
          );
        })}
      </div>
    </div>
  );
};