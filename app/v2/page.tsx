"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { person, projects, skills, stats } from "@/lib/resume";

import "./v2.module.css";

const faqs: [string, string][] = [
  [
    "What is your primary stack?",
    "Python backend development — FastAPI, Django, Flask — with PostgreSQL, Docker, and cloud deployments on Google Cloud (Cloud Run, Secret Manager), AWS, and Azure. Six years of building scalable, cloud-native backend systems and REST APIs, with strong system design, LLD, and DSA fundamentals."
  ],
  [
    "What are you building at UKG right now?",
    "As a Senior Software Engineer I architect backend services and the agentic-AI platform behind UKG's enterprise workforce-management products — an extensibility platform of Agents, Skills, Scripts, Commands, and Hooks that cut workflow creation time by ~60%, serving 1,000+ enterprise customers at 99.9% uptime on Google Cloud Run."
  ],
  [
    "What did you do before AI platforms?",
    "At Ingenuity Gaming I built high-performance slot-game engines in Python from client math specs — 12+ live titles for Light & Wonder, AvatarUX, Rogue, and Reel Play, hardened with 10M+ simulated spins. Before that, at EZOPS I automated financial data reconciliation and ETL for Wells Fargo, BNY Mellon, and SEI, and shipped ARO Pypeline, a no-code data-transformation tool."
  ],
  [
    "How do I reach you?",
    `Email ${person.email}, or find me on GitHub (@${person.handles.github}), LinkedIn (${person.handles.linkedin}), and CodeChef (highest rating 1758). Based in ${person.location}.`
  ]
];

export default function V2Page() {
  const topSkills = useMemo(() => skills.filter((skill) => skill.weight === 3).slice(0, 18), []);
  const marquee = useMemo(() => [
    "Agentic AI",
    "Python",
    "FastAPI",
    "REST APIs",
    "Google Cloud Run",
    "PostgreSQL",
    "Docker",
    "System design",
    "Distributed systems",
    "Generative AI",
  ], []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Define textures/logos fallback for WebGL particles organism
    (window as any).__resources = {
      claudeLogo: "https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/claudecode-color.png",
      envelope: "https://cdn-icons-png.flaticon.com/512/561/561127.png",
      pen: "https://cdn-icons-png.flaticon.com/512/1250/1250615.png",
      invoice: "https://cdn-icons-png.flaticon.com/512/1041/1041857.png"
    };

    // Shared scope references for the centralized animation loop
    let active = true;
    let marquees: any[] = [];
    let pcanvas: any[] = [];
    let colliders: any[] = [];
    let organisms: any[] = [];
    let orgIvs: any[] = [];
    let loopRAF: number | null = null;
    let preloaderInterval: any = null;

    // Matter.js references
    let physEngine: any = null;
    let physReady = false;
    let physBox: HTMLElement | null = null;
    let physWalls: any[] = [];
    let physItems: any[] = [];
    let MatterLib: any = null;

    // Cursor coordinates
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = cx;
    let ty = cy;
    let cursorShown = false;

    // Scroll tracking
    let lastScrollY = window.scrollY;
    let vel = 0;

    const _waitFor = (fn: () => any, ms: number) => {
      return new Promise<any>((resolve) => {
        const t0 = Date.now();
        (function poll() {
          const v = fn();
          if (v) return resolve(v);
          if (Date.now() - t0 > ms) return resolve(null);
          setTimeout(poll, 100);
        })();
      });
    };

    // 1. Script Loader helper
    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
        if (script) {
          if (script.getAttribute("data-loaded") === "true") {
            resolve();
          } else {
            script.addEventListener("load", () => resolve());
            script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
          }
          return;
        }
        script = document.createElement("script");
        script.src = src;
        script.async = false; // Ensure sequential execution
        script.onload = () => {
          script.setAttribute("data-loaded", "true");
          resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
      });
    };

    // Sequential load of visual scripts
    const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
    (window as any).__csBase = BASE; // mascot.js uses this for /play links
    const loadScriptsAndInit = async () => {
      try {
        await loadScript(BASE + "/v2/js/lenis.js");
        await loadScript(BASE + "/v2/js/matter.js");
        await loadScript(BASE + "/v2/js/three.js");
        await loadScript(BASE + "/v2/js/organism.js");
        await loadScript(BASE + "/v2/js/mascot.js");

        if (!active) return;

        // Initialize libraries once scripts have completed loading
        initLenis();
        initOrganism();
        initPhysics();
      } catch (err) {
        console.error("Error loading visual dependencies:", err);
      }
    };

    // 2. Initialize Lenis Scroll global
    const initLenis = () => {
      try {
        if ((window as any).Lenis) {
          const lx = new (window as any).Lenis({ lerp: 0.14, smoothWheel: true });
          (window as any).__lenis = lx;
        }
      } catch (e) {}
    };

    // 3. Preloader Progress Number Ticker
    const initPreloader = () => {
      const pre = document.getElementById("cs-pre");
      const num = document.getElementById("cs-prenum");
      if (!pre) return;
      let v = 0;
      preloaderInterval = setInterval(() => {
        v += 4 + Math.random() * 7;
        if (v >= 100) {
          v = 100;
          clearInterval(preloaderInterval);
          if (num) num.textContent = "100";
          setTimeout(() => {
            pre.style.transition = "transform .75s cubic-bezier(.76,0,.24,1)";
            pre.style.transform = "translateY(-101%)";
            setTimeout(() => {
              pre.style.display = "none";
            }, 780);
          }, 220);
        } else {
          if (num) num.textContent = Math.round(v).toString().padStart(3, "0");
        }
      }, 32);
    };

    // 4. Cursor spotlight & hover labels mouse listeners
    const initCursor = () => {
      const c = document.getElementById("cs-cursor") as HTMLElement;
      if (!c) return () => {};

      const handleMove = (e: MouseEvent) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!cursorShown) {
          cursorShown = true;
          c.style.opacity = "1";
        }
      };
      window.addEventListener("mousemove", handleMove, { passive: true });

      const lbl = document.getElementById("cs-cursor-label") as HTMLElement;
      const setMode = (mode: string, text: string) => {
        if (mode === "label") {
          if (lbl) {
            lbl.textContent = text;
            lbl.style.opacity = "1";
            lbl.style.transform = "scale(1)";
          }
          c.style.height = "38px";
          c.style.minWidth = "38px";
          c.style.padding = "0 16px";
          c.style.background = "var(--ink)";
          c.style.borderRadius = "100px";
          c.style.boxShadow = "none";
        } else if (mode === "ring") {
          if (lbl) {
            lbl.style.opacity = "0";
            lbl.style.transform = "scale(.6)";
            lbl.textContent = "";
          }
          c.style.height = "46px";
          c.style.minWidth = "46px";
          c.style.padding = "0";
          c.style.background = "transparent";
          c.style.borderRadius = "50%";
          c.style.boxShadow = "0 0 0 1.5px rgba(255,244,141,.85)";
        } else {
          if (lbl) {
            lbl.style.opacity = "0";
            lbl.style.transform = "scale(.6)";
            lbl.textContent = "";
          }
          c.style.height = "12px";
          c.style.minWidth = "12px";
          c.style.padding = "0";
          c.style.background = "var(--ink)";
          c.style.borderRadius = "50%";
          c.style.boxShadow = "0 0 0 1.5px rgba(255,244,141,.85)";
        }
      };

      const HOT = "a, button, [data-bouncy], [data-faq-q], [data-item], [data-cursor-label], .cs-ai-mascot, .cs-chat__pill, .cs-worker-card, .cs-nav-pet, .cs-guide-skip, .cs-sound-chip";
      let cursorHot: HTMLElement | null = null;

      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const hot = target.closest ? (target.closest(HOT) as HTMLElement) : null;
        if (hot === cursorHot) return;
        cursorHot = hot;
        if (hot) {
          const labelled = hot.closest("[data-cursor-label]");
          if (labelled) {
            setMode("label", labelled.getAttribute("data-cursor-label") || "");
          } else if (hot.closest(".cs-ai-mascot")) {
            setMode("label", "talk");
          } else if (hot.closest(".cs-nav-pet")) {
            setMode("label", "restyle");
          } else if (hot.closest("[data-item]")) {
            setMode("label", "view");
          } else if (hot.closest("[data-faq-q]")) {
            setMode("label", "open");
          } else {
            const href = hot.getAttribute("href") || "";
            if (/contact|quote/i.test(href)) {
              setMode("label", "let's talk");
            } else {
              setMode("ring", "");
            }
          }
        } else {
          setMode("dot", "");
        }
      };
      document.addEventListener("mouseover", handleMouseOver, { passive: true });
    };

    // 5. Magnetic Hover Button Effects
    const initMagnetic = () => {
      document.querySelectorAll("[data-bouncy]").forEach((el) => {
        const htmlEl = el as HTMLElement;
        el.addEventListener("mousemove", (e) => {
          const me = e as MouseEvent;
          const r = el.getBoundingClientRect();
          if (r.width > 520) return;
          htmlEl.style.transition = "transform .15s ease-out";
          htmlEl.style.transform =
            (htmlEl.dataset.baseTf || "") +
            " translate(" +
            ((me.clientX - (r.left + r.width / 2)) * 0.18).toFixed(1) +
            "px," +
            ((me.clientY - (r.top + r.height / 2)) * 0.28).toFixed(1) +
            "px)";
        });
        el.addEventListener("mouseleave", () => {
          htmlEl.style.transition = "transform .55s cubic-bezier(.34,1.56,.64,1)";
          htmlEl.style.transform = "";
        });
      });
    };

    // 6. Infinite Loop Marquee Easing Setup
    const initMarquee = () => {
      document.querySelectorAll("[data-marq]").forEach((track) => {
        const htmlTrack = track as HTMLElement;
        marquees.push({
          track: htmlTrack,
          off: 0,
          speed: parseFloat(htmlTrack.getAttribute("data-speed") || "1") || 1,
          half: htmlTrack.scrollWidth / 2,
        });
      });
    };

    // 7. Background Canvas Particles Network Setup
    const initParticles = () => {
      document.querySelectorAll("canvas[data-particles]").forEach((cv) => {
        const htmlCv = cv as HTMLCanvasElement;
        pcanvas.push({ cv: htmlCv, ctx: htmlCv.getContext("2d"), w: 0, h: 0, dpr: 1, pts: null });
      });

      const sizeParticles = () => {
        pcanvas.forEach((p) => {
          const r = p.cv.getBoundingClientRect();
          const w = Math.max(1, Math.round(r.width));
          const h = Math.max(1, Math.round(r.height));
          if (w === p.w && h === p.h) return;
          p.w = w;
          p.h = h;
          p.dpr = Math.min(2, window.devicePixelRatio || 1);
          p.cv.width = w * p.dpr;
          p.cv.height = h * p.dpr;
          p.ctx.setTransform(p.dpr, 0, 0, p.dpr, 0, 0);
          const n = Math.max(14, Math.min(58, Math.round((w * h) / 16000)));
          p.pts = [];
          for (let i = 0; i < n; i++) {
            p.pts.push({
              x: Math.random() * w,
              y: Math.random() * h,
              vx: (Math.random() - 0.5) * 0.32,
              vy: (Math.random() - 0.5) * 0.32,
            });
          }
        });
      };

      sizeParticles();
      window.addEventListener("resize", sizeParticles);
    };

    // 8. 2D Background Canvas Draw Ticker
    const drawParticles = () => {
      const vh = window.innerHeight;
      pcanvas.forEach((p) => {
        if (p.w < 2 || !p.pts || !p.ctx) return;
        const r = p.cv.getBoundingClientRect();
        if (r.bottom < -60 || r.top > vh + 60) return;
        const ctx = p.ctx;
        const w = p.w;
        const h = p.h;
        const pts = p.pts;
        const D = 118;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < 0) a.x += w;
          else if (a.x > w) a.x -= w;
          if (a.y < 0) a.y += h;
          else if (a.y > h) a.y -= h;
        }
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const a = pts[i];
            const b = pts[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < D) {
              ctx.strokeStyle = "rgba(255,244,141," + ((1 - d / D) * 0.16).toFixed(3) + ")";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
        ctx.fillStyle = "rgba(255,244,141,0.65)";
        for (let i = 0; i < pts.length; i++) {
          ctx.beginPath();
          ctx.arc(pts[i].x, pts[i].y, 1.5, 0, 6.283);
          ctx.fill();
        }
      });
    };

    // 9. Three.js dynamic particle organism initialization
    const initOrganism = async () => {
      const els = document.querySelectorAll('[data-organism]');
      if (!els.length) return;
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const mobile = window.innerWidth < 760;
      try {
        const RES = (window as any).__resources || {};
        const FALLBACK: any = {
          claudeLogo: 'https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/claudecode-color.png',
          envelope: 'https://cdn-icons-png.flaticon.com/512/561/561127.png',
          invoice: 'https://cdn-icons-png.flaticon.com/512/1041/1041857.png',
          pen: 'https://cdn-icons-png.flaticon.com/512/1250/1250615.png'
        };
        const resolve = (s: string | null) => {
          if (!s || s === 'organic') return null;
          s = s.trim();
          if (s.indexOf('img:@') === 0) {
            const id = s.slice(5);
            return 'img:' + (RES[id] || FALLBACK[id] || '');
          }
          return s;
        };
        const create = await _waitFor(() => (window as any).createOrganism, 6000);
        if (!create || !active) return;
        
        const tokStyle = window.getComputedStyle(document.documentElement);
        const tok = (n: string, fb: string) => (tokStyle.getPropertyValue(n) || '').trim() || fb;
        const CS_ORG = {
          a: tok('--org-a', '#3a3a22'),
          b: tok('--org-b', '#131309'),
          ga: tok('--org-glow-a', '#d8dfae'),
          gb: tok('--org-glow-b', '#FFF48D')
        };

        els.forEach(c => {
          const htmlC = c as HTMLElement;
          const variant = c.getAttribute('data-org-variant') || 'ink';
          const cfg: any = variant === 'glow'
            ? { blending: 'additive', background: null, colorA: CS_ORG.ga, colorB: CS_ORG.gb, alpha: 1 }
            : { blending: 'normal', background: null, colorA: CS_ORG.a, colorB: CS_ORG.b, alpha: 2.4 };
          cfg.count = mobile ? 8000 : (parseInt(c.getAttribute('data-org-count') || '', 10) || 18000);
          cfg.freq = 1.6; cfg.amp = 0.34; cfg.speed = 1.0; cfg.rotation = 0.05; cfg.dprMax = 1.6;
          const org = create(c, cfg);
          org.__csVariant = variant;
          organisms.push(org);
          (htmlC as any).__csOrg = org;
          (window as any).__csOrganisms = (window as any).__csOrganisms || [];
          (window as any).__csOrganisms.push(org);
          
          const orgIO = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
              const targetOrg = (en.target as any).__csOrg;
              if (!targetOrg) return;
              if (en.isIntersecting) { if (targetOrg.resume) targetOrg.resume(); }
              else if (targetOrg.pause) { targetOrg.pause(); }
            });
          }, { rootMargin: '140px' });
          orgIO.observe(c);

          const shape = mobile ? (c.getAttribute('data-org-mobile-shape') || c.getAttribute('data-org-shape')) : c.getAttribute('data-org-shape');
          if (shape) org.setShape(resolve(shape));
          const cycle = mobile ? (c.getAttribute('data-org-mobile-cycle') || c.getAttribute('data-org-cycle')) : c.getAttribute('data-org-cycle');
          if (cycle && !reduce) {
            const shapes = cycle.split(',').map(resolve);
            let i = 0;
            orgIvs.push(setInterval(() => {
              i = (i + 1) % shapes.length;
              org.setShape(shapes[i]);
            }, 4200));
          }
        });
      } catch (e) { console.warn('[organism] init failed', e); }
    };

    // 10. Matter.js Physics Engine setup
    const initPhysics = () => {
      const box = document.getElementById('cs-physics-box');
      if (!box) return;
      const M = (window as any).Matter;
      if (!M) {
        setTimeout(() => initPhysics(), 120);
        return;
      }
      MatterLib = M;
      physBox = box;
      const W = box.clientWidth;
      const H = box.clientHeight;
      const engine = M.Engine.create();
      engine.gravity.y = 1;
      physEngine = engine;
      const world = engine.world;
      const wo = { isStatic: true, render: { visible: false } };
      const t = 220;
      physWalls = [
        M.Bodies.rectangle(W / 2, H + t / 2, W + t * 2, t, wo),
        M.Bodies.rectangle(-t / 2, H / 2, t, H * 3, wo),
        M.Bodies.rectangle(W + t / 2, H / 2, t, H * 3, wo),
        M.Bodies.rectangle(W / 2, -t / 2 - H, W + t * 2, t, wo)
      ];
      M.World.add(world, physWalls);
      
      const pills = box.querySelectorAll('[data-pill]');
      physItems = [];
      pills.forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        const w = htmlEl.offsetWidth;
        const h = htmlEl.offsetHeight;
        const x = 70 + Math.random() * Math.max(1, W - 140);
        const y = -70 - i * 66 - Math.random() * 30;
        const body = M.Bodies.rectangle(x, y, w, h, { restitution: .45, friction: .35, frictionAir: .012, chamfer: { radius: h / 2 } });
        M.Body.setAngularVelocity(body, (Math.random() - .5) * .06);
        M.World.add(world, body);
        physItems.push({ el: htmlEl, body: body, w: w, h: h });
      });
      
      const mouse = M.Mouse.create(box);
      mouse.pixelRatio = window.devicePixelRatio || 1;
      if (mouse.mousewheel) {
        mouse.element.removeEventListener('wheel', mouse.mousewheel);
        mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
      }
      const mc = M.MouseConstraint.create(engine, { mouse: mouse, constraint: { stiffness: .2, render: { visible: false } } });
      M.World.add(world, mc);
      physReady = true;
    };

    const sizePhysics = () => {
      if (!physReady || !physBox || !MatterLib) return;
      const M = MatterLib;
      const W = physBox.clientWidth;
      const H = physBox.clientHeight;
      const t = 220;
      const wl = physWalls;
      M.Body.setPosition(wl[0], { x: W / 2, y: H + t / 2 });
      M.Body.setPosition(wl[1], { x: -t / 2, y: H / 2 });
      M.Body.setPosition(wl[2], { x: W + t / 2, y: H / 2 });
      M.Body.setPosition(wl[3], { x: W / 2, y: -t / 2 - H });
    };

    // 11. Footer Float Colliders
    const initColliders = () => {
      const sec = document.getElementById('contact');
      if (!sec) return;
      const W = sec.clientWidth;
      const H = sec.clientHeight;
      const els = sec.querySelectorAll('[data-collider]');
      colliders = Array.prototype.slice.call(els).map((el, i) => ({
        el: el as HTMLElement,
        x: W * (0.55 + (Math.random() - 0.5) * 0.2),
        y: H * (0.35 + Math.random() * 0.25),
        vx: i ? -1.5 : 1.5,
        vy: i ? 1.2 : -1.1,
        r: 29,
        init: true
      }));
    };

    const stepColliders = () => {
      const sec = document.getElementById('contact');
      if (!sec || !colliders.length) return;
      const r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const W = sec.clientWidth;
      const H = sec.clientHeight;
      colliders.forEach(c => {
        c.x += c.vx; c.y += c.vy;
        if (c.x < c.r) { c.x = c.r; c.vx = Math.abs(c.vx); }
        else if (c.x > W - c.r) { c.x = W - c.r; c.vx = -Math.abs(c.vx); }
        if (c.y < c.r) { c.y = c.r; c.vy = Math.abs(c.vy); }
        else if (c.y > H - c.r) { c.y = H - c.r; c.vy = -Math.abs(c.vy); }
      });
      for (let i = 0; i < colliders.length; i++) {
        for (let j = i + 1; j < colliders.length; j++) {
          const a = colliders[i];
          const b = colliders[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          const min = a.r + b.r;
          if (d < min) {
            const nx = dx / d;
            const ny = dy / d;
            const ov = (min - d) / 2;
            a.x -= nx * ov; a.y -= ny * ov;
            b.x += nx * ov; b.y += ny * ov;
            const avn = a.vx * nx + a.vy * ny;
            const bvn = b.vx * nx + b.vy * ny;
            a.vx += (bvn - avn) * nx; a.vy += (bvn - avn) * ny;
            b.vx += (avn - bvn) * nx; b.vy += (avn - bvn) * ny;
          }
        }
      }
      colliders.forEach(c => {
        c.el.style.transform = `translate(${(c.x - c.r).toFixed(1)}px, ${(c.y - c.r).toFixed(1)}px)`;
      });
    };

    // 12. Selected Work Showcase
    const initShowcase = () => {
      const rows = document.querySelectorAll("[data-show]");
      const items = document.querySelectorAll("[data-item]");
      if (!rows.length || !items.length) return;
      const setActive = (index: number) => {
        items.forEach((it) => {
          const htmlIt = it as HTMLElement;
          const on = parseInt(it.getAttribute("data-item") || "0", 10) === index;
          htmlIt.style.opacity = on ? "1" : "0";
          htmlIt.style.transform = on ? "scale(1)" : "scale(1.04)";
        });
      };
      rows.forEach((row) => {
        const htmlRow = row as HTMLElement;
        const i = parseInt(row.getAttribute("data-show") || "0", 10);
        const fill = row.querySelector("[data-fill]") as HTMLElement;
        const arrow = row.querySelector("[data-arrow]") as HTMLElement;
        row.addEventListener("mouseenter", () => {
          if (fill) {
            fill.style.transformOrigin = "left center";
            fill.style.transform = "scaleX(1)";
          }
          htmlRow.style.background = "var(--ink)";
          htmlRow.style.color = "var(--accent)";
          if (arrow) {
            arrow.style.opacity = "1";
            arrow.style.transform = "translate(0,0)";
          }
          setActive(i);
        });
        row.addEventListener("mouseleave", () => {
          if (fill) {
            fill.style.transformOrigin = "right center";
            fill.style.transform = "scaleX(0)";
          }
          htmlRow.style.background = "transparent";
          htmlRow.style.color = "var(--ink)";
          if (arrow) {
            arrow.style.opacity = "0";
            arrow.style.transform = "translate(-6px,6px)";
          }
        });
      });
      setActive(0);
    };

    // 13. FAQ Accordion Click Handler
    const initFAQ = () => {
      document.querySelectorAll("[data-faq]").forEach((item) => {
        const q = item.querySelector("[data-faq-q]") as HTMLElement;
        const a = item.querySelector("[data-faq-a]") as HTMLElement;
        const ic = item.querySelector("[data-faq-ic]") as HTMLElement;
        if (!q || !a) return;
        a.style.overflow = "hidden";
        a.style.maxHeight = "0px";
        a.style.opacity = "0";
        a.style.transition = "max-height .55s cubic-bezier(.16,1,.3,1),opacity .4s ease,margin .4s ease";
        a.setAttribute("aria-hidden", "true");
        q.setAttribute("role", "button");
        q.tabIndex = 0;
        q.setAttribute("aria-expanded", "false");
        q.addEventListener("click", () => {
          const open = item.getAttribute("data-open") === "1";
          if (open) {
            a.style.maxHeight = "0px";
            a.style.opacity = "0";
            a.style.marginTop = "0px";
            item.setAttribute("data-open", "0");
            q.setAttribute("aria-expanded", "false");
            a.setAttribute("aria-hidden", "true");
            if (ic) ic.style.transform = "rotate(0deg)";
          } else {
            a.style.maxHeight = a.scrollHeight + 40 + "px";
            a.style.opacity = "1";
            a.style.marginTop = "16px";
            item.setAttribute("data-open", "1");
            q.setAttribute("aria-expanded", "true");
            a.setAttribute("aria-hidden", "false");
            if (ic) ic.style.transform = "rotate(135deg)";
          }
        });
      });
    };

    // 14. Scroll depth progress tracking & stack scaling
    const initScrollDepth = () => {
      const handleScroll = () => {
        if (!active) return;
        const y = window.scrollY || window.pageYOffset || 0;
        vel += y - lastScrollY;
        vel = Math.max(-70, Math.min(70, vel));
        lastScrollY = y;

        const vh = window.innerHeight;
        const pb = document.getElementById("cs-progress");
        const hHeight = document.documentElement.scrollHeight - vh || 1;
        const ratio = Math.max(0, Math.min(1, y / hHeight));
        if (pb) pb.style.transform = "scaleX(" + ratio.toFixed(4) + ")";

        const nav = document.getElementById("cs-nav");
        if (nav) {
          const s = y > 30;
          nav.style.background = s ? "rgba(255, 244, 141, 0.9)" : "transparent";
          nav.style.backdropFilter = s ? "blur(8px)" : "none";
          nav.style.boxShadow = s ? "0 1px 0 rgba(14,14,12,.12)" : "none";
        }

        // Parallax updates
        document.querySelectorAll("[data-plx]").forEach((el) => {
          const htmlEl = el as HTMLElement;
          const sp = parseFloat(el.getAttribute("data-plx") || "0") || 0;
          if ((htmlEl as any)._plxBase == null) {
            const rr = el.getBoundingClientRect();
            (htmlEl as any)._plxBase = rr.top + y + rr.height / 2;
          }
          const shift = (((htmlEl as any)._plxBase - (y + vh / 2)) * sp).toFixed(1);
          const b = el.hasAttribute("data-plx-c") ? "translateY(-50%) " : "";
          htmlEl.style.transform = b + "translate3d(0," + shift + "px,0)";
        });

        // Sticky stack parallax
        const ph = document.getElementById("cs-phases");
        if (ph) {
          const panels = ph.querySelectorAll("[data-stack]");
          const top = ph.getBoundingClientRect().top + y;
          const within = y - top;
          panels.forEach((pnl, i) => {
            const htmlPnl = pnl as HTMLElement;
            const inner = pnl.firstElementChild as HTMLElement;
            if (i < panels.length - 1) {
              let p = (within - i * vh) / vh;
              p = Math.max(0, Math.min(1, p));
              const e = p * p;
              const eq = e.toFixed(3);
              if ((htmlPnl as any)._lastE !== eq) {
                (htmlPnl as any)._lastE = eq;
                if (inner) {
                  inner.style.transformOrigin = "center 40%";
                  inner.style.transform = "scale(" + (1 - 0.09 * e).toFixed(4) + ")";
                }
                htmlPnl.style.filter = "brightness(" + (1 - 0.32 * e).toFixed(3) + ")";
              }
            } else if (inner && (htmlPnl as any)._lastE !== "x") {
              (htmlPnl as any)._lastE = "x";
              inner.style.transform = "none";
              htmlPnl.style.filter = "none";
            }
          });
        }

        // Count reveal triggering
        document.querySelectorAll("[data-count]").forEach((el) => {
          const htmlEl = el as HTMLElement;
          if ((htmlEl as any)._counted) return;
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.88 && r.bottom > 0) {
            (htmlEl as any)._counted = true;
            const target = parseFloat(el.getAttribute("data-count") || "0");
            const dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
            const start = performance.now();
            const dur = 1400;
            const countStep = (t: number) => {
              let p = Math.min(1, (t - start) / dur);
              p = 1 - Math.pow(1 - p, 3);
              const v = target * p;
              el.textContent = dec ? v.toFixed(dec) : Math.round(v).toString();
              if (p < 1) requestAnimationFrame(countStep);
            };
            requestAnimationFrame(countStep);
          }
        });

        // Kinetic text filling
        document.querySelectorAll("[data-fillword]").forEach((el) => {
          const htmlEl = el as HTMLElement;
          const r = el.getBoundingClientRect();
          const filled = r.top < vh * 0.62 && r.bottom > 0;
          if ((htmlEl as any)._filled !== filled) {
            (htmlEl as any)._filled = filled;
            htmlEl.style.color = filled ? "var(--accent)" : "transparent";
            htmlEl.style.webkitTextStroke = filled ? "0px var(--accent)" : "1.6px var(--accent)";
          }
        });
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    };

    // 15. Reveal elements on scroll
    const initReveal = () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const htmlEl = entry.target as HTMLElement;
            const delay = htmlEl.getAttribute("data-reveal-delay") || "0";
            setTimeout(() => {
              htmlEl.style.opacity = "1";
              htmlEl.style.transform = htmlEl.style.transform.replace(/translateY\([^)]+\)/, "translateY(0)");
            }, parseInt(delay, 10));
            observer.unobserve(htmlEl);
          }
        });
      }, { rootMargin: "0px 0px -10% 0px" });

      document.querySelectorAll("[data-reveal]").forEach((el) => {
        observer.observe(el);
      });

      // Special handling for hero organism
      const heroOrg = document.getElementById("hero-organism");
      if (heroOrg) {
        setTimeout(() => { heroOrg.style.opacity = "1"; }, 300);
      }
    };

    // Centralized 60fps animation loop coordinating scrolling, skewing, floats, and physics engines
    const runLoop = (time: number) => {
      if (!active) return;

      try {
        // 1. Lenis Ticker
        if ((window as any).__lenis) {
          try { (window as any).__lenis.raf(time); } catch (e) {}
        }

        // 2. Scroll speed velocity decay
        vel *= 0.9;
        if (Math.abs(vel) < 0.02) vel = 0;

        // 3. Marquee skewing and translating
        const skew = Math.max(-5, Math.min(5, vel * 0.16));
        marquees.forEach((m) => {
          const half = m.half || m.track.scrollWidth / 2;
          m.off -= m.speed + Math.abs(vel) * 0.4;
          if (half > 0) {
            while (m.off <= -half) m.off += half;
          }
          m.track.style.transform = `translate3d(${m.off.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
        });

        // 4. Background Canvas Drawing
        drawParticles();

        // 5. Floating SVG Vectors update
        stepColliders();

        // 6. Matter.js engine physics ticking
        if (physReady && physEngine && MatterLib && physBox) {
          const r = physBox.getBoundingClientRect();
          const vh = window.innerHeight;
          if (r.bottom > -120 && r.top < vh + 120) {
            MatterLib.Engine.update(physEngine, 1000 / 60);
            for (let i = 0; i < physItems.length; i++) {
              const it = physItems[i];
              it.el.style.transform = `translate(${(it.body.position.x - it.w / 2).toFixed(1)}px, ${(it.body.position.y - it.h / 2).toFixed(1)}px) rotate(${it.body.angle.toFixed(3)}rad)`;
            }
          }
        }

        // 7. Cursor easing coordinates updating
        const c = document.getElementById("cs-cursor");
        const spot = document.getElementById("cs-spot");
        if (c) {
          cx += (tx - cx) * 0.22;
          cy += (ty - cy) * 0.22;
          const w = c.offsetWidth || 12;
          const h = c.offsetHeight || 12;
          c.style.transform = `translate3d(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px, 0)`;

          if (spot) {
            spot.style.transform = `translate3d(${(cx - 320).toFixed(1)}px, ${(cy - 320).toFixed(1)}px, 0)`;
            let over = false;
            const darkSecs = document.querySelectorAll("[data-dark]");
            for (let i = 0; i < darkSecs.length; i++) {
              const r = darkSecs[i].getBoundingClientRect();
              if (cy >= r.top && cy <= r.bottom && r.top < window.innerHeight && r.bottom > 0) {
                over = true;
                break;
              }
            }
            spot.style.opacity = over ? "1" : "0";
          }
        }
      } catch (e) {
        console.error("Error in runLoop:", e);
      }

      loopRAF = requestAnimationFrame(runLoop);
    };

    // Load scripts sequentially, then initialize organisms and physics engines
    loadScriptsAndInit();

    // Setup visual components
    initPreloader();
    initCursor();
    initMagnetic();
    initMarquee();
    initParticles();
    initColliders();
    initShowcase();
    initFAQ();
    initReveal();
    const cleanScroll = initScrollDepth();

    // Start animation loop
    loopRAF = requestAnimationFrame(runLoop);

    const handleResize = () => {
      sizePhysics();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup resources
    return () => {
      active = false;
      if (loopRAF) cancelAnimationFrame(loopRAF);
      if (preloaderInterval) clearInterval(preloaderInterval);
      orgIvs.forEach(iv => clearInterval(iv));
      window.removeEventListener("resize", handleResize);
      cleanScroll();
      
      // Cleanup WebGL organisms
      organisms.forEach(o => {
        try { o.destroy(); } catch (e) {}
      });
      
      // Cleanup Matter.js worlds
      if (physEngine && MatterLib) {
        try { MatterLib.World.clear(physEngine.world, false); MatterLib.Engine.clear(physEngine); } catch (e) {}
      }
    };
  }, []);

  return (
    <div id="cs-root" style={{ position: "relative", width: "100%", background: "var(--bg)" }}>
      {/* Google fonts for Bricolage and Geist Mono */}
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Geist+Mono:wght@100..900&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="/v2/css/mascot.css" />

      {/* Preloader Screen */}
      <div id="cs-pre" style={{ position: "fixed", inset: 0, zIndex: 2147482790, background: "var(--bg)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "clamp(64px,9vh,92px) 20px clamp(88px,13vh,130px)", color: "var(--ink)", fontFamily: "'Bricolage Grotesque',sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".18em", textTransform: "uppercase" }}>
          <span>ashutosh*</span>
          <span>Live session</span>
        </div>
        <div style={{ fontSize: "clamp(4rem,18vw,14rem)", fontWeight: 800, letterSpacing: "-.04em", lineHeight: .85 }}>
          <span id="cs-prenum">000</span>%
        </div>
      </div>

      {/* Progress timeline + custom cursor indicator */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "3px", zIndex: 200, background: "rgba(var(--ink-rgb),.1)" }}>
        <div id="cs-progress" style={{ height: "100%", background: "var(--ink)", transform: "scaleX(0)", transformOrigin: "0 50%" }}></div>
      </div>
      <div id="cs-cursor" style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "12px",
        minWidth: "12px",
        padding: 0,
        borderRadius: "100px",
        background: "var(--ink)",
        border: "2px solid var(--ink)",
        boxShadow: "0 0 0 1.5px rgba(255,244,141,.85)",
        color: "var(--accent)",
        zIndex: 2147483600,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: "'Geist Mono',monospace",
        fontSize: "11px",
        letterSpacing: ".08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        transition: "height .3s cubic-bezier(.16,1,.3,1),min-width .3s cubic-bezier(.16,1,.3,1),padding .3s cubic-bezier(.16,1,.3,1),background .3s ease,box-shadow .3s ease,border-radius .3s ease",
        willChange: "transform",
        opacity: 0
      }}>
        <span id="cs-cursor-label" style={{
          opacity: 0,
          transform: "scale(.6)",
          transition: "opacity .25s ease,transform .3s cubic-bezier(.16,1,.3,1)"
        }}></span>
      </div>

      <div id="cs-wipe" style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "var(--ink)",
        transform: "scaleY(0)",
        transformOrigin: "bottom",
        pointerEvents: "none"
      }}></div>

      <div id="cs-spot" style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "640px",
        height: "640px",
        borderRadius: "50%",
        background: "radial-gradient(circle,rgba(255,244,141,.16),rgba(255,244,141,.05) 40%,transparent 68%)",
        mixBlendMode: "screen",
        pointerEvents: "none",
        zIndex: 2,
        opacity: 0,
        transition: "opacity .5s ease",
        willChange: "transform"
      }}></div>

      {/* Global Grain overlays */}
      <div style={{ position: "fixed", inset: 0, zIndex: 9997, pointerEvents: "none", opacity: .05, mixBlendMode: "overlay", backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22140%22 height=%22140%22 filter=%22url(%23n)%22/></svg>')" }}></div>
      <div style={{ position: "fixed", inset: 0, zIndex: 9996, pointerEvents: "none", background: "radial-gradient(130% 100% at 50% 45%,transparent 55%,rgba(var(--ink-rgb),.18) 100%)" }}></div>

      {/* Nav */}
      <nav id="cs-nav" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 180, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px clamp(18px,4vw,44px)", transition: "background .4s ease,box-shadow .4s ease" }}>
        <a href="#top" style={{ textDecoration: "none", fontWeight: 800, fontSize: "22px", letterSpacing: "-.03em", color: "var(--ink)" }}>ashutosh<span style={{ color: "var(--ink)" }}>*</span></a>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px,2vw,30px)" }}>
          <a href="#work" style={{ textDecoration: "none", fontWeight: 600, fontSize: "15px", color: "var(--ink)" }}>Work</a>
          <a href="#faq" style={{ textDecoration: "none", fontWeight: 600, fontSize: "15px", color: "var(--ink)" }}>FAQ</a>
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/galaxy/`} style={{ textDecoration: "none", fontWeight: 600, fontSize: "15px", color: "var(--ink)" }}>Galaxy ↗</a>
          <a href={`mailto:${person.email}`} data-lead="" data-bouncy="" style={{ cursor: "none", textDecoration: "none", fontWeight: 700, fontSize: "15px", background: "var(--ink)", color: "var(--accent)", padding: "11px 20px", borderRadius: "100px", transition: "transform .4s cubic-bezier(.34,1.56,.64,1)" }}>Book a call →</a>
        </div>
      </nav>

      {/* Hero */}
      <header id="top" data-screen-label="Hero" style={{ position: "relative", minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px clamp(18px,4vw,44px) 60px", overflow: "hidden" }}>
        {/* living particle organism canvas loaded by Three.js */}
        <div id="hero-organism" data-organism="" data-org-birth="" data-org-variant="ink" data-org-count="15000" data-org-shape="text:SHIP" data-org-cycle="text:SHIP, organic, text:LIVE, organic" data-org-mobile-shape="organic" data-org-mobile-cycle="organic" data-plx="-0.04" data-plx-c="" style={{ position: "absolute", right: "clamp(0px,4vw,80px)", top: "50%", transform: "translateY(-50%)", width: "clamp(440px,60vw,940px)", height: "clamp(440px,60vw,940px)", zIndex: 1, pointerEvents: "none", opacity: 0, transition: "opacity 1.5s cubic-bezier(.16,1,.3,1) .25s" }}></div>
        
        <div data-plx="0.12" style={{ position: "absolute", right: "clamp(18px,6vw,90px)", top: "18%", width: "clamp(96px,12vw,150px)", height: "clamp(96px,12vw,150px)", zIndex: 3 }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: "38%", height: "38%", borderRadius: "50%", background: "var(--ink)" }}></span></div>
        </div>

        <div data-reveal="" style={{ opacity: 0, transform: "translateY(16px)", transition: "opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)", fontFamily: "'Geist Mono',monospace", fontSize: "13px", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: "clamp(20px,3vw,34px)", display: "flex", alignItems: "center", gap: "12px" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "var(--ink)", animation: "cs-blink 1.5s step-end infinite" }}></span><span data-scramble="">{person.title} — Python backend · agentic AI · 6 yrs</span></div>

        <h1 style={{ position: "relative", zIndex: 2, margin: 0, fontWeight: 700, fontSize: "clamp(3rem,11vw,11rem)", lineHeight: .9, letterSpacing: "-.045em", maxWidth: "14ch" }}>
          <span style={{ display: "block", overflow: "visible" }}><span data-reveal="" data-reveal-delay="40" style={{ display: "block", opacity: 0, transform: "translateY(38px)", transition: "opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)" }}>AI that</span></span>
          <span style={{ display: "block", overflow: "visible" }}><span data-reveal="" data-reveal-delay="120" style={{ display: "block", opacity: 0, transform: "translateY(38px)", transition: "opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)" }}>actually</span></span>
          <span style={{ display: "block", overflow: "visible" }}><span data-reveal="" data-reveal-delay="200" style={{ display: "inline-block", position: "relative", opacity: 0, transform: "translateY(38px)", transition: "opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)" }}>ships.<svg viewBox="0 0 320 120" preserveAspectRatio="none" style={{ position: "absolute", left: "-6%", top: "-8%", width: "112%", height: "116%", overflow: "visible", pointerEvents: "none" }}><path data-draw="" pathLength="1" d="M30 64 C70 18 250 14 300 52 C322 70 300 104 180 110 C70 116 6 96 14 62 C20 36 70 26 120 26" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round"></path></svg></span></span>
        </h1>

        <div data-reveal="" data-reveal-delay="300" style={{ position: "relative", zIndex: 2, opacity: 0, transform: "translateY(18px)", transition: "opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)", display: "flex", alignItems: "center", gap: "clamp(20px,3vw,40px)", flexWrap: "wrap", marginTop: "clamp(32px,5vw,56px)" }}>
          <a href={`mailto:${person.email}`} data-lead="" data-bouncy="" style={{ cursor: "none", display: "inline-flex", alignItems: "center", gap: "10px", background: "var(--ink)", color: "var(--accent)", textDecoration: "none", fontWeight: 700, fontSize: "clamp(15px,1.3vw,18px)", padding: "18px 32px", borderRadius: "100px", transition: "transform .45s cubic-bezier(.34,1.56,.64,1)" }}>Book a call →</a>
          <span style={{ maxWidth: "400px", fontSize: "clamp(15px,1.2vw,17px)", lineHeight: 1.5, fontWeight: 500 }}>{person.intro}</span>
        </div>
      </header>

      {/* Marquee Speed Track */}
      <div style={{ background: "var(--ink)", color: "var(--accent)", overflow: "hidden", padding: "18px 0", borderTop: "3px solid var(--ink)" }}>
        <div data-marq="" data-speed="1.1" style={{ display: "flex", whiteSpace: "nowrap", willChange: "transform", fontWeight: 700, fontSize: "clamp(1.4rem,3vw,2.4rem)", letterSpacing: "-.02em" }}>
          {marquee.map((item, idx) => (
            <span key={idx} style={{ padding: "0 .4em" }}>{item} ✦</span>
          ))}
          {marquee.map((item, idx) => (
            <span key={idx + marquee.length} style={{ padding: "0 .4em" }}>{item} ✦</span>
          ))}
        </div>
      </div>

      {/* What we do */}
      <section id="work" data-screen-label="What we do" style={{ background: "var(--paper)", padding: "clamp(60px,9vw,140px) clamp(18px,4vw,44px)", overflow: "hidden" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.35fr) minmax(0,1fr)", gap: "clamp(28px,5vw,80px)", alignItems: "end", marginBottom: "clamp(40px,5vw,72px)" }}>
            <div data-reveal="" style={{ opacity: 0, transform: "translateY(26px)", transition: "opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)" }}>
              <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "13px", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: "22px", display: "flex", alignItems: "center", gap: "10px" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "var(--ink)" }}></span><span data-scramble="">What I do</span></div>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: "clamp(2.2rem,5.8vw,5.2rem)", lineHeight: .94, letterSpacing: "-.035em" }}>I don't just<br />ship
                <span style={{ position: "relative", display: "inline-flex", flexDirection: "column", height: ".94em", overflow: "hidden", verticalAlign: "bottom" }}>
                  <span style={{ display: "flex", flexDirection: "column", animation: "cs-rotword 6.5s cubic-bezier(.76,0,.24,1) infinite" }}>
                    <span style={{ lineHeight: ".94em", color: "var(--ink)" }}>APIs.</span>
                    <span style={{ lineHeight: ".94em", color: "var(--ink)" }}>scripts.</span>
                    <span style={{ lineHeight: ".94em", color: "var(--ink)" }}>demos.</span>
                    <span style={{ lineHeight: ".94em", color: "var(--ink)" }}>APIs.</span>
                  </span>
                  <svg viewBox="0 0 240 40" preserveAspectRatio="none" style={{ position: "absolute", left: 0, bottom: "-6px", width: "100%", height: "22px", overflow: "visible" }}><path data-draw="" pathLength="1" d="M6 22 C70 8 170 8 234 18" fill="none" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round"></path></svg>
                </span>
              </h2>
            </div>
            <div data-reveal="" data-reveal-delay="120" style={{ opacity: 0, transform: "translateY(26px)", transition: "opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)" }}>
              <p style={{ margin: "0 0 20px", fontSize: "clamp(16px,1.3vw,19px)", lineHeight: 1.5, fontWeight: 600, color: "var(--ink)" }}>{person.summary}</p>
              <div style={{ display: "flex", gap: "22px", flexWrap: "wrap", fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-soft)" }}>
                <span>◆ AI &amp; Agentic platforms</span><span>◆ FastAPI backends</span><span>◆ Game &amp; data engines</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stickystack phases */}
      <section id="cs-phases" style={{ position: "relative", background: "var(--ink)" }}>
        {/* PHASE 01 */}
        <div data-stack="" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", borderRadius: "36px 36px 0 0", background: "var(--ink)", color: "var(--accent)" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center" }}>
            <div aria-hidden="true" style={{ position: "absolute", right: "-3%", bottom: "-14%", fontWeight: 700, fontSize: "min(52vw,64vh)", lineHeight: .7, letterSpacing: "-.06em", color: "rgba(var(--accent-rgb),.07)", pointerEvents: "none", userSelect: "none" }}>01</div>
            <div style={{ position: "relative", zIndex: 1, maxWidth: "1320px", width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,1fr)", gap: "clamp(24px,5vw,72px)", alignItems: "center", padding: "96px clamp(18px,4vw,44px) 0" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".14em", marginBottom: "26px" }}><span style={{ color: "var(--accent)" }}>01</span><span style={{ width: "34px", height: "2px", background: "var(--accent)" }}></span><span style={{ opacity: .35 }}>02</span><span style={{ width: "12px", height: "1px", background: "rgba(var(--accent-rgb),.35)" }}></span><span style={{ opacity: .35 }}>03</span></div>
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: "18px", color: "var(--ink-mute)" }}>( UKG · Generative AI · Cloud Run )</div>
                <h2 style={{ margin: "0 0 20px", fontWeight: 700, fontSize: "clamp(2.2rem,5vw,4.8rem)", lineHeight: .94, letterSpacing: "-.03em", color: "#fff" }}><span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}><span data-reveal="" style={{ display: "inline-block", transform: "translateY(110%)", transition: "transform .8s cubic-bezier(.16,1,.3,1)" }}>Agents</span></span> <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}><span data-reveal="" data-reveal-delay="80" style={{ display: "inline-block", transform: "translateY(110%)", transition: "transform .8s cubic-bezier(.16,1,.3,1)" }}>&amp;</span></span> <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}><span data-reveal="" data-reveal-delay="160" style={{ display: "inline-block", transform: "translateY(110%)", transition: "transform .8s cubic-bezier(.16,1,.3,1)" }}>applied AI</span></span></h2>
                <p style={{ margin: 0, fontSize: "clamp(15px,1.2vw,18px)", lineHeight: 1.55, fontWeight: 500, color: "#cfcfc4", maxWidth: "440px" }}>Architecting UKG&apos;s enterprise AI extensibility platform — Agents, Skills, Scripts, Commands, and Hooks with workflow authoring, validation, and automated testing. Workflow creation time down ~60%, serving 1,000+ enterprise customers.</p>
                <div className="cs-svc-list" style={{ marginTop: "18px", fontFamily: "'Geist Mono',monospace", fontSize: "12.5px", lineHeight: 2.05, letterSpacing: ".04em", color: "var(--accent)" }}>→ Extensibility Studio — agent authoring<br />→ Bryte Generative-AI control panel<br />→ LLD &amp; service-oriented architecture<br />→ 5+ new capabilities per quarter</div>
                <div style={{ marginTop: "18px" }}><span style={{ display: "inline-block", fontFamily: "'Geist Mono',monospace", fontSize: "11.5px", letterSpacing: ".12em", textTransform: "uppercase", border: "1.5px solid rgba(var(--accent-rgb),.5)", color: "var(--accent)", borderRadius: "100px", padding: "6px 14px" }}>UKG · Oct 2024 — Present</span></div>
              </div>
              <div style={{ position: "relative", background: "rgba(var(--accent-rgb),.05)", border: "1px solid rgba(var(--accent-rgb),.2)", borderRadius: "20px", padding: "clamp(20px,2vw,30px)", aspectRatio: "4/3", overflow: "hidden" }}>
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "11px", letterSpacing: ".06em", color: "var(--ink-mute)", marginBottom: "6px" }}>retrieval · query → cited answer</div>
                <svg viewBox="0 0 340 220" style={{ width: "100%", height: "calc(100% - 22px)", overflow: "visible" }}>
                  <path data-draw="" pathLength="1" d="M60 46 H150" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="1" strokeDashoffset="1"></path>
                  <path data-draw="" pathLength="1" d="M195 46 V110 H70 V150" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="1" strokeDashoffset="1"></path>
                  <path data-draw="" pathLength="1" d="M240 60 V150" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="1" strokeDashoffset="1"></path>
                  <rect x="14" y="30" width="46" height="32" rx="7" fill="none" stroke="var(--accent)" strokeWidth="2"></rect>
                  <rect x="150" y="30" width="90" height="32" rx="7" fill="var(--accent)"></rect>
                  <rect x="30" y="150" width="80" height="34" rx="7" fill="none" stroke="var(--accent)" strokeWidth="2"></rect>
                  <rect x="200" y="150" width="90" height="34" rx="7" fill="none" stroke="var(--accent)" strokeWidth="2"></rect>
                  <text x="195" y="50" textAnchor="middle" fontFamily="monospace" fontSize="12" fill="var(--ink)" fontWeight="700">rerank</text>
                  <text x="37" y="50" textAnchor="middle" fontFamily="monospace" fontSize="11" fill="var(--accent)">query</text>
                  <text x="70" y="171" textAnchor="middle" fontFamily="monospace" fontSize="11" fill="var(--accent)">vectors</text>
                  <text x="245" y="171" textAnchor="middle" fontFamily="monospace" fontSize="11" fill="var(--accent)">sources</text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* PHASE 02 */}
        <div data-stack="" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--ink)", borderRadius: "36px 36px 0 0" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center" }}>
            <div aria-hidden="true" style={{ position: "absolute", right: "-3%", bottom: "-14%", fontWeight: 700, fontSize: "min(52vw,64vh)", lineHeight: .7, letterSpacing: "-.06em", color: "rgba(var(--ink-rgb),.06)", pointerEvents: "none", userSelect: "none" }}>02</div>
            <div style={{ position: "relative", zIndex: 1, maxWidth: "1320px", width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,1fr)", gap: "clamp(24px,5vw,72px)", alignItems: "center", padding: "96px clamp(18px,4vw,44px) 0" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".14em", marginBottom: "26px" }}><span style={{ opacity: .35 }}>01</span><span style={{ width: "12px", height: "1px", background: "currentColor", opacity: .35 }}></span><span style={{ color: "currentColor" }}>02</span><span style={{ width: "34px", height: "2px", background: "currentColor" }}></span><span style={{ opacity: .35 }}>03</span></div>
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: "18px", color: "#5a5a48" }}>( FastAPI · PostgreSQL · Scale )</div>
                <h2 style={{ margin: "0 0 20px", fontWeight: 700, fontSize: "clamp(2.2rem,5vw,4.8rem)", lineHeight: .94, letterSpacing: "-.03em" }}><span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}><span data-reveal="" style={{ display: "inline-block", transform: "translateY(110%)", transition: "transform .8s cubic-bezier(.16,1,.3,1)" }}>FastAPI</span></span> <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}><span data-reveal="" data-reveal-delay="80" style={{ display: "inline-block", transform: "translateY(110%)", transition: "transform .8s cubic-bezier(.16,1,.3,1)" }}>backends</span></span></h2>
                <p style={{ margin: 0, fontSize: "clamp(15px,1.2vw,18px)", lineHeight: 1.55, fontWeight: 500, color: "var(--ink-soft)", maxWidth: "440px" }}>Scalable, cloud-native services and REST APIs in Python/FastAPI. Led the Scala → Python migration of UKG&apos;s Auditor backend — ~30% faster feature delivery — deployed on Google Cloud Run with Secret Manager at 99.9% uptime.</p>
                <div className="cs-svc-list" style={{ marginTop: "18px", fontFamily: "'Geist Mono',monospace", fontSize: "12.5px", lineHeight: 2.05, letterSpacing: ".04em", color: "var(--ink)" }}>→ REST APIs · async ORM (Tortoise)<br />→ PostgreSQL · Docker · Linux<br />→ Cloud Run + Secret Manager, zero credential leaks</div>
                <div style={{ marginTop: "18px" }}><span style={{ display: "inline-block", fontFamily: "'Geist Mono',monospace", fontSize: "11.5px", letterSpacing: ".12em", textTransform: "uppercase", border: "1.5px solid rgba(var(--ink-rgb),.4)", borderRadius: "100px", padding: "6px 14px" }}>~30% faster delivery · 99.9% uptime</span></div>
              </div>
              <div style={{ position: "relative", background: "var(--ink)", borderRadius: "20px", padding: "clamp(22px,2.2vw,32px)", aspectRatio: "4/3", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'Geist Mono',monospace", fontSize: "11px", letterSpacing: ".06em", color: "var(--ink-mute)", marginBottom: "2px" }}>records<span style={{ display: "inline-flex", alignItems: "center", gap: "7px", color: "var(--accent)" }}>synthetic <span style={{ width: "26px", height: "14px", borderRadius: "20px", background: "rgba(var(--accent-rgb),.25)", position: "relative" }}><span style={{ position: "absolute", top: "2px", left: "2px", width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent)", animation: "cs-flowdot 2.8s ease-in-out infinite" }}></span></span> live</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ fontFamily: "'Geist Mono',monospace", fontSize: "11px", color: "var(--ink-mute)", width: "52px" }}>user_id</span><span style={{ position: "relative", flex: 1, height: "16px", borderRadius: "5px", background: "rgba(var(--accent-rgb),.14)", overflow: "hidden" }}><span style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg,rgba(var(--accent-rgb),.5),rgba(var(--accent-rgb),.5) 5px,transparent 5px,transparent 10px)", animation: "cs-desynth 2.8s ease-in-out infinite" }}></span></span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ fontFamily: "'Geist Mono',monospace", fontSize: "11px", color: "var(--ink-mute)", width: "52px" }}>amount</span><span style={{ position: "relative", flex: 1, height: "16px", borderRadius: "5px", background: "rgba(var(--accent-rgb),.14)", overflow: "hidden" }}><span style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg,rgba(var(--accent-rgb),.5),rgba(var(--accent-rgb),.5) 5px,transparent 5px,transparent 10px)", animation: "cs-desynth 2.8s ease-in-out infinite", animationDelay: ".25s" }}></span></span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ fontFamily: "'Geist Mono',monospace", fontSize: "11px", color: "var(--ink-mute)", width: "52px" }}>email</span><span style={{ position: "relative", flex: 1, height: "16px", borderRadius: "5px", background: "rgba(var(--accent-rgb),.14)", overflow: "hidden" }}><span style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg,rgba(var(--accent-rgb),.5),rgba(var(--accent-rgb),.5) 5px,transparent 5px,transparent 10px)", animation: "cs-desynth 2.8s ease-in-out infinite", animationDelay: ".5s" }}></span></span></div>
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "11px", color: "var(--ok)", marginTop: "2px" }}>✓ REST · PostgreSQL · Docker — wired</div>
              </div>
            </div>
          </div>
        </div>

        {/* PHASE 03 */}
        <div data-stack="" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "var(--paper)", color: "var(--ink)", borderRadius: "36px 36px 0 0" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center" }}>
            <div aria-hidden="true" style={{ position: "absolute", right: "-3%", bottom: "-14%", fontWeight: 700, fontSize: "min(52vw,64vh)", lineHeight: .7, letterSpacing: "-.06em", color: "rgba(var(--ink-rgb),.05)", pointerEvents: "none", userSelect: "none" }}>03</div>
            <div style={{ position: "relative", zIndex: 1, maxWidth: "1320px", width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,1fr)", gap: "clamp(24px,5vw,72px)", alignItems: "center", padding: "96px clamp(18px,4vw,44px) 0" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".14em", marginBottom: "26px" }}><span style={{ opacity: .35 }}>01</span><span style={{ width: "12px", height: "1px", background: "currentColor", opacity: .35 }}></span><span style={{ opacity: .35 }}>02</span><span style={{ width: "12px", height: "1px", background: "currentColor", opacity: .35 }}></span><span style={{ color: "currentColor" }}>03</span><span style={{ width: "34px", height: "2px", background: "currentColor" }}></span></div>
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: "18px", color: "#5a5a48" }}>( Python · Probability · 12+ titles )</div>
                <h2 style={{ margin: "0 0 20px", fontWeight: 700, fontSize: "clamp(2.2rem,5vw,4.8rem)", lineHeight: .94, letterSpacing: "-.03em" }}><span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}><span data-reveal="" style={{ display: "inline-block", transform: "translateY(110%)", transition: "transform .8s cubic-bezier(.16,1,.3,1)" }}>Game &amp; data</span></span> <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}><span data-reveal="" data-reveal-delay="80" style={{ display: "inline-block", transform: "translateY(110%)", transition: "transform .8s cubic-bezier(.16,1,.3,1)" }}>engines</span></span></h2>
                <p style={{ margin: 0, fontSize: "clamp(15px,1.2vw,18px)", lineHeight: 1.55, fontWeight: 500, color: "var(--ink-soft)", maxWidth: "440px" }}>High-performance slot-game engines built from client math specs at Ingenuity Gaming — 12+ live titles for Light &amp; Wonder, AvatarUX, Rogue, and Reel Play — plus financial ETL and reconciliation pipelines at EZOPS for Wells Fargo, BNY Mellon, and SEI.</p>
                <div className="cs-svc-list" style={{ marginTop: "18px", fontFamily: "'Geist Mono',monospace", fontSize: "12.5px", lineHeight: 2.05, letterSpacing: ".04em", color: "var(--ink)" }}>→ 10M+ spins simulated before release<br />→ Pandas data-mining, ~25% perf gained<br />→ ARO Pypeline — no-code transformations</div>
                <div style={{ marginTop: "18px" }}><span style={{ display: "inline-block", fontFamily: "'Geist Mono',monospace", fontSize: "11.5px", letterSpacing: ".12em", textTransform: "uppercase", border: "1.5px solid rgba(var(--ink-rgb),.4)", borderRadius: "100px", padding: "6px 14px" }}>2020 — 2024 · Ingenuity &amp; EZOPS</span></div>
              </div>
              <div style={{ position: "relative", background: "var(--ink)", borderRadius: "20px", padding: "clamp(22px,2.2vw,32px)", aspectRatio: "4/3", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "auto" }}><span style={{ fontFamily: "'Geist Mono',monospace", fontSize: "11px", letterSpacing: ".06em", color: "var(--ink-mute)" }}>volume test · 10M+ spins</span><span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "'Geist Mono',monospace", fontSize: "11px", color: "var(--ok)" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ok)", animation: "cs-blink 1.3s step-end infinite" }}></span>99.9% uptime</span></div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "44%", margin: "14px 0" }}><span style={{ flex: 1, background: "var(--accent)", borderRadius: "4px 4px 0 0", height: "100%", transformOrigin: "bottom", animation: "cs-bar 2.4s ease-in-out infinite" }}></span><span style={{ flex: 1, background: "var(--accent)", borderRadius: "4px 4px 0 0", height: "100%", transformOrigin: "bottom", animation: "cs-bar 2.4s ease-in-out infinite", animationDelay: ".2s" }}></span><span style={{ flex: 1, background: "rgba(var(--accent-rgb),.4)", borderRadius: "4px 4px 0 0", height: "100%", transformOrigin: "bottom", animation: "cs-bar 2.4s ease-in-out infinite", animationDelay: ".4s" }}></span><span style={{ flex: 1, background: "var(--accent)", borderRadius: "4px 4px 0 0", height: "100%", transformOrigin: "bottom", animation: "cs-bar 2.4s ease-in-out infinite", animationDelay: ".6s" }}></span><span style={{ flex: 1, background: "rgba(var(--accent-rgb),.4)", borderRadius: "4px 4px 0 0", height: "100%", transformOrigin: "bottom", animation: "cs-bar 2.4s ease-in-out infinite", animationDelay: ".8s" }}></span><span style={{ flex: 1, background: "var(--accent)", borderRadius: "4px 4px 0 0", height: "100%", transformOrigin: "bottom", animation: "cs-bar 2.4s ease-in-out infinite", animationDelay: "1s" }}></span></div>
                <div style={{ display: "flex", gap: "10px", fontFamily: "'Geist Mono',monospace", fontSize: "10.5px", color: "#cfcfc4" }}><span style={{ background: "rgba(var(--accent-rgb),.12)", borderRadius: "6px", padding: "6px 9px" }}>12+ live titles</span><span style={{ background: "rgba(var(--accent-rgb),.12)", borderRadius: "6px", padding: "6px 9px" }}>~40% fewer code smells</span><span style={{ background: "rgba(70,201,139,.16)", color: "var(--ok)", borderRadius: "6px", padding: "6px 9px" }}>0 critical defects</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workforce */}
      <section id="cs-workforce" style={{ position: "relative", background: "var(--bg)", padding: "clamp(50px,7vw,110px) clamp(18px,4vw,44px)", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "1320px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(32px,5vw,72px)" }}>
          <div style={{ flex: "1 1 460px", minWidth: "300px" }}>
            <div data-reveal="" style={{ opacity: 0, transform: "translateY(18px)", transition: "opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)", fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: "clamp(18px,2.2vw,28px)" }}><span data-scramble="">( The digital workforce )</span></div>
            <h3 data-reveal="" data-reveal-delay="80" style={{ opacity: 0, transform: "translateY(18px)", transition: "opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)", margin: 0, fontWeight: 800, fontSize: "clamp(1.9rem,4.2vw,3.8rem)", lineHeight: .95, letterSpacing: "-.035em", textTransform: "uppercase" }}>Your next hire<br />isn't a person.</h3>
            <p data-reveal="" data-reveal-delay="160" style={{ opacity: 0, transform: "translateY(18px)", transition: "opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)", margin: "clamp(18px,2.2vw,28px) 0 0", maxWidth: "520px", fontSize: "clamp(15px,1.3vw,18px)", lineHeight: 1.55, fontWeight: 500, color: "var(--ink-soft)" }}>The extensibility platform I built at UKG treats agents as first-class staff — Agents, Skills, Scripts, Commands, and Hooks, each with validation, tests and guardrails. Click through the team.</p>
          </div>
          <div style={{ flex: "0 1 420px", minWidth: "300px" }}>
            <div id="cs-worker-deck" style={{ position: "relative", height: "378px", maxWidth: "400px", margin: "0 auto", cursor: "pointer" }}>
              {/* erizo -> guardrails */}
              <div className="cs-worker-card" data-worker="erizo" style={{ position: "absolute", inset: 0, background: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: "22px", padding: "20px 22px", boxShadow: "8px 8px 0 rgba(var(--ink-rgb),.9)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Geist Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: "13px" }}><span>Ashutosh · staff pass</span><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ok)" }}></span></div>
                <h3>ERIZO-09</h3>
                <p>Digital worker</p>
                <dl style={{ margin: "14px 0", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)", padding: "10px 0" }}>
                  <dt style={{ fontSize: "9px", textTransform: "uppercase", opacity: .5, fontFamily: "'Geist Mono',monospace" }}>Role</dt>
                  <dd style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 800 }}>System guardrails</dd>
                </dl>
                <strong>I'm the security guardrails. Professionally paranoid.</strong>
              </div>

              {/* pixel -> test runner */}
              <div className="cs-worker-card" data-worker="pixel" style={{ position: "absolute", inset: 0, background: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: "22px", padding: "20px 22px", boxShadow: "8px 8px 0 rgba(var(--ink-rgb),.9)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Geist Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: "13px" }}><span>Ashutosh · staff pass</span><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ok)" }}></span></div>
                <h3>FUZZ-02</h3>
                <p>Digital worker</p>
                <dl style={{ margin: "14px 0", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)", padding: "10px 0" }}>
                  <dt style={{ fontSize: "9px", textTransform: "uppercase", opacity: .5, fontFamily: "'Geist Mono',monospace" }}>Role</dt>
                  <dd style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 800 }}>QA regressions</dd>
                </dl>
                <strong>I run every test. EVERY test. Catching defects before release.</strong>
              </div>

              {/* espiral -> document data pipeline */}
              <div className="cs-worker-card" data-worker="espiral" style={{ position: "absolute", inset: 0, background: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: "22px", padding: "20px 22px", boxShadow: "8px 8px 0 rgba(var(--ink-rgb),.9)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Geist Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: "13px" }}><span>Ashutosh · staff pass</span><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ok)" }}></span></div>
                <h3>VORTEX-04</h3>
                <p>Digital worker</p>
                <dl style={{ margin: "14px 0", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)", padding: "10px 0" }}>
                  <dt style={{ fontSize: "9px", textTransform: "uppercase", opacity: .5, fontFamily: "'Geist Mono',monospace" }}>Role</dt>
                  <dd style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 800 }}>Data pipelines</dd>
                </dl>
                <strong>I move 10K documents a night. Quietly. Converting documents.</strong>
              </div>

              {/* anillos -> knowledge assistant */}
              <div className="cs-worker-card" data-worker="anillos" style={{ position: "absolute", inset: 0, background: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: "22px", padding: "20px 22px", boxShadow: "8px 8px 0 rgba(var(--ink-rgb),.9)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Geist Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: "13px" }}><span>Ashutosh · staff pass</span><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ok)" }}></span></div>
                <h3>ECHO-03</h3>
                <p>Digital worker</p>
                <dl style={{ margin: "14px 0", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)", padding: "10px 0" }}>
                  <dt style={{ fontSize: "9px", textTransform: "uppercase", opacity: .5, fontFamily: "'Geist Mono',monospace" }}>Role</dt>
                  <dd style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 800 }}>Docs RAG</dd>
                </dl>
                <strong>I answer questions — always with strict database citations.</strong>
              </div>

              {/* denso -> support agent */}
              <div className="cs-worker-card" data-worker="denso" style={{ position: "absolute", inset: 0, background: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: "22px", padding: "20px 22px", boxShadow: "8px 8px 0 rgba(var(--ink-rgb),.9)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Geist Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: "13px" }}><span>Ashutosh · staff pass</span><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ok)" }}></span></div>
                <h3>DENSO-01</h3>
                <p>Digital worker</p>
                <dl style={{ margin: "14px 0", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)", padding: "10px 0" }}>
                  <dt style={{ fontSize: "9px", textTransform: "uppercase", opacity: .5, fontFamily: "'Geist Mono',monospace" }}>Role</dt>
                  <dd style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 800 }}>Support tickets</dd>
                </dl>
                <strong>I answer support tickets. Under two seconds, all night long.</strong>
              </div>

              {/* original -> quick tour guide */}
              <div className="cs-worker-card" data-worker="original" style={{ position: "absolute", inset: 0, background: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: "22px", padding: "20px 22px", boxShadow: "8px 8px 0 rgba(var(--ink-rgb),.9)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Geist Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: "13px" }}><span>Ashutosh · staff pass</span><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ok)" }}></span></div>
                <h3>DOT-01</h3>
                <p>Digital worker</p>
                <dl style={{ margin: "14px 0", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)", padding: "10px 0" }}>
                  <dt style={{ fontSize: "9px", textTransform: "uppercase", opacity: .5, fontFamily: "'Geist Mono',monospace" }}>Role</dt>
                  <dd style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 800 }}>Guided tours</dd>
                </dl>
                <strong>I guide visitors. Explain features, slide marquees, throw pills.</strong>
              </div>

              {/* orbital -> monitor */}
              <div className="cs-worker-card" data-worker="orbital" style={{ position: "absolute", inset: 0, background: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: "22px", padding: "20px 22px", boxShadow: "8px 8px 0 rgba(var(--ink-rgb),.9)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Geist Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: "13px" }}><span>Ashutosh · staff pass</span><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ok)" }}></span></div>
                <h3>HALO-07</h3>
                <p>Digital worker</p>
                <dl style={{ margin: "14px 0", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)", padding: "10px 0" }}>
                  <dt style={{ fontSize: "9px", textTransform: "uppercase", opacity: .5, fontFamily: "'Geist Mono',monospace" }}>Role</dt>
                  <dd style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 800 }}>Ops monitor</dd>
                </dl>
                <strong>I watch dashboards so nobody has to. Rollbacks and rollouts.</strong>
              </div>

              {/* nube -> code judge */}
              <div className="cs-worker-card" data-worker="nube" style={{ position: "absolute", inset: 0, background: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: "22px", padding: "20px 22px", boxShadow: "8px 8px 0 rgba(var(--ink-rgb),.9)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Geist Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: "13px" }}><span>Ashutosh · staff pass</span><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ok)" }}></span></div>
                <h3>NUBE-05</h3>
                <p>Digital worker</p>
                <dl style={{ margin: "14px 0", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)", padding: "10px 0" }}>
                  <dt style={{ fontSize: "9px", textTransform: "uppercase", opacity: .5, fontFamily: "'Geist Mono',monospace" }}>Role</dt>
                  <dd style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 800 }}>Structured evaluation</dd>
                </dl>
                <strong>I read and evaluate output accuracy against benchmarks.</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sonar / Echo Drive */}
      <section id="cs-echo-drive" data-dark="" style={{ position: "relative", background: "#0e0e0c", color: "var(--accent)", padding: "clamp(60px,9vw,140px) clamp(18px,4vw,44px)", overflow: "hidden" }}>
        <canvas data-particles="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}></canvas>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "1320px", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.2fr)", gap: "clamp(32px,5vw,80px)", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".18em", textTransform: "uppercase", opacity: .55, marginBottom: "22px" }}>( Production telemetry )</div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: "clamp(2.2rem,5.8vw,5.2rem)", lineHeight: .94, letterSpacing: "-.035em" }}>Observability in your terminal.</h2>
            <p style={{ margin: "22px 0 0", fontSize: "clamp(15px,1.2vw,18px)", lineHeight: 1.55, color: "#cfcfc4" }}>Every service I run on Google Cloud Run ships with telemetry — containerized, secrets managed via Google Secret Manager, sustaining 99.9% uptime with zero credential-exposure incidents across 1,000+ enterprise customers.</p>
          </div>
          <div style={{ background: "#131310", border: "1.5px solid rgba(255,244,141,.2)", borderRadius: "24px", padding: "clamp(24px,4vw,44px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 50px rgba(0,0,0,.5)" }}>
            <svg viewBox="0 0 100 100" style={{ width: "clamp(76px,10vw,120px)", height: "clamp(76px,10vw,120px)", fill: "none", stroke: "var(--accent)", strokeWidth: "1.8", animation: "cs-spin 12s linear infinite", marginBottom: "20px" }}>
              <circle cx="50" cy="50" r="45" strokeDasharray="3 3"></circle>
              <circle cx="50" cy="50" r="30" strokeWidth="1"></circle>
              <circle cx="50" cy="50" r="15" strokeDasharray="6 2"></circle>
              <line x1="50" y1="50" x2="50" y2="5" strokeWidth="2"></line>
              <line x1="50" y1="50" x2="85" y2="85" strokeWidth="1" strokeDasharray="2"></line>
            </svg>
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: "clamp(18px,2vw,24px)", fontWeight: 700, letterSpacing: ".06em" }}>CLOUD_RUN // OK</span>
            <h4 style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", opacity: .55, margin: "6px 0 20px" }}>99.9% uptime · zero credential leaks</h4>
            <code style={{ background: "rgba(255,244,141,.06)", border: "1px dashed var(--accent)", borderRadius: "8px", padding: "8px 18px", fontSize: "clamp(11px,1.1vw,13px)", color: "var(--accent)", wordBreak: "break-all", maxWidth: "100%" }}>$ gcloud run deploy extensibility-studio --region us-central1</code>
          </div>
        </div>
      </section>

      {/* Selected Work */}
      <section id="cs-selected" data-screen-label="Selected work" style={{ background: "var(--bg)", padding: "clamp(60px,9vw,140px) clamp(18px,4vw,44px)", overflow: "hidden" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "clamp(32px,4vw,58px)" }}>
            <div>
              <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: "18px" }}><span data-scramble="">( Proof of work )</span></div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: "clamp(2rem,5vw,4.5rem)", lineHeight: .95, letterSpacing: "-.035em", textTransform: "uppercase" }}>Selected builds.</h3>
            </div>
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: "11px", letterSpacing: ".12em", textTransform: "uppercase", opacity: .5, paddingBottom: "6px" }}>Hover to preview</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "clamp(28px,5vw,72px)", alignItems: "start" }}>
            <div style={{ borderTop: "2px solid var(--ink)", display: "flex", flexDirection: "column" }}>
              {projects.map((proj, idx) => (
                <button key={proj.name} data-show={idx} style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(14,14,12,.12)", padding: "24px 12px", fontSize: "clamp(1.4rem,2.8vw,2.4rem)", fontWeight: 800, color: "var(--ink)", cursor: "none", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", textAlign: "left", transition: "all .3s ease" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "18px" }}><span style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", opacity: .4 }}>0{idx + 1}</span>{proj.name}</span>
                  <span data-arrow="" style={{ opacity: 0, transform: "translate(-6px,6px)", transition: "all .3s ease" }}>→</span>
                </button>
              ))}
            </div>
            <div style={{ position: "relative", background: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: "24px", padding: "clamp(22px,3vw,40px)", minHeight: "380px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "8px 8px 0 rgba(14,14,12,.9)" }}>
              {projects.map((proj, idx) => (
                <div key={proj.name} data-item={idx} style={{ position: "absolute", inset: "clamp(22px,3vw,40px)", display: "flex", flexDirection: "column", justifyContent: "space-between", opacity: idx === 0 ? 1 : 0, transform: idx === 0 ? "scale(1)" : "scale(1.04)", transition: "opacity .5s ease, transform .5s ease", pointerEvents: idx === 0 ? "auto" : "none" }}>
                  <div>
                    <p style={{ margin: 0, fontFamily: "'Geist Mono',monospace", fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-mute)" }}>{proj.context}</p>
                    <h4 style={{ margin: "10px 0 16px", fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.4rem)", lineHeight: 1, letterSpacing: "-.02em" }}>{proj.name}</h4>
                    <p style={{ margin: 0, fontSize: "clamp(14px,1.1vw,16px)", lineHeight: 1.5, color: "var(--ink-soft)" }}>{proj.description}</p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "24px" }}>
                    {proj.tech.map((tag: string) => (
                      <span key={tag} style={{ fontFamily: "'Geist Mono',monospace", fontSize: "10px", textTransform: "uppercase", border: "1px solid var(--ink)", borderRadius: "100px", padding: "4px 10px", background: "var(--accent)" }}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section id="cs-stats" data-dark="" style={{ position: "relative", background: "#0e0e0c", color: "var(--accent)", padding: "clamp(60px,8vw,120px) clamp(18px,4vw,44px)", borderTop: "3px solid var(--ink)", borderBottom: "3px solid var(--ink)", overflow: "hidden" }}>
        <canvas data-particles="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}></canvas>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "1320px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "clamp(24px,4vw,60px)" }}>
          {stats.map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: "clamp(2.4rem,6vw,5.5rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-.04em" }}>
                <span data-count={stat.value} data-decimals={stat.value.toString().includes(".") ? "1" : "0"}>0</span>
                <span>{stat.suffix}</span>
              </div>
              <p style={{ margin: "8px 0 0", fontFamily: "'Geist Mono',monospace", fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)", opacity: .65 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Toolkit */}
      <section id="cs-toolkit" style={{ background: "var(--paper)", padding: "clamp(60px,9vw,140px) clamp(18px,4vw,44px)", overflow: "hidden" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: "18px" }}><span data-scramble="">( Skills &amp; toolkit )</span></div>
          <h3 style={{ margin: "0 0 34px", fontWeight: 800, fontSize: "clamp(2rem,5vw,4.5rem)", lineHeight: 1, letterSpacing: "-.035em", textTransform: "uppercase", maxWidth: "25ch" }}>Drag &amp; throw — every tag here runs in production.</h3>
          <div id="cs-physics-box" style={{ position: "relative", border: "3px solid var(--ink)", borderRadius: "24px", background: "var(--bg)", height: "420px", width: "100%", overflow: "hidden", boxShadow: "8px 8px 0 rgba(14,14,12,.9)" }}>
            {topSkills.map((skill, index) => (
              <span key={skill.name} data-pill="" style={{ position: "absolute", display: "inline-block", border: "2.5px solid var(--ink)", borderRadius: "100px", padding: "10px 22px", background: "var(--paper)", color: "var(--ink)", fontSize: "14.5px", fontWeight: 700, fontFamily: "sans-serif", whiteSpace: "nowrap", userSelect: "none", transformOrigin: "center center" }}>
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" data-screen-label="FAQ" style={{ background: "var(--paper)", padding: "clamp(60px,9vw,140px) clamp(18px,4vw,44px)", borderTop: "3px solid var(--ink)", overflow: "hidden" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.35fr)", gap: "clamp(32px,6vw,80px)" }}>
          <div>
            <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: "18px" }}><span data-scramble="">( Questions? answered )</span></div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: "clamp(2.2rem,5.2vw,4.5rem)", lineHeight: .95, letterSpacing: "-.035em", textTransform: "uppercase" }}>Straight from<br />the resume.</h3>
          </div>
          <div style={{ borderTop: "2px solid var(--ink)", display: "flex", flexDirection: "column" }}>
            {faqs.map(([question, answer], idx) => (
              <div key={idx} data-faq="" style={{ borderBottom: "1px solid rgba(14,14,12,.12)", padding: "16px 0" }}>
                <div data-faq-q="" style={{ outline: "none", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "none", fontSize: "clamp(15px,1.3vw,19px)", fontWeight: 800, color: "var(--ink)", padding: "12px" }}>
                  <span>{question}</span>
                  <span data-faq-ic="" style={{ fontSize: "20px", fontWeight: 600, transition: "transform .45s cubic-bezier(.16,1,.3,1)", transformOrigin: "center" }}>+</span>
                </div>
                <div data-faq-a="" style={{ padding: "0 12px" }}>
                  <p style={{ margin: 0, fontSize: "clamp(14px,1.1vw,15.5px)", lineHeight: 1.55, color: "var(--ink-soft)" }}>{answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" data-screen-label="Contact" data-dark="" style={{ position: "relative", background: "#0e0e0c", color: "var(--accent)", padding: "clamp(76px,10vw,140px) clamp(18px,4vw,44px) 44px", borderTop: "3px solid var(--ink)", overflow: "hidden" }}>
        <canvas data-particles="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}></canvas>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "1320px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "30px" }}>
          <div data-collider="" style={{ position: "absolute", left: 0, top: 0, width: "58px", height: "58px", borderRadius: "50%", background: "rgba(255,244,141,.06)", border: "1.5px dashed var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }}></span></div>
          <div data-collider="" style={{ position: "absolute", right: 0, top: 0, width: "58px", height: "58px", borderRadius: "50%", background: "rgba(255,244,141,.06)", border: "1.5px dashed var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }}></span></div>

          <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", letterSpacing: ".18em", textTransform: "uppercase", opacity: .55 }}>( Let's connect )</div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: "clamp(2.4rem,6vw,5.8rem)", lineHeight: .9, letterSpacing: "-.040em", textTransform: "uppercase" }}>Let's build your AI.</h2>
          <a href={`mailto:${person.email}`} data-cursor-label="email" style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontSize: "clamp(18px,2.4vw,34px)", fontWeight: 800, letterSpacing: "-.02em", color: "var(--accent)", textDecoration: "none" }}>
            {person.email}
          </a>
          
          <div style={{ display: "flex", gap: "22px", fontSize: "14px", marginTop: "20px", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/" style={{ textDecoration: "underline", color: "var(--accent)" }}>current site</Link>
            <span>·</span>
            <a href={person.links.github} target="_blank" rel="noreferrer" style={{ textDecoration: "underline", color: "var(--accent)" }}>GitHub</a>
            <span>·</span>
            <a href={person.links.linkedin} target="_blank" rel="noreferrer" style={{ textDecoration: "underline", color: "var(--accent)" }}>LinkedIn</a>
            <span>·</span>
            <a href={person.links.codechef} target="_blank" rel="noreferrer" style={{ textDecoration: "underline", color: "var(--accent)" }}>CodeChef 1758</a>
            <span>·</span>
            <span>{person.location}</span>
            <span>·</span>
            <span>{person.tagline}</span>
          </div>
        </div>
      </footer>

      {/* Dynamic scripts loaded on client-side mount */}
    </div>
  );
}
