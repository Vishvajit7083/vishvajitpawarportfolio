import React, { useEffect, useRef, useState } from 'react';
import { Network, Filter, Search, Info, Cpu, Sparkles, Terminal, Layers, CheckCircle2 } from 'lucide-react';
import { SKILLS_DATA } from '../data/portfolioData';
import { SkillNode } from '../types';
import { sound } from '../utils/audioEffects';

type CategoryFilter = 'ALL' | 'Programming' | 'Embedded Systems' | 'AI & Robotics' | 'Hardware' | 'Tools' | 'Operating Systems';

const CATEGORIES: CategoryFilter[] = [
  'ALL',
  'Programming',
  'Embedded Systems',
  'AI & Robotics',
  'Hardware',
  'Tools',
  'Operating Systems',
];

export const SkillsNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSkill, setHoveredSkill] = useState<SkillNode | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillNode>(SKILLS_DATA[1]); // Default to Python or ESP32
  const [viewMode, setViewMode] = useState<'network' | 'grid'>('network');

  // Filter skills
  const filteredSkills = SKILLS_DATA.filter((s) => {
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Canvas interactive circuit network animation
  useEffect(() => {
    if (viewMode !== 'network') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 480);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = Math.max(420, Math.min(520, window.innerHeight * 0.55));
    };
    window.addEventListener('resize', handleResize);

    // Initialize node positions in a radial/network layout
    const nodes = SKILLS_DATA.map((skill, i) => {
      const angle = (i / SKILLS_DATA.length) * Math.PI * 2;
      const radius = Math.min(width, height) * (0.28 + (i % 3) * 0.08);
      return {
        ...skill,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseRadius: 18 + (skill.level / 100) * 8,
      };
    });

    let mouseX = -1000;
    let mouseY = -1000;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Find hovered node
      let found: SkillNode | null = null;
      for (const node of nodes) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < node.baseRadius + 10) {
          found = node;
          break;
        }
      }
      if (found && (!hoveredSkill || hoveredSkill.id !== found.id)) {
        sound.playHover();
      }
      setHoveredSkill(found);
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      for (const node of nodes) {
        const dx = node.x - clickX;
        const dy = node.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < node.baseRadius + 12) {
          sound.playClick();
          setSelectedSkill(node);
          break;
        }
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);

    let pulse = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      pulse += 0.03;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle cyber grid background inside canvas
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 36;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update node physics (gentle floating drift)
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Boundaries
        const pad = node.baseRadius + 20;
        if (node.x < pad || node.x > width - pad) node.vx *= -1;
        if (node.y < pad || node.y > height - pad) node.vy *= -1;
      });

      // Draw connections (circuit traces) between nodes in the same category or related clusters
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const isSameCategory = n1.category === n2.category;
          const maxDist = isSameCategory ? 200 : 130;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isSameCategory ? 0.35 : 0.15);
            ctx.strokeStyle = isSameCategory ? n1.color : 'rgba(56, 189, 248, 0.3)';
            ctx.globalAlpha = alpha;
            ctx.lineWidth = isSameCategory ? 1.5 : 1;

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            // Draw circuit-style angled or direct lines
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();

            // Circuit pulse electron packet
            if (isSameCategory && dist > 50) {
              const packetT = (Math.sin(pulse + i + j) + 1) / 2;
              const px = n1.x + dx * packetT;
              const py = n1.y + dy * packetT;

              ctx.fillStyle = n1.color;
              ctx.globalAlpha = 0.8;
              ctx.beginPath();
              ctx.arc(px, py, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw Nodes
      nodes.forEach((node) => {
        const isHovered = hoveredSkill?.id === node.id;
        const isSelected = selectedSkill.id === node.id;
        const isCategoryMatch = selectedCategory === 'ALL' || node.category === selectedCategory;

        ctx.globalAlpha = isCategoryMatch ? 1 : 0.25;

        // Outer glow
        if (isHovered || isSelected) {
          const glowGrad = ctx.createRadialGradient(
            node.x,
            node.y,
            node.baseRadius * 0.6,
            node.x,
            node.y,
            node.baseRadius * 2
          );
          glowGrad.addColorStop(0, node.color);
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.baseRadius * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main Node Body (Dark glass disk)
        ctx.fillStyle = isSelected ? '#0f233a' : '#0a1324';
        ctx.strokeStyle = isHovered || isSelected ? '#ffffff' : node.color;
        ctx.lineWidth = isHovered || isSelected ? 2.5 : 1.5;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.baseRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner Level Ring
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          node.x,
          node.y,
          node.baseRadius - 4,
          -Math.PI / 2,
          -Math.PI / 2 + (node.level / 100) * Math.PI * 2
        );
        ctx.stroke();

        // Node Text
        ctx.fillStyle = isHovered || isSelected ? '#00f0ff' : '#e2e8f0';
        ctx.font = `600 ${isHovered ? '12px' : '11px'} 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name, node.x, node.y);
      });

      ctx.globalAlpha = 1;
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [viewMode, selectedCategory, hoveredSkill, selectedSkill]);

  const activeFocusSkill = hoveredSkill || selectedSkill;

  return (
    <section id="skills" className="relative w-full py-20 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase">
            <Network className="w-4 h-4" />
            <span>// SKILL_TOPOLOGY_NETWORK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-wide mt-1">
            INTERACTIVE SKILLS CIRCUIT
          </h2>
          <p className="text-xs sm:text-sm font-mono text-slate-400 mt-1">
            Hover over floating nodes or select categories to inspect technical proficiencies & embedded systems relevance.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 glass-panel p-1 rounded-xl border border-cyan-500/30">
          <button
            id="view-mode-network"
            onClick={() => {
              sound.playClick();
              setViewMode('network');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'network'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>3D NETWORK</span>
          </button>
          <button
            id="view-mode-grid"
            onClick={() => {
              sound.playClick();
              setViewMode('grid');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>MATRIX GRID</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              onMouseEnter={() => sound.playHover()}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)] font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="skill-search-input"
            type="text"
            placeholder="Search skill (e.g. ESP32, C, OpenCV)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Interactive Main Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Main Visualizer: Canvas Network or Grid */}
        <div className="lg:col-span-8 glass-panel-glow p-4 rounded-2xl border border-cyan-500/30 overflow-hidden relative min-h-[460px] flex flex-col">
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />

          {viewMode === 'network' ? (
            <div className="relative w-full flex-1 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair rounded-xl block"
              />
              <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400 pointer-events-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>ACTIVE NODES: {filteredSkills.length} // DRAG & HOVER TO INSPECT</span>
              </div>
            </div>
          ) : (
            /* Matrix Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2 overflow-y-auto max-h-[460px]">
              {filteredSkills.map((skill) => {
                const isSelected = activeFocusSkill?.id === skill.id;
                return (
                  <button
                    key={skill.id}
                    id={`skill-card-${skill.id}`}
                    onClick={() => {
                      sound.playClick();
                      setSelectedSkill(skill);
                    }}
                    onMouseEnter={() => {
                      sound.playHover();
                      setHoveredSkill(skill);
                    }}
                    className={`p-3 rounded-xl border text-left font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {skill.category}
                      </span>
                      <span className="text-xs font-bold text-cyan-300">{skill.level}%</span>
                    </div>
                    <div className="text-sm font-semibold text-white">{skill.name}</div>
                    <div className="w-full bg-slate-950 rounded-full h-1 mt-2 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Holographic Node Tooltip / Explanatory Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 relative space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
            <div className="cyber-corner-tl" />
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            <div className="cyber-corner-br" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Cpu className="w-4 h-4" />
                <span>SKILL NODE TELEMETRY</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {activeFocusSkill.category}
              </span>
            </div>

            {/* Main Skill Focus Name & Rating */}
            <div>
              <div className="text-2xl font-bold font-display text-white flex items-center justify-between">
                <span>{activeFocusSkill.name}</span>
                <span className="text-lg font-mono text-cyan-300">{activeFocusSkill.level}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 mt-2 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                  style={{ width: `${activeFocusSkill.level}%` }}
                />
              </div>
            </div>

            {/* Description Tooltip */}
            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-cyan-400" /> TECHNICAL EXPLANATION:
              </span>
              <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                {activeFocusSkill.description}
              </p>
            </div>

            {/* Relevance to Embedded / IoT / AI / Robotics */}
            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> EMBEDDED & ROBOTICS RELEVANCE:
              </span>
              <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-emerald-950/60">
                {activeFocusSkill.relevance}
              </p>
            </div>

            <div className="pt-2 text-[10px] font-mono text-slate-500 flex justify-between border-t border-slate-800/80">
              <span>STATUS: INTEGRATED</span>
              <span>DOMAIN: HARDWARE/FIRMWARE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
