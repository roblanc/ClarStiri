import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useAggregatedNews } from "@/hooks/useNews";
import { 
  Copy, Check, RefreshCw, Layers, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { getThumbnailUrl } from "@/utils/imageOptimizer";

export default function InstagramStudio() {
  const { data: stories, isLoading, refetch, isFetching } = useAggregatedNews(60);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const featuredStory = useMemo(() => {
    if (!stories || stories.length === 0) return null;
    return stories[selectedStoryIndex] || stories[0];
  }, [stories, selectedStoryIndex]);

  const copyCaption = (storyTitle: string, id: string) => {
    const caption = `thesite.ro ${storyTitle}. Vezi știrea din toate perspectivele pe thesite.ro.\n\n#stiri #politica #economie #romania`;
    navigator.clipboard.writeText(caption);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDominantBadge = (story: any) => {
    const left = Math.round(story.bias?.left || 0);
    const center = Math.round(story.bias?.center || 0);
    const right = Math.round(story.bias?.right || 0);
    const blindspot = story.blindspot;

    if (blindspot === 'left') return 'Ignorat de Stânga';
    if (blindspot === 'right') return 'Ignorat de Dreapta';
    if (left > center && left > right) return 'Preluat de Stânga';
    if (right > center && right > left) return 'Preluat de Dreapta';
    return 'Preluat de Centru';
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#111111] flex flex-col font-sans selection:bg-amber-300 selection:text-black">
      <Helmet>
        <title>Laborator de Layout & Instagram Studio | thesite.ro</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Top Header */}
      <header className="border-b border-black/10 bg-[#faf9f6]/90 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="font-serif italic font-bold text-2xl text-black tracking-tight">thesite.ro</span>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2.5 py-0.5 rounded-none">
              Studio Privat
            </span>
          </Link>
          <span className="hidden md:inline-block text-xs text-neutral-500 font-medium">
            | Previzualizare & Export 1080×1350
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="border-black/20 bg-white hover:bg-neutral-100 text-black text-xs rounded-none font-bold gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Reîmprospătează datele
          </Button>
          <Link 
            to="/" 
            className="text-xs font-bold text-neutral-600 hover:text-black flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Înapoi la site
          </Link>
        </div>
      </header>

      <div className="max-w-[1550px] w-full mx-auto p-6 lg:p-10 space-y-16">

        {/* SECTION 1: HERO & MAIN POSTER REFERENCE */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-12 items-start border-b border-black/10 pb-16">
          
          {/* Hero Left Intro */}
          <div className="space-y-8 pt-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest border border-black/20 bg-white px-3 py-1 text-neutral-700">
                PREVIZUALIZARE PRIVATĂ
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest border border-black/20 bg-white px-3 py-1 text-neutral-700">
                LABORATOR DE LAYOUT
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest border border-black/20 bg-white px-3 py-1 text-neutral-700">
                GATA DE CAPTURĂ
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-black tracking-tight leading-[1.05]">
                Citești. Compari. Postezi.
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 max-w-xl leading-relaxed font-normal">
                Aceasta este o variantă privată a landing page-ului actual, construită ca să păstreze structura pe care o ai deja, dar să îți dea o compoziție mai bună pentru screenshot-uri, export social și un look mai editorial.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-black/10">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">01 / CADRU</span>
                <p className="text-xs text-neutral-700 font-medium leading-normal">
                  Un singur cadru clar, bun pentru instagram și pentru share.
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">02 / STRUCTURĂ</span>
                <p className="text-xs text-neutral-700 font-medium leading-normal">
                  Hero, feed, surse și footer rămân, doar sunt compuse mai curat.
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">03 / CAPTURĂ</span>
                <p className="text-xs text-neutral-700 font-medium leading-normal">
                  Ușor de țintit din script, fără rupe layout-ul public.
                </p>
              </div>
            </div>
          </div>

          {/* Hero Right Poster Reference (1080 x 1350 Card) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              <span>POSTER DE REFERINȚĂ • Format 4:5, bun pentru export.</span>
              <span className="border border-black/20 bg-white px-2 py-0.5 text-black">1080 X 1350</span>
            </div>

            {featuredStory && (
              <div className="w-full aspect-[4/5] bg-black rounded-none shadow-2xl overflow-hidden flex flex-col justify-between relative group select-none border border-black">
                {/* Hero Image Area */}
                <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-between p-6">
                  <img 
                    src={getThumbnailUrl(featuredStory.image) || PLACEHOLDER_IMAGE} 
                    alt={featuredStory.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="relative z-20 flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#132238] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-none shadow">
                        {featuredStory.sourcesCount || featuredStory.sources?.length || 0} SURSE
                      </span>
                      <span className="bg-[#132238]/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-none backdrop-blur-sm">
                        {featuredStory.timeAgo || "acum 20 min"}
                      </span>
                    </div>

                    <span className="bg-white text-black text-[11px] font-bold px-3.5 py-1.5 rounded-none shadow">
                      {getDominantBadge(featuredStory)}
                    </span>
                  </div>

                  {/* Title & Watermark */}
                  <div className="relative z-20 space-y-2 pt-12">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug tracking-tight text-balance drop-shadow-md">
                      {featuredStory.title}
                    </h2>
                    <div className="text-[12px] font-medium text-slate-300 tracking-wide opacity-90">
                      thesite.ro
                    </div>
                  </div>
                </div>

                {/* Proportional 3-Column Solid Bias Bar */}
                <div className="flex w-full h-[95px] shrink-0 border-t border-black/20">
                  <div 
                    style={{ flexGrow: Math.round(featuredStory.bias?.left || 0) || 1, minWidth: '15%' }}
                    className="bg-[#28508a] text-white flex flex-col items-center justify-center p-1.5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-90">STÂNGA</span>
                    <span className="text-2xl font-black">{Math.round(featuredStory.bias?.left || 0)}%</span>
                  </div>

                  <div 
                    style={{ flexGrow: Math.round(featuredStory.bias?.center || 0) || 1, minWidth: '15%' }}
                    className="bg-white text-[#1f2937] flex flex-col items-center justify-center p-1.5 border-x border-black/10"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-80">CENTRU</span>
                    <span className="text-2xl font-black">{Math.round(featuredStory.bias?.center || 0)}%</span>
                  </div>

                  <div 
                    style={{ flexGrow: Math.round(featuredStory.bias?.right || 0) || 1, minWidth: '15%' }}
                    className="bg-[#822727] text-white flex flex-col items-center justify-center p-1.5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-90">DREAPTA</span>
                    <span className="text-2xl font-black">{Math.round(featuredStory.bias?.right || 0)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </section>


        {/* SECTION 2: PACHET INSTAGRAM - 3 screenshot-uri gata de comparat */}
        <section className="space-y-6 border-b border-black/10 pb-16">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">
                PACHET INSTAGRAM
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                Trei screenshot-uri gata de comparat
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase border border-black/20 bg-white px-2.5 py-1 text-black">
              3 VARIANTE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stories?.slice(0, 4).map((story, i) => (
              <div 
                key={story.id || i}
                onClick={() => setSelectedStoryIndex(i)}
                className="w-full aspect-[4/5] bg-black rounded-none shadow-xl overflow-hidden flex flex-col justify-between relative cursor-pointer group hover:ring-2 ring-black transition-all"
              >
                <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-between p-5">
                  <img 
                    src={getThumbnailUrl(story.image) || PLACEHOLDER_IMAGE} 
                    alt={story.title} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  <div className="relative z-20 flex justify-between">
                    <span className="bg-[#132238] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1">
                      {story.mainCategory || "ACTUALITATE"}
                    </span>
                    <span className="bg-white text-black text-[9px] font-bold px-2.5 py-1">
                      {story.sourcesCount || 0} SURSE
                    </span>
                  </div>

                  <div className="relative z-20 space-y-1">
                    <h3 className="text-sm font-bold text-white line-clamp-3 leading-snug">
                      {story.title}
                    </h3>
                  </div>
                </div>

                <div className="flex w-full h-[65px] shrink-0 border-t border-black/20">
                  <div style={{ flexGrow: Math.round(story.bias?.left || 1) }} className="bg-[#28508a] text-white flex flex-col items-center justify-center p-1">
                    <span className="text-[8px] font-bold uppercase">STÂNGA</span>
                    <span className="text-sm font-black">{Math.round(story.bias?.left || 0)}%</span>
                  </div>
                  <div style={{ flexGrow: Math.round(story.bias?.center || 1) }} className="bg-white text-[#1f2937] flex flex-col items-center justify-center p-1 border-x border-black/10">
                    <span className="text-[8px] font-bold uppercase">CENTRU</span>
                    <span className="text-sm font-black">{Math.round(story.bias?.center || 0)}%</span>
                  </div>
                  <div style={{ flexGrow: Math.round(story.bias?.right || 1) }} className="bg-[#822727] text-white flex flex-col items-center justify-center p-1">
                    <span className="text-[8px] font-bold uppercase">DREAPTA</span>
                    <span className="text-sm font-black">{Math.round(story.bias?.right || 0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* SECTION 3: FEED CURAT - Știri cu aceeași structură, dar cu prezentare mai bună */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">
                FEED CURAT
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                Știri cu aceeași structură, dar cu prezentare mai bună
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase border border-black/20 bg-white px-2.5 py-1 text-black">
              {stories?.length || 0} ȘTIRI
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stories?.map((story) => {
              const left = Math.round(story.bias?.left || 0);
              const center = Math.round(story.bias?.center || 0);
              const right = Math.round(story.bias?.right || 0);
              const totalSources = story.sourcesCount || story.sources?.length || 0;
              const isCopied = copiedId === story.id;

              return (
                <div 
                  key={story.id} 
                  className="bg-black rounded-none shadow-xl overflow-hidden flex flex-col justify-between relative group border border-black"
                >
                  {/* 4:5 Poster Image Card */}
                  <div className="relative aspect-[4/5] w-full flex flex-col justify-between p-5 overflow-hidden">
                    <img 
                      src={getThumbnailUrl(story.image) || PLACEHOLDER_IMAGE} 
                      alt={story.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="relative z-20 flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-[#132238] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1">
                          {totalSources} SURSE
                        </span>
                        <span className="bg-[#132238]/90 text-white text-[9px] font-bold px-2.5 py-1 backdrop-blur-sm">
                          {story.timeAgo || "acum 20 min"}
                        </span>
                      </div>

                      <span className="bg-white text-black text-[9px] font-bold px-2.5 py-1">
                        {getDominantBadge(story)}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="relative z-20 space-y-1 pt-8">
                      <h3 className="text-sm font-extrabold text-white line-clamp-3 leading-snug">
                        {story.title}
                      </h3>
                    </div>
                  </div>

                  {/* Proportional 3-Column Solid Bias Bar */}
                  <div className="flex w-full h-[65px] shrink-0 border-t border-black/20">
                    {left > 0 && (
                      <div style={{ flexGrow: left, minWidth: '15%' }} className="bg-[#28508a] text-white flex flex-col items-center justify-center p-1">
                        <span className="text-[8px] font-bold uppercase">STÂNGA</span>
                        <span className="text-sm font-black">{left}%</span>
                      </div>
                    )}

                    {center > 0 && (
                      <div style={{ flexGrow: center, minWidth: '15%' }} className="bg-white text-[#1f2937] flex flex-col items-center justify-center p-1 border-x border-black/10">
                        <span className="text-[8px] font-bold uppercase">CENTRU</span>
                        <span className="text-sm font-black">{center}%</span>
                      </div>
                    )}

                    {right > 0 && (
                      <div style={{ flexGrow: right, minWidth: '15%' }} className="bg-[#822727] text-white flex flex-col items-center justify-center p-1">
                        <span className="text-[8px] font-bold uppercase">DREAPTA</span>
                        <span className="text-sm font-black">{right}%</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Footer */}
                  <div className="bg-[#faf9f6] p-2.5 border-t border-black/10 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-600 truncate max-w-[150px]">
                      {story.mainCategory || "Actualitate"}
                    </span>
                    <button
                      onClick={() => copyCaption(story.title, story.id)}
                      className="bg-black hover:bg-neutral-800 text-white font-bold text-[10px] px-2.5 py-1 flex items-center gap-1"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? "Copiat" : "Caption"}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
