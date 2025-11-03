import React, { useEffect } from 'react';

export type ParticleKind = 'damage' | 'heal' | 'shield';

interface ParticleBurstProps {
  kind: ParticleKind;
  count?: number;
  onComplete?: () => void;
}

// Renders a burst of particles centered in its parent container.
// Parent should be position: relative; this component is position: absolute and fills it.
export const ParticleBurst: React.FC<ParticleBurstProps> = ({ kind, count = 14, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete && onComplete(), 900); // match CSS anim ~0.8s + margin
    return () => clearTimeout(timer);
  }, [onComplete]);

  const cls = kind === 'damage' ? 'particle-damage' : kind === 'heal' ? 'particle-heal' : 'particle-shield';

  const particles = Array.from({ length: count }, (_, i) => {
    // Random target offsets for each particle
    const angle = Math.random() * Math.PI * 2;
    const radius = 40 + Math.random() * 60; // px travel radius
    const tx = Math.cos(angle) * radius;
    const ty = Math.sin(angle) * radius;
    const size = 6 + Math.floor(Math.random() * 6); // 6-11px
    const delay = Math.random() * 80; // small stagger
    return { id: i, tx, ty, size, delay };
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className={`particle ${cls}`}
          style={{
            left: '50%',
            top: '50%',
            width: p.size,
            height: p.size,
            // @ts-ignore CSS var for animation vector
            ['--tx' as any]: `${p.tx}px`,
            ['--ty' as any]: `${p.ty}px`,
            animationDelay: `${p.delay}ms`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
};
