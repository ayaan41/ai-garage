"use client";
import { useEffect, useRef } from "react";
export default function AuroraBackground() {
  const auroraRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = auroraRef.current;
    if (!el) return;
    const h = (e: MouseEvent) => {
      el.style.setProperty("--mx", `${(e.clientX / window.innerWidth) * 100}%`);
      el.style.setProperty("--my", `${(e.clientY / window.innerHeight) * 100}%`);
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return (
    <div ref={auroraRef} className="pointer-events-none fixed inset-0" style={{ ["--mx" as any]: "50%", ["--my" as any]: "50%" } as any}>
      <div className="absolute inset-0 bg-[#050507]" />
      <div className="absolute w- h- rounded-full blur- opacity-[0.26] transition-all duration-" style={{ left: "var(--mx)", top: "var(--my)", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, #FFC61C 0%, transparent 70%)" }} />
      <div className="absolute -bottom-[25%] -left-[15%] w-[70%] h-[70%] rounded-full blur- opacity-[0.12]" style={{ background: "radial-gradient(ellipse, #10B981 0%, transparent 70%)" }} />
      <div className="absolute inset-0">
        <div className="absolute" style={{ left: "10%", top: "15%", fontSize: 110, opacity: 0.13 }}>⚙️</div>
        <div className="absolute" style={{ left: "70%", top: "20%", fontSize: 90, opacity: 0.11 }}>🛞</div>
        <div className="absolute" style={{ left: "20%", top: "60%", fontSize: 80, opacity: 0.12 }}>🔧</div>
      </div>
    </div>
  );
}