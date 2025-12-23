import { NewsItem } from "@/components/NewsCard";

export const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "Economia României crește cu 4.2% în ultimul trimestru, depășind așteptările analiștilor",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    sourcesCount: 47,
    bias: { left: 30, center: 55, right: 15 },
    blindspot: "none",
    timeAgo: "acum 2 ore",
  },
  {
    id: "2", 
    title: "Proiect de lege controversat privind energia verde ajunge în Parlament",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
    sourcesCount: 32,
    bias: { left: 45, center: 35, right: 20 },
    blindspot: "right",
    timeAgo: "acum 3 ore",
  },
  {
    id: "3",
    title: "Noi reglementări bancare intră în vigoare de la 1 ianuarie",
    image: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&q=80",
    sourcesCount: 28,
    bias: { left: 20, center: 60, right: 20 },
    blindspot: "none",
    timeAgo: "acum 4 ore",
  },
  {
    id: "4",
    title: "Ministrul Sănătății anunță investiții majore în spitalele regionale",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    sourcesCount: 41,
    bias: { left: 35, center: 40, right: 25 },
    blindspot: "none",
    timeAgo: "acum 5 ore",
  },
  {
    id: "5",
    title: "Protestele fermierilor continuă pentru a treia săptămână consecutiv",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
    sourcesCount: 56,
    bias: { left: 50, center: 30, right: 20 },
    blindspot: "left",
    timeAgo: "acum 6 ore",
  },
  {
    id: "6",
    title: "România semnează acord strategic cu parteneri europeni pentru securitate cibernetică",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    sourcesCount: 23,
    bias: { left: 25, center: 55, right: 20 },
    blindspot: "none",
    timeAgo: "acum 7 ore",
  },
  {
    id: "7",
    title: "Dezbatere aprinsă privind reforma sistemului de pensii",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80",
    sourcesCount: 67,
    bias: { left: 40, center: 25, right: 35 },
    blindspot: "none",
    timeAgo: "acum 8 ore",
  },
  {
    id: "8",
    title: "Industria IT românească atrage investiții record în 2025",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    sourcesCount: 19,
    bias: { left: 15, center: 70, right: 15 },
    blindspot: "none",
    timeAgo: "acum 9 ore",
  },
];

export const topStories = [
  {
    title: "Economia României crește cu 4.2% în ultimul trimestru, depășind așteptările",
    centerCoverage: 57,
    sourcesCount: 60,
  },
  {
    title: "Parlament adoptă bugetul pentru anul 2026",
    centerCoverage: 70,
    sourcesCount: 202,
  },
  {
    title: "Planuri de infrastructură pentru București anunțate de Primărie",
    centerCoverage: 50,
    sourcesCount: 250,
  },
  {
    title: "Proiecte de energie verde suspendate pentru evaluare",
    centerCoverage: 38,
    sourcesCount: 277,
  },
  {
    title: "Investitor major anunță extindere în România",
    centerCoverage: 55,
    sourcesCount: 169,
  },
];

export const storyDetails = {
  "1": {
    title: "Economia României crește cu 4.2% în ultimul trimestru, depășind așteptările analiștilor",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
    bias: { left: 30, center: 55, right: 15 },
    sourcesCount: 47,
    summary: "Institutul Național de Statistică a raportat o creștere economică de 4.2% în trimestrul patru, depășind prognozele analiștilor de 3.5%. Aceasta marchează cel mai puternic trimestru pentru economia românească din ultimii trei ani.",
    sources: {
      left: [
        { name: "Gazeta Progresistă", location: "București", headline: "Creșterea economică maschează inegalitățile în creștere, susțin economiștii de stânga", image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&q=80" },
        { name: "Vocea Socială", location: "Cluj", headline: "Experții avertizează: beneficiile creșterii nu ajung la muncitorii obișnuiți", image: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?w=400&q=80" },
        { name: "Monitorul Popular", location: "Timișoara", headline: "Cifrele pozitive ascund probleme structurale în economia reală", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" },
      ],
      center: [
        { name: "Ziarul Central", location: "București", headline: "România înregistrează creștere economică de 4.2% în T4, depășind estimările", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80" },
        { name: "Observatorul Critic", location: "București", headline: "Economia națională crește peste așteptări în ultimul trimestru", image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80" },
        { name: "Cotidianul Economic", location: "Iași", headline: "INS confirmă performanță economică solidă în trimestrul patru", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80" },
        { name: "Jurnal Obiectiv", location: "Brașov", headline: "Datele oficiale arată creștere robustă a economiei românești", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80" },
      ],
      right: [
        { name: "Tribuna Liberală", location: "București", headline: "Piața liberă livrează: creșterea dovedește succesul politicilor pro-business", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80" },
        { name: "Capitalul Românesc", location: "Constanța", headline: "Boom economic validează strategia guvernamentală de reducere a taxelor", image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&q=80" },
      ],
    },
  },
};
