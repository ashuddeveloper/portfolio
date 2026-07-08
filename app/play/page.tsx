"use client";

/* /play — arcade arena. The "game" chip on /v2 links here.
   Three self-contained canvas games sharing one HUD + picker. */

import { useEffect, useRef } from "react";

const BG = "#FBF29F";
const INK = "#131311";

export default function PlayPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const canvas = root.querySelector("canvas")!;
    const ctx = canvas.getContext("2d")!;
    const hudLevel = root.querySelector("[data-hud-level]")!;
    const hudScore = root.querySelector("[data-hud-score]")!;
    const hudHearts = root.querySelector("[data-hud-hearts]")!;
    const hudAmmo = root.querySelector("[data-hud-ammo]")!;
    const menuEl = root.querySelector<HTMLElement>("[data-menu]")!;
    const overEl = root.querySelector<HTMLElement>("[data-over]")!;
    const overText = root.querySelector<HTMLElement>("[data-over-text]")!;

    let W = 0, H = 0, raf = 0;
    let game: { step: (dt: number) => void; draw: () => void; destroy?: () => void } | null = null;
    let last = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    /* ------- shared state / HUD ------- */
    const S = { level: 1, score: 0, hearts: 3, ammo: -1, clip: 6, stars: 0 };
    const hudStars = root.querySelector("[data-hud-stars]")!;
    function hud() {
      hudLevel.textContent = String(S.level);
      hudScore.textContent = String(S.score);
      hudHearts.textContent = "♥".repeat(Math.max(0, S.hearts));
      hudStars.textContent = S.stars > 0 ? "★ " + S.stars : "";
      hudAmmo.innerHTML = S.ammo < 0 ? "" : Array.from({ length: S.clip }, (_, i) =>
        `<span style="display:inline-block;width:11px;height:11px;border-radius:50%;margin:0 3px;border:2px solid ${INK};${i < S.ammo ? `background:${INK}` : ""}"></span>`).join("");
    }
    function reset() { S.level = 1; S.score = 0; S.hearts = 3; S.ammo = -1; S.clip = 6; S.stars = 0; hud(); }

    /* input */
    const keys: Record<string, boolean> = {};
    let mouseX = W / 2, clicked = false;
    const onKey = (e: KeyboardEvent) => {
      keys[e.key] = e.type === "keydown";
      if (e.type === "keydown" && e.key === "Escape") showMenu();
      if (e.type === "keydown" && (e.key === " " || e.key === "ArrowUp")) clicked = true;
      if (e.type === "keydown") dirKey(e.key);
    };
    const onMove = (e: PointerEvent) => { mouseX = e.clientX; };
    const onDown = () => { clicked = true; };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    window.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);

    let queuedDir: [number, number] | null = null;
    function dirKey(k: string) {
      const m: Record<string, [number, number]> = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
      };
      if (m[k]) queuedDir = m[k];
    }

    /* dotted-blob renderer (mascot look) */
    function scatter(n: number, seed: number) {
      const pts: [number, number, number][] = [];
      let s = seed;
      const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
        pts.push([Math.cos(a) * r, Math.sin(a) * r, 1 + rnd() * 2.4]);
      }
      return pts;
    }
    function drawBlob(x: number, y: number, R: number, pts: [number, number, number][], frac: number, eyes: boolean, t: number) {
      const n = Math.max(4, Math.floor(pts.length * frac));
      ctx.fillStyle = INK;
      for (let i = 0; i < n; i++) {
        const p = pts[i];
        const wob = Math.sin(t / 400 + i) * 1.5;
        ctx.globalAlpha = 0.35 + (i % 5) * 0.15;
        ctx.beginPath();
        ctx.arc(x + p[0] * R + wob, y + p[1] * R, p[2] * (R / 60), 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (eyes) {
        for (const dx of [-R * 0.28, R * 0.28]) {
          ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.arc(x + dx, y - R * 0.15, R * 0.3, 0, 7); ctx.fill();
          ctx.fillStyle = INK;
          ctx.beginPath(); ctx.arc(x + dx, y - R * 0.15, R * 0.13, 0, 7); ctx.fill();
        }
      }
    }

    function gameOver() {
      game = null;
      overText.textContent = "Score " + S.score + " · level " + S.level;
      overEl.style.display = "flex";
    }

    /* =============== 1. DOT SHOT (reference game) =============== */
    function dotShot() {
      reset(); S.ammo = 6; hud();
      S.level = Math.max(1, parseInt(new URLSearchParams(location.search).get("lvl") || "1", 10) || 1);
      const PINK = "#e0245e";
      const BOSSES = ["THE DEADLINE", "SCOPE CREEP", "THE REWRITE", "LEGACY CODE", "THE OUTAGE"];
      const orbPts = scatter(150, 7);
      const mePts = scatter(90, 3);
      const pellets: { x: number; y: number }[] = [];
      const parts: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
      const ripples: { x: number; y: number; life: number }[] = [];
      const pops: { x: number; y: number; txt: string; life: number }[] = [];
      let px = W / 2, t = 0, shake = 0, hurt = 0, regenT = 0, baseY = 0;
      const orb = { x: W / 2, y: H * 0.36, R: 100, hp: 8, max: 8, vx: 0.04, boss: false, name: "" };
      function newOrb() {
        orb.boss = S.level % 5 === 0;
        orb.name = orb.boss ? BOSSES[((S.level / 5 - 1) % BOSSES.length + BOSSES.length) % BOSSES.length] : "";
        orb.max = orb.hp = (orb.boss ? 14 : 8) + S.level * 2;
        orb.R = orb.boss
          ? Math.min(W, H) * 0.24
          : Math.max(60, Math.min(W, H) * 0.2 - S.level * 5);
        orb.vx = 0.04 + S.level * 0.03;
        orb.x = W / 2;
        baseY = orb.R + 80;
        S.clip = orb.boss ? 10 : 6;
        S.ammo = S.clip;
        hud();
      }
      newOrb();
      function burst(x: number, y: number, n: number) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, v = 0.08 + Math.random() * 0.25;
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 });
        }
      }
      return {
        step(dt: number) {
          t += dt;
          shake = Math.max(0, shake - dt);
          hurt = Math.max(0, hurt - dt);
          orb.x += Math.sin(t / 900) * orb.vx * dt;
          orb.x = Math.max(orb.R, Math.min(W - orb.R, orb.x));
          // the deadline creeps toward you — reach your side and it costs a heart
          baseY += (0.006 + S.level * 0.0022) * dt;
          orb.y = baseY + Math.sin(t / 1300) * 14;
          if (baseY > H - 240 - orb.R * 0.3) {
            S.hearts--; shake = 320; baseY = orb.R + 80; hud();
            if (S.hearts <= 0) { gameOver(); return; }
          }
          // pellets trickle back in
          regenT += dt;
          if (regenT > 700 && S.ammo < S.clip) { S.ammo++; regenT = 0; hud(); }
          if (keys.ArrowLeft || keys.a) px -= 0.5 * dt;
          if (keys.ArrowRight || keys.d) px += 0.5 * dt;
          if (Math.abs(mouseX - px) > 2) px += (mouseX - px) * 0.12;
          px = Math.max(40, Math.min(W - 40, px));
          if (clicked && S.ammo > 0) { pellets.push({ x: px, y: H - 120 }); S.ammo--; hud(); }
          clicked = false;
          for (let i = pellets.length - 1; i >= 0; i--) {
            const p = pellets[i];
            p.y -= 0.7 * dt;
            const dx = p.x - orb.x, dy = p.y - orb.y;
            if (dx * dx + dy * dy < orb.R * orb.R * 0.92) {
              pellets.splice(i, 1);
              orb.hp--; S.score += 10; hurt = 260; hud();
              ripples.push({ x: p.x, y: p.y, life: 1 });
              burst(p.x, p.y, 10);
              pops.push({ x: p.x, y: p.y - 14, txt: "+10", life: 1 });
              if (orb.hp <= 0) {
                S.level++; S.score += orb.boss ? 150 : 50; S.stars++;
                pops.push({ x: orb.x, y: orb.y, txt: orb.boss ? "+150" : "+50", life: 1 });
                burst(orb.x, orb.y, 36);
                shake = 320;
                newOrb();
              }
            } else if (p.y < -20) pellets.splice(i, 1);
          }
          for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.0004 * dt;
            p.life -= dt / 700;
            if (p.life <= 0) parts.splice(i, 1);
          }
          for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].life -= dt / 500; if (ripples[i].life <= 0) ripples.splice(i, 1); }
          for (let i = pops.length - 1; i >= 0; i--) { pops[i].y -= dt * 0.04; pops[i].life -= dt / 900; if (pops[i].life <= 0) pops.splice(i, 1); }
        },
        draw() {
          ctx.save();
          if (shake > 0) ctx.translate((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7);
          const ring = orb.boss ? PINK : "rgba(19,19,17,.35)";
          // antennae (boss only)
          if (orb.boss) {
            ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
            for (const a of [-Math.PI / 2, Math.PI * 0.05, Math.PI * 0.95]) {
              const wob = Math.sin(t / 600 + a * 3) * 0.08;
              const ex = orb.x + Math.cos(a + wob) * (orb.R + 30), ey = orb.y + Math.sin(a + wob) * (orb.R + 30);
              ctx.beginPath();
              ctx.moveTo(orb.x + Math.cos(a + wob) * orb.R, orb.y + Math.sin(a + wob) * orb.R);
              ctx.lineTo(ex, ey); ctx.stroke();
              ctx.beginPath(); ctx.arc(ex, ey, 7, 0, 7); ctx.stroke();
            }
          }
          ctx.strokeStyle = hurt > 0 ? PINK : ring;
          ctx.lineWidth = orb.boss ? 2.5 : 1.5;
          const squish = hurt > 0 ? 1 + Math.sin(hurt / 40) * 0.02 : 1;
          ctx.beginPath(); ctx.ellipse(orb.x, orb.y, orb.R * squish, orb.R / squish, 0, 0, 7); ctx.stroke();
          drawBlob(orb.x, orb.y, orb.R * 0.82, orbPts, orb.hp / orb.max, false, t);
          // face — pupils track the player
          const lk = Math.max(-8, Math.min(8, (px - orb.x) * 0.02));
          const er = Math.max(10, orb.R * 0.11);
          for (const dx of [-er * 1.3, er * 1.3]) {
            ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.ellipse(orb.x + dx, orb.y - orb.R * 0.06, er * 0.85, er, 0, 0, 7); ctx.fill();
            ctx.fillStyle = orb.boss ? PINK : INK;
            ctx.beginPath(); ctx.arc(orb.x + dx + lk, orb.y - orb.R * 0.06 + 2, er * 0.42, 0, 7); ctx.fill();
          }
          if (orb.boss) { // angry brows
            ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(orb.x - er * 2.1, orb.y - orb.R * 0.06 - er * 1.9); ctx.lineTo(orb.x - er * 0.6, orb.y - orb.R * 0.06 - er * 1.35); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(orb.x + er * 2.1, orb.y - orb.R * 0.06 - er * 1.9); ctx.lineTo(orb.x + er * 0.6, orb.y - orb.R * 0.06 - er * 1.35); ctx.stroke();
          }
          // boss badge
          if (orb.boss) {
            const label = "BOSS — " + orb.name;
            ctx.font = "700 13px 'Geist Mono', monospace";
            const tw = ctx.measureText(label).width + 44;
            const bx = orb.x - tw / 2, by = Math.max(76, orb.y - orb.R - 66);
            ctx.fillStyle = PINK;
            ctx.beginPath();
            if ((ctx as any).roundRect) (ctx as any).roundRect(bx, by, tw, 36, 18); else ctx.rect(bx, by, tw, 36);
            ctx.fill();
            ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(label, orb.x, by + 19);
            ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
          }
          // fx
          for (const r of ripples) {
            ctx.strokeStyle = `rgba(19,19,17,${r.life * 0.5})`; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(r.x, r.y, 12 + (1 - r.life) * 34, 0, 7); ctx.stroke();
          }
          ctx.fillStyle = INK;
          for (const p of parts) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, 7); ctx.fill();
          }
          ctx.globalAlpha = 1;
          for (const p of pops) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.font = "800 17px 'Geist Mono', monospace";
            ctx.fillStyle = INK;
            ctx.fillText(p.txt, p.x + 8, p.y);
          }
          ctx.globalAlpha = 1;
          drawBlob(px, H - 120, 34, mePts, 1, true, t);
          ctx.fillStyle = INK;
          for (const p of pellets) { ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 7); ctx.fill(); }
          ctx.restore();
        },
      };
    }

    /* =============== 2. DOT SNAKE =============== */
    function dotSnake() {
      reset(); hud();
      const PINK = "#e0245e";
      const cell = 26;
      const cols = Math.floor((W - 40) / cell), rows = Math.floor((H - 260) / cell);
      const ox = (W - cols * cell) / 2, oy = 150;
      const cx = (c: number) => ox + c * cell + cell / 2;
      const cy = (r: number) => oy + r * cell + cell / 2;
      let snake: [number, number][] = [[Math.floor(cols / 2), Math.floor(rows / 2)]];
      let dir: [number, number] = [1, 0];
      let food: [number, number] = [0, 0];
      let gold: [number, number] | null = null;
      let goldT = 0, acc = 0, eaten = 0, t = 0, dead = 0, shake = 0;
      const parts: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
      const pops: { x: number; y: number; txt: string; life: number }[] = [];
      const free = (): [number, number] => {
        let p: [number, number];
        do { p = [1 + Math.floor(Math.random() * (cols - 2)), 1 + Math.floor(Math.random() * (rows - 2))]; }
        while (snake.some((s) => s[0] === p[0] && s[1] === p[1]));
        return p;
      };
      food = free();
      queuedDir = null;
      function burst(x: number, y: number, n: number) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, v = 0.06 + Math.random() * 0.2;
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 });
        }
      }
      return {
        step(dt: number) {
          t += dt; shake = Math.max(0, shake - dt);
          for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt / 600; if (p.life <= 0) parts.splice(i, 1); }
          for (let i = pops.length - 1; i >= 0; i--) { pops[i].y -= dt * 0.04; pops[i].life -= dt / 900; if (pops[i].life <= 0) pops.splice(i, 1); }
          if (dead > 0) { dead -= dt; return; }
          if (gold) { goldT -= dt; if (goldT <= 0) gold = null; }
          acc += dt;
          const speed = Math.max(60, 130 - S.level * 8);
          if (acc < speed) return;
          acc = 0;
          if (queuedDir && (queuedDir[0] !== -dir[0] || queuedDir[1] !== -dir[1])) dir = queuedDir;
          const head: [number, number] = [(snake[0][0] + dir[0] + cols) % cols, (snake[0][1] + dir[1] + rows) % rows];
          if (snake.some((s) => s[0] === head[0] && s[1] === head[1])) {
            S.hearts--; hud();
            burst(cx(head[0]), cy(head[1]), 22); shake = 320;
            if (S.hearts <= 0) { gameOver(); return; }
            snake = [head]; dead = 650; return;
          }
          snake.unshift(head);
          if (head[0] === food[0] && head[1] === food[1]) {
            S.score += 5; eaten++;
            if (eaten % 8 === 0) S.level++;
            burst(cx(head[0]), cy(head[1]), 8);
            pops.push({ x: cx(head[0]), y: cy(head[1]) - 12, txt: "+5", life: 1 });
            hud(); food = free();
            if (!gold && eaten % 4 === 0) { gold = free(); goldT = 4500; } // limited-time bonus pill
          } else if (gold && head[0] === gold[0] && head[1] === gold[1]) {
            S.score += 25; S.stars++;
            burst(cx(head[0]), cy(head[1]), 18); shake = 180;
            pops.push({ x: cx(head[0]), y: cy(head[1]) - 12, txt: "+25", life: 1 });
            snake.push(snake[snake.length - 1], snake[snake.length - 1]);
            gold = null; hud();
          } else snake.pop();
        },
        draw() {
          ctx.save();
          if (shake > 0) ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
          // arena
          ctx.strokeStyle = "rgba(19,19,17,.22)"; ctx.lineWidth = 1.5;
          ctx.beginPath();
          if ((ctx as any).roundRect) (ctx as any).roundRect(ox - 8, oy - 8, cols * cell + 16, rows * cell + 16, 22); else ctx.rect(ox - 8, oy - 8, cols * cell + 16, rows * cell + 16);
          ctx.stroke();
          const blink = dead > 0 && Math.floor(dead / 90) % 2 === 0;
          if (!blink) {
            ctx.fillStyle = INK;
            snake.forEach((s, i) => {
              const r = i === 0 ? cell * 0.42 : Math.max(4, cell * 0.34 - Math.min(i, 8) * 0.6) + Math.sin(t / 200 - i * 0.6) * 0.8;
              ctx.globalAlpha = i === 0 ? 1 : 0.75;
              ctx.beginPath(); ctx.arc(cx(s[0]), cy(s[1]), Math.max(3, r), 0, 7); ctx.fill();
            });
            ctx.globalAlpha = 1;
            // eyes look where the snake is heading
            const h = snake[0], exo = dir[0] * 3, eyo = dir[1] * 3;
            for (const side of [-4, 4]) {
              ctx.fillStyle = "#fff";
              ctx.beginPath(); ctx.arc(cx(h[0]) + side, cy(h[1]) - 3, 4.4, 0, 7); ctx.fill();
              ctx.fillStyle = INK;
              ctx.beginPath(); ctx.arc(cx(h[0]) + side + exo, cy(h[1]) - 3 + eyo, 2, 0, 7); ctx.fill();
            }
          }
          const pulse = 6 + Math.sin(t / 200) * 2;
          ctx.strokeStyle = INK; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx(food[0]), cy(food[1]), pulse + 5, 0, 7); ctx.stroke();
          ctx.fillStyle = INK;
          ctx.beginPath(); ctx.arc(cx(food[0]), cy(food[1]), 4, 0, 7); ctx.fill();
          if (gold) {
            const g = 1 - goldT / 4500;
            ctx.strokeStyle = PINK; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(cx(gold[0]), cy(gold[1]), 12 + Math.sin(t / 130) * 2.5, 0, 7); ctx.stroke();
            ctx.beginPath(); ctx.arc(cx(gold[0]), cy(gold[1]), 15, -Math.PI / 2, -Math.PI / 2 + (1 - g) * Math.PI * 2); ctx.stroke();
            ctx.fillStyle = PINK;
            ctx.beginPath(); ctx.arc(cx(gold[0]), cy(gold[1]), 5, 0, 7); ctx.fill();
          }
          ctx.fillStyle = INK;
          for (const p of parts) { ctx.globalAlpha = Math.max(0, p.life); ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 7); ctx.fill(); }
          ctx.globalAlpha = 1;
          for (const p of pops) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.font = "800 16px 'Geist Mono', monospace"; ctx.fillStyle = INK;
            ctx.fillText(p.txt, p.x + 8, p.y);
          }
          ctx.globalAlpha = 1;
          ctx.restore();
        },
      };
    }

    /* =============== 3. BRICK POP =============== */
    function brickPop() {
      reset(); hud();
      const PINK = "#e0245e";
      let bricks: { x: number; y: number; hp: number }[] = [];
      const bw = 46;
      let ball = { x: W / 2, y: H * 0.6, vx: 0.28, vy: -0.34 };
      let px = W / 2, t = 0, launched = false, shake = 0, wideT = 0, squish = 0;
      const parts: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
      const pops: { x: number; y: number; txt: string; life: number }[] = [];
      const drops: { x: number; y: number; kind: "wide" | "bonus" }[] = [];
      const trail: { x: number; y: number; life: number }[] = [];
      const padW = () => (wideT > 0 ? 88 : 60);
      function burst(x: number, y: number, n: number) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, v = 0.06 + Math.random() * 0.22;
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 });
        }
      }
      function wave() {
        bricks = [];
        const cols = Math.min(14, Math.floor((W - 80) / bw));
        const rows = 3 + Math.min(4, S.level);
        const ox = (W - cols * bw) / 2 + bw / 2;
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++)
            bricks.push({ x: ox + c * bw, y: 130 + r * 44, hp: S.level >= 2 && r === 0 ? 2 : 1 });
        ball = { x: W / 2, y: H * 0.6, vx: 0.28 + S.level * 0.03, vy: -(0.34 + S.level * 0.03) };
        launched = false;
      }
      wave();
      return {
        step(dt: number) {
          t += dt; shake = Math.max(0, shake - dt); squish = Math.max(0, squish - dt);
          if (wideT > 0) wideT -= dt;
          for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.0004 * dt; p.life -= dt / 650; if (p.life <= 0) parts.splice(i, 1); }
          for (let i = pops.length - 1; i >= 0; i--) { pops[i].y -= dt * 0.04; pops[i].life -= dt / 900; if (pops[i].life <= 0) pops.splice(i, 1); }
          for (let i = trail.length - 1; i >= 0; i--) { trail[i].life -= dt / 260; if (trail[i].life <= 0) trail.splice(i, 1); }
          if (keys.ArrowLeft || keys.a) px -= 0.55 * dt;
          if (keys.ArrowRight || keys.d) px += 0.55 * dt;
          if (Math.abs(mouseX - px) > 2) px += (mouseX - px) * 0.15;
          px = Math.max(padW(), Math.min(W - padW(), px));
          // falling power-ups
          for (let i = drops.length - 1; i >= 0; i--) {
            const d = drops[i];
            d.y += 0.22 * dt;
            if (d.y > H - 92 && d.y < H - 62 && Math.abs(d.x - px) < padW() + 10) {
              if (d.kind === "wide") { wideT = 9000; pops.push({ x: d.x, y: d.y - 14, txt: "WIDE", life: 1 }); }
              else { S.score += 25; S.stars++; pops.push({ x: d.x, y: d.y - 14, txt: "+25", life: 1 }); hud(); }
              burst(d.x, d.y, 10);
              drops.splice(i, 1);
            } else if (d.y > H + 20) drops.splice(i, 1);
          }
          if (!launched) {
            ball.x = px; ball.y = H - 96;
            if (clicked) launched = true;
            clicked = false;
            return;
          }
          clicked = false;
          ball.x += ball.vx * dt; ball.y += ball.vy * dt;
          trail.push({ x: ball.x, y: ball.y, life: 1 });
          if (ball.x < 8 || ball.x > W - 8) ball.vx *= -1;
          if (ball.y < 70) ball.vy = Math.abs(ball.vy);
          if (ball.y > H - 88 && ball.y < H - 68 && Math.abs(ball.x - px) < padW() + 2 && ball.vy > 0) {
            ball.vy = -Math.abs(ball.vy);
            ball.vx += (ball.x - px) * 0.004;
            squish = 220;
          }
          if (ball.y > H + 20) {
            S.hearts--; shake = 320; hud();
            burst(ball.x, H - 30, 16);
            if (S.hearts <= 0) { gameOver(); return; }
            launched = false;
          }
          for (const [i, b] of bricks.entries()) {
            const dx = ball.x - b.x, dy = ball.y - b.y;
            if (dx * dx + dy * dy < 24 * 24) {
              b.hp--;
              if (Math.abs(dx) > Math.abs(dy)) ball.vx *= -1; else ball.vy *= -1;
              if (b.hp <= 0) {
                bricks.splice(i, 1);
                S.score += 10; hud();
                burst(b.x, b.y, 10);
                pops.push({ x: b.x, y: b.y - 12, txt: "+10", life: 1 });
                if (Math.random() < 0.12) drops.push({ x: b.x, y: b.y, kind: Math.random() < 0.5 ? "wide" : "bonus" });
              } else burst(b.x, b.y, 4);
              break;
            }
          }
          if (bricks.length === 0) {
            S.level++; S.score += 50; S.stars++; hud();
            pops.push({ x: W / 2, y: H / 2, txt: "+50", life: 1 });
            wave();
          }
        },
        draw() {
          ctx.save();
          if (shake > 0) ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
          ctx.fillStyle = INK;
          for (const b of bricks) {
            const r = (b.hp === 2 ? 16 : 13) + Math.sin(t / 500 + b.x) * 1.2;
            if (b.hp === 2) {
              ctx.strokeStyle = INK; ctx.lineWidth = 2;
              ctx.beginPath(); ctx.arc(b.x, b.y, r + 4, 0, 7); ctx.stroke();
            }
            ctx.globalAlpha = 0.85;
            ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, 7); ctx.fill();
            ctx.globalAlpha = 1;
          }
          for (const d of drops) {
            ctx.strokeStyle = PINK; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(d.x, d.y, 10 + Math.sin(t / 140) * 2, 0, 7); ctx.stroke();
            ctx.fillStyle = PINK;
            if (d.kind === "wide") { ctx.fillRect(d.x - 6, d.y - 1.6, 12, 3.2); }
            else { ctx.beginPath(); ctx.arc(d.x, d.y, 3.6, 0, 7); ctx.fill(); }
          }
          for (const p of trail) {
            ctx.globalAlpha = p.life * 0.28;
            ctx.fillStyle = INK;
            ctx.beginPath(); ctx.arc(p.x, p.y, 6 * p.life, 0, 7); ctx.fill();
          }
          ctx.globalAlpha = 1;
          ctx.fillStyle = INK;
          ctx.beginPath(); ctx.arc(ball.x, ball.y, 8, 0, 7); ctx.fill();
          const sq = squish > 0 ? 1 + Math.sin(squish / 35) * 0.12 : 1;
          const pw = padW() * sq, ph = 14 / sq;
          ctx.beginPath();
          if ((ctx as any).roundRect) (ctx as any).roundRect(px - pw, H - 84, pw * 2, ph, 8); else ctx.rect(px - pw, H - 84, pw * 2, ph);
          ctx.fill();
          if (wideT > 0 && wideT < 1500 && Math.floor(t / 150) % 2 === 0) { /* blink before expiring */ }
          ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.arc(px - 14, H - 77, 3.5, 0, 7); ctx.fill();
          ctx.beginPath(); ctx.arc(px + 14, H - 77, 3.5, 0, 7); ctx.fill();
          ctx.fillStyle = INK;
          const pk = Math.max(-1.8, Math.min(1.8, ball.vx * 5));
          ctx.beginPath(); ctx.arc(px - 14 + pk, H - 77, 1.6, 0, 7); ctx.fill();
          ctx.beginPath(); ctx.arc(px + 14 + pk, H - 77, 1.6, 0, 7); ctx.fill();
          for (const p of parts) { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 7); ctx.fill(); }
          ctx.globalAlpha = 1;
          for (const p of pops) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.font = "800 16px 'Geist Mono', monospace"; ctx.fillStyle = INK;
            ctx.fillText(p.txt, p.x + 8, p.y);
          }
          ctx.globalAlpha = 1;
          ctx.restore();
        },
      };
    }

    /* ------- loop ------- */
    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(34, now - last || 16);
      last = now;
      ctx.clearRect(0, 0, W, H);
      if (game) game.step(dt);
      if (game) game.draw(); // step() can end the game and null it out
    }
    raf = requestAnimationFrame(loop);

    /* ------- menu wiring ------- */
    function showMenu() { game = null; overEl.style.display = "none"; menuEl.style.display = "flex"; }
    function start(which: string) {
      menuEl.style.display = "none"; overEl.style.display = "none";
      game = which === "shot" ? dotShot() : which === "snake" ? dotSnake() : brickPop();
    }
    (root as HTMLElement).addEventListener("click", (e) => {
      const t = (e.target as HTMLElement).closest("[data-game], [data-menu-open], [data-again]");
      if (!t) return;
      if (t.hasAttribute("data-game")) start(t.getAttribute("data-game")!);
      else if (t.hasAttribute("data-again")) showMenu();
      else showMenu();
    });
    showMenu();
    hud();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, []);

  const card = {
    background: "transparent", border: `2.5px solid ${INK}`, borderRadius: "22px",
    padding: "26px 22px", width: "min(230px, 78vw)", cursor: "pointer",
    color: INK, textAlign: "center" as const, fontFamily: "inherit",
  };

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed", inset: 0, zIndex: 999, background: BG, color: INK, overflow: "hidden",
        fontFamily: "'Hanken Grotesk','Geist',system-ui,sans-serif", userSelect: "none", touchAction: "none",
      }}
    >
      <canvas style={{ position: "absolute", inset: 0 }} />

      {/* HUD */}
      <div style={{ position: "absolute", top: 26, left: 34 }}>
        <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 13, letterSpacing: ".28em" }}>LEVEL</div>
        <div data-hud-level style={{ fontSize: 56, fontWeight: 800, lineHeight: 1 }}>1</div>
        <div data-hud-hearts style={{ color: "#e0245e", fontSize: 15, letterSpacing: 3, marginTop: 6 }}>♥♥♥</div>
      </div>
      <div style={{ position: "absolute", top: 26, left: 0, right: 0, textAlign: "center", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em" }}>ashutosh*</div>
      <div style={{ position: "absolute", top: 26, right: 34, textAlign: "right" }}>
        <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 13, letterSpacing: ".28em" }}>SCORE</div>
        <div data-hud-score style={{ fontSize: 56, fontWeight: 800, lineHeight: 1 }}>0</div>
        <div data-hud-stars style={{ color: "#e0245e", fontFamily: "'Geist Mono',monospace", fontSize: 15, marginTop: 6, minHeight: 18 }} />
      </div>
      <div data-hud-ammo style={{ position: "absolute", bottom: 34, left: 0, right: 0, textAlign: "center" }} />

      <a href={(process.env.NEXT_PUBLIC_BASE_PATH || "") + "/v2/"} style={{ position: "absolute", bottom: 28, left: 28, background: INK, color: BG, textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "14px 24px", borderRadius: 100 }}>← Back to site</a>
      <button data-menu-open style={{ position: "absolute", bottom: 28, right: 28, background: INK, color: BG, border: 0, fontWeight: 700, fontSize: 14, letterSpacing: ".12em", padding: "16px 26px", borderRadius: 100, cursor: "pointer", fontFamily: "inherit" }}>MENU</button>

      {/* game picker */}
      <div data-menu style={{ position: "absolute", inset: 0, display: "none", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28, background: "rgba(251,242,159,.94)" }}>
        <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 13, letterSpacing: ".3em" }}>( PICK YOUR GAME )</div>
        <div style={{ fontSize: "clamp(34px,5vw,58px)", fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1 }}>Ready to play?</div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", padding: "0 18px" }}>
          <button data-game="shot" style={card}>
            <div style={{ fontSize: 34 }}>◉</div>
            <div style={{ fontWeight: 800, fontSize: 20, margin: "10px 0 6px" }}>Dot Shot</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.45, opacity: 0.75 }}>Pop the orb before it reaches you — pellets recharge, every 5th level is a boss. Click or space to fire.</div>
          </button>
          <button data-game="snake" style={card}>
            <div style={{ fontSize: 34 }}>∿</div>
            <div style={{ fontWeight: 800, fontSize: 20, margin: "10px 0 6px" }}>Dot Snake</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.45, opacity: 0.75 }}>Classic snake, mascot style. Arrows or WASD. Eat pills, don&apos;t bite yourself.</div>
          </button>
          <button data-game="brick" style={card}>
            <div style={{ fontSize: 34 }}>⣿</div>
            <div style={{ fontWeight: 800, fontSize: 20, margin: "10px 0 6px" }}>Brick Pop</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.45, opacity: 0.75 }}>Breakout with dots. Move the paddle with your mouse, click to launch.</div>
          </button>
        </div>
      </div>

      {/* game over */}
      <div data-over style={{ position: "absolute", inset: 0, display: "none", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18, background: "rgba(251,242,159,.94)" }}>
        <div style={{ fontSize: "clamp(34px,5vw,58px)", fontWeight: 800, letterSpacing: "-.03em" }}>Game over.</div>
        <div data-over-text style={{ fontFamily: "'Geist Mono',monospace", fontSize: 14, letterSpacing: ".08em" }} />
        <button data-again style={{ background: INK, color: BG, border: 0, fontWeight: 700, fontSize: 15, padding: "16px 30px", borderRadius: 100, cursor: "pointer", fontFamily: "inherit" }}>Play again →</button>
      </div>
    </div>
  );
}
