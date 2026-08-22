import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useAggregatedNews } from "@/hooks/useNews";
import { 
  Copy, Check, RefreshCw, AlertTriangle, ArrowRight, ArrowLeft,
  Sparkles, Layers, ShieldCheck, ExternalLink, Download, ZoomIn, ZoomOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { getThumbnailUrl } from "@/utils/imageOptimizer";
import { SourceFavicon } from "@/components/SourceFavicon";

export default function InstagramStudio() {
  const { data: stories, isLoading, refetch, isFetching } = useAggregatedNews(60);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState<1 | 2 | 3 | 4>(1);
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState<number>(0.85);

  const currentStory = useMemo(() => {
    if (!stories || stories.length === 0) return null;
    return stories[selectedStoryIndex] || stories[0];
  }, [stories, selectedStoryIndex]);

  const left = Math.round(currentStory?.bias?.left || 0);
  const center = Math.round(currentStory?.bias?.center || 0);
  const right = Math.round(currentStory?.bias?.right || 0);
  const totalSources = currentStory?.sourcesCount || currentStory?.sources?.length || 0;
  const category = (currentStory?.mainCategory || "ACTUALITATE").toUpperCase();
  const blindspot = currentStory?.blindspot;

  // Grupăm sursele pe cele 3 tabere
  const leftSources = useMemo(() => {
    return (currentStory?.sources || []).filter(s => {
      const b = (s.source?.bias || "").toLowerCase();
      return b.includes("left");
    });
  }, [currentStory]);

  const centerSources = useMemo(() => {
    return (currentStory?.sources || []).filter(s => {
      const b = (s.source?.bias || "").toLowerCase();
      return b === "center" || (!b.includes("left") && !b.includes("right"));
    });
  }, [currentStory]);

  const rightSources = useMemo(() => {
    return (currentStory?.sources || []).filter(s => {
      const b = (s.source?.bias || "").toLowerCase();
      return b.includes("right");
    });
  }, [currentStory]);

  const sampleLeft = leftSources[0] || { 
    source: { name: "Presa de Stânga", url: "https://g4media.ro", bias: "left" }, 
    title: currentStory?.title || "" 
  };
  const sampleCenter = centerSources[0] || { 
    source: { name: "Presa de Centru", url: "https://hotnews.ro", bias: "center" }, 
    title: currentStory?.title || "" 
  };
  const sampleRight = rightSources[0] || { 
    source: { name: "Presa de Dreapta", url: "https://antena3.ro", bias: "right" }, 
    title: currentStory?.title || "" 
  };

  const captionText = useMemo(() => {
    if (!currentStory) return "";
    return `⚖️ ${currentStory.title}

📊 Cum a relatat presa acest eveniment?
${totalSources} publicații au acoperit subiectul:
• Stânga: ${left}%
• Centru: ${center}%
• Dreapta: ${right}%

👉 Glisează pentru a vedea cum diferă titlurile și framing-ul fiecărei publicații!

🔗 Vezi analiza completă pe thesite.ro (Link în Bio)

#thesite #știri #romania #groundnews #media #bias #actualitate #presaromana`;
  }, [currentStory, totalSources, left, center, right]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(captionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      <Helmet>
        <title>Instagram Studio Privat | thesite.ro</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Ambient background light glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[140px]" />
        <div className="absolute top-[40%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-amber-500/15 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-rose-600/15 blur-[140px]" />
      </div>

      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0c0e14]/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="font-serif italic font-bold text-2xl text-amber-100 tracking-tight">thesite.ro</span>
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-amber-500/40 text-amber-400 bg-amber-500/10 font-mono px-2 py-0.5">
              Studio Instagram
            </Badge>
          </Link>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">| Previzualizare Carusel 1080×1350</span>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="border-white/15 bg-white/5 hover:bg-white/10 text-xs rounded-full gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-amber-400" : ""}`} />
            Reîmprospătează
          </Button>
          <Button 
            onClick={copyToClipboard}
            size="sm"
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-full gap-2 shadow-lg shadow-amber-400/20"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
            {copied ? "Copiat în clipboard!" : "Copiază Caption"}
          </Button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="relative z-10 flex-1 max-w-[1650px] w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        
        {/* Left Column: Story Selector */}
        <div className="space-y-4 bg-white/[0.02] border border-white/10 backdrop-blur-md p-4 rounded-3xl">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Alege o știre ({stories?.length || 0})
            </h2>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live Feed
            </span>
          </div>

          <div className="space-y-2.5 max-h-[76vh] overflow-y-auto pr-1.5 custom-scrollbar">
            {isLoading && (
              <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                Se încarcă știrile...
              </div>
            )}
            {stories?.map((story, idx) => {
              const isSelected = idx === selectedStoryIndex;
              return (
                <button
                  key={story.id || idx}
                  onClick={() => setSelectedStoryIndex(idx)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border group relative overflow-hidden ${
                    isSelected 
                      ? "bg-gradient-to-r from-amber-500/15 to-amber-500/5 border-amber-500/50 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30" 
                      : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      {story.mainCategory || "Actualitate"}
                    </span>
                    <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-slate-300 border border-white/10">
                      {story.sourcesCount || story.sources?.length || 0} surse
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-snug line-clamp-2 text-slate-200 group-hover:text-white transition-colors">
                    {story.title}
                  </p>
                  
                  {/* Mini Bias Bar */}
                  <div className="mt-3 flex h-1.5 w-full rounded-full overflow-hidden bg-white/10 gap-0.5">
                    <div style={{ width: `${story.bias?.left || 0}%` }} className="bg-gradient-to-r from-blue-500 to-cyan-400" />
                    <div style={{ width: `${story.bias?.center || 0}%` }} className="bg-slate-200" />
                    <div style={{ width: `${story.bias?.right || 0}%` }} className="bg-gradient-to-r from-rose-500 to-red-500" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Slide Visualizer & Controls */}
        <div className="flex flex-col items-center w-full">
          
          {/* Top Control Bar: Slide Tabs & Zoom Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 w-full max-w-[620px] mb-6">
            
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/[0.04] border border-white/10 rounded-full backdrop-blur-xl shadow-xl">
              <button
                onClick={() => setActiveSlide(1)}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                  activeSlide === 1 ? "bg-amber-400 text-black shadow-md shadow-amber-400/20" : "text-slate-400 hover:text-white"
                }`}
              >
                Slide 1: Copertă
              </button>
              <button
                onClick={() => setActiveSlide(2)}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                  activeSlide === 2 ? "bg-amber-400 text-black shadow-md shadow-amber-400/20" : "text-slate-400 hover:text-white"
                }`}
              >
                Slide 2: Titluri
              </button>
              <button
                onClick={() => setActiveSlide(3)}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                  activeSlide === 3 ? "bg-amber-400 text-black shadow-md shadow-amber-400/20" : "text-slate-400 hover:text-white"
                }`}
              >
                Slide 3: CTA
              </button>
              <button
                onClick={() => setActiveSlide(4)}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                  activeSlide === 4 ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20" : "text-slate-400 hover:text-white"
                }`}
              >
                Single-Post
              </button>
            </div>

            {/* Scale controls */}
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-xl">
              <button 
                onClick={() => setScale(s => Math.max(0.5, +(s - 0.05).toFixed(2)))} 
                className="text-slate-400 hover:text-white p-1"
                title="Micșorează"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-300 w-10 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button 
                onClick={() => setScale(s => Math.min(1.25, +(s + 0.05).toFixed(2)))} 
                className="text-slate-400 hover:text-white p-1"
                title="Mărește"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Canvas Container with scaled dimensions */}
          <div 
            className="transition-all duration-200 ease-out origin-top flex items-center justify-center"
            style={{ transform: `scale(${scale})`, marginBottom: `${(scale - 1) * 675}px` }}
          >
            {/* 1080x1350 Ratio Frame */}
            <div className="w-[540px] h-[675px] bg-[#090a0f] border border-white/20 rounded-[32px] shadow-2xl shadow-black/80 overflow-hidden relative flex flex-col p-7 justify-between select-none">
              
              {/* Radial dot matrix background */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-25" 
                style={{
                  backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)",
                  backgroundSize: "22px 22px"
                }} 
              />
              
              {/* Soft corner gradient accents */}
              <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* SLIDE 1: Cover & Bias Bar */}
              {activeSlide === 1 && currentStory && (
                <div className="relative z-10 flex flex-col justify-between h-full">
                  {/* Top Bar */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md shadow-amber-500/15">
                        {category}
                      </span>
                      <span className="bg-white/10 text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/15 backdrop-blur-md">
                        {totalSources} SURSE
                      </span>
                    </div>
                    <div className="bg-[#f2efe6] px-4 py-1 rounded-full shadow-lg border border-white/40">
                      <span className="font-serif italic font-bold text-black text-sm tracking-tight">thesite.ro</span>
                    </div>
                  </div>

                  {/* Hero Image Card */}
                  <div className="relative my-4 rounded-2xl overflow-hidden flex-1 border border-white/15 shadow-2xl bg-black/60 group">
                    <img 
                      src={getThumbnailUrl(currentStory.image) || PLACEHOLDER_IMAGE} 
                      alt={currentStory.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/40 to-transparent" />
                    
                    <div className="absolute bottom-0 inset-x-0 p-5 space-y-2.5">
                      {blindspot && (
                        <div className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/50 text-red-300 text-[11px] font-black px-3 py-1 rounded-lg backdrop-blur-md shadow-md">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          PUNCT ORB: Ignorat de {blindspot === 'left' ? 'Stânga' : 'Dreapta'}
                        </div>
                      )}
                      <h1 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-md text-balance">
                        {currentStory.title}
                      </h1>
                    </div>
                  </div>

                  {/* Bias Bar Card */}
                  <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 backdrop-blur-xl space-y-2.5 shadow-xl">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Distribuție orientare media</span>
                      <span className="text-amber-400 font-extrabold">{totalSources} publicații analizate</span>
                    </div>

                    <div className="flex justify-between text-xs font-black">
                      <span className="text-cyan-400">Stânga {left}%</span>
                      <span className="text-slate-200">Centru {center}%</span>
                      <span className="text-rose-400">Dreapta {right}%</span>
                    </div>

                    <div className="flex h-3 w-full rounded-full overflow-hidden gap-1 bg-white/10 p-0.5 border border-white/10">
                      <div style={{ width: `${left}%` }} className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-l-full" />
                      <div style={{ width: `${center}%` }} className="bg-slate-200 h-full" />
                      <div style={{ width: `${right}%` }} className="bg-gradient-to-r from-rose-500 to-red-500 h-full rounded-r-full" />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span className="font-semibold text-slate-400">Analiză automată media</span>
                      <span className="text-amber-400 font-black flex items-center gap-1 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                        Glisează pentru titluri <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 2: Head-to-Head Headlines */}
              {activeSlide === 2 && currentStory && (
                <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                  {/* Top Bar */}
                  <div className="flex justify-between items-center">
                    <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-black text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                      Comparație Titluri
                    </span>
                    <span className="font-serif italic font-bold text-slate-200 text-sm tracking-tight">thesite.ro</span>
                  </div>

                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-amber-400 mb-0.5">Perspective Media</p>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-tight">Același eveniment, unghiuri diferite</h2>
                  </div>

                  {/* Headline Outlet Cards Stack */}
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    
                    {/* Left Outlet Card */}
                    <div className="bg-white/[0.04] border border-white/10 border-l-4 border-l-cyan-400 rounded-2xl p-4 backdrop-blur-md space-y-2 relative overflow-hidden shadow-lg">
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-2">
                          <SourceFavicon source={sampleLeft.source} size="xs" showRing={false} />
                          <span className="text-slate-200 font-black text-xs">{sampleLeft.source?.name}</span>
                        </div>
                        <span className="bg-cyan-500/20 text-cyan-300 font-black px-2.5 py-0.5 rounded-md border border-cyan-500/30 uppercase">
                          Stânga
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                        „{sampleLeft.title}”
                      </p>
                    </div>

                    {/* Center Outlet Card */}
                    <div className="bg-white/[0.04] border border-white/10 border-l-4 border-l-slate-200 rounded-2xl p-4 backdrop-blur-md space-y-2 relative overflow-hidden shadow-lg">
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-2">
                          <SourceFavicon source={sampleCenter.source} size="xs" showRing={false} />
                          <span className="text-slate-200 font-black text-xs">{sampleCenter.source?.name}</span>
                        </div>
                        <span className="bg-white/20 text-slate-200 font-black px-2.5 py-0.5 rounded-md border border-white/30 uppercase">
                          Centru
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                        „{sampleCenter.title}”
                      </p>
                    </div>

                    {/* Right Outlet Card */}
                    <div className="bg-white/[0.04] border border-white/10 border-l-4 border-l-rose-500 rounded-2xl p-4 backdrop-blur-md space-y-2 relative overflow-hidden shadow-lg">
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-2">
                          <SourceFavicon source={sampleRight.source} size="xs" showRing={false} />
                          <span className="text-slate-200 font-black text-xs">{sampleRight.source?.name}</span>
                        </div>
                        <span className="bg-rose-500/20 text-rose-300 font-black px-2.5 py-0.5 rounded-md border border-rose-500/30 uppercase">
                          Dreapta
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                        „{sampleRight.title}”
                      </p>
                    </div>

                  </div>

                  <div className="bg-white/[0.06] border border-white/10 rounded-full px-4 py-2 flex justify-between items-center text-[10px] backdrop-blur-md">
                    <span className="text-slate-400 font-medium">Vezi cum limbajul schimbă nuanța</span>
                    <span className="text-amber-400 font-black flex items-center gap-1">
                      Glisează pentru sinteză <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              )}

              {/* SLIDE 3: CTA & Mission */}
              {activeSlide === 3 && (
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center">
                    <span className="font-serif italic font-bold text-amber-100 text-lg tracking-tight">thesite.ro</span>
                    <span className="text-[10px] bg-white/10 border border-white/15 px-3 py-1 rounded-full text-slate-200 font-extrabold backdrop-blur-md">
                      Harta presei românești
                    </span>
                  </div>

                  <div className="bg-white/[0.04] border border-white/15 rounded-3xl p-6 text-center space-y-4 my-auto backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 text-black text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-md">
                      <ShieldCheck className="w-3.5 h-3.5 text-black" />
                      Decide tu ce să crezi
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                      Ieși din bula de știri.
                    </h2>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto font-medium">
                      Pe <strong className="text-white">thesite.ro</strong> grupăm știrile pe subiecte, măsurăm bias-ul politic și îți arătăm ce omit publicațiile pe care le citești zilnic.
                    </p>

                    <div className="inline-flex items-center gap-2 bg-[#f2efe6] text-black px-6 py-2.5 rounded-full font-black text-xs shadow-xl border border-white">
                      🔗 Link în bio: thesite.ro
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-left text-[10px] text-slate-300">
                      <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                        <span className="text-amber-400 font-black">✓</span> 35+ publicații
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                        <span className="text-amber-400 font-black">✓</span> Detecție blindspots
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                        <span className="text-amber-400 font-black">✓</span> Comparație titluri
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                        <span className="text-amber-400 font-black">✓</span> Fără algoritmi de bulă
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3 flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>© thesite.ro</span>
                    <span>Urmărește @thesite.ro</span>
                  </div>
                </div>
              )}

              {/* SLIDE 4: Single-Post Layout */}
              {activeSlide === 4 && currentStory && (
                <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-400 text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        {category}
                      </span>
                      <span className="bg-white/15 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/10">
                        {totalSources} SURSE
                      </span>
                    </div>
                    <span className="font-serif italic font-bold text-amber-100 text-sm">thesite.ro</span>
                  </div>

                  {/* Hero Box */}
                  <div className="relative rounded-2xl overflow-hidden h-[180px] border border-white/15 bg-black/60 shadow-xl">
                    <img 
                      src={getThumbnailUrl(currentStory.image) || PLACEHOLDER_IMAGE} 
                      alt={currentStory.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/40 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-3.5">
                      <h2 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2">
                        {currentStory.title}
                      </h2>
                    </div>
                  </div>

                  {/* Mini Bias Bar */}
                  <div className="bg-white/[0.05] border border-white/10 rounded-xl p-3 space-y-1.5 backdrop-blur-md">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
                      <span>Distribuție media</span>
                      <span>{totalSources} surse</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-extrabold">
                      <span className="text-cyan-400">Stânga {left}%</span>
                      <span className="text-slate-200">Centru {center}%</span>
                      <span className="text-rose-400">Dreapta {right}%</span>
                    </div>
                    <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 bg-white/10 p-0.5">
                      <div style={{ width: `${left}%` }} className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-l-full" />
                      <div style={{ width: `${center}%` }} className="bg-slate-200" />
                      <div style={{ width: `${right}%` }} className="bg-gradient-to-r from-rose-500 to-red-500 rounded-r-full" />
                    </div>
                  </div>

                  {/* 2 Mini Headlines with Favicons */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/[0.04] border border-white/10 border-l-2 border-l-cyan-400 p-3 rounded-xl space-y-1.5 backdrop-blur-md">
                      <div className="flex items-center gap-1.5">
                        <SourceFavicon source={sampleLeft.source} size="xs" showRing={false} />
                        <span className="text-[9px] font-black text-cyan-300 uppercase truncate">
                          {sampleLeft.source?.name}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-200 line-clamp-2 leading-tight">„{sampleLeft.title}”</p>
                    </div>

                    <div className="bg-white/[0.04] border border-white/10 border-l-2 border-l-rose-400 p-3 rounded-xl space-y-1.5 backdrop-blur-md">
                      <div className="flex items-center gap-1.5">
                        <SourceFavicon source={sampleRight.source} size="xs" showRing={false} />
                        <span className="text-[9px] font-black text-rose-300 uppercase truncate">
                          {sampleRight.source?.name}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-200 line-clamp-2 leading-tight">„{sampleRight.title}”</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-2 flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>thesite.ro — Vezi toate perspectivele</span>
                    <span className="text-amber-400 font-bold">🔗 Link în bio</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Slide Navigation Buttons */}
          <div className="flex items-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={activeSlide === 1}
              onClick={() => setActiveSlide((s) => Math.max(1, s - 1) as any)}
              className="rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-xs gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Slide anterior
            </Button>
            <span className="text-xs font-bold text-slate-400">
              {activeSlide <= 3 ? `Slide ${activeSlide} din 3` : "Single Post"}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={activeSlide === 3}
              onClick={() => setActiveSlide((s) => Math.min(3, s + 1) as any)}
              className="rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-xs gap-1.5"
            >
              Următorul slide <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

      </main>
    </div>
  );
}
