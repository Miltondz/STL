// components/GenericModal.tsx
import React from 'react';

interface GenericModalProps {
  title: string;
  image?: string;
  video?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export const GenericModal: React.FC<GenericModalProps> = ({ title, image, video, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-zoom-in-fade">
      <div className="bg-gray-800/90 border border-cyan-500/30 rounded-lg p-6 shadow-lg max-w-2xl w-full text-center">
        <h2 className="text-2xl font-orbitron text-cyan-300 mb-4">{title}</h2>
        
        {image && <img src={image} alt={title} className="max-w-full max-h-[60vh] mx-auto rounded-md mb-6" />}
        {video && (
          <video controls autoPlay muted loop className="max-w-full max-h-[60vh] mx-auto rounded-md mb-6">
            <source src={video} type="video/mp4" />
            Tu navegador no soporta el tag de video.
          </video>
        )}
        
        {children && <div className="mb-6">{children}</div>}

        <button 
          onClick={onClose}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold text-white transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};