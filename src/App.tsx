import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import {
  Github, Linkedin, Mail, ExternalLink, ChevronDown,
  Zap, Code2, Brain, Database, Sparkles, ArrowRight,
  Menu, X, GraduationCap, Award, MapPin, Calendar
} from 'lucide-react';

// ─── Touch detection ──────────────────────────────────────────────────────────
const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    const isTouch = isTouchDevice();
    const NUM = isTouch ? 40 : 90;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const onMM = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onTM = (e: TouchEvent) => { if (e.touches[0]) mouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    window.addEventListener('mousemove', onMM);
    window.addEventListener('touchmove', onTM, { passive: true });
    const particles = Array.from({ length: NUM }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, r: Math.random() * 2 + 0.5,
    }));
    const LINK = isTouch ? 80 : 120, MDist = isTouch ? 100 : 160;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouse.current;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139,92,246,0.6)'; ctx.fill();
      });
      for (let i = 0; i < NUM; i++) {
        for (let j = i + 1; j < NUM; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - d / LINK)})`; ctx.lineWidth = 0.8; ctx.stroke(); }
        }
        const dx = particles[i].x - mx, dy = particles[i].y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < MDist) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(mx, my); ctx.strokeStyle = `rgba(6,182,212,${0.25 * (1 - d / MDist)})`; ctx.lineWidth = 1; ctx.stroke(); }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMM); window.removeEventListener('touchmove', onTM); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ─── Cursor Glow ──────────────────────────────────────────────────────────────
function CursorGlow() {
  const cx = useMotionValue(-300), cy = useMotionValue(-300);
  const sx = useSpring(cx, { damping: 25, stiffness: 200 }), sy = useSpring(cy, { damping: 25, stiffness: 200 });
  useEffect(() => {
    if (isTouchDevice()) return;
    const m = (e: MouseEvent) => { cx.set(e.clientX); cy.set(e.clientY); };
    window.addEventListener('mousemove', m);
    return () => window.removeEventListener('mousemove', m);
  }, [cx, cy]);
  if (isTouchDevice()) return null;
  return (
    <motion.div className="fixed pointer-events-none z-0 hidden md:block"
      style={{ left: sx, top: sy, translateX: '-50%', translateY: '-50%', width: 480, height: 480, background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
  );
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
function Typewriter({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0), [displayed, setDisplayed] = useState(''), [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[idx];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < word.length) t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    else if (!deleting && displayed.length === word.length) t = setTimeout(() => setDeleting(true), 1800);
    else if (deleting && displayed.length > 0) t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
    else { setDeleting(false); setIdx((idx + 1) % words.length); }
    return () => clearTimeout(t);
  }, [displayed, deleting, idx, words]);
  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400">
      {displayed}<span className="animate-pulse text-cyan-400">|</span>
    </span>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const links = ['About', 'Projects', 'Experience', 'Skills', 'Contact'];
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm" />
          <motion.div key="dr" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col" style={{ background: 'rgba(10,10,24,0.97)', borderLeft: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800">
              <span className="font-bold text-lg"><span className="text-white">iv</span><span className="text-violet-400">.</span><span className="text-cyan-400">dev</span></span>
              <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><X size={22} /></button>
            </div>
            <nav className="flex flex-col gap-1 px-4 pt-6 flex-1">
              {links.map((link, i) => (
                <motion.a key={link} href={`#${link.toLowerCase()}`} onClick={onClose}
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 active:scale-95 transition-all text-lg font-medium">
                  <span className="text-violet-400 font-mono text-sm">0{i + 1}.</span>{link}
                </motion.a>
              ))}
            </nav>
            <div className="px-6 pb-8 pt-4 border-t border-slate-800 flex flex-col gap-4">
              <div className="flex gap-3">
                {[Github, Linkedin, Mail].map((Icon, i) => (
                  <a key={i} href={i === 0 ? 'https://github.com/ishaanverma' : i === 1 ? 'https://linkedin.com' : 'mailto:ishaan.verma2003@gmail.com'}
                    className="p-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-violet-500 transition-all active:scale-90 flex-1 flex justify-center"><Icon size={20} /></a>
                ))}
              </div>
              <a href="mailto:ishaan.verma2003@gmail.com" className="w-full py-3.5 rounded-full text-center font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 active:scale-95 transition-transform">Hire Me</a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false), [menuOpen, setMenuOpen] = useState(false);
  const links = ['About', 'Projects', 'Experience', 'Skills', 'Contact'];
  useEffect(() => { const f = () => setScrolled(window.scrollY > 50); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f); }, []);
  return (
    <>
      <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'bg-slate-950/85 backdrop-blur-xl border-b border-white/5 shadow-2xl' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} className="font-bold text-lg tracking-tight select-none">
            <span className="text-white">iv</span><span className="text-violet-400">.</span><span className="text-cyan-400">dev</span>
          </motion.div>
          <div className="hidden md:flex gap-6 lg:gap-8">
            {links.map(link => (
              <motion.a key={link} href={`#${link.toLowerCase()}`} whileHover={{ y: -2 }}
                className="text-sm text-slate-400 hover:text-white transition-colors relative group">
                {link}<span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-violet-400 to-cyan-400 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>
          <motion.a href="mailto:ishaan.verma2003@gmail.com"
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(139,92,246,0.5)' }} whileTap={{ scale: 0.97 }}
            className="hidden md:block px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 text-white">
            Hire Me
          </motion.a>
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setMenuOpen(true)}
            className="md:hidden p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors" aria-label="Open menu">
            <Menu size={24} />
          </motion.button>
        </div>
      </motion.nav>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ label, title, accent }: { label: string; title: string; accent: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-10 sm:mb-16">
      <p className={`${accent} font-mono text-xs sm:text-sm tracking-widest uppercase mb-3`}>{label}</p>
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white mb-4">{title}</h2>
      <div className={`w-20 h-1 rounded-full bg-gradient-to-r ${accent === 'text-violet-400' ? 'from-violet-500 to-cyan-500' : accent === 'text-cyan-400' ? 'from-cyan-500 to-pink-500' : accent === 'text-pink-400' ? 'from-pink-500 to-amber-500' : 'from-amber-500 to-violet-500'}`} />
    </motion.div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
interface Project { title: string; type: string; desc: string; icon: React.ReactNode; gradient: string; tags: string[]; link?: string; }
function ProjectCard({ project, i }: { project: Project; i: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      onClick={() => project.link && window.open(project.link, '_blank')}
      whileHover={{ y: -10, scale: 1.02 }} whileTap={{ scale: 0.98 }}
      className="relative rounded-2xl overflow-hidden group cursor-pointer"
      style={{ background: 'rgba(15,15,30,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <motion.div className="absolute inset-0" animate={{ opacity: hovered ? 0.07 : 0 }} transition={{ duration: 0.3 }}
        style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="p-5 sm:p-7">
        <div className="flex justify-between items-start mb-5">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>{project.icon}</div>
          <div className="flex gap-1">
            <motion.a whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} href={project.link || '#'} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center">
              <Github size={16} />
            </motion.a>
            <motion.a whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} href={project.link || '#'} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-950/40 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center">
              <ExternalLink size={16} />
            </motion.a>
          </div>
        </div>
        <p className={`text-xs font-mono font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${project.gradient}`}>{project.type}</p>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3">{project.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-5">{project.desc}</p>
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 rounded-md text-xs text-slate-400 bg-slate-800/60 border border-slate-700/50">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  const [count, setCount] = useState(0), ref = useRef<HTMLDivElement>(null);
  const target = parseInt(value.replace(/\D/g, ''));
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { let s = 0; const step = Math.ceil(target / 40); const t = setInterval(() => { s = Math.min(s + step, target); setCount(s); if (s >= target) clearInterval(t); }, 40); obs.disconnect(); }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: 'backOut' }}
      whileHover={{ y: -6, scale: 1.04 }} whileTap={{ scale: 0.97 }}
      className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="p-2.5 sm:p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.15)' }}>{icon}</div>
      <div className="text-2xl sm:text-3xl font-black text-white">{count}{value.replace(/[0-9]/g, '')}</div>
      <div className="text-xs text-slate-400 text-center leading-tight">{label}</div>
    </motion.div>
  );
}

// ─── Skill Badge ──────────────────────────────────────────────────────────────
function SkillBadge({ label, color }: { label: string; color: string }) {
  return (
    <motion.span whileHover={{ scale: 1.1, y: -3 }} whileTap={{ scale: 0.95 }}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-default select-none ${color}`}>
      {label}
    </motion.span>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {

  const projects: Project[] = [
    {
      title: 'MedFlow AI',
      type: 'Agentic Healthcare Platform',
      desc: 'Production-grade full-stack healthcare platform with a multi-agent orchestration engine. RAG pipeline using PostgreSQL + pgvector for patient-isolated semantic search, structured entity extraction, and a HITL safety layer via async Celery queues.',
      icon: <Brain className="w-6 h-6 text-violet-400" />,
      gradient: 'from-violet-500 to-purple-700',
      tags: ['FastAPI', 'Next.js', 'LangGraph', 'Multi-Agent LLMs', 'RAG', 'pgvector', 'Docker'],
      link: 'https://github.com/IshaanVerma2204/medflow-ai',
    },
    {
      title: 'TrialBridge AI',
      type: 'Clinical Trial Matching Engine',
      desc: 'AI-powered clinical trial matching platform processing 5,000+ clinical records. Reverse-matching engine with Qdrant Vector DB + NLP embeddings achieving 90%+ precision, cutting search latency to under 50ms.',
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      gradient: 'from-cyan-500 to-teal-700',
      tags: ['Next.js', 'FastAPI', 'Qdrant', 'NLP Embeddings', 'TypeScript', 'Tailwind CSS'],
      link: 'https://github.com/IshaanVerma2204/TrialBridge-AI',
    },
    {
      title: 'LLM Gateway',
      type: 'Cost-Saving AI Proxy Platform',
      desc: 'High-throughput AI gateway in Go to optimise LLM API costs. Dual-layer caching: Redis (sub-2ms exact-match) + pgvector (semantic similarity). Token-bucket rate limiting via Lua with a real-time observability dashboard.',
      icon: <Database className="w-6 h-6 text-pink-400" />,
      gradient: 'from-pink-500 to-rose-700',
      tags: ['Go', 'Redis', 'PostgreSQL', 'pgvector', 'Next.js', 'Docker', 'TypeScript'],
      link: 'https://github.com/IshaanVerma2204/LLM-Gateway',
    },
    {
      title: 'Fact Knowledge Layer',
      type: 'AI · Knowledge Systems',
      desc: 'Knowledge graph and fact-retrieval layer built with Python. Enables structured reasoning over unstructured data by linking named entities to a persistent fact store for downstream LLM grounding.',
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      gradient: 'from-emerald-500 to-green-700',
      tags: ['Python', 'Knowledge Graphs', 'NLP', 'LLM Grounding'],
      link: 'https://github.com/IshaanVerma2204/fact-knowledge-layer',
    },
    {
      title: 'DivyaDhrishti',
      type: 'Computer Vision · Assistive Tech',
      desc: 'AI-powered visual assistance system leveraging computer vision and deep learning to aid visually impaired users — combining real-time object detection, scene understanding, and intelligent feedback.',
      icon: <Brain className="w-6 h-6 text-fuchsia-400" />,
      gradient: 'from-fuchsia-500 to-violet-700',
      tags: ['Python', 'Computer Vision', 'Deep Learning', 'OpenCV', 'Assistive AI'],
      link: 'https://github.com/IshaanVerma2204/DivyaDhrishti',
    },
    {
      title: 'E-Commerce ML Pipeline',
      type: 'Data Science · ML',
      desc: 'End-to-end machine learning pipeline for e-commerce — covering customer segmentation, purchase prediction, churn analysis, and product recommendation using Scikit-learn and Pandas.',
      icon: <Database className="w-6 h-6 text-amber-400" />,
      gradient: 'from-amber-500 to-orange-700',
      tags: ['Python', 'Scikit-learn', 'Pandas', 'ML Pipeline', 'Data Analysis'],
      link: 'https://github.com/IshaanVerma2204/ecommerce-ml-pipeline',
    },
    {
      title: 'PulseFlow Analytics',
      type: 'Data Analytics · Dashboard',
      desc: 'Real-time analytics dashboard for monitoring key business metrics and data streams. Features interactive visualisations, time-series trend detection, and automated anomaly alerting.',
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      gradient: 'from-cyan-500 to-teal-700',
      tags: ['Python', 'Data Analytics', 'Visualisation', 'Dashboards', 'Time Series'],
      link: 'https://github.com/IshaanVerma2204/pulseflow-analytics',
    },
    {
      title: 'SurgeFlow',
      type: 'Data Analytics · Flow Analysis',
      desc: 'Flow-based analytics tool for identifying demand surges, traffic spikes, and anomalous patterns across datasets, enabling data-driven operational decisions.',
      icon: <Brain className="w-6 h-6 text-violet-400" />,
      gradient: 'from-violet-500 to-purple-700',
      tags: ['Python', 'Data Engineering', 'Analytics', 'Anomaly Detection'],
      link: 'https://github.com/IshaanVerma2204/surgeflow',
    },
    {
      title: 'Deepfake Image Detection',
      type: 'Computer Vision · CNN',
      desc: 'CNN-based deepfake detection pipeline trained on manipulated vs. authentic image datasets. Implements feature extraction, data augmentation, and a classification head to flag AI-generated faces.',
      icon: <Brain className="w-6 h-6 text-indigo-400" />,
      gradient: 'from-indigo-500 to-blue-700',
      tags: ['Python', 'CNN', 'TensorFlow', 'OpenCV', 'Image Classification'],
      link: 'https://github.com/IshaanVerma2204/Deepfake-Image-Detection-using-CNN',
    },
    {
      title: 'OpenCV Vision Lab',
      type: 'Computer Vision',
      desc: 'Collection of computer vision experiments using OpenCV — covering real-time object detection, edge detection, contour analysis, and image transformation pipelines in Python.',
      icon: <Code2 className="w-6 h-6 text-cyan-400" />,
      gradient: 'from-cyan-400 to-sky-700',
      tags: ['Python', 'OpenCV', 'NumPy', 'Real-time Detection'],
      link: 'https://github.com/IshaanVerma2204/genericopencvproject',
    },
    {
      title: 'HelpDesk Management',
      type: 'Full Stack · C#',
      desc: 'Feature-rich helpdesk and ticket management system. Supports ticket creation, assignment, prioritisation, SLA tracking, and an admin dashboard — built with C# and .NET.',
      icon: <Zap className="w-6 h-6 text-pink-400" />,
      gradient: 'from-pink-500 to-fuchsia-700',
      tags: ['C#', '.NET', 'SQL Server', 'REST API', 'Admin Dashboard'],
      link: 'https://github.com/IshaanVerma2204/HelpDeskManagement',
    },
    {
      title: 'Stock Screener Dashboard',
      type: 'Full Stack · Zetheta Algorithms',
      desc: 'Production stock screener supporting 5,000+ simulated stocks with advanced search, filtering, sorting, and watchlist management. Interactive portfolio analytics and sector allocation visualisations.',
      icon: <Sparkles className="w-6 h-6 text-violet-400" />,
      gradient: 'from-violet-500 to-indigo-700',
      tags: ['React', 'Next.js', 'Zustand', 'Recharts', 'TypeScript', 'Vercel'],
    },
  ];

  const skills: Record<string, string[]> = {
    'Languages': ['Python', 'TypeScript', 'JavaScript', 'SQL', 'Go', 'C#'],
    'AI & Machine Learning': ['LangGraph', 'RAG', 'Multi-Agent LLMs', 'TensorFlow', 'Scikit-learn', 'NLP Embeddings', 'OpenCV'],
    'Web & Frameworks': ['Next.js', 'React', 'FastAPI', 'Tailwind CSS', 'Zustand', 'Celery', '.NET'],
    'Database & DevOps': ['PostgreSQL', 'pgvector', 'Qdrant', 'Redis', 'Docker', 'AWS', 'Vercel'],
  };

  const skillColors: Record<string, string> = {
    'Languages': 'bg-violet-950/60 text-violet-300 border-violet-700/40 hover:border-violet-400',
    'AI & Machine Learning': 'bg-cyan-950/60 text-cyan-300 border-cyan-700/40 hover:border-cyan-400',
    'Web & Frameworks': 'bg-pink-950/60 text-pink-300 border-pink-700/40 hover:border-pink-400',
    'Database & DevOps': 'bg-amber-950/60 text-amber-300 border-amber-700/40 hover:border-amber-400',
  };

  const certs = [
    { name: 'Oracle Agentic AI Foundations Associate', sub: 'Oracle · Jul 2026', score: '92%', color: 'text-red-400', bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.2)' },
    { name: 'AWS Certified Cloud Practitioner', sub: 'Amazon Web Services', score: '90%', color: 'text-amber-400', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)' },
    { name: 'McKinsey Forward Program', sub: 'McKinsey & Company · Jun 2026', score: null, color: 'text-blue-300', bg: 'rgba(147,197,253,0.06)', border: 'rgba(147,197,253,0.2)' },
    { name: 'Marketing Analysis', sub: 'NPTEL · May 2026 · Top 5%', score: null, color: 'text-orange-400', bg: 'rgba(251,146,60,0.07)', border: 'rgba(251,146,60,0.2)' },
    { name: 'Introduction to Machine Learning', sub: 'NPTEL · May 2025', score: null, color: 'text-orange-400', bg: 'rgba(251,146,60,0.07)', border: 'rgba(251,146,60,0.2)' },
    { name: 'Goldman Sachs — Internal Audit Simulation', sub: 'Forage · Dec 2025', score: null, color: 'text-sky-400', bg: 'rgba(56,189,248,0.06)', border: 'rgba(56,189,248,0.2)' },
    { name: 'Goldman Sachs — Controllers Simulation', sub: 'Forage · Dec 2025', score: null, color: 'text-sky-400', bg: 'rgba(56,189,248,0.06)', border: 'rgba(56,189,248,0.2)' },
    { name: 'Goldman Sachs — Risk Job Simulation', sub: 'Forage · Dec 2025', score: null, color: 'text-sky-400', bg: 'rgba(56,189,248,0.06)', border: 'rgba(56,189,248,0.2)' },
    { name: 'Google IT Support', sub: 'Google · Coursera · Dec 2025', score: null, color: 'text-blue-400', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.2)' },
    { name: 'Bits and Bytes of Computer Networking', sub: 'Coursera · Nov 2024', score: null, color: 'text-violet-400', bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.2)' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-violet-500/30">
      <ParticleCanvas />
      <CursorGlow />
      <Navbar />

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-violet-700/20 blur-[120px] animate-float" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-cyan-600/15 blur-[120px] animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] rounded-full bg-pink-600/12 blur-[100px] animate-float" style={{ animationDelay: '6s' }} />
      </div>

      <main className="relative z-10">

        {/* ── Hero ─────────────────────────────────────────────────────────────── */}
        <section id="about" className="min-h-[100svh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20 pb-10">

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'backOut' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs sm:text-sm font-medium text-cyan-300 border border-cyan-500/25"
            style={{ background: 'rgba(6,182,212,0.07)', boxShadow: '0 0 30px rgba(6,182,212,0.1)' }}>
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}><Sparkles size={13} /></motion.span>
            Open to full-time roles & collaborations
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-5 leading-[0.95]">
            Hi, I'm<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400 bg-[size:200%] animate-gradient-x">
              Ishaan Verma
            </span>
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="text-xl sm:text-2xl md:text-3xl text-slate-300 mb-5 font-light min-h-[2rem] sm:min-h-[2.5rem]">
            <Typewriter words={['Full Stack AI Engineer', 'Agentic AI Developer', 'Data Scientist', 'ML Engineer']} />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
            className="text-slate-400 max-w-xl sm:max-w-2xl text-base sm:text-lg mb-10 sm:mb-12 leading-relaxed px-2">
            Results-driven CS undergraduate building end-to-end AI solutions — from multi-agent orchestration and RAG pipelines to production full-stack platforms in healthcare, finance, and beyond.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto mb-10">
            <motion.a href="#projects" whileHover={{ scale: 1.06, boxShadow: '0 0 35px rgba(139,92,246,0.5)' }} whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 text-base w-full sm:w-auto">
              View Projects <ArrowRight size={18} />
            </motion.a>
            <motion.a href="mailto:ishaan.verma2003@gmail.com" whileHover={{ scale: 1.06, boxShadow: '0 0 25px rgba(139,92,246,0.2)' }} whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold border border-slate-700 text-slate-300 hover:text-white transition-colors text-base w-full sm:w-auto">
              Get in Touch
            </motion.a>
          </motion.div>

          {/* Social + Location */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-col items-center gap-4">
            <div className="flex gap-3 sm:gap-4">
              {[
                { Icon: Github, href: 'https://github.com/IshaanVerma2204', cls: 'hover:border-violet-500 hover:text-violet-300', glow: 'rgba(139,92,246,0.5)' },
                { Icon: Linkedin, href: 'https://linkedin.com', cls: 'hover:border-cyan-500 hover:text-cyan-300', glow: 'rgba(6,182,212,0.5)' },
                { Icon: Mail, href: 'mailto:ishaan.verma2003@gmail.com', cls: 'hover:border-pink-500 hover:text-pink-300', glow: 'rgba(236,72,153,0.5)' },
              ].map(({ Icon, href, cls, glow }, i) => (
                <motion.a key={i} href={href} whileHover={{ y: -4, boxShadow: `0 0 22px ${glow}` }} whileTap={{ scale: 0.88 }}
                  className={`p-3.5 rounded-xl border border-slate-700/60 text-slate-400 transition-all duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center ${cls}`}
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <MapPin size={12} /><span>New Delhi, India</span>
            </div>
          </motion.div>

          <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-slate-600 flex flex-col items-center gap-1 mt-12">
            <span className="text-xs text-slate-500 tracking-widest uppercase">scroll</span>
            <ChevronDown size={22} />
          </motion.div>
        </section>

        {/* ── Stats ────────────────────────────────────────────────────────────── */}
        <section className="py-10 sm:py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatCard value="13+" label="GitHub Repos" icon={<Github size={20} className="text-violet-400" />} />
            <StatCard value="10+" label="Certifications" icon={<Award size={20} className="text-cyan-400" />} />
            <StatCard value="3+" label="AI Systems Built" icon={<Brain size={20} className="text-pink-400" />} />
            <StatCard value="5000+" label="Records Processed" icon={<Database size={20} className="text-amber-400" />} />
          </div>
        </section>

        {/* ── Projects ─────────────────────────────────────────────────────────── */}
        <section id="projects" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <SectionHeader label="// Featured Work" title="Projects" accent="text-violet-400" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {projects.map((p, i) => <ProjectCard key={p.title} project={p} i={i} />)}
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center mt-10">
              <motion.a href="https://github.com/IshaanVerma2204" target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(139,92,246,0.3)' }} whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-700 text-slate-300 hover:text-white hover:border-violet-500 transition-all text-sm font-medium">
                <Github size={16} /> View all repos on GitHub
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* ── Experience ───────────────────────────────────────────────────────── */}
        <section id="experience" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <SectionHeader label="// Where I've Worked" title="Experience" accent="text-cyan-400" />
            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-8">

              {/* Zetheta — current */}
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative">
                <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
                <div className="p-5 sm:p-7 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white">Full Stack Developer</h3>
                      <p className="text-violet-400 font-semibold mt-0.5">Zetheta Algorithms Private Limited</p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1 text-xs text-slate-400 shrink-0">
                      <div className="flex items-center gap-1.5"><Calendar size={12} /><span>Jul 2026 – Present</span></div>
                      <div className="flex items-center gap-1.5"><MapPin size={12} /><span>Remote</span></div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-700/40 text-xs font-medium">Currently Here</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-slate-400 text-sm">
                    {[
                      'Developed a production-style stock screener dashboard supporting 5,000+ simulated stocks with advanced search, filtering, sorting, pagination, and persistent watchlist management.',
                      'Built an interactive analytics dashboard featuring portfolio insights, market overview, sector allocation, and dynamic stock detail visualisations using Recharts.',
                      'Designed a responsive, component-driven architecture with Zustand for scalable state management and deployed on Vercel.',
                    ].map((point, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-violet-400 mt-0.5 shrink-0">▹</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {['React', 'Next.js', 'TypeScript', 'Zustand', 'Recharts', 'Tailwind CSS', 'Vercel'].map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-md text-xs text-slate-400 bg-slate-800/60 border border-slate-700/50">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* MPOnline — past */}
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
                <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-4 h-4 rounded-full border-2 border-slate-600 bg-slate-900" />
                <div className="p-5 sm:p-7 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white">Advanced Software Engineering & AI</h3>
                      <p className="text-cyan-400 font-semibold mt-0.5">MPOnline Private Limited</p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1 text-xs text-slate-400 shrink-0">
                      <div className="flex items-center gap-1.5"><Calendar size={12} /><span>May 2026 – Aug 2026</span></div>
                      <div className="flex items-center gap-1.5"><MapPin size={12} /><span>Remote</span></div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/40 text-xs font-medium">Internship</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-slate-400 text-sm">
                    {[
                      'Worked on advanced software engineering practices and AI-driven application development within an enterprise environment.',
                      'Gained hands-on experience with AI foundations, system design, and production-grade software delivery pipelines.',
                    ].map((point, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-cyan-400 mt-0.5 shrink-0">▹</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {['AI Engineering', 'Software Engineering', 'System Design', 'Python'].map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-md text-xs text-slate-400 bg-slate-800/60 border border-slate-700/50">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── Skills ───────────────────────────────────────────────────────────── */}
        <section id="skills" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <SectionHeader label="// My Arsenal" title="Skills" accent="text-pink-400" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              {Object.entries(skills).map(([category, items], ci) => (
                <motion.div key={category} initial={{ opacity: 0, x: ci % 2 === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: ci * 0.1 }}
                  className="p-5 sm:p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-300 tracking-widest uppercase mb-4 sm:mb-5">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map(skill => <SkillBadge key={skill} label={skill} color={skillColors[category]} />)}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Education & Certifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mt-8 sm:mt-12">

              {/* Education */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="p-5 sm:p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2 mb-5">
                  <GraduationCap size={18} className="text-cyan-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-300 tracking-widest uppercase">Education</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-bold text-white text-sm">Vellore Institute of Technology</p>
                    <p className="text-xs text-slate-400 mt-0.5">B.Tech Computer Science & Engineering</p>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-xs text-slate-500">Sept 2023 – Jan 2027</span>
                      <span className="text-xs font-bold text-cyan-400">GPA: 8.91</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-800 pt-4">
                    <p className="font-semibold text-white text-sm">Apeejay School, Panchsheel Park</p>
                    <p className="text-xs text-slate-400 mt-0.5">New Delhi, India</p>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-slate-400">Class 12 Boards</span>
                      <span className="text-xs font-bold text-violet-400">92%</span>
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-xs text-slate-400">Class 10 Boards</span>
                      <span className="text-xs font-bold text-violet-400">92.5%</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Certifications */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
                className="p-5 sm:p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2 mb-5">
                  <Award size={18} className="text-amber-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-300 tracking-widest uppercase">Certifications</h3>
                </div>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {certs.map((cert, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="p-3 rounded-xl" style={{ background: cert.bg, border: `1px solid ${cert.border}` }}>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-white text-xs leading-tight">{cert.name}</p>
                          <p className={`text-xs mt-0.5 ${cert.color}`}>{cert.sub}</p>
                        </div>
                        {cert.score
                          ? <span className={`text-sm font-black ${cert.color} shrink-0`}>{cert.score}</span>
                          : <span className="text-xs font-medium text-slate-500 shrink-0 px-2 py-0.5 rounded-full border border-slate-700">verified</span>
                        }
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Contact ───────────────────────────────────────────────────────────── */}
        <section id="contact" className="py-16 sm:py-32 px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl mx-auto text-center rounded-2xl sm:rounded-3xl p-8 sm:p-12 relative overflow-hidden"
            style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-cyan-600/10 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-violet-600/20 blur-[80px]" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-cyan-600/20 blur-[80px]" />
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: 'linear' }} className="inline-block mb-5 text-violet-400">
                <Sparkles size={32} />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-3 sm:mb-4">
                Let's Build Something{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Remarkable</span>
              </h2>
              <p className="text-slate-400 mb-4 text-base sm:text-lg">Open to opportunities, collaborations, and interesting conversations.</p>
              <p className="text-slate-500 text-sm mb-8">📱 +91 9811540193 · 📧 ishaan.verma2003@gmail.com</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.a href="mailto:ishaan.verma2003@gmail.com"
                  whileHover={{ scale: 1.06, boxShadow: '0 0 50px rgba(139,92,246,0.5)' }} whileTap={{ scale: 0.94 }}
                  className="inline-flex items-center justify-center gap-3 px-7 sm:px-8 py-4 rounded-full text-white font-bold text-base sm:text-lg bg-gradient-to-r from-violet-600 to-cyan-600">
                  <Mail size={20} /> Say Hello
                </motion.a>
                <motion.a href="https://github.com/IshaanVerma2204" target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.06, boxShadow: '0 0 30px rgba(139,92,246,0.3)' }} whileTap={{ scale: 0.94 }}
                  className="inline-flex items-center justify-center gap-3 px-7 sm:px-8 py-4 rounded-full text-white font-bold text-base border border-slate-700 hover:border-violet-500 transition-colors">
                  <Github size={20} /> GitHub
                </motion.a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 sm:py-8 text-slate-600 text-xs sm:text-sm border-t border-slate-800/50 px-4">
          Crafted with 💜 by <span className="text-slate-400">Ishaan Verma</span> · React & Framer Motion · {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}
