"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "アイウエオカキクケコサシスセソ0123456789ABCDEF<>/\\|=+*";

/** Green falling characters over the terminal until any key (or click). */
export function MatrixRain({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement!;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () =>
      Math.floor(Math.random() * (canvas.height / fontSize))
    );

    let raf = 0;
    let last = 0;
    function draw(t: number) {
      raf = requestAnimationFrame(draw);
      if (t - last < 50) return;
      last = t;
      ctx!.fillStyle = "rgba(5, 8, 10, 0.18)";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      ctx!.fillStyle = "#57c97a";
      ctx!.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        ctx!.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas!.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    raf = requestAnimationFrame(draw);

    function stop() {
      onDone();
    }
    window.addEventListener("keydown", stop, true);
    window.addEventListener("pointerdown", stop, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", stop, true);
      window.removeEventListener("pointerdown", stop, true);
    };
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10"
      aria-label="Matrix rain — press any key to exit"
    />
  );
}
