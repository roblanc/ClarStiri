import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useAggregatedNews } from "@/hooks/useNews";
import { 
  Copy, Check, RefreshCw, AlertTriangle, ArrowRight, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { getThumbnailUrl } from "@/utils/imageOptimizer";

export default function InstagramStudio() {
  const { data: stories, isLoading, refetch, isFetching } = useAggregatedNews(60);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState<1 | 2 | 3 | 4>(1);
  const [copied, setCopied] = useState(false);

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

  const sampleLeft = leftSources[0] || { source: { name: "Presa de Stânga" }, title: currentStory?.title || "" };
  const sampleCenter = centerSources[0] || { source: { name: "Presa de Centru" }, title: currentStory?.title || "" };
  const sampleRight = rightSources[0] || { source: { name: "Presa de Dreapta" }, title: currentStory?.title || "" };

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
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      <Helmet>
        <title>Instagram Studio Privat | thesite.ro</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0f1117]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="font-serif italic font-bold text-2xl text-amber-100">thesite.ro</span>
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-amber-500/40 text-amber-400 bg-amber-500/10">
              Studio Instagram
            </Badge>
          </Link>
          <span className="hidden sm:inline-block text-xs text-slate-400">| Pagină privată de previzualizare</span>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="border-white/15 bg-white/5 hover:bg-white/10 text-xs rounded-full gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Reîmprospătează știri
          </Button>
          <Button 
            onClick={copyToClipboard}
            size="sm"
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-full gap-2"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copiat în clipboard!" : "Copiază Caption"}
          </Button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        
        {/* Left Column: Story Picker */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
              Alege o știre ({stories?.length || 0})
            </h2>
            <span className="text-[11px] text-slate-500">Live feed</span>
          </div>

          <div className="space-y-2.5 max-h-[78vh] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading && (
              <div className="p-8 text-center text-slate-500 text-sm">Se încarcă știrile...</div>
            )}
            {stories?.map((story, idx) => {
              const isSelected = idx === selectedStoryIndex;
              return (
                <button
                  key={story.id || idx}
                  onClick={() => setSelectedStoryIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                    isSelected 
                      ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30" 
                      : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {story.mainCategory || "Actualitate"}
                    </span>
                    <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                      {story.sourcesCount || story.sources?.length || 0} surse
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-snug line-clamp-2 text-slate-200">
                    {story.title}
                  </p>
                  
                  {/* Mini Bias Bar */}
                  <div className="mt-3 flex h-1.5 w-full rounded-full overflow-hidden bg-white/10 gap-0.5">
                    <div style={{ width: `${story.bias?.left || 0}%` }} className="bg-blue-500" />
                    <div style={{ width: `${story.bias?.center || 0}%` }} className="bg-slate-300" />
                    <div style={{ width: `${story.bias?.right || 0}%` }} className="bg-red-500" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Slide Visualizer */}
        <div className="flex flex-col items-center">
          
          {/* Slide Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-full mb-6 max-w-full">
            <button
              onClick={() => setActiveSlide(1)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeSlide === 1 ? "bg-amber-400 text-black shadow-md" : "text-slate-300 hover:text-white"
              }`}
            >
              Slide 1: Copertă & Bară
            </button>
            <button
              onClick={() => setActiveSlide(2)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeSlide === 2 ? "bg-amber-400 text-black shadow-md" : "text-slate-300 hover:text-white"
              }`}
            >
              Slide 2: Comparație Titluri
            </button>
            <button
              onClick={() => setActiveSlide(3)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeSlide === 3 ? "bg-amber-400 text-black shadow-md" : "text-slate-300 hover:text-white"
              }`}
            >
              Slide 3: Sinteză & CTA
            </button>
            <button
              onClick={() => setActiveSlide(4)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeSlide === 4 ? "bg-blue-500 text-white shadow-md" : "text-blue-300 hover:text-white"
              }`}
            >
              Varianta Single-Post
            </button>
          </div>

          {/* 1080x1350 Canvas Preview Container */}
          <div className="w-full max-w-[540px] aspect-[4/5] bg-[#0f1015] border border-white/15 rounded-[28px] shadow-2xl overflow-hidden relative flex flex-col p-6 sm:p-7 justify-between select-none">
            
            {/* Background Grid Dots */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40" 
              style={{
                backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }} 
            />

            {/* SLIDE 1: Cover & Bias Bar */}
            {activeSlide === 1 && currentStory && (
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      {category}
                    </span>
                    <span className="bg-white/15 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                      {totalSources} SURSE
                    </span>
                  </div>
                  <div className="bg-[#f0eee6] px-3.5 py-1 rounded-full shadow-md">
                    <span className="font-serif italic font-bold text-black text-sm">thesite.ro</span>
                  </div>
                </div>

                {/* Hero Image Card */}
                <div className="relative my-4 rounded-2xl overflow-hidden flex-1 border border-white/15 shadow-xl bg-black">
                  <img 
                    src={getThumbnailUrl(currentStory.image) || PLACEHOLDER_IMAGE} 
                    alt={currentStory.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0f] via-black/40 to-transparent" />
                  
                  <div className="absolute bottom-0 inset-x-0 p-5 space-y-2.5">
                    {blindspot && (
                      <div className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/50 text-red-300 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3" />
                        Punct Orb: Ignorat de {blindspot === 'left' ? 'Stânga' : 'Dreapta'}
                      </div>
                    )}
                    <h1 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight text-balance">
                      {currentStory.title}
                    </h1>
                  </div>
                </div>

                {/* Bias Meter Section */}
                <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4 backdrop-blur-md space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Distribuție media</span>
                    <span>{totalSources} publicații</span>
                  </div>

                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-blue-400">Stânga {left}%</span>
                    <span className="text-slate-200">Centru {center}%</span>
                    <span className="text-red-400">Dreapta {right}%</span>
                  </div>

                  <div className="flex h-3 w-full rounded-full overflow-hidden gap-1 bg-white/10">
                    <div style={{ width: `${left}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${center}%` }} className="bg-slate-200 h-full" />
                    <div style={{ width: `${right}%` }} className="bg-red-500 h-full" />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span>Analiză automată a presei</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      Glisează pentru titluri <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 2: Head-to-Head Headlines */}
            {activeSlide === 2 && currentStory && (
              <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                <div className="flex justify-between items-center">
                  <span className="bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                    Comparație Titluri
                  </span>
                  <span className="font-serif italic font-bold text-slate-200 text-sm">thesite.ro</span>
                </div>

                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-amber-400">Perspective media</p>
                  <h2 className="text-lg sm:text-xl font-black text-white">Același eveniment, unghiuri diferite</h2>
                </div>

                {/* Stacked Cards */}
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  {/* Left Outlet */}
                  <div className="bg-white/[0.04] border border-white/10 border-l-4 border-l-blue-500 rounded-xl p-3.5 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="bg-blue-500/20 text-blue-300 font-black px-2 py-0.5 rounded uppercase">Stânga</span>
                      <span className="text-slate-400 font-bold">{sampleLeft.source?.name || "Presă Stânga"}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                      „{sampleLeft.title}”
                    </p>
                  </div>

                  {/* Center Outlet */}
                  <div className="bg-white/[0.04] border border-white/10 border-l-4 border-l-slate-200 rounded-xl p-3.5 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="bg-white/20 text-slate-200 font-black px-2 py-0.5 rounded uppercase">Centru</span>
                      <span className="text-slate-400 font-bold">{sampleCenter.source?.name || "Presă Centru"}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                      „{sampleCenter.title}”
                    </p>
                  </div>

                  {/* Right Outlet */}
                  <div className="bg-white/[0.04] border border-white/10 border-l-4 border-l-red-500 rounded-xl p-3.5 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="bg-red-500/20 text-red-300 font-black px-2 py-0.5 rounded uppercase">Dreapta</span>
                      <span className="text-slate-400 font-bold">{sampleRight.source?.name || "Presă Dreapta"}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                      „{sampleRight.title}”
                    </p>
                  </div>
                </div>

                <div className="bg-white/[0.06] border border-white/10 rounded-full px-4 py-2 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Vezi cum limbajul schimbă nuanța</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    Glisează pentru sinteză <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            )}

            {/* SLIDE 3: CTA & Mission */}
            {activeSlide === 3 && (
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-center">
                  <span className="font-serif italic font-bold text-amber-100 text-lg">thesite.ro</span>
                  <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full text-slate-300 font-bold">
                    Harta presei românești
                  </span>
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 text-center space-y-4 my-auto backdrop-blur-md">
                  <span className="bg-emerald-400 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full inline-block">
                    Decide tu ce să crezi
                  </span>

                  <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                    Ieși din bula de știri.
                  </h2>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                    Pe <strong>thesite.ro</strong> grupăm știrile pe subiecte, măsurăm bias-ul politic și îți arătăm ce omit publicațiile pe care le citești zilnic.
                  </p>

                  <div className="inline-flex items-center gap-2 bg-[#f0eee6] text-black px-6 py-2.5 rounded-full font-black text-sm shadow-xl">
                    🔗 Link în bio: thesite.ro
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-left text-[10px] text-slate-300">
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-center gap-1.5">
                      <span className="text-amber-400">✓</span> 35+ publicații
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-center gap-1.5">
                      <span className="text-amber-400">✓</span> Detecție blindspots
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-center gap-1.5">
                      <span className="text-amber-400">✓</span> Comparație titluri
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-center gap-1.5">
                      <span className="text-amber-400">✓</span> Fără algoritmi de bulă
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>© thesite.ro</span>
                  <span>Urmărește @thesite.ro</span>
                </div>
              </div>
            )}

            {/* SLIDE 4 / Single Post Layout */}
            {activeSlide === 4 && currentStory && (
              <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      {category}
                    </span>
                    <span className="bg-white/15 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {totalSources} SURSE
                    </span>
                  </div>
                  <span className="font-serif italic font-bold text-amber-100 text-sm">thesite.ro</span>
                </div>

                {/* Hero Box */}
                <div className="relative rounded-xl overflow-hidden h-[180px] border border-white/15 bg-black">
                  <img 
                    src={getThumbnailUrl(currentStory.image) || PLACEHOLDER_IMAGE} 
                    alt={currentStory.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <h2 className="text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-2">
                      {currentStory.title}
                    </h2>
                  </div>
                </div>

                {/* Mini Bias Bar */}
                <div className="bg-white/[0.05] border border-white/10 rounded-xl p-3 space-y-1.5">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
                    <span>Distribuție media</span>
                    <span>{totalSources} surse</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-extrabold">
                    <span className="text-blue-400">Stânga {left}%</span>
                    <span className="text-slate-200">Centru {center}%</span>
                    <span className="text-red-400">Dreapta {right}%</span>
                  </div>
                  <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 bg-white/10">
                    <div style={{ width: `${left}%` }} className="bg-blue-500" />
                    <div style={{ width: `${center}%` }} className="bg-slate-200" />
                    <div style={{ width: `${right}%` }} className="bg-red-500" />
                  </div>
                </div>

                {/* 2 Mini Headlines */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/[0.04] border border-white/10 border-l-2 border-l-blue-500 p-2.5 rounded-lg space-y-1">
                    <span className="text-[9px] font-black text-blue-400 uppercase block">Stânga ({sampleLeft.source?.name})</span>
                    <p className="text-[10px] font-bold text-slate-200 line-clamp-2 leading-tight">„{sampleLeft.title}”</p>
                  </div>
                  <div className="bg-white/[0.04] border border-white/10 border-l-2 border-l-red-500 p-2.5 rounded-lg space-y-1">
                    <span className="text-[9px] font-black text-red-400 uppercase block">Dreapta ({sampleRight.source?.name})</span>
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

          {/* Slide Navigation Buttons */}
          <div className="flex items-center gap-4 mt-6">
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
