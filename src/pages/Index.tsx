import { Suspense, lazy, useEffect, useState } from "react";
import { Gamepad2, Wifi, Wrench, Lightbulb, Cpu, Hammer, Volume2 } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const Keyboard3D = lazy(() => import("@/components/Keyboard3D"));

const products = [
  {
    icon: Gamepad2,
    title: "Gaming Keyboard",
    desc: "8000Hz polling, optical switches, sub-millisecond response. Built for competitive precision.",
    accent: "from-fuchsia-500/30 to-violet-500/30",
  },
  {
    icon: Wifi,
    title: "Wireless Keyboard",
    desc: "Tri-mode connectivity. 200-hour battery. Travel-ready 75% layout in CNC aluminum.",
    accent: "from-sky-500/30 to-indigo-500/30",
  },
  {
    icon: Wrench,
    title: "Custom Keyboard",
    desc: "Hot-swappable, gasket-mounted, fully programmable. Designed for the perfect feel.",
    accent: "from-violet-500/30 to-pink-500/30",
  },
];

const features = [
  { icon: Lightbulb, title: "RGB Lighting", desc: "16.8M colors with per-key diffusion and reactive effects." },
  { icon: Cpu, title: "Switch Types", desc: "Linear Reds, Tactile Browns, Clicky Blues — your touch, your sound." },
  { icon: Hammer, title: "Build Quality", desc: "Aerospace-grade aluminum chassis with PBT double-shot keycaps." },
  { icon: Volume2, title: "Typing Sound", desc: "Foam-dampened, lubed stabilizers. A satisfying thock with every press." },
];

const RevealDiv = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const LoadingScreen = ({ visible }: { visible: boolean }) => (
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ${
      visible ? "opacity-100" : "opacity-0 pointer-events-none"
    }`}
    style={{ background: "var(--gradient-bg)" }}
  >
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-secondary/20 border-b-secondary animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
      </div>
      <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">Initializing</p>
    </div>
  </div>
);

const Index = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <LoadingScreen visible={loading} />

      {/* Ambient orbs */}
      <div className="ambient-orb top-[-10%] left-[-5%] h-[500px] w-[500px] bg-primary/30 animate-glow-pulse" />
      <div className="ambient-orb top-[20%] right-[-10%] h-[600px] w-[600px] bg-secondary/25 animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="ambient-orb bottom-[10%] left-[20%] h-[400px] w-[400px] bg-accent/20 animate-glow-pulse" style={{ animationDelay: "3s" }} />

      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-[0_0_20px_hsl(var(--primary)/0.6)]" />
            <span>KEYFORGE</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#products" className="hover:text-foreground transition-colors">Products</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#craft" className="hover:text-foreground transition-colors">Craft</a>
          </nav>
          <button className="btn-ghost-premium text-sm py-2 px-5">Buy Now</button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-start pt-28 px-6">
        <RevealDiv className="text-center max-w-4xl mx-auto z-10">
          <span className="inline-block text-xs tracking-[0.4em] uppercase text-muted-foreground mb-6 px-4 py-1.5 rounded-full glass">
            New · Series X Pro
          </span>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6">
            Mechanical Precision,
            <br />
            <span className="text-gradient">Perfect Performance</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            A keyboard engineered down to the micron. Hover, click and explore every key — built for those who feel the difference.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="btn-premium">Shop Series X</button>
            <button className="btn-ghost-premium">Explore Tech</button>
          </div>
        </RevealDiv>

        {/* 3D canvas */}
        <div className="relative w-full max-w-6xl h-[60vh] md:h-[70vh] mt-4 -mb-20">
          <Suspense fallback={null}>
            <Keyboard3D />
          </Suspense>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/70 tracking-widest uppercase">
            Drag to orbit · Hover for RGB · Click to type
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="relative py-32 px-6">
        <div className="mx-auto max-w-7xl">
          <RevealDiv className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-primary mb-4">The Lineup</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold">
              Three boards. <span className="text-gradient">Infinite feel.</span>
            </h2>
          </RevealDiv>

          <div className="grid md:grid-cols-3 gap-6">
            {products.map((p, i) => {
              const Icon = p.icon;
              return (
                <RevealDiv key={p.title} delay={i * 120}>
                  <article className="glass glass-hover rounded-3xl p-8 h-full group">
                    <div className={`relative h-48 mb-6 rounded-2xl bg-gradient-to-br ${p.accent} overflow-hidden flex items-center justify-center`}>
                      <Icon className="h-20 w-20 text-foreground/90 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.2} />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold mb-3">{p.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{p.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80">From $189</span>
                      <span className="text-primary text-sm group-hover:translate-x-1 transition-transform">Discover →</span>
                    </div>
                  </article>
                </RevealDiv>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-32 px-6">
        <div className="mx-auto max-w-7xl">
          <RevealDiv className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-secondary mb-4">Engineering</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold max-w-3xl mx-auto">
              Crafted for those who <span className="text-gradient-glow">obsess over details</span>.
            </h2>
          </RevealDiv>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <RevealDiv key={f.title} delay={i * 100}>
                  <div className="glass glass-hover rounded-2xl p-7 h-full">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-5 border border-white/10">
                      <Icon className="h-7 w-7 text-primary-glow" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </RevealDiv>
              );
            })}
          </div>
        </div>
      </section>

      {/* CRAFT / CTA */}
      <section id="craft" className="relative py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <RevealDiv>
            <div className="glass rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
              <div className="relative">
                <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
                  Feel every <span className="text-gradient">keystroke.</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                  Pre-order the Series X Pro and experience the future of mechanical typing.
                </p>
                <button className="btn-premium">Pre-order Now — $249</button>
              </div>
            </div>
          </RevealDiv>
        </div>
      </section>

      <footer className="relative py-12 px-6 border-t border-white/5">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Keyforge. Crafted in titanium and code.</span>
          <span className="tracking-widest text-xs uppercase">Mechanical · Precision · Perfection</span>
        </div>
      </footer>
    </main>
  );
};

export default Index;
