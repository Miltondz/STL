import React from 'react';

/**
 * Configuración para las columnas verticales de texto Matrix
 */
interface MatrixColumnsConfig {
  /** Número de columnas a mostrar */
  count: number;
  /** Posición: 'left' o 'right' */
  position: 'left' | 'right';
}

/**
 * Configuración para las líneas horizontales de texto con efecto de tecleado
 */
interface TypingLinesConfig {
  /** Número de líneas a mostrar */
  count: number;
  /** Posición desde la izquierda en píxeles */
  left: number;
  /** Posición desde arriba en píxeles */
  top: number;
  /** Ancho del área de texto en píxeles */
  width: number;
  /** Altura del área de texto en píxeles */
  height: number;
}

/**
 * Configuración de colores para el efecto retro
 */
interface RetroColorConfig {
  /** Color principal en formato RGB (ej: '34, 197, 94' para verde) */
  primary: string;
  /** Nombre de la clase de color de Tailwind para el texto (ej: 'text-green-400') */
  textClass: string;
  /** Nombre de la clase de color de Tailwind para el borde (ej: 'border-green-500') */
  borderClass: string;
}

/**
 * Props para el componente RetroMonitor
 */
interface RetroMonitorProps {
  /** Contenido a mostrar en el centro del monitor */
  children?: React.ReactNode;
  /** Altura del monitor en píxeles */
  height?: number;
  /** Configuración de columnas Matrix izquierdas (opcional) */
  leftColumns?: MatrixColumnsConfig;
  /** Configuración de columnas Matrix derechas (opcional) */
  rightColumns?: MatrixColumnsConfig;
  /** Configuración de líneas de texto horizontal (opcional) */
  typingLines?: TypingLinesConfig;
  /** Configuración de colores del efecto retro */
  colors?: RetroColorConfig;
}

// Colores predefinidos
export const RETRO_COLORS = {
  GREEN: {
    primary: '34, 197, 94',
    textClass: 'text-green-400',
    borderClass: 'border-green-500',
  },
  CYAN: {
    primary: '103, 232, 249',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500',
  },
  AMBER: {
    primary: '251, 191, 36',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500',
  },
  PURPLE: {
    primary: '168, 85, 247',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500',
  },
};

/**
 * Genera una columna de caracteres Matrix aleatorios
 */
const generateMatrixColumn = (length: number): string[] => {
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]);
};

/**
 * Genera una línea de texto con iconos y espacios para simular palabras
 */
const generateTypingLine = (length: number): string => {
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const icons = '◆◇◈◉◊○◌◍◎●◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟◠◡◢◣◤◥◦◧◨◩◪◫◬◭◮◯☀☁☂☃☄★☆☇☈☉☊☋☌☍☎☏☐☑☒☓☖☗☘☙☚☛☜☝☞☟☠☡☢☣☤☥☦☧☨☩☪☫☬☭☮☯☰☱☲☳☴☵☶☷☸☹☺☻☼☽☾☿♀♁♂♃♄♅♆♇♈♉♊♋♌♍♎♏♐♑♒♓';
  let result = '';
  let wordLength = 0;

  for (let i = 0; i < length; i++) {
    const rand = Math.random();

    if (wordLength > 2 && rand > 0.7) {
      result += '  ';
      wordLength = 0;
    } else if (rand > 0.85) {
      result += icons[Math.floor(Math.random() * icons.length)];
      wordLength++;
    } else {
      result += chars[Math.floor(Math.random() * chars.length)];
      wordLength++;
    }
  }
  return result;
};

/**
 * Componente RetroMonitor
 * 
 * Crea un monitor retro con efectos CRT, scanlines y texto Matrix animado.
 * 
 * @example
 * // Monitor básico con solo el efecto CRT
 * <RetroMonitor height={200}>
 *   <img src="planet.png" alt="Planet" />
 * </RetroMonitor>
 * 
 * @example
 * // Monitor completo con columnas Matrix y líneas de texto
 * <RetroMonitor
 *   height={200}
 *   leftColumns={{ count: 5, position: 'left' }}
 *   rightColumns={{ count: 5, position: 'right' }}
 *   typingLines={{ count: 24, left: 56, top: 8, width: 100, height: 180 }}
 *   colors={RETRO_COLORS.GREEN}
 * >
 *   <img src="planet.png" alt="Planet" />
 * </RetroMonitor>
 */
export const RetroMonitor: React.FC<RetroMonitorProps> = ({
  children,
  height = 200,
  leftColumns,
  rightColumns,
  typingLines,
  colors = RETRO_COLORS.GREEN,
}) => {
  // Generar columnas Matrix izquierdas
  const leftMatrixColumns = leftColumns
    ? Array.from({ length: leftColumns.count }, (_, i) => ({
        id: `left-${i}`,
        chars: generateMatrixColumn(20 + Math.floor(Math.random() * 15)),
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    : [];

  // Generar columnas Matrix derechas
  const rightMatrixColumns = rightColumns
    ? Array.from({ length: rightColumns.count }, (_, i) => ({
        id: `right-${i}`,
        chars: generateMatrixColumn(20 + Math.floor(Math.random() * 15)),
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    : [];

  // Generar líneas de texto horizontal
  const horizontalTypingLines = typingLines
    ? Array.from({ length: typingLines.count }, (_, i) => ({
        id: `typing-${i}`,
        text: generateTypingLine(18 + Math.floor(Math.random() * 12)),
        duration: 15,
        delay: i * 0.8,
        indent: Math.floor(Math.random() * 20),
      }))
    : [];

  return (
    <div
      className={`retro-monitor-container relative rounded ${colors.borderClass}/30 overflow-hidden bg-black/50 flex items-center justify-center`}
      style={{ height: `${height}px` }}
    >
      {/* Columnas Matrix izquierdas */}
      {leftColumns && (
        <div className={`absolute left-0 top-0 bottom-0 flex gap-[2px] ${colors.textClass} text-[8px] font-mono opacity-70 overflow-hidden pl-1`}>
          {leftMatrixColumns.map((col) => (
            <div key={col.id} className="flex flex-col">
              <div
                className="matrix-column"
                style={{
                  animationDuration: `${col.duration}s`,
                  animationDelay: `${col.delay}s`,
                }}
              >
                {col.chars.map((char, i) => (
                  <div key={i} className="whitespace-nowrap leading-tight">
                    {char}
                  </div>
                ))}
                {col.chars.map((char, i) => (
                  <div key={`dup-${i}`} className="whitespace-nowrap leading-tight">
                    {char}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Columnas Matrix derechas */}
      {rightColumns && (
        <div className={`absolute right-0 top-0 bottom-0 flex gap-[2px] ${colors.textClass} text-[8px] font-mono opacity-70 overflow-hidden pr-1`}>
          {rightMatrixColumns.map((col) => (
            <div key={col.id} className="flex flex-col">
              <div
                className="matrix-column"
                style={{
                  animationDuration: `${col.duration}s`,
                  animationDelay: `${col.delay}s`,
                }}
              >
                {col.chars.map((char, i) => (
                  <div key={i} className="whitespace-nowrap leading-tight">
                    {char}
                  </div>
                ))}
                {col.chars.map((char, i) => (
                  <div key={`dup-${i}`} className="whitespace-nowrap leading-tight">
                    {char}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Líneas de texto horizontal con efecto de tecleado */}
      {typingLines && (
        <div
          className="absolute bg-black/10 rounded p-1 overflow-hidden"
          style={{
            left: `${typingLines.left}px`,
            top: `${typingLines.top}px`,
            width: `${typingLines.width}px`,
            height: `${typingLines.height}px`,
          }}
        >
          <div className="text-[7px] font-mono leading-tight space-y-[1px]">
            {horizontalTypingLines.map((line) => {
              const rand = Math.random();
              let colorClass = colors.textClass;
              if (rand > 0.88) colorClass = 'text-red-400';
              else if (rand > 0.76) colorClass = 'text-yellow-400';
              else if (rand > 0.65) colorClass = 'text-blue-400';

              return (
                <div key={line.id} className={`typing-line overflow-hidden whitespace-nowrap ${colorClass}`}>
                  <span
                    className="inline-block typing-text"
                    style={{
                      animationDuration: `${line.duration}s`,
                      animationDelay: `${line.delay}s`,
                      marginLeft: `${line.indent}px`,
                    }}
                  >
                    {line.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contenido central */}
      {children}

      {/* Estilos CSS para las animaciones */}
      <style>{`
        /* Old CRT Monitor Effect */
        @keyframes crtAnimation {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 10000%;
          }
        }

        @keyframes matrixScroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        .retro-monitor-container {
          box-shadow: inset 0px 0px 2rem rgba(${colors.primary}, 0.3);
          background-image: linear-gradient(0deg, #0000 10%, rgba(${colors.primary}, 0.1) 90%, #0000 100%);
          animation: crtAnimation 100s linear infinite;
          background-size: 100% 80%;
          /* Scanline Effect */
          mask-image: linear-gradient(to bottom, #0005 50%, #000 50%);
          mask-size: 100% 2px;
        }

        .matrix-column {
          animation: matrixScroll 3s linear infinite;
        }

        /* Efecto de tecleado horizontal */
        @keyframes typing {
          0% {
            width: 0;
            opacity: 1;
          }
          20% {
            width: 100%;
            opacity: 1;
          }
          70% {
            width: 100%;
            opacity: 1;
          }
          80% {
            width: 100%;
            opacity: 0;
          }
          100% {
            width: 0;
            opacity: 0;
          }
        }

        .typing-text {
          animation: typing 15s steps(40, end) infinite;
          width: 0;
          overflow: hidden;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};
