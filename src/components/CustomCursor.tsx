import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'text' | 'drag' | 'view'>('default');
  const [isClicked, setIsClicked] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Position motion values
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth trailing spring for the outer ring
  const ringSpringConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const ringX = useSpring(mouseX, ringSpringConfig);
  const ringY = useSpring(mouseY, ringSpringConfig);

  // Snappy spring for the center dot
  const dotSpringConfig = { damping: 35, stiffness: 800, mass: 0.1 };
  const dotX = useSpring(mouseX, dotSpringConfig);
  const dotY = useSpring(mouseY, dotSpringConfig);

  const activeMagneticRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Check for touch / reduced motion
    const touchCheck = window.matchMedia('(hover: none) or (pointer: coarse)');
    const motionCheck = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (touchCheck.matches || motionCheck.matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;

      // Check if target is inside a magnetic element
      const magneticElement = target?.closest('[data-magnetic="true"]') as HTMLElement | null;

      if (magneticElement) {
        activeMagneticRef.current = magneticElement;
        const rect = magneticElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate magnetic displacement (max 12px)
        const distToCenter = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        const pullStrength = Math.max(0, 1 - distToCenter / (rect.width * 0.9));
        
        const magnetX = (e.clientX - centerX) * 0.28 * pullStrength;
        const magnetY = (e.clientY - centerY) * 0.28 * pullStrength;
        
        magneticElement.style.transform = `translate3d(${magnetX}px, ${magnetY}px, 0)`;
        magneticElement.style.transition = 'transform 0.1s ease-out';

        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        setCursorType('pointer');
        return;
      } else if (activeMagneticRef.current) {
        activeMagneticRef.current.style.transform = 'translate3d(0px, 0px, 0)';
        activeMagneticRef.current.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        activeMagneticRef.current = null;
      }

      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Determine cursor state
      if (
        target?.closest('button') ||
        target?.closest('a') ||
        target?.closest('[role="button"]') ||
        target?.classList.contains('cursor-pointer') ||
        target?.closest('.cursor-pointer')
      ) {
        setCursorType('pointer');
      } else if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        setCursorType('text');
      } else if (
        target?.closest('#hero-3d-canvas-container') ||
        target?.closest('#robot-3d-canvas') ||
        target?.closest('#education-3d-canvas')
      ) {
        setCursorType('drag');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (isTouchDevice || !isVisible) return null;

  const isPointer = cursorType === 'pointer';
  const isDrag = cursorType === 'drag';
  const isText = cursorType === 'text';

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {/* Outer Halo Interaction Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-cyan-400/60 pointer-events-none flex items-center justify-center backdrop-blur-[0.5px]"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isDrag ? 48 : isPointer ? 44 : isText ? 26 : 28,
          height: isDrag ? 48 : isPointer ? 44 : isText ? 26 : 28,
          borderColor: isDrag
            ? 'rgba(168, 85, 247, 0.8)'
            : isPointer
            ? 'rgba(0, 240, 255, 0.9)'
            : isText
            ? 'rgba(56, 189, 248, 0.5)'
            : 'rgba(0, 240, 255, 0.35)',
          backgroundColor: isDrag
            ? 'rgba(168, 85, 247, 0.08)'
            : isPointer
            ? 'rgba(0, 240, 255, 0.12)'
            : 'rgba(0, 240, 255, 0.02)',
          scale: isClicked ? 0.85 : 1,
          boxShadow: isPointer
            ? '0 0 20px rgba(0, 240, 255, 0.3), inset 0 0 10px rgba(0, 240, 255, 0.15)'
            : isDrag
            ? '0 0 20px rgba(168, 85, 247, 0.3), inset 0 0 10px rgba(168, 85, 247, 0.15)'
            : '0 0 8px rgba(0, 240, 255, 0.15)',
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 400,
        }}
      >
        {isDrag && (
          <span className="text-[8px] font-mono text-purple-300 tracking-tighter uppercase font-bold">
            360°
          </span>
        )}
      </motion.div>

      {/* Center Core Glowing Laser Dot */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isPointer ? 8 : isClicked ? 10 : 4,
          height: isPointer ? 8 : isClicked ? 10 : 4,
          backgroundColor: isDrag ? '#c084fc' : '#00f0ff',
          boxShadow: isDrag
            ? '0 0 12px #c084fc, 0 0 4px #ffffff'
            : '0 0 12px #00f0ff, 0 0 4px #ffffff',
          opacity: isText ? 0.3 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 600,
        }}
      />
    </div>
  );
};
