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
        role: 'Influencer / Critic de modă',
        image: '/images/voices/dana-budeanu.jpg',
        bias: {
            leaning: 'right', // De obicei asociată cu valori conservatoare/anti-sistem
            score: 65,
            description: 'Critică frecvent "progresismul", USR și măsurile sociale liberale. Adopta adesea o poziție anti-sistem și conservatoare social.'
        },
        description: 'Cunoscută pentru stilul direct și rubricile "Amețitele și Mafiloții", Dana Budeanu comentează frecvent scena politică cu un ton satiric și critic la adresa politicienilor din spectrul liberal/progresist.',
        socialLinks: {
            instagram: 'https://instagram.com/danabudeanu',
            youtube: 'https://youtube.com/verdictdanabudeanu'
        },
        statements: [
            {
                id: 's1',
                text: 'Toate fătălăile care votează USR...',
                date: '2024-03-15',
                sourceUrl: '#',
                topic: 'Politică',
                impact: 'high'
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
