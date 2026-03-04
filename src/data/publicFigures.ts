export interface Statement {
    id: string;
    text: string;
    date: string;
    sourceUrl: string;      // homepage-ul publicației (ex: https://www.hotnews.ro)
    articleUrl?: string;    // URL-ul articolului specific, dacă există
    topic: string; // ex: "Politica", "Social"
    bias?: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
    impact: 'high' | 'medium' | 'low';
    factCheck?: {
        text: string;
        sources: { label: string; url: string }[];
    };
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
    contextNotes?: string[];  // Extra factual or behavioral notes about the figure
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
        contextNotes: [
            'În analizele sale citează frecvent publicația internațională Financial Times, un redutabil cotidian economic internațional deținut în prezent de holdingul de presă japonez Nikkei.',
            'Pe plan intern, recomandă adesea și preia informații exclusiviste din ziarul Gândul.',
            'Are apariții constante ca invitat la România TV, unde are o relație bună și un acord destul de frecvent cu moderatorul Victor Ciutacu.',
            'Apare totodată și la Antena 3 CNN, însă acolo discursul său generează mai multe contraziceri cu moderatorii postului.',
            'Pe canalele sale (mai ales pe Instagram) abordează frecvent o postură religioasă asumată, aducând des în discuție subiectul credinței.',
            'La nivelul personajelor istorice post-decembriste din România, s-a declarat în repetate rânduri o simpatizantă a viziunii și personalității lui Ion Iliescu.'
        ],
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
            },
            {
                id: 'db-ig-img-1',
                text: 'Încă una și mă culc. Că așa proști n-am văzut. CHINA a băgat deja 1 miliard în două dintre resursele de petrol ale lui MADURO și le-a luat pe 20 de ani ÎN 2025!',
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-img-2',
                text: 'Doresc să mai anunț că toți băieții buni Peterson Brand etc au trecut la crestinism si chiar la ortodoxie așa la bătrânețe brusc voiam sa va spun atat! PUPIX!',
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Religie / Social',
                impact: 'medium',
                bias: 'center-right',
                factCheck: {
                    text: 'Referința la "Brand" este legată de actorul Russell Brand. În urma unei investigații jurnalistice (The Times, Channel 4), acesta a fost acuzat de agresiune sexuală, viol și abuz emoțional de mai multe femei. După acest scandal mediatic care i-a demonetizat canalele, Brand și-a schimbat discursul și a anunțat convertirea la creștinism, acțiune catalogată de observatorii media drept o încercare strategică de atragere a audiențelor conservatoare și de PR.',
                    sources: [
                        { label: 'The Times', url: 'https://www.thetimes.co.uk/article/russell-brand-rape-sexual-assault-allegations-q3gcrpmcm' },
                        { label: 'BBC News', url: 'https://www.bbc.com/news/entertainment-arts-66838848' }
                    ]
                }
            },
            {
                id: 'db-ig-img-3',
                text: 'Mai știi când erai #REZIST, Siemioane? Ai culcat pisica lu Ciolacu? De mâine intră Căcălin 24/7 și tu mergi să lipești afișe pentru fratele tău Nicușor!',
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'high',
                bias: 'right'
            },
            {
                id: 'db-ig-img-4',
                text: 'AHAHAHA! Și așa a fost! Hai culcați-vă-n frig nespălați și mai vedem mâine! Tudororo? Tot prost ești?',
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-0',
                text: `01:42 8 •nl 56 • 6h • •• X DORESC SA MAI ANUNT CA TOTI BAIETII BUNI PETERSON BRAND ETC AU TRECUT LA CRESTINISM SI CHIAR LA ORTODOXIE ASA LA BATRANETE BRUSC VOIAM SA VA SPUN ATATI PUPIX!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-1',
                text: `09:51 • 10h X RUSSIA IN 2019 AHAHAHA! REPORTEDLY FLOATED SI ASA A DEAL TO THE A FOSTE FIRST- TERM TRUMP ADMINISTRATION HAI CULCATI VA N OFFERING US INFLUENCE OVER VENEZUELA FRIG IN EXCHANGE FOR NESPALATI WASHINGTON SI MAI VEDEM MAINE! TUDORORO? STEPPING AWAY FROM TOT PROST UKRAINE ESTI? FIONA HILL`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-3',
                text: `01:41 8 .00U 56 • 8h ••• X HOHHA DATI VA DRECU NU LOCUIESTE LA DE PE POD COTROCENI SATREACA SI ORICUM E NEPALEZII PLECAT LA SKI! CU GLOVO MASCARADE CA AIA MUNCESC CARE SI BAT JOC SI DUMINICA! DE JANDARMI SI DE POLITIE CARE TREBUIE SA STEA DUPA IDIOTENIILE LU SIEMION! VEZI CA MAI AI O ORA SI TREBUIE SA ALAPTEZI SI SA FACI BAITA!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-4',
                text: `23:09 - •DIU 45 • 2h < Patrick André de Hillerin o 20m • 0 .•• Ce o sá se ascuta lupta anti-drog la nivel planetar... China o să caute droguri în Taiwan, Iranul în Israel, Israelul în Iran, Israelul în Liban, Rusia în Ucraina, Macron la Le Pen, Merz la AFD, Maia Sandu la toți adversarii pe care încă îi mai are și tot așa. Numai în România nu o sá se întâmple nimic, pentru că la noi se face trafc de supraviețuire, nu în scopuri oneroase.`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-6',
                text: `09:46 • | g 67 • 41m .•• X CU OCAZIA ZILEI SRI DANUTA VA SPUNE CA HOHHA NA NUMIT SEF SRI UN AN JUMA CA SA FACA MASCARADA CU CACALIN SI CA SA L PJNA PRESEDINTE PĂ NICUSOR! LA MULTI ANI!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-7',
                text: `17:49 Your story reea.litycheck bucuresti.central.memes and.. • Smashing Pumpkins • Cherub Ro...`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-11',
                text: `23:31 8 •|| 64 • ... AVATARUL CACALIN SUNT DOAR O LOVITURA DE STAT IMPOTRIVA ECHILIBRULUI POLITIC CREAT, CA NU ESTE SUSTINUT DE NIMENI, DE NICIUN TRUMP SI IATA CA ASA A FOST! IN ZIUA IN CARE NICUSOR A FOST INSTALAT, CONSERVA CACALIN S A RETRAS DIN POLITICA IN CARE ORICUM NU A FOST NICIODATA! 7. IN SEARA DE 18 MAI, SIEMION CU CONCURSUL TUTUROR, NU A MAI NUMARAT NICIUN BULETIN! V AM DEMONSTRAT (TOT SINGURA DIN ROMANIA), SAT CU SAT, JUDET CU JUDET, CUM A FOST FURAT VOTUL PE LISTE SUPLIMENTARE! 8. AM FOST SINGURA CARE V AM EXPLICAT CA AL DOILEA RAZBOI MONDIAL A FOST CASTIGAT DE RUSIA IMPREUNA CU STATELE UNITE SI NOI SE STIE UNDE AM RAMAS! RAZBOIUL RECE ESTE UN SERIAL DE HOLLYWOOD PENTRU PROSTII CA VOI! NU A EXISTAT NICIODATA! DESTEPTII STIU CA A FOST O IMPARTEALA PE RESURSE SI ALTELE, CA SI ACUM! 9. SINGURA SOLUTIE AZI E UNA PE CARE NU MERITATI SA O STITI! PUP! 805 5 days ago`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-12',
                text: `19:22 • 2h •ll 9 94 • •• X ZELEVOGUE MOMAIASANDU BUTTHEAD SUNT SOLDATII LU PUTIN! BINE PROSTII O SA AFLE PESTE 10 ANI!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-13',
                text: `14:18 For you v 84 + Your story corinasucarov mariaol V ... INTERESUL RUSIEI ASA CUM VI L A ROSTIT SI PUTIN ESTE CA N TOATE TARILE DIN EUROPA SA FIE PROGRESISTI CURCUBEI LA CONDUCERE NU EL L A PUS PE ZELEVOGUE? RESTU E NUTRET PENTRU PROSTI RUSII AMERICANII CHINEZII STIU CA SUNTETI MULTI PROSTI! 418 SIEMION E NUTRETU PENTRU PROSTII CU VIN RUSII! RUSII S AICI SI N TOATE TARILE PRECUM FRANTA GERMANIA ETC! PRIN PRESEDINTII PROGRESISTI! JE SUIS MATEI PAUN... more .. maladia n`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-14',
                text: `16:43 •1| 5 52 SA RAMANA SCRIS REAMINTESC - DANA BUDEAMJIL A FOST SINGURA' :DIN 'ROMANIA» CARE A SPUS CĂCĂLIN GEORGESCU ESTE CANDIDATUL LUI HOHHANIS SI A SISTEMULUI LUT!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-15',
                text: `15:47 + Your story •0l 5G 78 annoujkah reea lity V ... < Dana Budeanu c 6m • ••• VAAAAAAAAI! HAIDETI DOMNU PALADA, CE DRECU! PAI VA FACETI DE RAS, SINCER! CE VOT? NICUSOR A IESIT PRESEDINTE NEVOTAT! A IESIT PRIN MASCARADA HATA SUVERANISTA CU CÃCÃLIN, PENTRU CREAREA UNEI SANCHI PANICI CA VIN RUSII SI NE IAU TROTINETELE SI GOJI (RUSII NU VIN SI SUNT INTERESATI DOAR CA N FIECARE TARA VECINA SA EXISTE UN ZELEVOGUE PRESEDINTE, PE CARE TOT EI L AU PUS), PANICA, CARE SA DEA SENZATIA FALSA CA MAMA GATA S A SPERIAT CINEVA SI PAC O SA VOTEZE PRO SANCHI EUROPA, CE DRECU O MAI FI SI AIA! NICUSOR DAN N A IESIT PRESEDINTE, ASA CUM DOAR EU AM SCRIS, DUPA CE AM STAT O NOAPTE SI V AM PREZENTAT SCHEMA CU LISTELE SUPLIMENTARE DE PESTE 1 MILION DE VOTURI! LASATI O ASA! 306`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-16',
                text: `11:50 | 26 • 2h < Dana Budeanu e 3m • O ••• Dana Budeanu c 14 ian. 2025 • 2021 CAND SCRIAM EU DESPRE ALA MICU WANNABE VLADIMIR, CA SE PANICASE GARNIZOANA RAIZ! AHAHAHAHAHAHA! < Dana Budeanu • 14 Jan 2021 • Q AHAHAHAHAHAHAHAHAHAHAHAHAHA! N AI MA CUM ASA CEVAAAAAAAAAA! CE S A INTAMPLAT, BAI, NENE? PROBABIL CA A RUPT CLIPU SI GATA E AMENINTARE??!!! PENTRU CINE? CA AIA FOARTE DESTEPTI STIU CE VOR PENTRU EI, NU STAU PE FB SA COMENTEZE CA DE CE S A FILMAT UNU LA VIENA SI CA DE CE LA VIENA! АНАНАНАНА! MORI, MA! PAI CUM DE CE? PENTRU CA S A UITAT LA MAGICIANU CARE TOT DE LA VIENA A VENIT SA NE LUMINEZE! NU? SAU DOAR ALA ARE VOIE LA, DE LA SI PENTRU VIENA? BAI, NENE, SA SE DERANJEZE RISE PENTRU ASA CEVA. MI SE PARE DE LA NEBUN!!!! CA CE? Dana Budeanu e 14 Jan 2021 • G FREEDOM OF SPEECH, COPII! ORICUM OAMENII FOARTE DESTEPTI STIU CE AU DE FACUT, NU? SAU VA E FRICA PENTRU PROSTI? N ARE CUM, CA AIA HALESC ORICE II SPERIE! NU I ATI SPERIAT SUFICIENT? AU MAI RAMAS D ASTIA NESPERIATI? RISE Project.`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-17',
                text: `< Dana Budeanu • Chiar acum • Q ••. OF, IAR SE CONFIRMA TOT CE E SCRIS CU ANI INAINTE DOAR PE VERDICT APP DANA BUDEANU? https://www.gandul.ro/financiar/cati-bani-a- incasat-ucraina-din-taxele-platite-de-rusia- pentru-tranzitul-gazului-contractele-s-au- incheiat-abia-dupa-trei-ani-de- razboi-20610951 2 app.verdictapp.com ZELENSKI - SOLDATUL LUI PUTIN | Brainy`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-18',
                text: `15:32 0 8 NICUSOR DAN ESTE ANDIDATUL SISTEMULUI HOHHANIS! 604 7 DORESC SA SE NOTEZE CA NICI PANA AZI, NICIUN HANALIST POLITIC NU A SCRIS ASTA! NICUSOR ESTE CANDIDATUL SISTEMULUI HOHHANIS! ASA A AJUNS PRIMAR IN 2020 SI 2024. PENTRU ASCENSIUNEA SI PREDAREA STAFETEI LA PREZIDENTIALE S A FOLOSIT INTERFATA CĂCĂLIN, PREGATITA DE ANI! DORESC SA VA INVIT SA VIZIONATI VERDICTUL POLITIC 'E LOVITURA DE STAT', ASTAZI CAND ANIVERSAM PATRU ANI DE ADEVAR CONTINUU PE VERDICT APP DANA BUDRANU! SCHEMA A FOST MEREU: FASOLE TECI CĂCĂLIN NICUSOR DAN! PS: SI DUPA MASCARADA V ATI TREZIT LA AN DISTANTA! 7 hours ago • Q ...`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-19',
                text: `09:59 .0l 24 Dana Budeanu * dana Chiar acum • NICUSOR PRESEDINTE! Dana Budeanu 10 feb. 2022 • 0 PLICUSOR CANDIDATUL PNL USRI PLUS 2 1/4 "FRATELE" LUI RARES RUJ ROZ OMUL PE MANA CARUIA ORBAN A INGROPAT CAPITALA ROMANIEI CANDIDATUL LUI IOHANNIS PRIMARUL GUNOAIELOR, PARCURILOR DISTRUSE, STRAZILOR INSALUBRE, CLADIRILOR IN PARAGINA, TRANSPORTULUI INFECT, TRISTETILOR SI MIZERIILOR CONTINUE, FRIGULUI INSUPORTABIL DIN SUTE DE MII DE CASE, AJUTOARELOR TAIATE ALE COPIILOR, MAMELOR SI BATRANILOR NEPUTINCIOSI... REPREZENTANTUL DREPTEI SI AL STATULUI ESUAT PE SUFLETUL, MINTEA SI MUNCA OAMENILOR...`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-20',
                text: `15:32 56 • 4h •.. X CĂCĂLINE MIE NU MI E IESI IN MM MILA DE DE CONSERVA #REZISTI DOI LA METRU CA S NISTE SI EXPLICA LE NETERMINATI ALORA PE CARE DAR DE BATRANII I AI CARDIT SI OAMENII CA SEMNU ALA AMARATI DE CARE V ATI BATUT JOC MARELE CU SUVERANISMU DIN AMERICA E IMI ESTE NICUSOR! TRADATORILOR! HAI MAI FA UN FILM AI SI SPUNE LE LA PROSTI CUM SE FACE!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-21',
                text: `20:47 .ll 69 • 3h ... X MUSKA PĂ KETAMINA VORBESTE DÃ CCR! AHAHAHAHA! NU VA MAI AU ZIS SEFII DROGATZ TAI DE LA CHIAR CIAIEI NON STOP! SA FACI CE TI AU DAT LA YANKEI ACOLO SCLAVULE!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-22',
                text: `09:23 5 + Your story finklness dianana S9 scena_9 ... PA DYICKA www.dacica.ro Peso de pizda țigăncii Plante, rasism și marketing Eticheta de pe un borcan ridică o întrebare la care se gândesc și botaniștii lumii: ce facem cu numele ofensatoare ale plantelor? Citește articolul din arhivă pe scenag.ro S9 © 1.319 • 25 7 56 Q`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-23',
                text: `19:05 < Dana Budeanu • Chiar acum • O ... UN NETERMINAT PUS PRIMAR DE GARNIZOANE SI SAGETI ALE GARNIZOANELOR CU AJUTORUL PNL! S LIVE stiripesurse.roo 12m• Săptămâna trecută, chiar în ziua ședinței Consiliului General, la care edilul Capitalei a absentat, blocând prin nesemnarea raportului, încă o investiție în sănătate, la Spitalul Clinic „Bagdasar-Arseni", judecătorii au administrat încă o sentință usturătoare candidatului „independent" la președinție. Astfel, Nicuşor Dan și Asociația Ecopolis au primit miercuri o lovitură uriașă din partea Curții de Apel Pitești, judecătorii respingând, prin hotărâre definitivă, recursul Municipiului București cu privire la anularea suspendării PUZ Sector 2.`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-24',
                text: `23:00 m For you v + Your story mariaoprina TRAFICANTUL DE INFLUENTA NICUSOR UN RATAT MAIDANEZ #REZIST CARE A INGROPAT BUCURESTIUL • CONSERVA A SERVICILOR ARE TUPEU SA SPUNA CA ROMANIA E UN STAT SLAB! 709 SIMSFIPDJPM! •ll 5G 65 annoujkah dianana ... BAI NESPALATULE PUTE LOCU SUB TINE SI SUB ZECILE DE PLANGERI PENALE TINUTE LA MISTO N SERTAR! MARS!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-25',
                text: `13:37 For you v 76 + Your story finklness mariaor ... TOT APARATUL FORMAT DIN ASTFEL REZERVISTI SUNTETI HATA JURNALISTI PARTAS! POLITICIENI SI VINOVATI DE INALTA VOTANTI TRADARE CAREI MARS! L AU SUSTINUT PÃ ATI JUCAT CĂCĂLIN ROMANIA LA BARBUTI AU PARTICIPAT LA LOVITURA DE STAT ORGANIZATA PENTRU NICUSOR! 606 3 hours ago +`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-26',
                text: `18:13 •ll 5G 51 • ... < Dana Budeanu e Chiar acum • O UN SERIAL UNIC IN ROMANIA! PFIUUUU IA UITE CAPITANII CARE SANCHI AU FACUT REVOLUTIA FACUTI GOLANI IN PIATA! BAEJNEBUN? ATAT DE PROSTI VA CRED! ••• 9 24 4 1990 app.verdictapp.com CARDEALA GOLANIADA MINERIADA (II)! 150 4 days ago SNOOP snoop.ro • .. Q`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-27',
                text: `23:01 A •Il 5G 65 • ... < Dana Budeanu • Chiar acum • O ••• PÃ SISTEM FRUMOS! PS: NU ASTA MA INTERESEAZA, CA AM SPUS DIN ZIUA UNU CA NICUSOR E CANDIDATUL GARNIZOANELOR, EU VREAU SA STIU EXACT SAGETILE CARE FINANTEAZA CAMPANIA...SA LE SPUNA GARNIZOANA SI SARACILOR, CA NU E TREABA MEA...ASA, CA SA STIE SI PROSTII PE CARE I PUNETI SA VOTEZE "CANDIDATI INDEPENDENTI"! PENTRU PROSTI, CA NU CRED CA STIU, BIROUL ELECTORAL DECONTEAZA DIN BANII POPULATIEI CE CHELTUIE SAGETILE! stiripesurse.ro e 39m • Fost colonel #SRI, în permanență la dreapta lui Nicușor Dan. 'Da, fac parte din echipa de campanie' ~ 289 1 day ago Q 7 • Q`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-28',
                text: `14:22 lan (26 Dara Budeanu e Chiar acum • O URLU DIN NOIEMBRIE! @ STIRIPESURSE.RO ACUM S A TREZIT SI PRESA: https://www.stiripesurse.ro/diversiunea- georgescu-si-adevaratul-pericol-pentru- romania_3619431.html Dana Budeanu o 2 mar. • NOTA TI SINGURA CARE V A CACALIN SPUS ESTE CONSERVA #REZIST REZERVISTILOR • #SUVERANIS1 DE ARUNCAT IN AU ACEIAS OCHII POPULATIEI IMBECILE SEFI IN SPATE PENTRU CA NETERMINATUL NICUSOR SA FIE VARIANTA!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-29',
                text: `16:54 82 • 46m ASA E N TOATA TARA ! & Voturi majoritare g Candidat 2 Grad centralizare JUDET IS IAŞI NIVEL Maxim 100% JUDET IS ASI Rezultate NTARE GRAFICA G cerc SOR-DANIEL DAN : 232.461 Date din procesul verbal Total alegatori inscriși in liste Total alegatori prezenți la urne 810595 400437 Proces-verbal Candidat 1. NICUSOR-DANIEL DAN 2. GEORGE-NICOLAE SIMION TOTAL Fisiere (v2 v1 Data ultimului fisier: 19.05.2025 16-5758 Votur tocent ~) 232.461 182 222 395.694 58,75 % 41,25 % 100,00 % SIEMION A FACUT LA MISTO CONTESTATIE! CÃCÃLIN A ANULAT ALEGERILE! TOTI SUNT MANA N MANA! RETINETI!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-30',
                text: `22:38 г .0l • 13h Dana Budeanu • Just now • DIN CE BANI, MAGICIENE? AAAAA...DIN AUSTRIA? AM CREZUT CA DE LA NIC! ••• gandul.ro Exclusiv. După despărțire, Vlad Voiculescu și fosta și-au cumpărat casă împreună!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-31',
                text: `11:40 •0l 81) VERDICT APP DANA BUDEANU NU FUNCTIONEAZA PENTRU CA A PICAT CLOUDFARE! ISI VA REVENI! SUNTEM COPLESITI DE MESAJE! STATI LINISTITI APLICATIA ESTE OK! ASTEPTAM ALATURI DE X CHATPROST SI ALTE APPS SA SI REVINA! @Telegraph.co.uk`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-33',
                text: `22:38 - •00l 70 • 23h •.. X MISCARILE CAND SANCHI VAD SUVERANISTE ATATA PROSTIE NASCUTE IN JUR ROSTOGOLITE iMI CrESTE INTRETINUTE INIMA DE EXCLUSIV BUCURIE! DE PLATFORMELE SOCIAL MEDIA SOROSISTE!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-34',
                text: `20:33 • 9h TINERI AU MURIT LA REVOLUTIE PENTRU LIBERTATE SI DUCEREA ROMANIEI CATRE VEST CA SA VINA ASTIA PROSTITI CARE AZI URLA SA NE IZOLAM DE OCCIDENT! 20 ••• X`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-35',
                text: `07:25 •0l 18 • 10h •.. X PROSTILOR DANA CE FACETI MA? BUDEANU CĂCĂLIN SINGURA SUVERANISTU P DIN ROMANIA SI A ANUNTAT • CAREV A SPUS RETRAGEREA DESPRE V A ARS PENTRU HARNEALA NICUSOR ) SUVERANISTA IMPREUNA CU SIEMION SI PLEACA IN M M DE UNDE A VENIT!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-36',
                text: `18:01 8 264 8 hours ago 68 • •.. Dana Budeanu e 1m . ••• ALTEX UNUL DINTRE SPONSORII PRINCIPALI AI LUI NICUSOR DAN! AM FOST SI RAMAS SINGURA DIN ROMANIA CARE V A SPUS DESPRE LOVITURA DE STAT DATA DE PENSATI PRIN CREAREA SI FINANTAREA VALULUI CÃCÃLIN, CU PARTICIPAREA LU SIEMION, PENTRU ADUCEREA LUI NICUSOR! REMUS BORZA cul DAN OSTAHIE NICOLAE CIUCA ORA 22:04 ORA 22:06 LOCATIA: CERCUL MILITAR gandul.ro IMAGINI EXCLUSIVE | Cină de taină de 3 ore: candidatul la Președinție Ciucă, miliardarul A... 370`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-37',
                text: `19:00 •0ll 74 • 41m ... X FÂSU LU BIBI E DE LA ACEEASI FABRICACA TRICOU LU ZELEVOGUE!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-38',
                text: `12:15 93 < Dana Budeanu • 9 apr. • .•• SI DUPA DOI ANI, LUI PREA TARZIU I SE FACE ALT PARTID SI AU INCALECAT PE O SA SI AU FOLOSIT TOATE CONSERVELE GARNIZOANELOR PENTRU NICUSOR DAN! PS: INAINTE SA MAI MERGETI CA PROSTII LA VOT, NU UITATI CA AM FOST, SUNT SI VOI RAMANE SINGURA DIN ROMANIA, CARE V A EXPLICAT CA REZISTII SI SUVERANISTII SUNT UNII SI ACEIASI!!!! O MIZERIE SUSTINUTA DE PRESA DE DOI BANI, DIN PATRU N PATRU ANI! lorian Coldea Vasile Dincu Radu Popa Claudiu Târziu STASA A FOST! adul mdul Sâmbătă, 27 mai 2023 gandul.ro IMAGINI EXCLUSIVE. Coldea, Dîncu & finuțul Popică au prânzit cu doamnele la libanez! Cl...`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-39',
                text: `13:40 •Ill 65 • 4h ... X BAI DECI GATA A VORBIT CALIN FILE DIN POVESTE IN AMERICA SI LUCRURILE NU RAMAN ASA AM INTELES DECI NU MAI SUNTEM SUVERANI? CU CINE A VORBIT CA VREAU SA SUN SI EU SA NE FACA SI NOUA CU LUMINITE FRUMOS ASA IN BUCURESTI!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-40',
                text: `20:32 • | 20• • 9h X SA RAMANA SCRIS REAMINTESC DANA BUDEANUIL A FOST SINGURA' DIN 'ROMANIA» CARE A SPUS CĂCĂLIN GEORGESCU ESTE CANDIDATUL LUI HOHHANIS SI A SISTEMULUI LUT!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-41',
                text: `10:01 .ll 42 Dana Budeanu o Chiar acum • O ••• VA VORBESTE #HURSULASUVERANISTA! IN TRADUCERE E BINE SA DAM 5% DIN PIB PÃ HARME LA NATO, NU I ASA HÃUREL? FRATELE LU NICUSOR DAN, ATAT DE PROSTI VA CREDE! AHAHAHAHA! PS: BAI, AMETITULE LASA L PÃ TRUMP, CA NU STIE CINE ESTI! IN ACEASTA ORDINE DE IDEI, STII DIFERENTA DINTRE ARMATA NATO SI ARMATA RUSIEI? ASA CA FAPT DIVERS LA MISTO? NU! CULCA TE SI CAND TE TREZESTI, VEZI CE MAI ARE NEVOIE FRATELE TAU NICUSOR PE CARE L AI PUS PRESEDINTE! George Simion • • Urmărește 2z• Dorim PACE. O vom obține numai prin umbrela de securitate NATO și cu aliații noștri strategici, Statele Unite și Polonia. Triada este soluția viitorului în Europa: Singura țară care luce Rusia la masa`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-42',
                text: `23:40 - MESAJ DE LA Ionut D ana Budeanu noiembrie 2024: "Lasoni si Cacalin sunt candidatul sistemului." Dana Budeanu decembrie 2024: "Nicusor candidatul sistemului, candidatul lui Hoha." Lasconi si-a facut treaba, s-a "detonat" in favoarea lui Nicusor. Urmeaza si cealalta conserva sa isi faca treaba.`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-43',
                text: `19:23 : •ll 94 • 1h > VICEPRESEDINTA VENEZUELEI E LA MOSCOVA SE UITA CA LA NETFLIX CU LAVROV JOACA TABLE! •.. ABIA ASTEPT DE LUNI HANALISTII POLITICI DE LA NOI PE LA TEVEURI! LUATI VA DRECU VERDICT APP DANA BUDEANU CITITI ULTIMII TREI ANI CA SA NU VA MAI FACETI DE KKT CONTINUU!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-44',
                text: `00:16 A .ll 4G (80 thesite.ro Q Politică Economie Sănătate Tehnologie Barometru Opinie Analiza poziționării figurilor publice din România Vezi toți D Dana Budeanu Influencer / Critic de modă Mircea Badea Realizator TV Victor C Jurnali: S Actualizează știrile Surse Active thesite.ro agregă știri din 42 surse pentru o perspectivă thesite.ro`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-45',
                text: `13:50 • 2h ... 58 X SISTEMU A DAT ORDIN 10% PE LISTE SUPLIMENTARE DIN TOTAL CU DREPT DE VOT PESTE TOT! PRIVITI CA SA STITI SA GANDITI!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-47',
                text: `16:44 •Il 52}' dan Dana Budeanu e`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-48',
                text: `13:42 0 | 82)' Dana Budeanu • Chiar acumi • ATAT DE PROSTI VA CRED! V AM SPUS CA E O HARNEALA FACUTA CA SANCHI SA CREEZE VALU SUVERANIST, UN ANTEMERGATOR SOCIAL DUS IN EXTREMISM INTENTIONAT, PENTRU A BATATORI CALEA PROGRESISTA! SINGURA DIN ROMANIA CARE V A EXPLICAT! E RETETA! S A MAI FACUT SI N UK SI N FRANTA... stiripesurse.ro • 18m • Asociația „Pământul Strămoșesc", fondată de Călin Georgescu în toamna anului 2021, a fost oficial dizolvată în data de 6 iunie 2025. Anunțul a fost făcut printr-un mesaj publicat pe pagina oficială de Facebook a organizației, în care fondatorii vorbesc despre „lucrarea" lor ca despre o misiune spirituală ce continuă dincolo de existența juridică.`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-51',
                text: `MESAJ DE LA Ionut D ana Budeanu noiembrie 2024: "Lasoni si Cacalin sunt candidatul sistemului." Dana Budeanu decembrie 2024: "Nicusor candidatul sistemului, candidatul lui Hoha." Lasconi si-a facut treaba, s-a "detonat" in favoarea lui Nicusor. Urmeaza si cealalta conserva sa isi faca treaba.`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-52',
                text: `.•• - CATI PROSTI SUNT IN ROMANIA SI UNDE? - LA ORASE 40% FOLOSESC CHATGPT! - MULTUMESC! - PENTRU PUTIN!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-53',
                text: `13:50 .00l 58 • 10h ... X SVIMSFIPDMR НОННА ATI JUCAT FASOLE TECI CĂCĂLIN TARA SIEMION MUCISOR CEI DIN LA ZARURI! GARNIZOANE CARE AU TRADAREA TRADAT DE GLIE REZERVISTII SE PLATESTE CU VIATA!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-55',
                text: `13:50 58 Dana Budeanu e Chiar acum • HAUR PESEDE ATI VAZUT ASTEA SAU ATI PLECAT DIN SECTII LA PRANZ? V AU CHEMAT NEVESTELE ACASA, MAFIOTILOR? SA MOARA FRANTA ASTIA S NUMA 186 187 PE LISTE SUPLIMENTARE! BAEJNEBUN? 86 - 87 CAND STATEAM LA RAND LA LAPTE! HOTILOOOOOOR! 69000 DE VOTURI PE LISTE SUPLIMENTARE N IASI! 8 Mai 2025 ₴ VANATORI Inscriși pe liste permanente Secti de votare Votanți pe liste permanente Votanti pe liste suplimentare Votanți cu urnà mobils Total votant s.s0u ngã la vot 8 Vot nte Eh Secti de votarel 36.26 * GRAJDUR inscriși pe liste permanente Sectil de volate Votanti ne liste permanente Votanti no licte cuntimentare Vatanti eutuna mobila Totat votanti Seati de votare Votanți pe liste permanen BT) @PEelve EVE 49.76 %`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-56',
                text: `00:42 8 •Ill 44 • 7h • • • SEFII LA LUME SI AU IMPARTIT EUROPA TRUMP PUTIN XI AU HOTARAT CA ROMANIA SA REVINA FRANTEI LA MULS AKA MUE! RESTUL E CANCAN!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-57',
                text: `10:31 .0l • 26m ... X MESAJ DE LA Letters from D to Dana A stăzi India-Pakistan, mâine Grecia- • Turcia, poimâine Taiwan, mai e și Siria. 'US wants UK military to focus more on Europe and away from Asia' - deja 2 'războaie' dintr-un titlu decise tot da șefii la lume astazi s-a postat si in FT ce se știa pe aplicația din 2022 singurul loc unde se spune adevărul și oamneii traiesc frumos liniștiți, iar prostii de mira și fac politică pa Insta. Ador și mulțumim`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-58',
                text: `18:56 64 < Posts • GEORGESCU ESTE O CONSERVA A SISTEMULUI ARUNCAT IN OCHII OAMENILOR LA MISTO CA SA FACA LOC CANDIDATULUI SISTEMULUI IN FINAL! LA FEL AU FACUT SI CU SIEMION! ... 693 • 7 11 April • S •`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-59',
                text: `17:23 62) < Dana Budeanu o 2m • SINGURA CARE V A SPUS CA FATALAU E PRIMARU LU TRUMP! MAINE SE DUCE N GENUNCHI PANA LA SEFU LUI! ••• Dana Budeanu e 5 nov. • O ALL RISE FOR THE FINAL COUNTDOWN TOWARDS THE FALL OF THE DEMOCRAT S ESTABLISHMENT! OMUL LUI TRUMP AJUNGE PRIMAR LA NY! ASA CUM PROGRESISMUL COORDONAT DE PUTIN SI US A INGROPAT EUROPA! DACA PROSTIA AR DUREA ATI FI TOTI LA ATI! Donald J. Trump • O @realDonaldTrump • 4h TRUTI ND SO IT BEGINS! | 4.81k g 4K 14.2k`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-60',
                text: `ACUM DOUA SAPTAMANI ELVETIA A REFUZAT SA PREDEA CONTROLUL TARII CATRE PALANTIR! O916 Q 5 24 138 RESTU E...COLECTIV!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-61',
                text: `SINGURA DIN ANU ASTA ROMANIA 'FIRMA' DE PROD CARE VA EXPLICAI ĂNTOLD CA PARANGHELIILE A 'LUCRAT" ÄNTOLDSI LA PLAJA PLEASE! SUNT CONTROLATE DE GARNIZOANE LOGIC PROSTILOR! 800 UN COPIL RÃRÃIT CU MAYBACH SAU UN PUI DE SECURIST CARUIA I SE CLASEAZA UN DOSAR DE PEDOFILIE, NU DETIN NIMIC...E FIRESC... RESTU E...CACAN! PS: BA DA, CONTEAZA ENORM CE MUZICA ASCULTI, ACEASTA MODELEAZA MINTI SI SUFLETE! MUZICA UNDERGROUD, IN SPETA SI HIP HOP UL HARDCORE, D AIA SE SI ASCULTA "PE ASCUNS", ASTA E IDEEA... AROGANTA VOASTRA ACOPERA DOAR IGNORANTA!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-62',
                text: `20:49 For you v + Your story mariaoprina sandra. ... CRED ULTRASINLU CASALIN RA CAL ATAT UNDE SUNT? CUM UNDE? LA NICUSOR! SUNT ACEIASI V AM MAI EXPLICAT! 213 4 hours ago Q`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-63',
                text: `23:31 д v 65 ... < Dana Budeanu o 1m • ••• ATAT DE PROSTI VA CRED! CITITI CA SA STITI SA GANDITI! Dana Budeanu • 2 iun. • O 1. SEFII LA LUME ISI IMPART TARILE DE SCLAVI CA MEREU IN ISTORIE: DPDV POLITIC, ECONOMIC ETC! 2. URLU DIN 2021, PUBLIC SI MULT MAI APLICAT PE VERDICT APP DANA BUDEANU! 3. V AM EXPLICAT CA, PESTE TOT IN EUROPA S A ORGANIZAT LA ORDIN, ODATA CU INCEPEREA MASCARADEI NUMITA PANDEMIE, O MISCARE SANCHI SUVERANISTA GENERALA, CARE SA DEA SENZATIA PROSTILOR, CA CINEVA SE LUPTA PENTRU EI, IN TIMP CE ACESTIA TREBUIE SA STEA CUMINTEI IN CASA SI SA ASTEPTE CA SEFII LA LUME, SA DESENEZE NOUA HARTA! 4. AM FOST SI RAMAS SINGURA DIN ~ 805 5 days ago`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-64',
                text: `23:31 8 64 • 4. AM FOST SI RAMAS SINGURA DIN ROMANIA CARE V A SPUS DIN ZIUA UNU CA SIEMION E O CONSERVA CREATA TOCMAI PENTRU ACEST SCENARIU, IAR CÃCÃLIN ESTE DOAR ANTEMERGATORUL LUI NICUSOR, INTERFATA PESTEI PROGRESISTE, CARE SE CHINUIE DE 35 DE ANI SA SE INSTALEZE PERMANENT IN ROMANIA! 5. ATI HALIT CU POLONICU SI #REZIST SI #SUVERANIST SI #MUEPSD! DE CE? PENTEU CA SUNTETI MANIPULATI CA NISTE CARPE, PENTRU CA VA DUCETI DUPA ORICE VAL, PENTRU CA STATI PRAJITI PE NET, PENTRU CA NU STITI CE S ALEA REGIM COMUNIST SI DICTATURA SI CREDETI CA ACESTEA SE POT MANIFESTA DOAR DACA TRAITI IN KOREA DE NORD! CEA MAI MARE DICTATURA E MANIPULAREA, ADICA INCHISOAREA MINTII! 6. DIN NOIEMBRIE V AM EXPLICAT SI AM URLAT CATRE TOATE AUTORITATILE STATULUI CA FENOMENUL #SUVERANIST SI AVATARUL CACALIN SUNT DOAR O LOVITURA DE STAT IMPOTRIVA O 805 5 days ago`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-65',
                text: `< Dana Budeanu ® Chiar acum • O • VICTOR #REZIST ZIS SI MICU SECURIST, REGRETA DECIZIA! PAI RADE O DIN PSD SI DA I DRUMU LA USRI, UNDE A ADUNAT GARNIZOANA TOTI PUII DE COMUNISTI! NU VA E RUSINE, BAI, FATALAILOR! CE E AIA DECLARATIE DE AVERE, NETERMINATILOR? SA DAM CU SUBSEMNATU CU CE AVEM PRIN CASA SI PRIN CONTURI? UNDE SUNTEM? IN KOREA DE NORD? UNDE ATI INVATAT SA GANDITI ASA, LINGAILOR? CUM SA DAM CU SUBSEMNATU? MARS IN COMUNISM! URLU DE 10 ANI PE ACEASTA TEMA IMBECILA, DEMNA DE UN STAT DICTATORIAL!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-66',
                text: `00:58 m Dana Budeanu PENTRU ALTII! BAI NENOROCITILOOOIOOOR! DULE VA VOIL NOI SUNTEM CARNE DE TUN! CUM ADICA SANE APARAMI DE CINE? DE RUSII DIN SLAVA? CE TREABA AVEM NOI BAI INCHIPUHTILUR! Author grae Average influencer... 340 votes, 170 comments.... • imediat dupa ce noul Papa a fost anuntat --- Dana a postat pe Instagram story o poza cu Trump generata cu Al, unde Trump apare drept Papa (poza a fost postata de Trump cu ceva gen 1-2 saptamani inainte) • avand in vedere o recurenta a caracterului conspirationist al Danei (vaccin, great reset stuff etc.) --- probabil vrea sa spuna ca Trump a avut o influenta in punerea Papei ?! • de notat este ca noul Papa avea Tweeterul plin de postari anti JD Vance (vicepresedintele Americii + Insert`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-67',
                text: `09:02 13 Dana Budeanu o na Chiar acum •`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-68',
                text: `09:45 Afshin Rattansi C @afshinrattansi Secretary of War Pete Hegseth: 'European countries buy US weapons, transfer them to NATO for the fight in Ukraine.' The US makes all the money, Europe bankrupts itself for Washington's proxy war, and Ukrainians keep dying for the failed goal of weakening Russia.' ••. NATO OTAN •TATO I1 0:29 Oskabeeva NATO OTAN AHAHAHAHA! DANA BUDEANU PE 9 IULIE I A VICTAR CIUTACU! @Youtu.be AZI SECRETARU PA RAZBOI! PS: ATAT DÃ PROSTI VA CRED BOLOVAN SI RESTU!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică Externă',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-69',
                text: `13:59 - 30 Dana Budeanu o Chiar acum • O ••• "E FOAME DÃ BANI, E FOAME DÃ BANI BAIETI! LUMEA TRE SA STIE CE FEL DE BAIETI SUNTETI!" FAIN SI SIMPLU A PUS? Ionut Cristache 21h • Breaking News! A venit si punctajul la deontologi! lancu Guda (IQ) Florin Negruțiu e`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-70',
                text: `23:57 P • 9h SINGURA DIN ROMANIA CARE V A SPUS CA MISIUNEA LU HOHHA A FOST ACEEA DE A DUSTRUGE PNL SI POLUL DE DREAPRA SI ALDA LA NETERMINATII A REUSIT! • 0`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
                bias: 'right'
            },
            {
                id: 'db-ig-auto-71',
                text: `09:52 •Ill 51 • 13h SI TOATE AMETITELE NE POVESTESC TRAUMELE LOR LOR DE RATEURI STITI DE CE MA CA SA STIE SI ALTE AMETITE CA NU SUNT SIGURE IN CRETINISM MA! MARS NETERMINATELOR!`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Social',
                impact: 'medium',
                bias: 'right'
            },

            {
                id: 'db-ig-auto-74',
                text: `08:31 8 •00l 100 < v Dana Budeanu e 2m • Patrick André de Hillerin e 51m • Din punctul meu de vedere, materialul jurnalistic al recorder s-a oprit în minutul 12 și 15 secunde, când am observat în colțul din stânga sus al ecranului mențiunea "INTERVIU RECONSTITUIT". Din acel moment nu mai este vorba despre un material jurnalistic, despre un documentar, ci despre orice altceva. Poate fi o piesă de teatru în care un actor recită ceva ce i s-a dat să recite, poate fi orice, dar material jurnalistic nu este, îmi pare rău. ulube Search Q NTERVIU RECONST + Create O recorder Trimite un cadou ire judecătorul de drepturi și libertăți 12:15 / 2:00:09 cc`,
                date: '2026-03-01',
                sourceUrl: 'https://www.instagram.com/danajustlove/',
                topic: 'Politică',
                impact: 'medium',
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
        contextNotes: [
            'Realizator longeviv al emisiunii „În gura presei” de la Antena 3 CNN, post fondat de Dan Voiculescu, față de care și-a asumat mereu loialitatea.',
            'Pe parcursul carierei, s-a poziționat ca un critic vehement al procurorilor anticoruptie (DNA), al Laurei Codruța Kövesi, al președintelui Traian Băsescu și, ulterior, al lui Klaus Iohannis și al partidelor de dreapta/USL.',
            'Folosește un discurs puternic satiric, bazat pe porecle, pamflet și revizuirea ironică a presei.',
        ],
        statements: [
            {
                id: 'mb-s1',
                text: 'Nu dau doi bani găuriți pe FMI.',
                date: '2025-09-01',
                sourceUrl: 'https://www.antena3.ro',
                articleUrl: 'https://www.antena3.ro/emisiuni/in-fata-natiunii/mircea-badea-mesaj-fmi-699400.html',
                topic: 'Economie',
                impact: 'high',
                bias: 'left'
            },
            {
                id: 'mb-s2',
                text: 'De la 1 ianuarie 2025, dacă dai cuiva 6.000 de lei cash, primești amendă. 25% din suma folosită. Acesta este capitolul neexplicat din legea austerității.',
                date: '2025-09-28',
                sourceUrl: 'https://www.antena3.ro',
                articleUrl: 'https://www.antena3.ro/emisiuni/in-gura-presei/mircea-badea-limitare-tranzactii-bani-cash-2025-persoane-fizice-capitol-neexplicat-lege-687233.html',
                topic: 'Economie / Austeritate',
                impact: 'medium',
                bias: 'left'
            },
            {
                id: 'mb-yt-1',
                text: 'Cum au dat englezii și americanii, practic agenția americană de spionaj CIA, o lovitură de stat pe față în Iran pur și simplu pentru a prelua controlul absolut asupra petrolului lor... Păi după aia mai stăm și ne întrebăm ipocrit de unde au decurs toate derapajele istorice în Orientul Mijlociu.',
                date: '2026-03-01',
                sourceUrl: 'https://youtu.be/6knOlBGxrOE?si=NrT3B4iN40H-wKBw',
                topic: 'Geo-Politică',
                impact: 'high',
                bias: 'center-left',
                factCheck: {
                    text: 'Referința istorică vizează Lovitura de stat iraniană din 1953 (Operațiunea Ajax), orchestrată oficial de MI6 (Marea Britanie) și CIA (SUA) pentru a-l înlătura pe premierul ales democratic Mohammad Mosaddegh, după ce acesta a naționalizat industria petrolieră a Iranului, aflată anterior sub control britanic.',
                    sources: [
                        { label: 'Declassified CIA Documents', url: 'https://nsarchive2.gwu.edu/NSAEBB/NSAEBB435/' }
                    ]
                }
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
        contextNotes: [
            'S-a afirmat la Jurnalul Național și Antena 3, iar în ultimii ani a devenit ancora principală a postului România TV, preluând zona de prime-time.',
            'Stilul său este direct, adesea conflictual, și are o istorie lungă de contre publice dure cu figuri ale opoziției, activiști civici și jurnaliști independenți.',
            'Postul pe care îl reprezintă (România TV) are frecvent derapaje sancționate de CNA, promovând narative senzaționaliste sau pro-PSD/suveraniste.'
        ],
        statements: [
            {
                id: 'vc-s1',
                text: 'Vlădica boierește, opinca pătimește.',
                date: '2025-06-24',
                sourceUrl: 'https://www.romaniatv.net',
                articleUrl: 'https://www.romaniatv.net/victor-ciutacu-dupa-primele-masuri-ale-lui-mesia-bolojan-vladica-boiereste-opinca-patimeste_8998057.html',
                topic: 'Economie',
                impact: 'high',
                bias: 'left'
            },
            {
                id: 'vc-s2',
                text: 'Achită fraierii nota de plată!',
                date: '2025-07-10',
                sourceUrl: 'https://www.romaniatv.net',
                articleUrl: 'https://www.romaniatv.net/exclusiv-victor-ciutacu-dupa-ce-ilie-bolojan-a-anuntat-masuri-dure-de-austeritate-achita-fraierii-nota-de-plata_9013519.html',
                topic: 'Economie / Austeritate',
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
        contextNotes: [
            'Fost director la Adevărul, fondator al publicației Gândul și colaborator de lungă durată la Digi24 și Europa FM, de care s-a despărțit ulterior. În prezent scrie independent și comentează frecvent pe platforme online.',
            'Asumă o poziție de critic intransigent, taxând în limbaj adesea vitriolic și plastic atât liderii populiști / extremiști (AUR, SOS, Călin Georgescu), cât și clasa politică tradițională (PSD, PNL).',
            'Adoptă o perspectivă pro-occidentală, secular-umanistă și științifică.'
        ],
        statements: [
            {
                id: 'ctp-s1',
                text: 'AUR este o grupare fascistă, condusă de un individ care are astfel de idei.',
                date: '2025-05-15',
                sourceUrl: 'https://www.hotnews.ro',
                articleUrl: 'https://hotnews.ro/ctp-mesaj-vehement-aur-este-o-grupare-nazista-condusa-de-un-individ-care-are-astfel-de-idei-1976180',
                topic: 'Politică / Extremism',
                impact: 'high',
                bias: 'left'
            },
            {
                id: 'ctp-s2',
                text: 'În sfârșit, primul gest de politică externă hotărât și clar al președintelui Dan. După mai rău de 10 ani, vocea României se face auzită în Europa și în lume.',
                date: '2025-12-20',
                sourceUrl: 'https://www.hotnews.ro',
                articleUrl: 'https://hotnews.ro/observatia-lui-cristian-tudor-popescu-despre-vocea-romaniei-in-lume-dupa-interviul-lui-nicusor-dan-acordat-politico-2137737',
                topic: 'Politică Externă',
                impact: 'high',
                bias: 'center'
            },
            {
                id: 'ctp-s3',
                text: 'Dacă Georgescu va candida, îl va transforma într-o tumoare imensă inoperabilă, în organismul românesc.',
                date: '2025-01-10',
                sourceUrl: 'https://www.hotnews.ro',
                articleUrl: 'https://hotnews.ro/cristian-tudor-popescu-ctp-calin-georgescu-tumoare-imensa-inoperabila-1874829',
                topic: 'Alegeri',
                impact: 'high',
                bias: 'center'
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
        contextNotes: [
            'Jurnalist de investigație premiat internațional, renumit pentru dosarele Hexi Pharma, Colectiv, Gala Bute. A condus redacțiile Gazeta Sporturilor și Libertatea.',
            'Demiterea sa recentă din trustul elvețian Ringier a declanșat un val de dezbateri vizavi de presiunile din partea industriei de pariuri și amestecul comercialului în independența editorială.',
            'Are o poziție axată pe transparența banilor publici, protecția cetățeanului și responsabilitatea instituțiilor de stat.'
        ],
        statements: [
            {
                id: 'tol-s1',
                text: 'Știam că vom pierde. Jurnalismul se face cu fața la public sau nu se poate face deloc.',
                date: '2024-03-10',
                sourceUrl: 'https://www.euronews.ro',
                articleUrl: 'https://www.euronews.ro/articole/catalin-tolontan-dupa-plecarea-de-la-libertatea-stiam-ca-vom-pierde-jurnalismul-s',
                topic: 'Media / Libertatea Presei',
                impact: 'high',
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
        contextNotes: [
            'Și-a construit profilul public ca moderator TV "anti-PSD" la Realitatea TV, folosind un discurs foarte emoțional și naționalist.',
            'În 2019 a părăsit presa pentru a intra în politică direct la vârful PNL, obținând un mandat de europarlamentar.',
            'A fost criticat frecvent în spațiul public pentru trecerea de la critic acerb al PSD-ului (la televizor) la partener de guvernare (prin intrarea PNL în alianța PSD-PNL).'
        ],
        statements: [
            {
                id: 'rb-s1',
                text: 'Ilie, nu poți să ceri vot de încredere din lună în lună. Ilie Bolojan este ales președinte al Partidului Național Liberal. Congres avem peste un an și jumătate. Nu acum.',
                date: '2026-02-01',
                sourceUrl: 'https://www.digi24.ro',
                articleUrl: 'https://www.digi24.ro/stiri/actualitate/politica/rares-bogdan-despre-un-posibil-vot-de-incredere-cerut-de-ilie-bolojan-in-pnl-nu-poti-sa-ceri-din-luna-n-luna-facem-consiliu-national-3612597',
                topic: 'Politică',
                impact: 'high',
                bias: 'center'
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
        contextNotes: [
            'Fost prezentator de jurnale de știri clasice (Pro TV, Antena 1), s-a reinventat ca un susținător și catalizator al clasei de mijloc pro-europene.',
            'Emisiunea sa de la Digi FM se axează pe dialogul cu ascultătorii, demontarea de teorii ale conspirației (antivaccinism, suveranism exacerbat) prin apel la știință și spirit civic.',
            'Organizează tururi cicliste cu publicul și promovează activ un stil de viață occidental, democratic.'
        ],
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
        contextNotes: [
            'Fost realizator al emisiunii economice Biziday (la TVR, apoi Digi24) și voce importantă la Europa FM. Creatorul uneia dintre cele mai descărcate aplicații de știri din România.',
            'A renunțat temporar la publicistică în 2020 pentru a consilia politic partidele de dreapta (USR / PNL), dar ulterior a revenit la statutul de analist și comentator.',
            'Discursul său îmbină pedagogia economică cu un simț civic pronunțat și cu o abordare critică, bazată frecvent pe predicții de criză.'
        ],
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
        contextNotes: [
            'Creator de conținut și antreprenor, reprezentant influent pentru publicul "Gen Z".',
            'Are un număr imens de urmăritori pe YouTube (peste 3 milioane) și un istoric de ieșiri publice bine documentate în care a criticat sever anacronismele și deficiențele sistemului de învățământ din România.',
            'Deși nu are orientare partinică, impactul său social în rândul tinerilor îl face o voce urmărită chiar și de politicieni.'
        ],
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
    },
    {
        id: 'anca-alexandrescu',
        slug: 'anca-alexandrescu',
        name: 'Anca Alexandrescu',
        role: 'Realizator TV / Fost Consilier Politic',
        image: '/images/voices/anca-alexandrescu.webp',
        bias: {
            leaning: 'right',
            score: 85,
            description: 'Jurnalistă TV cu un profil puternic suveranist și antieuropean. Fostă consilieră a lui Liviu Dragnea și Viorica Dăncilă, s-a reinventat ca voce critică a "statului paralel". Promovează ideea că România este o colonie și susține necesitatea unei schimbări radicale, fiind una dintre principalele platforme media pentru Călin Georgescu și mișcările de dreapta populistă.'
        },
        description: 'Anca Alexandrescu este realizatoarea emisiunii „Culisele Statului Paralel” la Realitatea Plus. După o carieră lungă în culisele comunicării PSD, a devenit una dintre cele mai influente figuri ale noului val suveranist. În 2025-2026, discursul său s-a radicalizat, atacând sistematic instituțiile europene, NATO și ceea ce numește „dictatura globalistă”. A vehiculat public ideea propriei candidaturi la prezidențiale pentru a reprezenta polul suveranist.',
        socialLinks: {
            facebook: 'https://www.facebook.com/AncaAlexandrescuRealitatea',
        },
        targets: ['Statul Paralel', 'Bruxelles / UE', 'NATO', 'Klaus Iohannis', 'Marcel Ciolacu', 'ONG-urile globaliste'],
        rhetoric: { aggressiveness: 88, irony: 60 },
        contextNotes: [
            'A fost unul dintre cei mai apropiați colaboratori ai lui Liviu Dragnea în perioada de apogeu a acestuia în PSD.',
            'Emisiunea sa este considerată principala tribună de promovare pentru Călin Georgescu în media tradițională.',
            'Promovează frecvent teorii conform cărora România este condusă prin interpuși de către puteri externe.',
            'În decembrie 2024, a anunțat că ar putea candida la prezidențiale ca alternativă suveranistă.'
        ],
        statements: [
            {
                id: 'aa-2026-02-15',
                text: 'Viitorul este suveranismul! Globalismul este mort, nu mai există, s-a terminat cu această dictatură care vrea să ne șteargă identitatea.',
                date: '2026-02-15',
                sourceUrl: 'https://www.realitatea.net',
                topic: 'Suveranism',
                impact: 'high',
                bias: 'right'
            },
            {
                id: 'aa-2026-01-20',
                text: 'Sistemul vrea să-l elimine pe Călin Georgescu pentru că se tem de el. Este sub o presiune inadmisibilă din partea tuturor instituțiilor de forță.',
                date: '2026-01-20',
                sourceUrl: 'https://www.realitatea.net',
                topic: 'Politică',
                impact: 'high',
                bias: 'right'
            },
            {
                id: 'aa-2025-12-10',
                text: 'Liderii de la Bruxelles sunt pur și simplu speriați de valul suveranist care vine peste ei. Nu mai pot controla popoarele cu directive absurde.',
                date: '2025-12-10',
                sourceUrl: 'https://www.realitatea.net',
                topic: 'UE',
                impact: 'medium',
                bias: 'right'
            }
        ]
    },
    {
        id: 'calin-georgescu',
        slug: 'calin-georgescu',
        name: 'Călin Georgescu',
        role: 'Fost Candidat Prezidențial (Independent)',
        image: '/images/voices/calin-georgescu.webp',
        bias: {
            leaning: 'right',
            score: 95,
            description: 'Figură centrală a curentului ultranaționalist și mistic-conservator. Promovează neutralitatea României, ieșirea din structurile euro-atlantice în formatul actual și o întoarcere la valori ancestrale, cu accente legionare și mesianice.'
        },
        description: 'Călin Georgescu a produs cel mai mare șoc electoral post-decembrist în 2024, printr-o campanie digitală de o eficiență fără precedent. Retragerea sa formală din politica de partid în 2025 a marcat tranziția către o postură de „conducător spiritual” al poporului, discursul său devenind un hibrid între ortodoxie arhaică, misticism oriental și o critică feroce la adresa ordinii mondiale. Deși se prezintă ca un „om al tăcerii”, mesajele sale au declanșat crize de securitate națională și anchete penale pentru instigare împotriva ordinii constituționale și promovarea unor figuri istorice condamnate.',
        socialLinks: {
            tiktok: 'https://tiktok.com/@calingc',
            youtube: 'https://youtube.com/calingeorgescu'
        },
        targets: ['Oligarhia Globalistă', 'NATO / UE', 'Klaus Schwab / WEF', 'Organizațiile Internaționale', 'Sistemul Partinic', 'Marile Corporații', 'Digitalizarea / Transumanismul'],
        rhetoric: { aggressiveness: 45, irony: 25 },
        contextNotes: [
            'Victoria sa surprinzătoare a dus la anularea alegerilor prin hotărâre CCR, invocând ingerințe ale unui actor statal străin și manipulare algoritmică.',
            'Amestecă doctrina creștin-ortodoxă cu învățături mistice din curente New Age și filozofi precum Osho sau G.I. Gurdjieff, vizând „trezirea conștiinței”.',
            'A generat un scandal imens prin încercarea de a-i reabilita pe Corneliu Zelea Codreanu și Ion Antonescu, numindu-i „eroi” care au luptat pentru moralitate.',
            'Consideră că pandemia a fost un experiment de control social („Marea Resetare”) menit să instaleze un guvern mondial și o monedă unică.',
            'În 2026, se află sub control judiciar strict, fiind investigat pentru constituirea unei organizații cu caracter fascist și propagandă legionară.',
            'Promovează ideea că resursele naturale ale României (apă, pământ, energie) au frecvențe spirituale vindecătoare și nu pot fi privatizate.',
            'Afirmă că globalismul este o formă de „sclavie digitală” și că transumanismul urmărește distrugerea ființei umane create de Dumnezeu.'
        ],
        statements: [
            {
                id: 'cg-2025-05-15',
                text: 'Mă retrag din circul politic oficial. Partidul meu este poporul român. Sistemul este atât de putred încât nu poate fi reformat, el trebuie lăsat să se prăbușească sub propria greutate a minciunii.',
                date: '2025-05-15',
                sourceUrl: 'https://www.realitatea.net',
                topic: 'Politică',
                impact: 'high',
                bias: 'right'
            },
            {
                id: 'cg-2024-11-20',
                text: 'Hrană, Apă, Energie – acesta este pilonul sfânt. Apa sacră din Carpați este un dar cosmic care ne va vindeca trupul și sufletul. Nu avem nevoie de stăpâni străini pentru a ne administra bogățiile.',
                date: '2024-11-20',
                sourceUrl: 'https://www.bursa.ro',
                topic: 'Suveranitate / Misticism',
                impact: 'high',
                bias: 'right'
            },
            {
                id: 'cg-2022-02-10',
                text: 'Corneliu Zelea Codreanu și Ion Antonescu au fost oameni care au făcut și fapte bune. S-au luptat pentru moralitatea ființei umane într-o epocă a decadenței. Istoria pe care o învățați azi este o mistificare.',
                date: '2022-02-10',
                sourceUrl: 'https://www.digi24.ro',
                topic: 'Istorie',
                impact: 'high',
                bias: 'right'
            },
            {
                id: 'cg-2025-02-28',
                text: 'Vă vorbesc despre Marea Resetare a lui Klaus Schwab. Este un eșec al oligarhiei globaliste care se teme. Ei vă vor sclavi digitali, fără proprietate, fără suflet. Dar poporul s-a trezit la viață.',
                date: '2025-02-28',
                sourceUrl: 'https://www.youtube.com/calingeorgescu',
                topic: 'Geo-Politică',
                impact: 'high',
                bias: 'right'
            },
            {
                id: 'cg-2026-03-01',
                text: 'Benzina va fi 15 lei și veți fi fericiți, vă spun ei. Totul este o economie de cazino, o iluzie creată să vă fure munca. România mai are doar o șansă: întoarcerea la tăcere și la Dumnezeu.',
                date: '2026-03-01',
                sourceUrl: 'https://www.ziarulprofit.ro',
                topic: 'Economie / Social',
                impact: 'high',
                bias: 'right'
            }
        ]
    },
    {
        id: 'radu-banciu',
        slug: 'radu-banciu',
        name: 'Radu Banciu',
        role: 'Jurnalist / Realizator TV',
        image: '/images/voices/radu-banciu.jpg',
        bias: {
            leaning: 'center',
            score: 0,
            description: 'Radu Banciu practică un cinism jurnalistic agresiv care vizează mediocritatea și incompetența trans-partinică. Nu se aliniază ideologic, atacând cu aceeași virulență suveraniștii, progresiștii și partidele tradiționale. Discursul său este unul de revoltă culturală și socială mai degrabă decât una politică propriu-zisă.'
        },
        description: 'Cu o carieră începută în presa sportivă și consacrată în emisiuni de tip pamflet (Lumea lui Banciu), Radu Banciu este una dintre cele mai controversate voci media. Din 2024, prin proiectele „Prea Mult Banciu” și „iAM Banciu”, a continuat să critice derapajele societății românești pe care o descrie frecvent ca fiind în declin moral și intelectual. Stilul său este caracterizat de monologuri lungi, referințe culturale franceze și un dispreț afișat față de clasa politică.',
        socialLinks: {
            youtube: 'https://www.youtube.com/@iAMnewsro',
            website: 'https://iamnews.ro'
        },
        targets: ['PSD', 'PNL', 'AUR', 'George Simion', 'Marcel Ciolacu', 'Nicușor Dan', 'Călin Georgescu', 'Mocofanii', 'Fătălăii'],
        rhetoric: { aggressiveness: 96, irony: 99 },
        contextNotes: [
            'A lucrat timp de 9 ani la B1 TV, unde emisiunea sa a fost un fenomen de audiență și controversă.',
            'Este renumit pentru atacurile la adresa sportivilor români pe care îi consideră supraevaluați.',
            'Se consideră un „franțuzit” exilat într-o societate balcanică pe care o analizează cu detașare rece.',
            'În 2025-2026 s-a mutat pe platforme digitale unde are libertate totală de exprimare, fără restricțiile CNA.'
        ],
        statements: [
            {
                id: 'rb-2026-02-26',
                text: 'Politica românească este pur și simplu revanșa oamenilor fără carte. Nu e vorba de ideologie aici, ci de dorința mediocrității de a se răzbuna pe cei care chiar au citit ceva în viața asta.',
                date: '2026-02-26',
                sourceUrl: 'https://iamnews.ro',
                topic: 'Politică',
                impact: 'high',
                bias: 'center'
            },
            {
                id: 'rb-2026-02-13',
                text: 'Întâi vom ajunge pe Marte și abia apoi vom afla din ce trăiau cu adevărat politicienii noștri. Până atunci, stăm și ascultăm gogomăniile lor de dimineața până seara.',
                date: '2026-02-13',
                sourceUrl: 'https://iamnews.ro',
                topic: 'Politică',
                impact: 'medium',
                bias: 'center'
            },
            {
                id: 'rb-2025-12-19',
                text: '2025 a fost un an grețos, exact cum mă așteptam. O revărsare de mizerie, incompetență și promisiuni deșarte pentru mulțimea de mocofani care stă cu gura căscată.',
                date: '2025-12-19',
                sourceUrl: 'https://iamnews.ro',
                topic: 'Social',
                impact: 'high',
                bias: 'center'
            },
            {
                id: 'rb-2025-12-15',
                text: 'Măresc impozitele pe case din 2026 și mocofanul de român stă tot în casă. N-a ieșit niciodată în stradă pentru ce contează cu adevărat, doar pentru fofârlicile lor politice.',
                date: '2025-12-15',
                sourceUrl: 'https://iamsport.ro',
                topic: 'Economie',
                impact: 'medium',
                bias: 'center'
            },
            {
                id: 'rb-2025-12-03',
                text: 'L-ați văzut pe Georgescu? Discursul lui e de ultimul om. O adunătură de misticism de doi bani pentru niște oameni care n-au deschis o carte de istorie în viața lor.',
                date: '2025-12-03',
                sourceUrl: 'https://iamnews.ro',
                topic: 'Social',
                impact: 'medium',
                bias: 'center'
            }
        ]
    }
];
