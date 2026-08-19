import { useEffect, useRef } from "react";

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let particles: Array<{ x: number; y: number; z: number; speed: number; size: number }> = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(140, Math.max(55, Math.floor(width / 10)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random(),
        speed: 0.0008 + Math.random() * 0.002,
        size: 0.6 + Math.random() * 2.2,
      }));
    };

    const getColor = () => {
      const isDark = document.documentElement.classList.contains("dark");
      return isDark ? "rgba(88, 215, 255, 0.8)" : "rgba(20, 124, 170, 0.42)";
    };

    const render = () => {
      frame += 1;
      context.clearRect(0, 0, width, height);
      const color = getColor();
      const visible = particles.map((particle) => {
        particle.z -= particle.speed;
        if (particle.z <= 0.02) {
          particle.z = 1;
          particle.x = Math.random() * width;
          particle.y = Math.random() * height;
        }
        const perspective = 0.65 + particle.z * 0.9;
        return {
          x: width / 2 + (particle.x - width / 2) * perspective,
          y: height / 2 + (particle.y - height / 2) * perspective,
          radius: particle.size * perspective,
          opacity: 0.14 + particle.z * 0.62,
        };
      });

      context.lineWidth = 0.5;
      for (let index = 0; index < visible.length; index += 1) {
        const point = visible[index];
        context.beginPath();
        context.fillStyle = color.replace(/0\.8|0\.42/, `${point.opacity}`);
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fill();
        for (let next = index + 1; next < visible.length; next += 1) {
          const other = visible[next];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance < 110 && frame % 2 === 0) {
            context.beginPath();
            context.strokeStyle = color.replace(/0\.8|0\.42/, `${Math.max(0.03, 0.18 - distance / 900)}`);
            context.moveTo(point.x, point.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }
      }
      animationFrame = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}
