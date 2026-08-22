import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useAggregatedNews } from "@/hooks/useNews";
import { 
  Copy, Check, RefreshCw, ArrowRight, ArrowLeft,
  Layers, Heart, MessageCircle, Send, Bookmark, MoreHorizontal,
  Instagram, LayoutGrid, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { getThumbnailUrl } from "@/utils/imageOptimizer";

export default function InstagramStudio() {
  const { data: stories, isLoading, refetch, isFetching } = useAggregatedNews(60);
  const [viewMode, setViewMode] = useState<'feed' | 'carousel'>('feed');
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState<1 | 2 | 3>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentStory = useMemo(() => {
    if (!stories || stories.length === 0) return null;
    return stories[selectedStoryIndex] || stories[0];
  }, [stories, selectedStoryIndex]);

  const copyCaption = (storyTitle: string, id: string) => {
    const caption = `thesite.ro ${storyTitle}. Vezi știrea din toate perspectivele pe thesite.ro.\n\n#stiri #politica #economie #romania`;
    navigator.clipboard.writeText(caption);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      <Helmet>
        <title>Instagram Studio Privat | thesite.ro</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0c0e14]/90 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="font-serif italic font-bold text-2xl text-amber-100 tracking-tight">thesite.ro</span>
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-amber-500/40 text-amber-400 bg-amber-500/10 font-mono px-2 py-0.5">
              Studio Instagram
            </Badge>
          </Link>
          <span className="hidden md:inline-block text-xs text-slate-400 font-medium">| Simulator Feed & Carusel</span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-full">
          <button
            onClick={() => setViewMode('feed')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all ${
              viewMode === 'feed' 
                ? "bg-gradient-to-r from-pink-500 via-red-500 to-amber-500 text-white shadow-lg" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Simulator Feed Instagram
          </button>
          <button
            onClick={() => setViewMode('carousel')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all ${
              viewMode === 'carousel' 
                ? "bg-amber-400 text-black shadow-lg" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Inspector Carusel 3 Slide-uri
          </button>
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
        </div>
      </header>

      {/* MODE 1: SIMULATED INSTAGRAM FEED */}
      {viewMode === 'feed' && (
        <main className="flex-1 max-w-[800px] w-full mx-auto p-4 sm:p-6 space-y-8">
          <div className="text-center space-y-1 my-2">
            <h1 className="text-xl font-black text-white flex items-center justify-center gap-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              Simulare Feed Instagram @thesite.ro
            </h1>
            <p className="text-xs text-slate-400">
              Așa vor arăta postările în aplicația Instagram când le publicați. Copiați caption-ul pentru fiecare știre.
            </p>
          </div>

          {isLoading && (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              Se încarcă feed-ul de știri...
            </div>
          )}

          {stories?.map((story) => {
            const left = Math.round(story.bias?.left || 0);
            const center = Math.round(story.bias?.center || 0);
            const right = Math.round(story.bias?.right || 0);
            const totalSources = story.sourcesCount || story.sources?.length || 0;
            const blindspot = story.blindspot;

            let dominantBadgeLabel = 'Preluat de Centru';
            if (blindspot === 'left') dominantBadgeLabel = 'Punct Orbit Stânga';
            else if (blindspot === 'right') dominantBadgeLabel = 'Punct Orbit Dreapta';
            else if (left > center && left > right) dominantBadgeLabel = 'Preluat de Stânga';
            else if (right > center && right > left) dominantBadgeLabel = 'Preluat de Dreapta';

            const isCopied = copiedId === story.id;

            return (
              <article 
                key={story.id} 
                className="bg-[#000000] border border-white/15 rounded-2xl overflow-hidden shadow-2xl max-w-[520px] mx-auto"
              >
                {/* Instagram Post Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#090a0f]">
                  <div className="flex items-center gap-3">
                    {/* Profile Avatar Circle */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-red-500 to-pink-500 p-[2px]">
                      <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                        <span className="font-serif italic font-bold text-[10px] text-amber-100">ts</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white">thesite.ro</span>
                        <span className="w-1 h-1 rounded-full bg-blue-500" />
                      </div>
                      <p className="text-[10px] text-slate-400">România • Harta presei</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => copyCaption(story.title, story.id)}
                      className="bg-amber-400 hover:bg-amber-300 text-black font-black text-[11px] h-7 px-3 rounded-full gap-1"
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? "Copiat!" : "Copiază Caption"}
                    </Button>
                    <button className="text-slate-400 hover:text-white p-1">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* THE 1080x1350 EXACT SITE CARD POST IMAGE */}
                <div className="relative w-full aspect-[4/5] bg-black flex flex-col justify-between overflow-hidden select-none">
                  {/* Hero Image Container */}
                  <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-between p-5 sm:p-6">
                    <img 
                      src={getThumbnailUrl(story.image) || PLACEHOLDER_IMAGE} 
                      alt={story.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    {/* Top Badges Row */}
                    <div className="relative z-20 flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#132238] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-none shadow-md">
                          {totalSources} SURSE
                        </div>
                        <div className="bg-[#132238]/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-none backdrop-blur-sm">
                          {story.timeAgo || "acum 20 min"}
                        </div>
                      </div>

                      <div className="bg-white text-black text-[11px] font-bold px-3.5 py-1.5 rounded-none shadow-md">
                        {dominantBadgeLabel}
                      </div>
                    </div>

                    {/* Headline & Watermark */}
                    <div className="relative z-20 space-y-2.5 pt-10">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug tracking-tight drop-shadow-md text-balance">
                        {story.title}
                      </h2>
                      <div className="text-[11px] font-medium text-slate-300 tracking-wide opacity-90">
                        thesite.ro
                      </div>
                    </div>
                  </div>

                  {/* Bottom Proportional Bias Bar */}
                  <div className="flex w-full h-[85px] shrink-0 border-t border-black/20">
                    {left > 0 && (
                      <div 
                        style={{ flexGrow: left, minWidth: '15%' }}
                        className="bg-[#28508a] text-white flex flex-col items-center justify-center p-1.5"
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider mb-0.5 opacity-90">STÂNGA</span>
                        <span className="text-xl sm:text-2xl font-black">{left}%</span>
                      </div>
                    )}

                    {center > 0 && (
                      <div 
                        style={{ flexGrow: center, minWidth: '15%' }}
                        className="bg-white text-[#1f2937] flex flex-col items-center justify-center p-1.5 border-x border-black/10"
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider mb-0.5 opacity-80">CENTRU</span>
                        <span className="text-xl sm:text-2xl font-black">{center}%</span>
                      </div>
                    )}

                    {right > 0 && (
                      <div 
                        style={{ flexGrow: right, minWidth: '15%' }}
                        className="bg-[#822727] text-white flex flex-col items-center justify-center p-1.5"
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider mb-0.5 opacity-90">DREAPTA</span>
                        <span className="text-xl sm:text-2xl font-black">{right}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instagram Action Icons Row */}
                <div className="px-4 py-3 flex items-center justify-between bg-[#090a0f] border-t border-white/10">
                  <div className="flex items-center gap-4 text-white">
                    <button className="hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="hover:text-slate-300 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button className="hover:text-slate-300 transition-colors">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <button className="text-white hover:text-amber-400 transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>

                {/* Likes & Formatted Caption Box */}
                <div className="px-4 pb-4 bg-[#090a0f] space-y-2 text-xs">
                  <p className="font-bold text-white">Apreciat de <span className="font-black">thesite.ro</span> și alții</p>
                  
                  <div className="space-y-1 leading-relaxed text-slate-200">
                    <p>
                      <span className="font-black text-white mr-1.5">thesite.ro</span>
                      {story.title}. Vezi știrea din toate perspectivele pe thesite.ro.
                    </p>
                    <p className="text-blue-400 font-semibold text-[11px]">
                      #stiri #politica #economie #romania #bias #groundnews #presaromana
                    </p>
                  </div>
                </div>

              </article>
            );
          })}
        </main>
      )}

      {/* MODE 2: CAROUSEL SLIDE INSPECTOR */}
      {viewMode === 'carousel' && (
        <main className="relative z-10 flex-1 max-w-[1650px] w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          
          {/* Story Selector */}
          <div className="space-y-4 bg-white/[0.02] border border-white/10 backdrop-blur-md p-4 rounded-3xl">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Alege o știre ({stories?.length || 0})
              </h2>
            </div>

            <div className="space-y-2.5 max-h-[76vh] overflow-y-auto pr-1.5 custom-scrollbar">
              {stories?.map((story, idx) => {
                const isSelected = idx === selectedStoryIndex;
                return (
                  <button
                    key={story.id || idx}
                    onClick={() => setSelectedStoryIndex(idx)}
                    className={`w-full text-left p-4 rounded-2xl transition-all border ${
                      isSelected 
                        ? "bg-amber-500/15 border-amber-500/50 shadow-xl" 
                        : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-200 line-clamp-2">{story.title}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slide Visualizer */}
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-2 mb-6">
              <button 
                onClick={() => setActiveSlide(1)}
                className={`px-4 py-2 rounded-full text-xs font-bold ${activeSlide === 1 ? "bg-amber-400 text-black" : "text-slate-300"}`}
              >
                1. Card Clasic (Foto Post)
              </button>
              <button 
                onClick={() => setActiveSlide(2)}
                className={`px-4 py-2 rounded-full text-xs font-bold ${activeSlide === 2 ? "bg-amber-400 text-black" : "text-slate-300"}`}
              >
                2. Comparație Titluri
              </button>
              <button 
                onClick={() => setActiveSlide(3)}
                className={`px-4 py-2 rounded-full text-xs font-bold ${activeSlide === 3 ? "bg-amber-400 text-black" : "text-slate-300"}`}
              >
                3. CTA
              </button>
            </div>

            <div className="w-[540px] h-[675px] bg-black border border-white/20 rounded-none overflow-hidden relative flex flex-col justify-between">
              {activeSlide === 1 && currentStory && (
                <div className="relative flex flex-col justify-between h-full w-full bg-black">
                  <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-between p-6">
                    <img src={getThumbnailUrl(currentStory.image) || PLACEHOLDER_IMAGE} alt="hero" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="relative z-20 flex justify-between">
                      <span className="bg-[#132238] text-white text-xs font-black px-3 py-1.5">{currentStory.sourcesCount || 0} SURSE</span>
                    </div>
                    <div className="relative z-20 space-y-2">
                      <h2 className="text-2xl font-extrabold text-white">{currentStory.title}</h2>
                      <p className="text-xs text-slate-300">thesite.ro</p>
                    </div>
                  </div>
                  <div className="flex w-full h-[95px] shrink-0 border-t border-black">
                    <div style={{ flexGrow: currentStory.bias?.left || 1 }} className="bg-[#28508a] text-white flex flex-col items-center justify-center"><span className="text-xs font-bold">STÂNGA</span><span className="text-2xl font-black">{Math.round(currentStory.bias?.left || 0)}%</span></div>
                    <div style={{ flexGrow: currentStory.bias?.center || 1 }} className="bg-white text-[#1f2937] flex flex-col items-center justify-center"><span className="text-xs font-bold">CENTRU</span><span className="text-2xl font-black">{Math.round(currentStory.bias?.center || 0)}%</span></div>
                    <div style={{ flexGrow: currentStory.bias?.right || 1 }} className="bg-[#822727] text-white flex flex-col items-center justify-center"><span className="text-xs font-bold">DREAPTA</span><span className="text-2xl font-black">{Math.round(currentStory.bias?.right || 0)}%</span></div>
                  </div>
                </div>
              )}
              {activeSlide === 2 && currentStory && (
                <div className="p-6 space-y-4 bg-[#090a0f] h-full flex flex-col justify-between">
                  <h2 className="text-xl font-black text-white">Comparație Titluri</h2>
                  <p className="text-xs text-slate-300">Vezi cum diferă framing-ul în presă pentru: {currentStory.title}</p>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 border-l-4 border-l-cyan-400">
                    <span className="text-[10px] font-black uppercase text-cyan-400">Stânga</span>
                    <p className="text-sm font-bold text-white">„{currentStory.title}”</p>
                  </div>
                </div>
              )}
              {activeSlide === 3 && (
                <div className="p-6 text-center space-y-4 bg-[#090a0f] h-full flex flex-col items-center justify-center">
                  <h2 className="text-2xl font-black text-white">Ieși din bula de știri.</h2>
                  <p className="text-xs text-slate-300">Vezi toate perspectivele pe thesite.ro</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-4">
              <Button size="sm" variant="outline" disabled={activeSlide === 1} onClick={() => setActiveSlide(s => (s - 1) as any)}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Slide anterior
              </Button>
              <Button size="sm" variant="outline" disabled={activeSlide === 3} onClick={() => setActiveSlide(s => (s + 1) as any)}>
                Următorul slide <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </main>
      )}

    </div>
  );
}
