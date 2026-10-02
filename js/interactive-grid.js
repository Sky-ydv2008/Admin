/**
 * Apex Innovators — interactive-grid.js
 * Interactive Dot Grid Canvas Background (port of interactive-grid component).
 * Grid dots change brightness, hue, and draw vector lines to the cursor on hover.
 */

export function initInteractiveGrid(canvasId = "hero-interactive-grid", opts = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const canvas = typeof canvasId === "string" ? document.getElementById(canvasId) : canvasId;
  if (!canvas) return;

  const isMobile = window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches;
  const dotDistance = opts.dotDistance || (isMobile ? 42 : 30);
  const dotRadius = opts.dotRadius || 2;
  const minProximity = opts.minProximity || (isMobile ? 140 : 220);
  const minProxSq = minProximity * minProximity;

  let width = 0;
  let height = 0;
  let dots = [];
  let mouse = { x: -1000, y: -1000 };
  let hue = 195;
  let animId = null;
  let isVisible = true;

  function resize() {
    const parent = canvas.parentElement;
    const pW = parent ? parent.offsetWidth : 0;
    const pH = parent ? parent.offsetHeight : 0;
    width = canvas.width = Math.max(pW, window.innerWidth);
    height = canvas.height = Math.max(pH, window.innerHeight, 500);
    createDots();
  }

  function createDots() {
    dots = [];
    for (let x = 0; x < width; x += dotDistance) {
      for (let y = 0; y < height; y += dotDistance) {
        dots.push({ x, y });
      }
    }
  }

  function onMouseMove(e) {
    if (!isVisible) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    hue = (((mouse.x / (width || 1)) + (mouse.y / (height || 1))) * 360) % 360;
  }

  function onMouseLeave() {
    mouse.x = -1000;
    mouse.y = -1000;
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("mouseleave", onMouseLeave, { passive: true });

  resize();

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  // Pause animation when off-screen to save 100% CPU/GPU
  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
      if (isVisible && !animId) render();
    }, { threshold: 0.05 });
    observer.observe(canvas);
  }

  function render() {
    if (!isVisible || document.hidden) {
      animId = null;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    // 1. Batch draw all static background dots in ONE single path call
    ctx.beginPath();
    ctx.fillStyle = "rgba(125, 211, 252, 0.18)";
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      const dX = dot.x - mouse.x;
      const dY = dot.y - mouse.y;
      if (dX * dX + dY * dY > minProxSq) {
        ctx.moveTo(dot.x + dotRadius, dot.y);
        ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
      }
    }
    ctx.fill();

    // 2. Render active interactive dots near cursor (<15 dots max)
    if (mouse.x >= 0 && mouse.y >= 0) {
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dX = dot.x - mouse.x;
        const dY = dot.y - mouse.y;
        const distSq = dX * dX + dY * dY;

        if (distSq <= minProxSq) {
          const factor = 1 - distSq / minProxSq;
          const brightness = Math.max(25, Math.round(75 - (distSq / minProxSq) * 50));
          const color = `hsl(${hue}, 90%, ${brightness}%)`;

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dotRadius * (1 + factor * 0.6), 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `hsla(${hue}, 90%, ${brightness}%, ${Math.max(0.2, factor * 0.75)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(render);
  }

  render();

  return () => {
    window.removeEventListener("resize", resize);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseleave", onMouseLeave);
    if (animId) cancelAnimationFrame(animId);
  };
}

export function autoInitGrid() {
  if (typeof document === "undefined") return;
  const targets = document.querySelectorAll("#hero-interactive-grid, #admin-interactive-grid, .hero-grid-canvas, .admin-grid-canvas");
  targets.forEach((c) => {
    if (!c.dataset.gridInited) {
      c.dataset.gridInited = "true";
      initInteractiveGrid(c);
    }
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => autoInitGrid());
  } else {
    autoInitGrid();
  }
}
