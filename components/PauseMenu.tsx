import React, { useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { exportSave, importSave, deleteSave } from '../services/saveManager';

interface PauseMenuProps {
  onClose: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onClose }) => {
  const { saveCurrentGame } = useGame();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    const ok = await importSave(file);
    if (ok) alert('Partida importada. Vuelve al inicio para continuar.');
    else alert('No se pudo importar la partida.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900/90 border border-cyan-500/30 rounded-lg p-6 w-full max-w-md">
        <h2 className="font-orbitron text-2xl text-cyan-300 mb-4">Pausa</h2>
        <div className="space-y-3">
          <button
            onClick={() => saveCurrentGame()}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold"
          >
            Guardar Ahora
          </button>
          <button
            onClick={() => exportSave()}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-white font-bold"
          >
            Exportar Partida
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded text-white font-bold"
          >
            Importar Partida
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              e.currentTarget.value = '';
            }}
          />
          <button
            onClick={() => { if (confirm('¿Eliminar partida guardada?')) deleteSave(); }}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white font-bold"
          >
            Eliminar Partida Guardada
          </button>
        </div>
        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 border border-cyan-500/40 rounded text-cyan-300">Cerrar</button>
        </div>
      </div>
    </div>
  );
};
