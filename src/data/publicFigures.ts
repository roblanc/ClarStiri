export interface Statement {
    id: string;
    text: string;
    date: string;
    sourceUrl: string;      // homepage-ul publicației (ex: https://www.hotnews.ro)
    articleUrl?: string;    // URL-ul articolului specific, dacă există
    topic: string; // ex: "Politica", "Social"
    bias?: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
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
    targets: string[];    // Ținte predilecte — persoane, partide, concepte pe care le atacă frecvent
    rhetoric: {
        aggressiveness: number;  // 0-100
        irony: number;           // 0-100
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
        targets: ['Robert Negoiță', 'USR', 'Corporatiști', 'Progresiști', 'Sistemul'],
        rhetoric: { aggressiveness: 92, irony: 85 },
        statements: [
            {
                id: 'db-ig-2026-02-24',
                text: 'STYLE IS YOU! Cine crede că moda e despre trenduri n-a înțeles nimic. Moda e despre cum te simți când ești stăpân pe tine, nu sclavul revistelor.',
                date: '2026-02-24',
                sourceUrl: 'https://verdictapp.com',
                topic: 'Stil',
                impact: 'medium',
                bias: 'center'
            },
            {
                id: 'db-ig-2026-02-20',
                text: 'Amețitele și fătălăii au pus stăpânire pe digitalizare. S-au trezit toți experți pe TikTok, dar nu știu să lege un nod la cravată sau să stea drepți în fața unei provocări reale.',
                date: '2026-02-20',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'high',
                bias: 'right'
            },
            {
                id: 'db-ig-2026-02-14',
                text: 'Dați-l pe Negoiță afară din PSD, că d-aia v-ați nenorocit! Țineți toți fătălăii! Cine poartă maiou pe sub helancă de cașmir merită arest preventiv!',
                date: '2026-02-14',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică / Stil',
                impact: 'high',
                bias: 'right'
            },
            {
                id: 'db-s1',
                text: 'Suveranismul promovat de unii este un film Disney. România nu are nevoie de hărneli, ci de bărbați care să nu stea în genunchi.',
                date: '2024-11-28',
                sourceUrl: 'https://www.antena3.ro/politica/dana-budeanu-george-simion-critici-suveranism-735456.html',
                topic: 'Suveranitate',
                impact: 'high',
                bias: 'right'
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
            leaning: 'center-left',
            score: -40,
            description: 'Cunoscut pentru emisiunea "În gura presei", are o lungă istorie de critică la adresa instituțiilor de forță și a "statului paralel". Recent, este critic la adresa măsurilor de austeritate.'
        },
        description: 'Realizator la Antena 3 CNN, Mircea Badea este una dintre cele mai vocale figuri media, folosind ironia și sarcasmul pentru a analiza derapajele politice și sociale.',
        socialLinks: {
            instagram: 'https://instagram.com/mirceabadea'
        },
        targets: ['DNA', 'SRI', 'Statul Paralel', 'Reformiștii', 'Klaus Iohannis'],
        rhetoric: { aggressiveness: 75, irony: 90 },
        statements: [
            {
                id: 'mb-s1',
                text: 'Guvernul Bolojan a inventat "austeritatea creativă". Adică tăiem de la polițiști și profesori ca să avem ce pune în PowerPoint-uri despre reformă.',
                date: '2026-02-15',
                sourceUrl: 'https://www.antena3.ro',
                topic: 'Economie',
                impact: 'high',
                bias: 'left'
            },
            {
                id: 'mb-s2',
                text: 'Siguranța publică a devenit o glumă. Când jurnaliștii sunt amenințați în plină stradă și autoritățile ridică din umeri, înseamnă că statul e în concediu.',
                date: '2026-02-10',
                sourceUrl: 'https://www.youtube.com/@Antena3Romania',
                topic: 'Social',
                impact: 'medium',
                bias: 'center'
            }
        ]
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
            description: 'Realizator România TV, promovează teme populiste și este frecvent critic la adresa reformiștilor radicali și a austerității.'
        },
        description: 'Moderator la România TV, Victor Ciutacu este cunoscut pentru stilul său incisiv și pentru campaniile media împotriva politicilor de dreapta dure.',
        socialLinks: {
            facebook: 'https://facebook.com/victorciutacu'
        },
        targets: ['Ilie Bolojan', 'PNL', 'Austeritatea', 'Reformiștii'],
        rhetoric: { aggressiveness: 70, irony: 65 },
        statements: [
            {
                id: 'vc-s1',
                text: 'Barosăneala lui Ilie Sărăcie Bolojan ne costă pe toți. Vreți reformă? Începeți prin a nu mai băga mâna în buzunarul oamenilor simpli sub pretextul eficienței.',
                date: '2026-02-18',
                sourceUrl: 'https://www.romaniatv.net',
                topic: 'Economie',
                impact: 'high',
                bias: 'left'
            }
        ]
    },
    {
        id: 'cristian-tudor-popescu',
        slug: 'ctp',
        name: 'C.T. Popescu',
        role: 'Gazetar / Scriitor',
        image: 'https://hotnews.ro/wp-content/uploads/2025/09/ctp.webp',
        bias: {
            leaning: 'center-right',
            score: 30,
            description: 'Poziții raționale, pro-europene. Critic acerb al populismului și al imposturii academice sau politice.'
        },
        description: 'Unul dintre cei mai respectați gazetari, CTP analizează realitatea prin prisma logicii și a integrității, fără a menaja nicio tabără politică.',
        socialLinks: {
            facebook: 'https://facebook.com/ctp'
        },
        targets: ['PSD', 'Populiștii', 'Impostura Academică', 'AUR'],
        rhetoric: { aggressiveness: 45, irony: 70 },
        statements: [
            {
                id: 'ctp-s1',
                text: 'Vizita lui Nicușor Dan la Trump a fost un exercițiu de umilință națională. Să mergi acolo și să fii batjocorit, primind o funcție greșită, este eșecul diplomației personale.',
                date: '2026-02-25',
                sourceUrl: 'https://www.hotnews.ro',
                topic: 'Politică Externă',
                impact: 'high',
                bias: 'center'
            },
            {
                id: 'ctp-s2',
                text: 'Pensiile speciale ale magistraților sunt cancerul care macină PNRR-ul. Amânarea promulgării legii de către președinte este o complicitate la subminarea economiei.',
                date: '2026-02-12',
                sourceUrl: 'https://www.republica.ro',
                topic: 'Justiție',
                impact: 'high',
                bias: 'right'
            }
        ]
    },
    {
        id: 'catalin-tolontan',
        slug: 'catalin-tolontan',
        name: 'Cătălin Tolontan',
        role: 'Jurnalist Investigativ',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSvPgqSu73YZLHg73P4LDTySMg5cSu2zUr_A&s',
        bias: {
            leaning: 'center',
            score: 5,
            description: 'Focus pe investigații independente, interes public și libertatea presei. Critică abuzurile de putere indiferent de guvernare.'
        },
        description: 'Unul dintre cei mai importanți jurnaliști de investigație din România, coordonator al unor anchete care au schimbat legi și miniștri.',
        socialLinks: {
            facebook: 'https://facebook.com/catalin.tolontan'
        },
        targets: ['Corupția', 'Abuzul de Putere', 'Sistemul Sanitar', 'Mafia Medicală'],
        rhetoric: { aggressiveness: 30, irony: 20 },
        statements: [
            {
                id: 'tol-s1',
                text: 'Jurnalismul nu este despre a fi pe placul cuiva, ci despre a servi publicul. Când prețul tăcerii devine moneda de schimb în democrație, adevărul este prima victimă.',
                date: '2026-02-20',
                sourceUrl: 'https://www.libertatea.ro',
                topic: 'Media',
                impact: 'medium',
                bias: 'center'
            }
        ]
    },
    {
        id: 'rares-bogdan',
        slug: 'rares-bogdan',
        name: 'Rareș Bogdan',
        role: 'Politician / Europarlamentar',
        image: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/1718281681350_20240612_BOGDAN_Rares_Ioan_RO_006.jpg',
        bias: {
            leaning: 'center-right',
            score: 45,
            description: 'Europarlamentar PNL, voce a curentului conservator-liberal. Recent intrat în conflict cu aripa reformistă dură a partidului.'
        },
        description: 'Fost jurnalist de top, Rareș Bogdan este acum unul dintre liderii PNL, cunoscut pentru retorica sa pro-europeană, dar și pentru apărarea intereselor primarilor liberali.',
        socialLinks: {
            facebook: 'https://facebook.com/RaresBogdan'
        },
        targets: ['Ilie Bolojan', 'Aripa Reformistă PNL', 'Austeritatea'],
        rhetoric: { aggressiveness: 60, irony: 40 },
        statements: [
            {
                id: 'rb-s1',
                text: 'Domnule Bolojan, nu se poate conduce o țară prin dictate lunare. PNL nu este o cazarmă și guvernarea nu se face prin solicitări de voturi de încredere din 30 în 30 de zile.',
                date: '2026-02-05',
                sourceUrl: 'https://www.mediafax.ro',
                topic: 'Politică',
                impact: 'high',
                bias: 'right'
            }
        ]
    },
    {
        id: 'lucian-mandruta',
        slug: 'lucian-mandruta',
        name: 'Lucian Mândruță',
        role: 'Jurnalist / Formator de Opinie',
        image: 'http://larics.ro/wp-content/uploads/2017/05/Lucian-Mandruta-1.png',
        bias: {
            leaning: 'center-left',
            score: -25,
            description: 'Abordare liberală, pro-occidentală, critic al naționalismului și populismului.'
        },
        description: 'Jurnalist cu o prezență online masivă, Mândruță analizează societatea românească prin prisma valorilor europene și a modernizării.',
        socialLinks: {
            facebook: 'https://facebook.com/LucianMandruta'
        },
        targets: ['Naționaliștii', 'AUR', 'Populismul', 'Pro-Rusia'],
        rhetoric: { aggressiveness: 35, irony: 55 },
        statements: [
            {
                id: 'lm-s1',
                text: 'Viitorul nostru nu este în izolare, ci într-o Europă puternică. Cei care vând suveranism pe pâine uită că pâinea aia e subvenționată de la Bruxelles.',
                date: '2026-02-22',
                sourceUrl: 'https://www.facebook.com/LucianMandruta',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'left'
            }
        ]
    },
    {
        id: 'moise-guran',
        slug: 'moise-guran',
        name: 'Moise Guran',
        role: 'Analist Economic',
        image: 'https://www.romaniacurata.ro/wp-content/uploads/2014/05/moise-guran.jpg',
        bias: {
            leaning: 'center-right',
            score: 20,
            description: 'Analiză economică riguroasă, pro-piață liberă și eficientizarea aparatului de stat.'
        },
        description: 'Cunoscut pentru emisiunea "Biziday", Moise Guran este una dintre cele mai ascultate voci pe teme economice și macro-politice.',
        socialLinks: {
            facebook: 'https://facebook.com/MoiseGuran'
        },
        targets: ['Birocrația', 'Risipa Bugetară', 'Guvernul', 'Sindicatele'],
        rhetoric: { aggressiveness: 45, irony: 50 },
        statements: [
            {
                id: 'mg-s1',
                text: 'Bugetul pe 2026 este un castel din cărți de joc. Dacă nu tăiem masiv din birocrație acum, la prima adiere de recesiune europeană, ne prăbușim toți.',
                date: '2026-02-14',
                sourceUrl: 'https://www.biziday.ro',
                topic: 'Economie',
                impact: 'high',
                bias: 'right'
            }
        ]
    },
    {
        id: 'selly',
        slug: 'selly',
        name: 'Selly',
        role: 'Influencer / Content Creator',
        image: 'https://www.masteringthemusicbusiness.ro/wp-content/uploads/2025/02/fb_selly.jpg',
        bias: {
            leaning: 'center',
            score: 5,
            description: 'Reprezentant al noii generații, concentrat pe educație și antreprenoriat. Critică sistemul de învățământ învechit.'
        },
        description: 'Andrei Șelaru (Selly) este cel mai mare creator de conținut din România, folosindu-și platforma pentru a pune presiune pe reformarea educației.',
        socialLinks: {
            youtube: 'https://youtube.com/selly',
            instagram: 'https://instagram.com/selly'
        },
        targets: ['Sistemul de Învățământ', 'Politicienii', 'Birocrația Educațională'],
        rhetoric: { aggressiveness: 25, irony: 45 },
        statements: [
            {
                id: 'selly-s1',
                text: 'Educația nu a fost niciodată o prioritate reală în România. Avem 31 de miniștri în 30 de ani și o școală care te învață orice, mai puțin cum să supraviețuiești în 2026.',
                date: '2026-02-27',
                sourceUrl: 'https://www.euronews.ro',
                topic: 'Educație',
                impact: 'medium',
                bias: 'center'
            }
        ]
    }
];
