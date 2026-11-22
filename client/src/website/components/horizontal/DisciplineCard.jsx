import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function DisciplineCard({ discipline, index = 0 }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Subtle 3D Tilt Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 180, mass: 0.1 };
  const rotateX = useSpring(useMotionValue(0), springConfig);
  const rotateY = useSpring(useMotionValue(0), springConfig);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Set CSS variables for cursor spotlight gradient
    cardRef.current.style.setProperty('--mouse-x', `${mouseX}px`);
    cardRef.current.style.setProperty('--mouse-y', `${mouseY}px`);

    // Calculate subtle rotation (-6deg to +6deg)
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    rotateX.set(-yPct * 8);
    rotateY.set(xPct * 8);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  const IconComp = discipline.icon;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: prefersReducedMotion ? 0 : rotateX,
        rotateY: prefersReducedMotion ? 0 : rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative w-full h-full min-h-[380px] rounded-3xl select-none group focus-within:ring-2 focus-within:ring-neutral-950 transition-all duration-300"
    >
      <Link
        to={`/career-explorer?domain=${discipline.id}`}
        aria-label={`${discipline.title} curriculum and roles`}
        className={`relative w-full h-full rounded-3xl border p-6 sm:p-7 flex flex-col justify-between overflow-hidden transition-all duration-300 block ${
          isHovered
            ? 'bg-[#050505] border-neutral-800 text-white shadow-xl -translate-y-1.5'
            : 'bg-white border-neutral-200/90 text-neutral-950 hover:border-neutral-300 shadow-xs'
        }`}
      >
        {/* Subtle Cursor-Following Radial Spotlight Gradient on Inversion */}
        {isHovered && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-25 transition-opacity duration-300"
            style={{
              background:
                'radial-gradient(380px circle at var(--mouse-x, 150px) var(--mouse-y, 200px), rgba(255, 255, 255, 0.15), transparent 70%)',
            }}
          />
        )}

        {/* Ambient Corner Specular Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full blur-2xl transition-opacity duration-300"
          style={{
            backgroundColor: discipline.accent,
            opacity: isHovered ? 0.2 : 0.04,
          }}
        />

        {/* --- Top Row: Rounded Icon + Number Tag --- */}
        <div className="relative z-10 flex items-start justify-between">
          <div
            className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xs ${
              isHovered
                ? 'bg-white text-neutral-950 scale-105'
                : 'bg-neutral-950 text-white'
            }`}
          >
            <IconComp className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
          </div>

          <span
            className={`text-xl sm:text-2xl font-mono font-bold tracking-tighter transition-colors duration-300 ${
              isHovered ? 'text-neutral-600' : 'text-neutral-300'
            }`}
          >
            {discipline.index}
          </span>
        </div>

        {/* --- Middle Row: Title + Full Wrap Subtitle --- */}
        <div className="relative z-10 my-auto pt-4 pb-2">
          <h3
            className={`text-lg sm:text-xl font-bold tracking-tight leading-snug transition-colors duration-300 ${
              isHovered ? 'text-white' : 'text-neutral-950'
            }`}
          >
            {discipline.title}
          </h3>

          {/* Subtitle wraps fully without truncation */}
          <p
            className={`mt-2 text-xs sm:text-[13px] leading-relaxed transition-colors duration-300 ${
              isHovered ? 'text-neutral-400' : 'text-neutral-600'
            }`}
          >
            {discipline.subtitle}
          </p>

          {/* --- Sliding Roles Preview (Slides up on Hover) --- */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              isHovered ? 'max-h-24 opacity-100 mt-4 pt-3 border-t border-neutral-800' : 'max-h-0 opacity-0 mt-0'
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1.5">
              Verified Career Tracks:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {discipline.rolesPreview.map((role) => (
                <span
                  key={role}
                  className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* --- Bottom Row: Role Count Badge + Action Arrow --- */}
        <div
          className={`relative z-10 pt-4 border-t flex items-center justify-between text-xs font-mono transition-colors duration-300 ${
            isHovered
              ? 'border-neutral-800 text-neutral-400'
              : 'border-neutral-200/80 text-neutral-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: discipline.accent }}
            />
            <span className="font-semibold">{discipline.roleCount} Roles</span>
          </div>

          <div
            className={`inline-flex items-center gap-1 font-bold transition-all duration-200 ${
              isHovered
                ? 'text-white translate-x-1'
                : 'text-neutral-950 group-hover:text-neutral-800'
            }`}
          >
            <span>View</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
