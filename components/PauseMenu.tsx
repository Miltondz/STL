import React, { useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { exportSave, importSave, deleteSave } from '../services/saveManager';

interface PauseMenuProps {
  onClose: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onClose }) => {
  const { saveCurrentGame, setGamePhase } = useGame();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = React.useState(false);
  const [musicVolume, setMusicVolume] = React.useState(50);
  const [soundVolume, setSoundVolume] = React.useState(50);
  const [confirmDialog, setConfirmDialog] = React.useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: '', message: '', onConfirm: () => {} });
  const [alertDialog, setAlertDialog] = React.useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: '', message: '' });

  const handleImport = async (file: File) => {
    const ok = await importSave(file);
    if (ok) {
      setAlertDialog({
        show: true,
        title: '✅ Importación Exitosa',
        message: 'Partida importada. Vuelve al inicio para continuar.',
      });
    } else {
      setAlertDialog({
        show: true,
        title: '❌ Error',
        message: 'No se pudo importar la partida.',
      });
    }
  };

  const handleSaveAndExit = () => {
    setConfirmDialog({
      show: true,
      title: '💾 Guardar y Salir',
      message: '¿Guardar y salir al menú principal?',
      onConfirm: () => {
        saveCurrentGame();
        setGamePhase('START_SCREEN');
        onClose();
      },
    });
  };

  const handleAbandonGame = () => {
    setConfirmDialog({
      show: true,
      title: '⚠️ Abandonar Juego',
      message: '¿Abandonar el juego sin guardar? Se perderá el progreso actual.',
      onConfirm: () => {
        setGamePhase('START_SCREEN');
        onClose();
      },
    });
  };

  // Modal de confirmación personalizado
  if (confirmDialog.show) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-gray-900/95 border-2 border-yellow-500/50 rounded-lg p-6 w-full max-w-md shadow-2xl">
          <h2 className="font-orbitron text-xl text-yellow-400 mb-4">⚠️ {confirmDialog.title}</h2>
          <p className="text-gray-300 mb-6">{confirmDialog.message}</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog({ show: false, title: '', message: '', onConfirm: () => {} });
              }}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white font-bold transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmDialog({ show: false, title: '', message: '', onConfirm: () => {} })}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal de alerta personalizado
  if (alertDialog.show) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-gray-900/95 border-2 border-cyan-500/50 rounded-lg p-6 w-full max-w-md shadow-2xl">
          <h2 className="font-orbitron text-xl text-cyan-400 mb-4">ℹ️ {alertDialog.title}</h2>
          <p className="text-gray-300 mb-6">{alertDialog.message}</p>
          <button
            onClick={() => setAlertDialog({ show: false, title: '', message: '' })}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-gray-900/90 border border-cyan-500/30 rounded-lg p-6 w-full max-w-md">
          <h2 className="font-orbitron text-2xl text-cyan-300 mb-4">⚙️ Configuración</h2>
          
          <div className="space-y-4">
            {/* Control de Música */}
            <div>
              <label className="block text-cyan-300 text-sm font-bold mb-2">
                🎵 Música: {musicVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Control de Sonido */}
            <div>
              <label className="block text-cyan-300 text-sm font-bold mb-2">
                🔊 Efectos de Sonido: {soundVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={soundVolume}
                onChange={(e) => setSoundVolume(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button 
              onClick={() => setShowSettings(false)} 
              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold"
            >
              Aplicar
            </button>
            <button 
              onClick={() => setShowSettings(false)} 
              className="px-4 py-2 border border-cyan-500/40 rounded text-cyan-300"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900/90 border border-cyan-500/30 rounded-lg p-6 w-full max-w-md">
        <h2 className="font-orbitron text-2xl text-cyan-300 mb-4">☰ MENÚ</h2>
        <div className="space-y-3">
          {/* Continuar */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-bold"
          >
            ▶️ Continuar
          </button>

          {/* Guardar y Salir */}
          <button
            onClick={handleSaveAndExit}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold"
          >
            💾 Guardar y Salir
          </button>

          {/* Configuración */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-white font-bold"
          >
            ⚙️ Configuración
          </button>

          {/* Separador */}
          <div className="border-t border-cyan-500/20 my-2"></div>

          {/* Opciones avanzadas */}
          <button
            onClick={() => exportSave()}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
          >
            📤 Exportar Partida
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
          >
            📥 Importar Partida
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

          {/* Separador */}
          <div className="border-t border-red-500/20 my-2"></div>

          {/* Abandonar */}
          <button
            onClick={handleAbandonGame}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white font-bold"
          >
            🚪 Abandonar Juego
          </button>
        </div>
      </div>
    </div>
  );
};
