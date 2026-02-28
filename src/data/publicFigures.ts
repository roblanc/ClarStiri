export interface Statement {
    id: string;
    text: string;
    date: string;
    sourceUrl: string;
    topic: string; // ex: "Politica", "Social"
    bias?: 'left' | 'center' | 'right';
    impact: 'high' | 'medium' | 'low';
}

export interface PublicFigure {
    id: string;
    slug: string;
    name: string;
    role: string; // Jurnalist, Analist, Influencer
    image: string;
    bias: {
        leaning: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
        score: number; // -100 (left) to 100 (right)
        description: string;
    };
    socialLinks: {
        facebook?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
        website?: string;
    };
    description: string;
    statements: Statement[];
}

export const PUBLIC_FIGURES: PublicFigure[] = [
    {
        id: 'dana-budeanu',
        slug: 'dana-budeanu',
        name: 'Dana Budeanu',
        role: 'Influencer / Comentator Politic / Critic de Modă',
        image: '/images/voices/dana-budeanu.jpg',
        bias: {
            leaning: 'right', 
            score: 78,
            description: 'Voce conservatoare și anti-progresistă. Deși folosește o retorică naționalistă, se distanțează critic de partidele suveraniste oficiale (AUR/SOS), pe care le consideră construcții artificiale. Poziționarea sa este una de "critic independent" care atacă virulent curentul #Rezist, partidele liberale (USR) și ceea ce numește influența nocivă a corporațiilor și ONG-urilor asupra valorilor tradiționale.'
        },
        description: 'Dana Budeanu și-a transformat platformele de social media, în special Instagram, într-un instrument de presiune politică și socială. Prin stilul său "Verdict", ea impune un limbaj care polarizează (ex: "fătălăi", "ametițe"), atacând sistematic ideologiile moderne, digitalizarea forțată și politicile europene. Influența sa este majoră în rândul publicului care resimte o deconectare de valorile conservatoare și care caută o voce critică la adresa "sistemului" globalist, fără a se identifica neapărat cu extremele politice clasice.',
        socialLinks: {
            instagram: 'https://instagram.com/danabudeanu',
            youtube: 'https://youtube.com/verdictdanabudeanu',
            website: 'https://danabudeanu.ro'
        },
        statements: [
            {
                id: 'db-s1',
                text: 'Suveranismul promovat de unii este un film Disney. România nu are nevoie de hărneli, ci de bărbați care să nu stea în genunchi.',
                date: '2024-11-28',
                sourceUrl: 'https://www.antena3.ro/politica/dana-budeanu-george-simion-critici-suveranism-735456.html',
                topic: 'Suveranitate',
                impact: 'high',
                bias: 'right'
            },
            {
                id: 'db-s2',
                text: 'Trotinetarii urii au distrus tot ce era instituție în țara asta. Ne-au adus într-un punct în care a fi normal e o vină.',
                date: '2025-01-12',
                sourceUrl: 'https://www.youtube.com/@VerdictDanaBudeanu/search?query=trotinetari',
                topic: 'Social',
                impact: 'high',
                bias: 'right'
            },
            {
                id: 'db-s3',
                text: 'USR este un experiment eșuat. O adunătură de impostori care vor să ne vândă țara pe bucăți la pachet cu ideologii de carton.',
                date: '2024-05-20',
                sourceUrl: 'https://www.youtube.com/@VerdictDanaBudeanu/search?query=USR',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-s4',
                text: 'Să votezi cu Georgescu înseamnă să votezi cu rușii. Diaspora nu a înțeles nimic din miza geopolitică a acestui moment.',
                date: '2024-12-01',
                sourceUrl: 'https://www.antena3.ro/politica/dana-budeanu-calin-georgescu-mesaj-sustinatori-737444.html',
                topic: 'Geopolitică',
                impact: 'high',
                bias: 'center-right'
            }
        ]
    },
    {
        id: 'mircea-badea',
        slug: 'mircea-badea',
        name: 'Mircea Badea',
        role: 'Realizator TV',
        image: '/images/voices/Mircea_Badea.jpg',
        bias: {
            leaning: 'center-left', // Tradițional anti-Băsescu/Iohannis, pro-PSD history
            score: -40,
            description: 'Cunoscut pentru emisiunea "În gura presei", are o lungă istorie de critică la adresa instituțiilor de forță (DNA, Servicii) și a președintelui Iohannis.'
        },
        description: 'Realizator la Antena 3 CNN, Mircea Badea este una dintre cele mai vocale figuri media, cu opinii puternice despre justiție și politică externă.',
        socialLinks: {
            instagram: 'https://instagram.com/mirceabadea'
        },
        statements: []
    },
    {
        id: 'victor-ciutacu',
        slug: 'victor-ciutacu',
        name: 'Victor Ciutacu',
        role: 'Jurnalist TV',
        image: '/images/voices/victor-ciutacu.jpg',
        bias: {
            leaning: 'center-left',
            score: -35,
            description: 'Realizator România TV, promovează teme populiste și este frecvent critic la adresa USR și a ONG-urilor.'
        },
        description: 'Moderator la România TV, Victor Ciutacu abordează subiecte politice și sociale, adesea dintr-o perspectivă critică la adresa guvernării de dreapta.',
        socialLinks: {
            facebook: 'https://facebook.com/victorciutacu'
        },
        statements: []
    },
    {
        id: 'cristian-tudor-popescu',
        slug: 'ctp',
        name: 'C.T. Popescu',
        role: 'Gazetar / Scriitor',
        image: '/images/voices/ctp.svg',
        bias: {
            leaning: 'center-right',
            score: 30,
            description: 'Poziții raționale, pro-europene, dar critic cu toate partidele. Adesea văzut ca o voce a dreptei intelectuale.'
        },
        description: 'Unul dintre cei mai longevivi și respectați gazetari din România, CTP analizează actualitatea cu un spirit critic incisiv.',
        socialLinks: {
            facebook: 'https://facebook.com/ctp'
        },
        statements: []
    },
    {
        id: 'catalin-tolontan',
        slug: 'catalin-tolontan',
        name: 'Cătălin Tolontan',
        role: 'Jurnalist investigativ',
        image: '/images/voices/catalin-tolontan.png',
        bias: {
            leaning: 'center',
            score: 5,
            description: 'Jurnalism de investigație obiectiv, concentrat pe corupție și abuzuri, fără afiliații politice explicite.'
        },
        description: 'Jurnalist de investigație la Libertatea, cunoscut pentru investigațiile despre Colectiv și sistemul de sănătate. Premiat internațional pentru jurnalismul său.',
        socialLinks: {
            facebook: 'https://facebook.com/catalin.tolontan'
        },
        statements: []
    },
    {
        id: 'rares-bogdan',
        slug: 'rares-bogdan',
        name: 'Rareș Bogdan',
        role: 'Politician / Europarlamentar',
        image: '/images/voices/rares-bogdan.png',
        bias: {
            leaning: 'center-right',
            score: 45,
            description: 'Fost jurnalist, acum europarlamentar PNL, poziții conservatoare și pro-europene.'
        },
        description: 'Fost realizator TV la Realitatea, actualmente europarlamentar PNL și una dintre cele mai vocale voci ale dreptei politice.',
        socialLinks: {
            facebook: 'https://facebook.com/RaresBogdan'
        },
        statements: []
    },
    {
        id: 'lucian-mandruta',
        slug: 'lucian-mandruta',
        name: 'Lucian Mândruță',
        role: 'Jurnalist / Blogger',
        image: '/images/voices/lucian-mandruta.png',
        bias: {
            leaning: 'center-left',
            score: -25,
            description: 'Abordare liberală, critică față de naționalismul excesiv și deschis spre teme progresiste.'
        },
        description: 'Jurnalist cu experiență la Antena 1 și ProTV, cunoscut pentru blogul său și comentariile pe teme sociale.',
        socialLinks: {
            facebook: 'https://facebook.com/LucianMandruta'
        },
        statements: []
    },
    {
        id: 'moise-guran',
        slug: 'moise-guran',
        name: 'Moise Guran',
        role: 'Jurnalist / Analist',
        image: '/images/voices/moise-guran.png',
        bias: {
            leaning: 'center-right',
            score: 20,
            description: 'Pro-reformist, pro-UE, fost candidat politic. Critică corupția și lipsa reformelor.'
        },
        description: 'Fost jurnalist la Europa FM și analist economic, cunoscut pentru pozițiile sale pro-reformiste și analizele economice.',
        socialLinks: {
            facebook: 'https://facebook.com/MoiseGuran'
        },
        statements: []
    },
    {
        id: 'andreea-esca',
        slug: 'andreea-esca',
        name: 'Andreea Esca',
        role: 'Prezentatoare TV',
        image: '/images/voices/andreea-esca.png',
        bias: {
            leaning: 'center',
            score: 0,
            description: 'Abordare neutră și profesionistă, simbol al jurnalismului TV din România.'
        },
        description: 'Cea mai longevivă și cunoscută prezentatoare de știri din România, la ProTV din 1995.',
        socialLinks: {
            instagram: 'https://instagram.com/andreeaesca'
        },
        statements: []
    },
    {
        id: 'selly',
        slug: 'selly',
        name: 'Selly',
        role: 'Influencer / Content Creator',
        image: '/images/voices/selly.png',
        bias: {
            leaning: 'center',
            score: 0,
            description: 'Comentează ocazional politica din perspectiva generației tinere, fără afilieri clare.'
        },
        description: 'Cel mai urmărit YouTuber din România, cu influență semnificativă asupra tinerilor. Implicat ocazional în dezbateri publice.',
        socialLinks: {
            youtube: 'https://youtube.com/selly',
            instagram: 'https://instagram.com/sfrfrfr'
        },
        statements: []
    }
];
