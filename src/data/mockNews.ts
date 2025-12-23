import { NewsItem } from "@/components/NewsCard";

export const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "Protestele privind clima se intensifică în capitală, activiștii cer acțiuni imediate",
    image: "https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=800&q=80",
    sourcesCount: 89,
    bias: { left: 29, center: 47, right: 24 },
    blindspot: "none",
    timeAgo: "acum 2 ore",
    category: "Politică",
    location: "România",
  },
  {
    id: "2", 
    title: "Bărbat din Croatia condamnat la 50 de ani pentru uciderea unui elev de 7 ani într-un atac la școală",
    image: "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800&q=80",
    sourcesCount: 26,
    bias: { left: 46, center: 40, right: 14 },
    blindspot: "none",
    timeAgo: "acum 3 ore",
    category: "Politică Croația",
    location: "Croația",
  },
  {
    id: "3",
    title: "Mașină lovește spectatorii la o paradă într-un oraș din Olanda, 9 răniți",
    image: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=800&q=80",
    sourcesCount: 35,
    bias: { left: 30, center: 40, right: 30 },
    blindspot: "none",
    timeAgo: "acum 4 ore",
    category: "Accident",
    location: "Olanda",
  },
  {
    id: "4",
    title: "Germania deportează infractor în Siria pe măsură ce presiunea migrației crește",
    image: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&q=80",
    sourcesCount: 22,
    bias: { left: 31, center: 37, right: 32 },
    blindspot: "none",
    timeAgo: "acum 5 ore",
    category: "Politică Germană",
    location: "Germania",
  },
  {
    id: "5",
    title: "Autoritatea antitrust din Italia amendează Ryanair cu 300 milioane $ pentru relațiile cu agențiile de turism",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    sourcesCount: 39,
    bias: { left: 30, center: 41, right: 29 },
    blindspot: "none",
    timeAgo: "acum 6 ore",
    category: "Ryanair",
    location: "Italia",
  },
  {
    id: "6",
    title: "Vânzările de mașini noi în Europa cresc pentru a cincea lună, impulsionate de vehiculele electrice",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
    sourcesCount: 5,
    bias: { left: 20, center: 60, right: 20 },
    blindspot: "none",
    timeAgo: "acum 7 ore",
    category: "Auto Tech",
    location: "Germania",
  },
  {
    id: "7",
    title: "Turcia spune că SDF condus de kurzi nu intenționează să avanseze integrarea cu statul sirian",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80",
    sourcesCount: 7,
    bias: { left: 43, center: 35, right: 22 },
    blindspot: "none",
    timeAgo: "acum 8 ore",
    category: "Politică Turcă",
    location: "Turcia",
  },
];

export const topStories = [
  {
    id: "t1",
    title: "General rus ucis în atentatul cu mașină-capcană din Moscova",
    bias: { left: 35, center: 30, right: 35 },
    sourcesCount: 248,
  },
  {
    id: "t2",
    title: "Congresul cere investigații după dispariția a 16 dosare din documentele DOJ Epstein",
    bias: { left: 25, center: 47, right: 28 },
    sourcesCount: 212,
  },
  {
    id: "t3",
    title: "Departamentul de Justiție începe eliberarea dosarelor mult așteptate legate de Epstein...",
    bias: { left: 26, center: 49, right: 25 },
    sourcesCount: 311,
  },
  {
    id: "t4",
    title: "Ucraina lovește petrolier fantomă rusesc în Mediterana pentru prima dată...",
    bias: { left: 39, center: 35, right: 26 },
    sourcesCount: 83,
  },
  {
    id: "t5",
    title: "UE acordă împrumut de €90 miliarde Ucrainei, nu reușește să folosească activele rusești",
    bias: { left: 42, center: 30, right: 28 },
    sourcesCount: 212,
  },
];

export const blindspotStories = [
  {
    id: "b1",
    title: "DOJ va investiga șoferul de autobuz școlar din Pennsylvania pentru tragerea asupra...",
    image: "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&q=80",
    bias: { left: 14, center: 13, right: 73 },
    blindspot: "right" as const,
    sourcesCount: 25,
  },
  {
    id: "b2",
    title: "Coloniști israelieni intră forțat în casa palestinienilor și ucid oi în ultimul incident...",
    image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=800&q=80",
    bias: { left: 73, center: 18, right: 9 },
    blindspot: "left" as const,
    sourcesCount: 12,
  },
];

export const dailyBriefingData = {
  storiesCount: 7,
  articlesCount: 315,
  readTime: "7m",
  stories: [
    {
      title: "SUA semnează acorduri de sănătate cu nouă națiuni africane",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80",
    },
    {
      title: "Poliția britanică renunță la sistemul de înregistrare a incidentelor de ură non-infracționale",
      image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&q=80",
    },
  ],
  moreStories: [
    "Acord de arme Pakistan-Libia de 4 miliarde",
    "Wiseman numit ambasador al Canadei în SUA",
    "și altele",
  ],
};

export const storyDetails = {
  "1": {
    title: "Protestele privind clima se intensifică în capitală, activiștii cer acțiuni imediate",
    image: "https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=1200&q=80",
    bias: { left: 29, center: 47, right: 24 },
    sourcesCount: 89,
    summary: "Mii de activiști pentru climă au ieșit în stradă cerând măsuri urgente împotriva schimbărilor climatice. Manifestanții au blocat mai multe intersecții importante, solicitând guvernului să declare urgență climatică.",
    sources: {
      left: [
        { name: "Gazeta Progresistă", location: "București", headline: "Tineretul se ridică pentru viitorul planetei - cea mai mare manifestație din ultimii ani", image: "https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=400&q=80" },
        { name: "Vocea Socială", location: "Cluj", headline: "Activiștii acuză inacțiunea guvernamentală în fața crizei climatice", image: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=400&q=80" },
        { name: "Monitorul Popular", location: "Timișoara", headline: "Protestele climatice cer justiție pentru generațiile viitoare", image: "https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?w=400&q=80" },
      ],
      center: [
        { name: "Ziarul Central", location: "București", headline: "Mii de manifestanți participă la protestul pentru climă din capitală", image: "https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=400&q=80" },
        { name: "Observatorul Critic", location: "București", headline: "Protestul climatic blochează traficul în zonele centrale", image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80" },
        { name: "Cotidianul Economic", location: "Iași", headline: "Guvernul răspunde la cerințele activiștilor pentru climă", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80" },
        { name: "Jurnal Obiectiv", location: "Brașov", headline: "Manifestațiile pentru climă atrag atenția internațională", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80" },
      ],
      right: [
        { name: "Tribuna Liberală", location: "București", headline: "Protestele climatice perturbă economia și afacerile locale", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80" },
        { name: "Capitalul Românesc", location: "Constanța", headline: "Analiștii pun sub semnul întrebării costurile tranziției energetice cerute de activiști", image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&q=80" },
      ],
    },
  },
};
