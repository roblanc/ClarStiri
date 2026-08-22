import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useAggregatedNews } from "@/hooks/useNews";
import { 
  Copy, Check, RefreshCw, AlertTriangle, ArrowRight, ArrowLeft,
  Layers, ZoomIn, ZoomOut
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

  // Calculăm eticheta de dominanță/preluare
  const dominantBadgeLabel = useMemo(() => {
    if (blindspot === 'left') return 'Punct Orbit Stânga';
    if (blindspot === 'right') return 'Punct Orbit Dreapta';
    if (left > center && left > right) return 'Preluat de Stânga';
    if (right > center && right > left) return 'Preluat de Dreapta';
    return 'Preluat de Centru';
  }, [blindspot, left, center, right]);

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
    return `thesite.ro ${currentStory.title}. Vezi știrea din toate perspectivele pe thesite.ro.

#stiri #politica #economie #romania`;
  }, [currentStory]);

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

      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0c0e14]/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="font-serif italic font-bold text-2xl text-amber-100 tracking-tight">thesite.ro</span>
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-amber-500/40 text-amber-400 bg-amber-500/10 font-mono px-2 py-0.5">
              Studio Instagram
            </Badge>
          </Link>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">| Previzualizare Card Clasic Site (1080×1350)</span>
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
            {copied ? "Copiat!" : "Copiază Caption"}
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
                    <div style={{ width: `${story.bias?.left || 0}%` }} className="bg-[#23497d]" />
                    <div style={{ width: `${story.bias?.center || 0}%` }} className="bg-white" />
                    <div style={{ width: `${story.bias?.right || 0}%` }} className="bg-[#7e2226]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Slide Visualizer & Controls */}
        <div className="flex flex-col items-center w-full">
          
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 w-full max-w-[620px] mb-6">
            
            {/* Slide Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/[0.04] border border-white/10 rounded-full backdrop-blur-xl shadow-xl">
              <button
                onClick={() => setActiveSlide(1)}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                  activeSlide === 1 ? "bg-amber-400 text-black shadow-md shadow-amber-400/20" : "text-slate-400 hover:text-white"
                }`}
              >
                Card Clasic Site
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
            {/* 1080x1350 Ratio Frame (540px x 675px canvas) */}
            <div className="w-[540px] h-[675px] bg-[#000000] border border-white/20 rounded-none shadow-2xl overflow-hidden relative flex flex-col justify-between select-none">
              
              {/* SLIDE 1: EXACT CLASSIC SITE CARD LAYOUT */}
              {activeSlide === 1 && currentStory && (
                <div className="relative z-10 flex flex-col justify-between h-full w-full bg-black">
                  
                  {/* Hero Image Container (top ~82% height) */}
                  <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-between p-6">
                    <img 
                      src={getThumbnailUrl(currentStory.image) || PLACEHOLDER_IMAGE} 
                      alt={currentStory.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Dark gradient overlay at the bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    {/* Top Badges Bar */}
                    <div className="relative z-20 flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {/* 7 SURSE Pill */}
                        <div className="bg-[#1e293b] text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-none shadow-lg">
                          {totalSources} SURSE
                        </div>
                        {/* Timp Pill */}
                        <div className="bg-[#1e293b]/90 text-white text-xs font-bold px-3.5 py-1.5 rounded-none backdrop-blur-md">
                          {currentStory.timeAgo || "acum 20 min"}
                        </div>
                      </div>

                      {/* Right Badge Pill: Preluat de Centru / Stânga / Dreapta */}
                      <div className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-none shadow-lg">
                        {dominantBadgeLabel}
                      </div>
                    </div>

                    {/* Headline & Watermark at bottom of image */}
                    <div className="relative z-20 space-y-3 pt-12">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug tracking-tight drop-shadow-md text-balance">
                        {currentStory.title}
                      </h1>
                      <div className="text-[12px] font-medium text-slate-300 tracking-wide opacity-90">
                        thesite.ro
                      </div>
                    </div>
                  </div>

                  {/* Bottom Solid 3-Column Bias Bar (bottom ~18% height) */}
                  <div className="flex w-full h-[105px] shrink-0 border-t border-black">
                    
                    {/* Left Column (Blue) */}
                    <div className="flex-1 bg-[#23497d] flex flex-col justify-center items-center p-2 text-white">
                      <span className="text-[11px] font-black tracking-widest uppercase mb-1">STÂNGA</span>
                      <span className="text-3xl font-black">{left}%</span>
                    </div>

                    {/* Center Column (White) */}
                    <div className="flex-1 bg-white flex flex-col justify-center items-center p-2 text-[#1e293b]">
                      <span className="text-[11px] font-black tracking-widest uppercase mb-1">CENTRU</span>
                      <span className="text-3xl font-black">{center}%</span>
                    </div>

                    {/* Right Column (Red) */}
                    <div className="flex-1 bg-[#7e2226] flex flex-col justify-center items-center p-2 text-white">
                      <span className="text-[11px] font-black tracking-widest uppercase mb-1">DREAPTA</span>
                      <span className="text-3xl font-black">{right}%</span>
                    </div>

                  </div>

                </div>
              )}

              {/* SLIDE 2: Head-to-Head Headlines */}
              {activeSlide === 2 && currentStory && (
                <div className="relative z-10 flex flex-col justify-between h-full space-y-3 p-6 bg-[#090a0f]">
                  <div className="flex justify-between items-center">
                    <span className="bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
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
                <div className="relative z-10 flex flex-col justify-between h-full p-6 bg-[#090a0f]">
                  <div className="flex justify-between items-center">
                    <span className="font-serif italic font-bold text-amber-100 text-lg tracking-tight">thesite.ro</span>
                    <span className="text-[10px] bg-white/10 border border-white/15 px-3 py-1 rounded-full text-slate-200 font-extrabold backdrop-blur-md">
                      Harta presei românești
                    </span>
                  </div>

                  <div className="bg-white/[0.04] border border-white/15 rounded-3xl p-6 text-center space-y-4 my-auto backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 text-black text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-md">
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
                  </div>

                  <div className="border-t border-white/10 pt-3 flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>© thesite.ro</span>
                    <span>Urmărește @thesite.ro</span>
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
              Slide {activeSlide} din 3
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
