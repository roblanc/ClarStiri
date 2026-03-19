/**
 * PROFILURI SURSE DE ȘTIRI ROMÂNEȘTI
 * ====================================
 * Fiecare sursă are documentație detaliată: fondatori, proprietari, conexiuni politice,
 * interese financiare, linie editorială și RAȚIONAMENTUL din spate pentru scorul de bias.
 *
 * Scor bias: -100 (extremă stânga) → 0 (centru) → +100 (extremă dreapta)
 * Categorii derivate din scor:
 *   left:         ≤ -55
 *   center-left:  -54 → -20
 *   center:       -19 → +19
 *   center-right: +20 → +54
 *   right:        ≥ +55
 *
 * NOTĂ PENTRU CODEX / CONTINUARE:
 * ---------------------------------
 * TODO: Integrează profilurile în UI - componenta SourceProfileCard.tsx (de creat)
 * TODO: Când se adaugă o sursă nouă în api/shared.ts, adaugă și profilul corespunzător
 *       aici folosind template-ul NEW_SOURCE_TEMPLATE de la sfârșitul fișierului.
 * TODO: Actualizează scorurile numerice din api/shared.ts pentru a reflecta biasScore-ul
 *       din profiluri (în prezent shared.ts folosește doar categorii, nu scoruri numerice).
 *TODO: Creează o pagină /surse sau un modal care să afișeze profilul detaliat al fiecărei surse.
 */

export interface SourceProfile {
  id: string;

  // --- Identitate & Istoric ---
  foundedYear?: number;
  founders?: string[];
  currentOwner?: string;
  parentCompany?: string;
  /** Descriere narativă a istoricului proprietății */
  ownershipHistory?: string;

  // --- Context Politic & Financiar ---
  /** Conexiuni cunoscute cu actori politici sau instituții */
  politicalConnections?: string[];
  /** Interese financiare/de business care pot influența editorial */
  knownFinancialInterests?: string[];
  /** Sursele de finanțare ale publicației */
  fundingSources?: string[];

  // --- Analiză Editorială ---
  /** Descriere generală a liniei editoriale */
  editorialLine: string;
  /** RAȚIONAMENTUL principal pentru scorul de bias atribuit */
  biasRationale: string;
  /** Tipare editoriale observabile în acoperirea știrilor */
  notablePatterns?: string[];
  /** Controverse documentate */
  controversies?: string[];
  /** Puncte forte ale publicației */
  strengths?: string[];

  // --- Scor & Metadate ---
  /**
   * Scor numeric de bias: -100 (extremă stânga) → 0 (centru) → +100 (extremă dreapta)
   * Acesta este scorul nuanțat; categoria (left/center-left/etc.) se derivă automat.
   */
  biasScore: number;
  /** Raționament pentru scorul de factualitate */
  factualityRationale?: string;
  /** Cât de siguri suntem de această analiză */
  confidence: 'high' | 'medium' | 'low';
  /** Data ultimei analize/actualizări a profilului */
  lastAnalysed: string;

  // --- Referinte ---
  /** Surse externe folosite pentru analiza acestui profil */
  references?: Array<{ label: string; url: string }>;
}

// ============================================================
//  PROFILURI COMPLETE PENTRU TOATE SURSELE DIN api/shared.ts
// ============================================================

export const SOURCE_PROFILES: Record<string, SourceProfile> = {

  // ===================== CENTRU / AGENȚII =====================

  agerpres: {
    id: 'agerpres',
    foundedYear: 1949,
    founders: ['Statul Român'],
    currentOwner: 'Statul Român',
    parentCompany: 'Agenția Națională de Presă Agerpres',
    ownershipHistory:
      'Fondată în 1949 ca agenție națională de presă. Funcționează în baza Legii nr. 19/2003. Finanțată integral de la bugetul de stat.',
    politicalConnections: [
      'Finanțare bugetară → vulnerabilitate indirectă față de guvernul în funcție',
      'Conducere numită politic',
    ],
    fundingSources: ['Buget de stat', 'Vânzare flux de știri (B2B)'],
    editorialLine:
      'Agenție de presă cu rol de serviciu public. Știri factuale în format telegrafic, fără linie editorială explicită. Acoperire națională și internațională cuprinzătoare.',
    biasRationale:
      'Ca agenție de stat, Agerpres menține o relativă neutralitate editorială — nu are proprietari privați cu interese politice directe. Riscul principal este influența indirectă a guvernului prin finanțare și numiri în conducere, dar în practică conținutul este predominant factual și echilibrat. Ușoară tendință pro-instituțională derivată din natura sa de stat.',
    notablePatterns: [
      'Știri în format telegrafic, fără editorial',
      'Acoperire prioritară a instituțiilor statului',
      'Sursă primară citată de alte publicații',
    ],
    strengths: ['Factualitate ridicată', 'Acoperire comprehensivă', 'Credibilitate instituțională'],
    biasScore: 5,
    factualityRationale: 'Agenție cu standarde jurnalistice ridicate și verificare riguroasă a faptelor.',
    confidence: 'high',
    lastAnalysed: '2026-02-26',
  },

  mediafax: {
    id: 'mediafax',
    foundedYear: 1991,
    currentOwner: 'Mediafax Group',
    ownershipHistory:
      'Una dintre primele agenții de presă private din România post-comunistă, fondată în 1991. A trecut prin mai mulți acționari.',
    fundingSources: ['Abonamente B2B', 'Publicitate'],
    editorialLine:
      'Agenție de presă privată cu focus pe știri economice, politice și generale. Format factual orientat spre clienți media și corporate.',
    biasRationale:
      'Agenție privată fără afiliații politice evidente. Modelul de business bazat pe abonamente B2B reduce dependența de publicitate politică. Conținutul este în general factual și echilibrat.',
    strengths: ['Viteza știrilor', 'Acoperire economică', 'Format factual'],
    biasScore: 0,
    factualityRationale: 'Agenție cu standarde profesionale ridicate.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  bursa: {
    id: 'bursa',
    foundedYear: 1990,
    currentOwner: 'Proprietate privată',
    ownershipHistory:
      'Una dintre cele mai vechi publicații economice private din România, fondată imediat după 1989.',
    fundingSources: ['Publicitate', 'Abonamente'],
    editorialLine:
      'Publicație economică axată pe piețe financiare, bursă, economie macro și micro.',
    biasRationale:
      'Publicație pur economică fără bias politic evident. Acoperirea focusată pe economia de piață implică o ușoară tendință pro-piață liberă, dar fără partizanism politic.',
    strengths: ['Specialitate financiară', 'Tradiție îndelungată', 'Date de piață'],
    biasScore: 5,
    factualityRationale: 'Factualitate ridicată în domeniul financiar.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  biziday: {
    id: 'biziday',
    foundedYear: 2015,
    founders: ['Mihai Precup', 'Alexandru Negrea'],
    currentOwner: 'Echipa fondatoare (independent)',
    ownershipHistory:
      'Lansat în 2015 ca newsletter de curatorie a știrilor economice. Crescut organic prin calitatea selecției editoriale.',
    fundingSources: ['Abonamente premium', 'Publicitate selectivă'],
    editorialLine:
      'Newsletter/site de curatorie zilnică a știrilor economice și generale. Fără opinie politică explicită — selecție editorială de calitate.',
    biasRationale:
      'Biziday funcționează ca un curator editorial, nu ca o redacție tradițională. Modelul de abonamente asigură independența față de presiunile publicității politice. Selecția poate reflecta o ușoară tendință pro-business, dar fără partizanism.',
    strengths: ['Independență editorială', 'Model sustenabil prin abonamente', 'Curatorie de calitate'],
    biasScore: 0,
    factualityRationale: 'Factualitate bună prin curatoria surselor diverse.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  // ===================== TV & RADIO MAINSTREAM =====================

  protv: {
    id: 'protv',
    foundedYear: 1995,
    founders: ['Adrian Sârbu', 'Mark Grabowski', 'CME (Central European Media Enterprises)'],
    currentOwner: 'PPF Group (Republica Cehă)',
    parentCompany: 'PPF Media / CME',
    ownershipHistory:
      'Fondat în 1995 ca parte a CME (Central European Media Enterprises). Cel mai urmărit post TV din România. PPF Group, fondat de miliardarul ceh Petr Kellner (decedat 2021), a achiziționat CME în 2020.',
    politicalConnections: [
      'PPF Group — grup ceh, fără afiliații politice românești directe',
    ],
    fundingSources: ['Publicitate', 'Abonamente cablu/satelit'],
    editorialLine:
      'Televiziune comercială mainstream. Jurnalism profesionist, standarde ridicate de producție. Acoperire echilibrată, orientată spre audiență largă.',
    biasRationale:
      'ProTV beneficiază de proprietar străin (PPF Group ceh), ceea ce reduce semnificativ riscul de influență politică locală. Prezintă jurnalism relativ echilibrat, orientat spre profesionalism și rating. Nu există afilieri politice românești evidente. Ușoară tendință centrist-progresistă specifică televiziunilor comerciale cu audiență largă.',
    notablePatterns: [
      'Format occidental de știri',
      'Producție de înaltă calitate',
      'Echilibru în acoperirea politicii',
    ],
    strengths: ['Profesionalism', 'Resurse de producție', 'Credibilitate publică'],
    biasScore: -10,
    factualityRationale: 'Standarde jurnalistice profesioniste. Factualitate ridicată.',
    confidence: 'high',
    lastAnalysed: '2026-02-26',
  },

  tvr: {
    id: 'tvr',
    foundedYear: 1956,
    founders: ['Statul Român'],
    currentOwner: 'Societatea Română de Televiziune (SRTV)',
    ownershipHistory:
      'Televiziune publică înființată în 1956. Funcționează în baza Legii SRTV. Finanțată din taxa audiovizuală și buget de stat.',
    politicalConnections: [
      'Consiliu de Administrație numit de Parlament → expusă presiunilor majorității parlamentare',
      'Finanțare parțial bugetară',
    ],
    fundingSources: ['Taxa audiovizuală', 'Buget de stat', 'Publicitate (limitată)'],
    editorialLine:
      'Televiziune publică cu misiune de serviciu public. Teoretic neutră și echilibrată, cu mandat de informare obiectivă.',
    biasRationale:
      'TVR este formal neutră, dar cronic vulnerabilă la influența politică prin modul de numire a conducerii (Parlament). De-a lungul timpului linia editorială a reflectat culoarea politică a majorității parlamentare. Riscul de bias depinde de perioadă și de conducerea în funcție.',
    controversies: [
      'Numiri politizate ale conducerii în diverse perioade',
      'Acuzații de partinitate în funcție de guvernul în funcție',
      'Subfinanțare cronică',
    ],
    notablePatterns: [
      'Acoperire extinsă de protocol a evenimentelor oficiale',
      'Spațiu redus pentru investigații',
    ],
    biasScore: 5,
    factualityRationale: 'Factualitate relativ bună, constrânsă uneori de influența politică.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  europafm: {
    id: 'europafm',
    foundedYear: 1990,
    currentOwner: 'Czech Media Invest (controlat de Daniel Křetínský)',
    parentCompany: 'Czech Media Invest (CMI)',
    ownershipHistory:
      'Post de radio comercial cu acoperire națională. A fost deținut de grupul francez Lagardère Active. În 2018, operațiunile radio din România (Europa FM, Virgin Radio, Vibe FM) au fost vândute către Czech Media Invest (CMI), unul dintre cei mai mari operatori media din Cehia, controlat de omul de afaceri Daniel Křetínský.',
    politicalConnections: [
      'Daniel Křetínský — grup media ceh, fără afilieri politice românești directe',
      'Structura de proprietate documentată în presa economică și media de specialitate',
    ],
    fundingSources: ['Publicitate', 'Sponsorizări'],
    editorialLine:
      'Post de radio comercial cu muzică, știri și talk-show-uri politice. Emisiuni precum „România în direct" și „Piața Victoriei" pun accent pe dezbatere și opinii ale moderatorilor și invitaților. Prezentatori cu opinii puternice, mai ales în segmentele de dezbatere.',
    biasRationale:
      'În analiza noastră, Europa FM tinde spre o orientare centru-dreapta, vizibilă în modul în care sunt abordate temele politice în talk-show-uri: pro-economie de piață, pro-UE, accent pe responsabilitate individuală și critică la adresa politicilor etatiste sau populiste. Conținutul de știri este, în general, mai echilibrat decât segmentele de opinie. Această încadrare este o estimare editorială proprie și nu reflectă o declarație oficială a postului. Nu există o clasificare MBFC sau similară disponibilă.',
    notablePatterns: [
      'Emisiuni de dezbatere cu opinii puternice ale moderatorilor',
      'Combinație de muzică, infotainment și știri',
      'Cel mai ascultat radio privat din România',
    ],
    strengths: ['Audiență mare', 'Jurnaliști profesioniști', 'Proprietar internațional fără influență politică locală'],
    biasScore: 20,
    factualityRationale: 'Factualitate relativ ridicată pentru conținutul de știri. Nu sunt cazuri notorii de fake news. Segmentele de opinie conțin interpretări subiective — normal pentru formatul talk-show.',
    confidence: 'medium',
    lastAnalysed: '2026-02-27',
    references: [
      { label: 'Europa FM – Site oficial / Grila de programe', url: 'https://www.europafm.ro/live/' },
      { label: 'Europa FM – Emisiunea „România în direct"', url: 'https://www.europafm.ro/category/programe/romania-in-direct/' },
      { label: 'Ziarul Financiar – Vânzarea Europa FM către Czech Media Invest', url: 'https://www.zf.ro/eveniment/postul-de-radio-europa-fm-va-avea-un-nou-proprietar-gigantul-media-francez-lagardere-vinde-radio-urile-detinute-in-europa-de-est-inclusiv-din-romania-catre-czech-media-invest-17133379' },
      { label: 'Czech Media Invest – Comunicat oficial achiziție Lagardère', url: 'https://www.czechmediainvest.cz/en/press-releases/cmi-has-completed-the-acquisition-of-lagardere-radios/' },
      { label: 'G4Media – Profil investitori CMI / Daniel Křetínský', url: 'https://www.g4media.ro/cine-sunt-investitorii-care-cumpara-posturile-europa-fm-virgin-radio-si-vibe-fm.html' },
      { label: 'Pagina de Media – Acționari posturi radio România', url: 'https://www.paginademedia.ro/stiri-media/actionari-posturi-radio-romania-20895178' },
      { label: 'Wikipedia – Europa FM (Romania)', url: 'https://en.wikipedia.org/wiki/Europa_FM_(Romania)' },
    ],
  },

  // ===================== CENTRU-STÂNGA =====================

  digi24: {
    id: 'digi24',
    foundedYear: 2012,
    founders: ['RCS&RDS (acum Digi Communications N.V.)'],
    currentOwner: 'Zoltán Teszári (indirect, prin grupul Digi Communications N.V. / Campus Media TV SRL)',
    parentCompany: 'Digi Communications N.V. / Campus Media TV SRL',
    ownershipHistory:
      'Lansat la 1 martie 2012 ca parte a grupului RCS&RDS, principal operator de telecomunicații din România, controlat de Zoltán Teszári. În 2019, proprietatea Digi24 a fost transferată către Campus Media TV SRL, pentru a permite distribuția și la alți operatori, nu doar în rețeaua Digi. Controlul rămâne legat de grupul Digi și de Teszári.',
    politicalConnections: [
      'Zoltán Teszári — nu are afiliere publică declarată la un partid politic, dar interesele sale de business în telecom intersectează agenda politică (reglementare ANCOM, legislație telecom)',
      'Ca televiziune comercială, Digi24 a vândut spații de publicitate și către partide politice, similar altor televiziuni de știri',
      'Amendamente PSD din 2022 au vizat forțarea separării Digi24 de RCS&RDS',
    ],
    fundingSources: ['Publicitate (inclusiv publicitate politică de campanie)', 'Distribuție în pachetele Digi', 'Proiecte speciale'],
    editorialLine:
      'Canal de știri TV 24/7, cu acoperire națională și focus pe actualitate politică, economică și internațională. Include jurnale de știri, talk-show-uri, analize și investigații, cu un profil pro-european și pro-reformă.',
    biasRationale:
      'Digi24 este adesea perceput ca unul dintre posturile relativ mai echilibrate din peisajul TV românesc, iar evaluări externe (MediaBiasFactCheck) îl notează ca „least biased" cu factualitate ridicată. Bias-ul estimat centru / ușor centru-stânga vine din accentul pus pe subiecte pro-UE, pro-anticorupție și critice față de extremism și populism, fără o aliniere clară și constantă cu un anumit partid. Există însă perioade în care unele voci din spațiul public au acuzat postul de apropiere de pozițiile partidelor de guvernare, ceea ce justifică o „încredere medie", nu maximă. Această încadrare este o estimare editorială proprie.',
    notablePatterns: [
      'Acoperire extinsă a UE și politicii externe, inclusiv dezbateri pe teme europene',
      'Dezbateri cu invitați din mai multe zone politice, cu moderare percepută ca mai critică față de extremism',
      'Investigații și analize, deși nu la nivelul outlet-urilor strict investigative',
    ],
    controversies: [
      'Amendamente PSD (2022) vizând forțarea vânzării Digi24 de către RCS&RDS',
      'Acuzații periodice de apropiere de pozițiile guvernării în funcție',
      'Interesele Digi în telecom pot influența acoperirea subiectelor legate de reglementare',
    ],
    strengths: [
      'Profesionalism editorial și producție TV bine standardizată',
      'Acoperire cuprinzătoare a politicii interne și externe, inclusiv live-uri extinse',
      'Percepție relativ mai bună de echilibru comparativ cu alte posturi de știri românești',
    ],
    biasScore: -25,
    factualityRationale: 'Factualitate ridicată: acoperire live extinsă, utilizează agenții de presă și corespondenți, nu este cunoscut pentru dezinformare sistematică. Evaluări independente (MBFC, Reuters Institute) îl menționează ca brand relativ de încredere.',
    confidence: 'medium',
    lastAnalysed: '2026-02-27',
    references: [
      { label: 'Wikipedia – Digi24', url: 'https://en.wikipedia.org/wiki/Digi24' },
      { label: 'Eurotopics – Fișă Digi24 (proprietate, Campus Media TV SRL)', url: 'https://www.eurotopics.net/en/163061/digi-24' },
      { label: 'MediaBiasFactCheck – Digi24 (least biased, high factuality)', url: 'https://mediabiasfactcheck.com/digi24-bias/' },
      { label: 'Economedia – PSD vizează ruperea Digi24 de RCS&RDS', url: 'https://economedia.ro/psd-vizeaza-ruperea-digi24-de-rcsrds-un-amendament-depus-de-ministrul-lucian-romascanu-ar-forta-compania-condusa-de-zoltan-teszari-sa-vanda-televiziunea-digi24-cablistii-cu-pozitie-dominanta-pe-pi.html' },
      { label: 'CMPF/EUI – Media Freedom in Romania (context publicitate politică)', url: 'https://cmpf.eui.eu/local-media-for-democracy-research-results/local-media-for-democracy-country-focus-romania/' },
      { label: 'Digi Communications – Despre noi', url: 'https://www.digi-communications.ro/ro/despre-noi' },
    ],
  },

  hotnews: {
    id: 'hotnews',
    foundedYear: 1999,
    currentOwner: 'Ringier Romania',
    parentCompany: 'Ringier AG (Elveția)',
    ownershipHistory:
      'Unul dintre cele mai vechi site-uri de știri online din România (1999). Achiziționat de grupul elvețian Ringier, unul dintre cele mai mari grupuri media europene.',
    politicalConnections: [
      'Ringier AG — grup media internațional elvețian, fără afilieri politice românești directe',
    ],
    fundingSources: ['Publicitate', 'Conținut sponsorizat', 'Abonamente'],
    editorialLine:
      'Site de știri online de referință. Acoperire serioasă a politicii, economiei și societății. Tendință pro-europeană și pro-reformă.',
    biasRationale:
      'HotNews beneficiază de independența față de politica românească prin proprietarul elvețian Ringier. Reputație de seriozitate și factualitate. Tendința centru-stânga se manifestă mai ales prin alegerea subiectelor (anti-corupție, pro-UE, critici ale populismului) decât prin bias explicit în știri.',
    strengths: ['Experiență îndelungată', 'Jurnaliști de calitate', 'Acoperire comprehensivă'],
    biasScore: -25,
    factualityRationale: 'Factualitate bună. Standarde profesioniste.',
    confidence: 'high',
    lastAnalysed: '2026-02-26',
  },

  recorder: {
    id: 'recorder',
    foundedYear: 2017,
    founders: ['Cristian Delcea', 'Mihai Voinea', 'Răzvan Ionescu', 'Iulian Andrei Crăciun'],
    currentOwner: 'Asociația Recorder Community (ONG de presă independentă)',
    ownershipHistory:
      'Fondat în 2017 de jurnaliștii Cristian Delcea, Mihai Voinea, Răzvan Ionescu și Iulian Andrei Crăciun. Proiectul a funcționat inițial prin firma Harfa Online Publishing SRL, unde aproape jumătate din acțiuni erau deținute de Dragoș Vîlcu Management SRL (Dragoș Vîlcu + tatăl său), restul de jurnaliștii fondatori. Modelul actual de funcționare este centrat pe Asociația Recorder Community, ONG care derulează activitatea editorială și colectează donațiile.',
    politicalConnections: ['Fără afiliații politice directe cunoscute'],
    fundingSources: [
      'Donații și contribuții recurente de la public (~90% din venituri)',
      'Granturi pentru jurnalism de investigație (naționale și internaționale)',
      'Advertising limitat (online), fără publicitate politică',
    ],
    editorialLine:
      'Proiect de jurnalism de investigație și documentar independent, cu focus pe subiecte de interes public: corupție, administrație, justiție, sănătate, educație, infrastructură. Conținutul principal este video (documentare, reportaje), completat de texte explicative și materiale de context.',
    biasRationale:
      'Recorder își asumă explicit valori precum lupta împotriva corupției, transparență instituțională și responsabilizarea puterii politice, în linie cu standardele jurnalismului de interes public. În contextul românesc, accentul pus pe instituții puternice, servicii publice funcționale și protecția cetățeanului poate fi perceput ca ușor centru-stânga, dar nu există un bias partizan clar în favoarea unui partid sau actor politic anume.',
    notablePatterns: [
      'Investigații profunde, bazate pe documente și surse primare',
      'Documentare video de impact social, cu audiențe mari și efecte în agenda publică',
      'Acoperire de durată a unor dosare și teme sistemice (infrastructură, justiție, administrație)',
    ],
    strengths: [
      'Independență editorială susținută de un model de finanțare centrat pe donații',
      'Calitate investigativă ridicată și capacitate de a produce documentare complexe',
      'Transparență financiară, cu rapoarte anuale detaliate puse la dispoziția publicului',
    ],
    biasScore: -35,
    factualityRationale: 'Factualitate foarte ridicată, bazată pe documentare riguroasă: utilizarea surselor primare (documente, baze de date, interviuri), verificarea afirmațiilor și prezentarea dovezilor în materiale video și texte. Recorder publică periodic rapoarte către cititori despre activitatea sa.',
    confidence: 'high',
    lastAnalysed: '2026-02-27',
    references: [
      { label: 'Recorder – Raport anual „Opt ani de Recorder" (finanțare, structură)', url: 'https://recorder.ro/opt-ani-de-recorder-raport-in-fata-cititorilor/' },
      { label: 'Recorder – Raport anual „7 ani de Recorder"', url: 'https://recorder.ro/7-ani-de-recorder-raport-in-fata-cititorilor/' },
      { label: 'Recorder – Pagina de susținere / donații', url: 'https://recorder.ro/sustine/' },
      { label: 'GIJN – Profil Recorder (model de jurnalism independent)', url: 'https://gijn.org/resource/recorder-romania/' },
      { label: 'IPI – Studiu de caz Recorder (finanțare din donații)', url: 'https://ipi.media/recorder-romania/' },
      { label: 'HotNews – Despre finanțarea și impactul Recorder', url: 'https://hotnews.ro/recorder-finantare-donatii-model-jurnalism' },
    ],
  },

  libertatea: {
    id: 'libertatea',
    foundedYear: 1989,
    currentOwner: 'Ringier Romania',
    parentCompany: 'Ringier AG (Elveția)',
    ownershipHistory:
      'Fondat în 1989, imediat după Revoluție. Unul dintre primele ziare libere din România. Achiziționat ulterior de Ringier.',
    politicalConnections: ['Ringier AG — grup media elvețian fără afilieri politice românești'],
    fundingSources: ['Publicitate', 'Conținut sponsorizat', 'Abonamente'],
    editorialLine:
      'Tabloid serios. Amestec de știri de interes general, subiecte sociale și anchete. Ton accesibil publicului larg.',
    biasRationale:
      'Libertatea combină formatul tabloid cu jurnalism serios. Proprietarul elvețian asigură independența față de politica locală. Tendința centru-stânga se manifestă prin subiectele sociale abordate (drepturi, egalitate, anti-discriminare) mai degrabă decât prin partizanism explicit.',
    biasScore: -20,
    factualityRationale: 'Factualitate mixtă — solidă pentru știri serioase, variabilă pentru conținut tabloid.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  adevarul: {
    id: 'adevarul',
    foundedYear: 1871,
    currentOwner: 'Adevărul Holding',
    ownershipHistory:
      'Unul dintre cele mai vechi ziare din România (rădăcini în 1871). Ziarul modern a reapărut în 1989. A trecut prin mai mulți proprietari, inclusiv perioade cu controverse privind conexiunile politice. Actualul proprietar este Adevărul Holding.',
    politicalConnections: [
      'Istoricul unor controverse privind conexiunile politice ale proprietarilor în diverse perioade',
    ],
    fundingSources: ['Publicitate', 'Distribuție', 'Abonamente online'],
    editorialLine:
      'Ziar național de referință. Acoperire largă de știri politice, sociale, economice. Tendință centru-stânga moderată.',
    biasRationale:
      'Adevărul are o istorie complexă de proprietate care a influențat linia editorială de-a lungul timpului. Formatul online actual acoperă un spectru larg de subiecte. Tendința centru-stânga se manifestă prin teme preferate (anti-corupție, pro-UE, critici ale naționalismului). Credibilitatea a variat în funcție de perioadă.',
    controversies: [
      'Controverse istorice privind conexiunile politice ale proprietarilor',
    ],
    biasScore: -20,
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  newsweek: {
    id: 'newsweek',
    currentOwner: 'Editor local (licență Newsweek International)',
    ownershipHistory:
      'Ediție românească a publicației internaționale Newsweek, operată sub licență de un editor local.',
    fundingSources: ['Publicitate', 'Abonamente'],
    editorialLine:
      'Amestec de știri internaționale traduse și conținut local. Ton analitic.',
    biasRationale:
      'Brand-ul Newsweek internațional are o orientare centru-stânga/liberală. Ediția românească urmărește această tendință, cu acoperire pro-europeană și focus pe societate civilă.',
    biasScore: -25,
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  snoop: {
    id: 'snoop',
    currentOwner: 'Independent',
    fundingSources: ['Publicitate', 'Conținut sponsorizat'],
    editorialLine:
      'Publicație de investigație și analiză media, politică, societate.',
    biasRationale:
      'Publicație independentă cu orientare centru-stânga prin valorile promovate (transparență, anti-corupție, pro-UE). Fără conexiuni politice directe cunoscute.',
    biasScore: -25,
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  spotmedia: {
    id: 'spotmedia',
    foundedYear: 2020,
    currentOwner: 'Independent',
    fundingSources: ['Publicitate', 'Abonamente'],
    editorialLine:
      'Site de știri independent cu acoperire politică și socială. Focus pe jurnalism de calitate.',
    biasRationale:
      'Publicație independentă relativ nouă, fără conexiuni politice directe documentate. Tendință centru-stânga prin alegerea subiectelor și cadrul analitic.',
    biasScore: -20,
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  paginademedia: {
    id: 'paginademedia',
    currentOwner: 'Independent',
    editorialLine:
      'Publicație specializată în monitorizarea presei românești. Audiențe, proprietate media, analiză industrie.',
    biasRationale:
      'Pagina de Media funcționează ca watchdog al industriei media. Tendința centru-stânga se manifestă prin critica față de publicațiile partizane de dreapta și promovarea independenței editoriale. Este una dintre puținele publicații care monitorizează sistematic proprietatea media.',
    strengths: [
      'Monitorizare sistematică a industriei media',
      'Transparență privind proprietatea publicațiilor',
      'Sursă valoroasă pentru analiza media',
    ],
    biasScore: -25,
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  vice: {
    id: 'vice',
    foundedYear: 2010,
    founders: ['Vice Media Group (brand global fondat în 1994 de Shane Smith, Suroosh Alvi și Gavin McInnes)'],
    currentOwner: 'Vice Media Group (preluat de consorțiu de creditori: Fortress Investment Group, Soros Fund Management etc.) — redacția română închisă în decembrie 2023',
    parentCompany: 'Vice Media Group (în reorganizare post-faliment)',
    ownershipHistory:
      'Vice România a funcționat din 2010 ca ediție locală a Vice Media Group, parte a rețelei internaționale Vice. La nivel global, brandul a fost fondat în 1994 la Montreal de Shane Smith, Suroosh Alvi și Gavin McInnes. Vice Media Group a inițiat procedura de faliment (Chapter 11) în SUA în 2023 și a fost preluat de un consorțiu de creditori. Redacția română și-a închis activitatea în decembrie 2023, pe fondul problemelor financiare ale grupului-mamă.',
    fundingSources: ['Publicitate', 'Conținut de brand (native advertising)', 'Campanii integrate pentru branduri'],
    editorialLine:
      'Ediție românească a brand-ului global Vice, orientată spre public tânăr, cu conținut despre cultură, lifestyle, sexualitate, societate și investigații sociale. Abordare neconvențională, limbaj direct, accent pe teme controversate și pe subiecte marginalizate. Redacția română a fost activă între 2010 și 2023.',
    biasRationale:
      'Vice, la nivel global, promovează constant teme progresiste: drepturi LGBTQ+, drepturile minorităților, critici la adresa autoritarismului, conservatorismului social și abuzurilor de putere. Ediția românească a urmat aceeași linie, atât prin selecția subiectelor, cât și prin tonul editorial, ceea ce justifică încadrarea în zona centru-stânga / progresistă, fără a fi explicit partizană în favoarea unui partid politic românesc.',
    notablePatterns: [
      'Conținut orientat spre Gen Z și public tânăr',
      'Teme progresiste: LGBTQ+, minorități, critici sociale',
      'Stil narativ și subiectiv, diferit de jurnalismul tradițional',
    ],
    controversies: [
      'Falimentul Vice Media Group (Chapter 11, 2023)',
      'Închiderea redacției române în decembrie 2023',
      'Dependență de finanțare externă și datorii mari la nivel global',
    ],
    strengths: ['Acces la public tânăr', 'Subiecte și perspective marginalizate', 'Investigații sociale neconvenționale'],
    biasScore: -35,
    factualityRationale: 'Factualitate medie: Vice combină reportaje solide și materiale de investigație cu texte subiective, narative sau foarte personale, ceea ce duce la o factualitate inegală între materiale. Redacția românească a produs și materiale bine documentate despre teme sociale sensibile.',
    confidence: 'medium',
    lastAnalysed: '2026-02-27',
    references: [
      { label: 'Vice România – „Ce a însemnat Vice România pentru noi" (bilanț)', url: 'https://www.vice.com/ro/article/ce-a-insemnat-vice-romania-pentru-noi/' },
      { label: 'Wikipedia – Vice (revistă)', url: 'https://ro.wikipedia.org/wiki/Vice_(revist%C4%83)' },
      { label: 'HotNews – Vice România se închide', url: 'https://hotnews.ro/vice-romnia-a-anuntat-ca-se-va-nchide-dupa-o-prezenta-de-peste-un-deceniu-pe-piata-25265' },
      { label: 'Știrile ProTV – Vice Media depune cerere de faliment', url: 'https://stirileprotv.ro/stiri/financiar/compania-care-detine-brandul-americano-canadian-vice-a-depus-cerere-pentru-intrarea-in-faliment.html' },
      { label: 'G4Media – Vice România s-a închis', url: 'https://www.g4media.ro/publicatia-vice-romania-s-a-inchis-zece-angajati-au-fost-concediati-compania-mama-are-probleme-la-nivel-global-dupa-ce-a-primit-bani-din-arabia-saudita.html' },
    ],
  },

  scena9: {
    id: 'scena9',
    currentOwner: 'Fundația9 (fondată de BRD – Groupe Société Générale)',
    parentCompany: 'Fundația9 / BRD – Groupe Société Générale',
    ownershipHistory:
      'Scena9 este un program coordonat de Fundația9, fondată de BRD – Groupe Société Générale. Funcționează ca revistă culturală și de analiză socială, cu sprijin instituțional din partea BRD prin programe culturale (inclusiv Rezidența BRD Scena9).',
    fundingSources: ['BRD – Groupe Société Générale (partener fondator)', 'Granturi culturale', 'Donații'],
    editorialLine:
      'Revistă culturală și de analiză socială. Conținut literar, artistic, investigații sociale profunde. Teme recurente: artă, feminism, drepturi civile, societate, cultură urbană.',
    biasRationale:
      'Scena9 are o orientare progresistă clară, reflectată în temele abordate (artă, feminism, drepturi civile, societate). Nu este partizană politic, dar valorile promovate sunt sistematic centru-stânga. Sprijinul instituțional din partea BRD (bancă comercială) nu influențează vizibil linia editorială.',
    notablePatterns: [
      'Conținut cultural și analitic de înaltă calitate',
      'Teme progresiste: feminism, drepturi civile, critică socială',
      'Format de revistă, nu flux de știri la zi',
    ],
    strengths: ['Calitate editorială ridicată', 'Analize profunde', 'Conținut cultural valoros'],
    biasScore: -40,
    factualityRationale: 'Factualitate bună pentru conținut analitic și cultural.',
    confidence: 'medium',
    lastAnalysed: '2026-02-27',
    references: [
      { label: 'Scena9 – Pagina „Despre noi"', url: 'https://www.scena9.ro/despre' },
      { label: 'Eurozine – Profil Scena9', url: 'https://www.eurozine.com/partner-journals/scena9/' },
      { label: 'Journalismfund Europe – Profil Scena9', url: 'https://www.journalismfund.eu/organisation/scena9' },
      { label: 'Project Oasis – Profil Scena9', url: 'https://www.projectoasis.media/publication/scena9/' },
    ],
  },

  // ===================== STÂNGA =====================

  g4media: {
    id: 'g4media',
    foundedYear: 2018,
    founders: ['Dan Tăpălagă', 'Cristian Pantazi'],
    currentOwner: 'Titluri Quality SRL (Radu Budeanu) — din august 2025',
    parentCompany: 'Titluri Quality (include și Mediafax, Gândul, Cancan)',
    ownershipHistory:
      'Fondat pe 18 martie 2018 de jurnaliștii Dan Tăpălagă și Cristian Pantazi, inițial ca organizație non-profit (Asociația Group 4 Media Freedom and Democracy), finanțată prin donații ale cititorilor. În august 2025, grupul G4Media a fost achiziționat integral de compania Titluri Quality, deținută de Radu Budeanu, formând cel mai mare conglomerat de presă digitală din România. Fondatorii au declarat că rămân implicați activ, iar noul proprietar a semnat un acord privind independența editorială.',
    politicalConnections: [
      'Fără afiliere directă la un partid politic',
      'Finanțare din fonduri europene și USAID pentru combaterea dezinformării (~2.8M EUR)',
      'Radu Budeanu (noul proprietar din 2025) — om de afaceri în media digitală',
    ],
    fundingSources: [
      'Publicitate',
      'Abonamente',
      'Donații cititori (perioada non-profit)',
      'Fonduri europene / USAID (proiecte anti-dezinformare)',
    ],
    editorialLine:
      'Jurnalism de investigație cu focus puternic pe anti-corupție, pro-UE, pro-NATO, anti-extremism. Cea mai explicită poziționare pro-europeană și anti-naționalistă din presa românească.',
    biasRationale:
      'G4Media are o orientare editorială clar de stânga în contextul românesc: puternic anti-naționalist, anti-AUR, critic al PSD, pro-USR, pro-UE, pro-NATO. Finanțarea din fonduri europene și proiecte anti-dezinformare consolidează această orientare. Deși jurnalismul în sine este de calitate și factualitate ridicată, framing-ul editorial este explicit partizan în favoarea taberei pro-europene. Aceasta nu este o critică — G4Media este transparent cu privire la valorile sale.',
    notablePatterns: [
      'Acoperire intensă a extremismului de dreapta',
      'Poziționare clară pro-UE/NATO',
      'Critici consistente la adresa PSD și AUR/SOS',
      'Monitorizare dezinformare',
    ],
    controversies: [
      'Finanțare din fonduri europene/USAID — considerată controversată de critica de dreapta',
      'Achiziția din 2025 de Titluri Quality — întrebări despre independența editorială viitoare',
    ],
    strengths: ['Calitate investigativă', 'Standarde ridicate de verificare', 'Audiență mare în mediul online'],
    biasScore: -65,
    factualityRationale: 'Factualitate ridicată în ciuda bias-ului editorial puternic.',
    confidence: 'high',
    lastAnalysed: '2026-02-27',
    references: [
      { label: 'G4Media – Pagina „Despre noi"', url: 'https://www.g4media.ro/despre-noi' },
      { label: 'Wikipedia – G4Media', url: 'https://ro.wikipedia.org/wiki/G4Media' },
      { label: 'HotNews – Achiziția G4Media de către Titluri Quality (2025)', url: 'https://hotnews.ro/g4media-achizitionat-titluri-quality-radu-budeanu' },
      { label: 'Adevărul – G4Media vândut către Radu Budeanu', url: 'https://adevarul.ro/economie/g4media-vandut-titluri-quality-radu-budeanu' },
      { label: 'PressHub – Cel mai mare conglomerat digital din România', url: 'https://presshub.ro/g4media-titluri-quality-conglomerat-digital' },
      { label: 'Revista 22 – Profil Dan Tăpălagă și G4Media', url: 'https://revista22.ro/actualitate-2/dan-tapalaga-g4media' },
      { label: 'Capital – Achiziția G4Media și impactul în piața media', url: 'https://www.capital.ro/g4media-achizitie-titluri-quality.html' },
      { label: 'G4Media – Finanțare și transparență', url: 'https://www.g4media.ro/dona' },
    ],
  },

  criticatac: {
    id: 'criticatac',
    currentOwner: 'Platformă colectivă de autori (fără proprietar comercial)',
    founders: ['Vasile Ernu', 'Ciprian Șiulea', 'Costi Rogozanu', 'Florin Poenaru'],
    ownershipHistory:
      'Platformă colectivă de critică socială, coordonată de un nucleu editorial de intelectuali și jurnaliști (Vasile Ernu, Ciprian Șiulea, Costi Rogozanu, Florin Poenaru și alții, componență variabilă în timp). Proiectul a beneficiat de sprijin pentru unele conferințe și activități din partea Fundației Friedrich Ebert, dar nu există un trust media comercial sau un partid politic care să dețină formal platforma.',
    politicalConnections: [
      'Fără afiliere la un partid politic — se auto-definește ca grup de critică socială de stânga',
      'Sprijin ocazional din partea Fundației Friedrich Ebert (fundație germană social-democrată)',
      'Parte a rețelei regionale de publicații de stânga (LeftEast, Global Dialogue)',
    ],
    fundingSources: ['Autofinanțare colectiv editorial', 'Donații', 'Sprijin ocazional fundații (Friedrich Ebert)'],
    editorialLine:
      'Platformă intelectuală de stânga, axată pe critică socială, politică și economică, cu eseuri, analize și intervenții teoretice. Nu funcționează ca site de știri la zi, ci ca spațiu de idei și dezbatere ideologică. Teme recurente: inegalitate socială, relația capital–muncă, critica elitelor și a capitalismului.',
    biasRationale:
      'CriticAtac se auto-definește explicit ca grup de critică socială cu orientare de stânga. Textele promovează constant perspective egalitariste, anticapitaliste și critice la adresa capitalismului, liberalismului economic și a elitelor intelectuale mainstream. Manifestele și intervențiile lor publice, inclusiv în rețele regionale de stânga, justifică încadrarea în zona stângii radicale, cu o poziționare sistemic critică față de ordinea capitalistă existentă.',
    notablePatterns: [
      'Conținut preponderent de opinie și teorie, nu flux de știri',
      'Eseuri și manifeste anticapitaliste',
      'Participare la rețele internaționale de stânga (LeftEast, ISA)',
    ],
    controversies: [
      'Percepută de criticii de dreapta ca platformă de propagandă marxistă',
      'Poziții controversate privind evenimentele din Ucraina (perspective critice față de NATO)',
    ],
    strengths: ['Profunzime analitică', 'Originalitate în peisajul media românesc', 'Independență față de trusturi media'],
    biasScore: -80,
    factualityRationale: 'Factualitate variabilă — accent pe opinie și teorie, mai puțin pe raportare neutră de știri. Nu este un „fake news site", dar nu poate fi tratat ca sursă neutră de factualitate. Conținutul este preponderent de analiză și eseu.',
    confidence: 'medium',
    lastAnalysed: '2026-02-27',
    references: [
      { label: 'CriticAtac – Pagina „Despre noi"', url: 'https://www.criticatac.ro/despre-noi/' },
      { label: 'CriticAtac – „Nu mai vreau bogati!" (articol ilustrativ)', url: 'https://www.criticatac.ro/nu-mai-vreau-bogati/' },
      { label: 'CriticAtac – „Viitorul are autor #COLECTIV. Revendicările stângii"', url: 'https://www.criticatac.ro/viitorul-autor-colectiv-revendicrile-stangii/' },
      { label: 'Wikipedia – CriticAtac', url: 'https://ro.wikipedia.org/wiki/CriticAtac' },
      { label: 'Eurotopics – Fișă CriticAtac', url: 'https://www.eurotopics.net/en/148467/criticatac' },
      { label: 'Global Dialogue (ISA) – „CriticAtac: An Anti-Capitalist Manifesto from Romania"', url: 'https://globaldialogue.isa-sociology.org/articles/criticatac-an-anti-capitalist-manifesto-from-romania' },
      { label: 'LeftEast – „Romania\'s Fragile New Left" (interviu Costi Rogozanu)', url: 'https://lefteast.org/romanias-fragile-new-left/' },
      { label: 'HotNews – Publiciștii de stânga din România', url: 'https://hotnews.ro/cum-vad-publicistii-de-stanga-din-romania-evenimentele-din-ucraina-o-paralela-cu-vocea-rusiei-572017' },
      { label: 'Jurnalul – „Intelectualii de stânga, față în față cu România"', url: 'https://jurnalul.ro/cultura/carte/intelectualii-de-stanga-fata-in-fata-cu-romania-574941.html' },
      { label: 'Contributors – Critică libertariană la adresa CriticAtac', url: 'https://www.contributors.ro/acul-libertarian-in-cojocul-criticatac-cat-ne-costa-statul/' },
    ],
  },

  // ===================== CENTRU-DREAPTA =====================

  ziare: {
    id: 'ziare',
    currentOwner: 'Proprietate privată',
    editorialLine:
      'Portal de agregare de știri și publicație proprie. Conținut variat: politică, economie, entertainment.',
    biasRationale:
      'Ziare.com funcționează parțial ca agregator, parțial ca publicație proprie. Tendința centru-dreapta se reflectă în alegerea și framing-ul știrilor politice. Proprietatea și conexiunile politice nu sunt complet transparente.',
    biasScore: 25,
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  gandul: {
    id: 'gandul',
    currentOwner: 'Proprietate privată',
    editorialLine:
      'Site de știri cu acoperire politică și generală.',
    biasRationale:
      'Gândul are o tendință centru-dreapta în acoperirea politică. Proprietatea nu este complet transparentă. Unele articole au un ton sensationalist.',
    biasScore: 25,
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  capital: {
    id: 'capital',
    currentOwner: 'Proprietate privată',
    editorialLine:
      'Publicație economică cu acoperire business și politică economică.',
    biasRationale:
      'Capital.ro are o orientare pro-business și pro-piață liberă specifică publicațiilor economice. Tendința centru-dreapta este naturală pentru acest profil. Factualitate mixtă — amestec de jurnalism economic serios și conținut de opinie.',
    biasScore: 25,
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  profit: {
    id: 'profit',
    currentOwner: 'Proprietate privată independentă',
    editorialLine:
      'Site de știri economice și de business. Focus exclusiv pe economie, finanțe, afaceri.',
    biasRationale:
      'Profit.ro este o publicație economică independentă cu standarde ridicate. Tendința centru-dreapta derivă din perspectiva pro-piață specifică jurnalismului economic serios. Nu există partizanism politic evident.',
    strengths: ['Specialitate economică', 'Factualitate ridicată', 'Informații financiare de calitate'],
    biasScore: 20,
    factualityRationale: 'Factualitate ridicată în domeniul economic.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  zf: {
    id: 'zf',
    foundedYear: 1995,
    currentOwner: 'Proprietate privată',
    editorialLine:
      'Cel mai important ziar economic din România. Standard ridicat în jurnalismul de afaceri, finanțe, macro-economie.',
    biasRationale:
      'Ziarul Financiar este orientat centru-dreapta prin natura sa de publicație economică: pro-piață liberă, pro-business, critic al intervenționismului statal excesiv. Calitate ridicată a jurnalismului.',
    strengths: ['Standard înalt în jurnalism economic', 'Analize financiare profunde', 'Credibilitate în mediul de afaceri'],
    biasScore: 25,
    factualityRationale: 'Factualitate ridicată în domeniul economic.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  romanialibera: {
    id: 'romanialibera',
    foundedYear: 1877,
    currentOwner: 'Proprietate privată (proprietar neclar)',
    ownershipHistory:
      'Ziar cu tradiție îndelungată (1877). Privatizat după 1989. Proprietate controversată în unele perioade. A schimbat mai mulți proprietari.',
    editorialLine:
      'Ziar național cu acoperire politică generală. Tendință centru-dreapta, critică la adresa stângii și a corupției.',
    biasRationale:
      'România Liberă are o orientare centru-dreapta istorică. Factualitatea a variat semnificativ în funcție de perioadă și proprietar. Unele perioade au arătat tendințe editoriale mai marcate politic.',
    biasScore: 30,
    factualityRationale: 'Factualitate mixtă, variabilă în timp.',
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  observator: {
    id: 'observator',
    currentOwner: 'Intact Media Group',
    parentCompany: 'Intact Media Group (Antena 1)',
    ownershipHistory:
      'Observator este știrile de pe Antena 1, parte a grupului Intact. Antena 1 este televiziunea generalistă a grupului, cu audiență mai largă decât Antena 3.',
    politicalConnections: [
      'Intact Media Group — Dan Voiculescu (fondator, condamnat pentru colaborare cu Securitatea)',
      'Mihaela Voiculescu — conducerea actuală a Intact',
    ],
    fundingSources: ['Publicitate'],
    editorialLine:
      'Știrile de pe Antena 1, mai moderate decât Antena 3, dar parte din același grup media cu orientare general centru-dreapta/populistă.',
    biasRationale:
      'Deși Antena 1 (Observator) este mai moderată decât Antena 3, rămâne parte a grupului Intact cu toate implicațiile acestuia. Conexiunile cu fostul fondator Dan Voiculescu și orientarea generală pro-populistă a grupului influențează editorial chiar și știrile de actualitate.',
    biasScore: 35,
    factualityRationale: 'Factualitate mixtă. Mai bună decât Antena 3, dar cu influențe politice.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  defapt: {
    id: 'defapt',
    currentOwner: 'Independent',
    editorialLine:
      'Publicație de fact-checking și verificare a declarațiilor politice.',
    biasRationale:
      'Defapt.ro se prezintă ca publicație de fact-checking independentă. Orientarea ușor centru-dreapta poate fi subtilă prin alegerea subiectelor verificate.',
    biasScore: 20,
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  dailybusiness: {
    id: 'dailybusiness',
    currentOwner: 'Proprietate privată',
    editorialLine:
      'Publicație de business și știri economice.',
    biasRationale:
      'Publicație economic-orientată cu tendință centru-dreapta specifică jurnalismului de business. Pro-piață liberă, pro-investiții.',
    biasScore: 20,
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  // ===================== DREAPTA =====================

  antena3: {
    id: 'antena3',
    foundedYear: 1997,
    founders: ['Dan Voiculescu'],
    currentOwner: 'Intact Media Group (Jurnalul National SA)',
    parentCompany: 'Intact Media Group',
    ownershipHistory:
      'Fondat în 1997 de Dan Voiculescu, politician și om de afaceri condamnat definitiv în 2014 pentru colaborare cu Securitatea comunistă (a servit pedeapsa). Voiculescu a fondat Partidul Conservator (PC). Fiica sa, Mihaela Voiculescu, conduce în prezent grupul.',
    politicalConnections: [
      'Dan Voiculescu — condamnat pentru colaborare cu Securitatea (2014), fondator Partid Conservator',
      'Conexiuni istorice cu PSD',
      'Mihaela Voiculescu — conducerea actuală Intact',
      'Poziționare sistematică anti-DNA, anti-justiție, anti-USR, pro-AUR/Georgescu',
    ],
    fundingSources: ['Publicitate', 'Posibile surse de finanțare opace (neverificabile direct)'],
    editorialLine:
      'Canal de știri cu orientare puternic naționalistă și populistă. Critică vehementă a DNA, USR, Occidentului și a "statului paralel". Promovare implicită a agendei conservatoare-naționaliste.',
    biasRationale:
      'Antena 3 este probabil cel mai partizan canal de știri din presa mainstream românească. Conexiunile directe ale fondatorului cu Securitatea comunistă și condamnarea sa penală evidențiază natura politică a instituției. Practica sistematică de dezinformare anti-DNA, anti-Occident și amplificarea narativelor conspiraționiste justifică ratingul de dreapta extremă. CNA (Consiliul Național al Audiovizualului) a sancționat repetat Antena 3 pentru dezinformare.',
    controversies: [
      'Fondatorul Dan Voiculescu — condamnat pentru colaborare cu Securitatea',
      'Multiple sancțiuni CNA pentru dezinformare',
      'Campanie sistematică anti-DNA și anti-justiție',
      'Retragere temporară autorizație audiovizuală (CNA, 2023)',
      'Promovare agresivă a candidaturii Călin Georgescu (2024)',
    ],
    notablePatterns: [
      'Dezinformare sistematică documentată',
      'Amplificarea extremismului naționalist',
      'Narativ pro-Georgescu/AUR în 2024',
      'Anti-UE și anti-NATO constant',
    ],
    biasScore: 80,
    factualityRationale: 'Factualitate scăzută. Multiple instanțe documentate de dezinformare.',
    confidence: 'high',
    lastAnalysed: '2026-02-26',
  },

  romaniatv: {
    id: 'romaniatv',
    founders: ['Sebastian Ghiță'],
    currentOwner: 'Structură comercială controversată',
    ownershipHistory:
      'Fondat de Sebastian Ghiță, om de afaceri și deputat PSD, acuzat de corupție, spălare de bani și legături cu servicii secrete. Ghiță a fugit din România în 2016 înainte de reținere, s-a predat ulterior din Serbia. Implicat și în investigațiile din dosarul Călin Georgescu (2024).',
    politicalConnections: [
      'Sebastian Ghiță — fugit și predat justiției române, acuzat de corupție și relații cu SRI',
      'Conexiuni cu PSD și persoane din serviciile secrete',
      'Poziționare anti-DNA, anti-justiție, pro-Georgescu',
    ],
    fundingSources: ['Publicitate', 'Surse de finanțare opace'],
    editorialLine:
      'Canal de știri cu orientare anti-instituțională, conspiraționistă și naționalistă. Critică sistematică a DNA, Occidentului, "statului profund".',
    biasRationale:
      'România TV are origini direct în politica PSD și în controversatele afaceri ale lui Sebastian Ghiță. Publicația promovează sistematic dezinformare, teorii ale conspirației și narativele anti-instituționale. Alinierea cu Călin Georgescu în 2024 și agenda anti-UE/anti-NATO fac din România TV una dintre publicațiile cu cel mai ridicat scor de bias.',
    controversies: [
      'Fondatorul Sebastian Ghiță — fugar și ulterior predat justiției',
      'Dezinformare sistematică documentată',
      'Promovare agresivă a candidaturii Georgescu (2024)',
      'Sancțiuni CNA multiple',
    ],
    biasScore: 85,
    factualityRationale: 'Factualitate scăzută. Dezinformare frecventă.',
    confidence: 'high',
    lastAnalysed: '2026-02-26',
  },

  dcnews: {
    id: 'dcnews',
    founders: ['Dan Andronic'],
    currentOwner: 'Dan Andronic',
    ownershipHistory:
      'Fondat și condus de Dan Andronic, jurnalist și publicist cu orientare de dreapta.',
    politicalConnections: [
      'Dan Andronic — orientare de dreapta explicită, critici la adresa stângii și a mass-media mainstream',
    ],
    fundingSources: ['Publicitate', 'Publicitate politică (potențial)'],
    editorialLine:
      'Site de știri cu orientare dreapta. Comentarii politice puternic partizane, critici ale stângii, USR și mass-media "mainstream".',
    biasRationale:
      'DCNews are o orientare clar de dreapta reflectată în alegerea subiectelor, framing-ul articolelor și comentariile explicite ale fondatorului. Factualitatea este afectată de tendința spre senzationalism și narativele partizane.',
    biasScore: 65,
    factualityRationale: 'Factualitate scăzută spre mixtă. Bias editorial puternic.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  flux24: {
    id: 'flux24',
    currentOwner: 'Proprietate privată',
    editorialLine:
      'Site de știri cu orientare dreapta-naționalistă.',
    biasRationale:
      'Flux24 acoperă știri cu framing naționalist și conservator. Tendința de dreapta este vizibilă în alegerea subiectelor și tonul editorial.',
    biasScore: 60,
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  activenews: {
    id: 'activenews',
    currentOwner: 'Proprietate privată',
    editorialLine:
      'Site de știri cu orientare puternic naționalistă, conservatoare și religioasă.',
    biasRationale:
      'ActiveNews este o publicație cu orientare dreapta-extremă: promovează naționalism, ortodoxie, anti-LGBTQ, anti-UE. Conținutul include frecvent știri false sau exagerate care susțin agenda conservatoare-religioasă extremă.',
    controversies: [
      'Promovare dezinformare sistematică',
      'Conținut anti-LGBTQ',
      'Narativele anti-vaccinare',
    ],
    biasScore: 85,
    factualityRationale: 'Factualitate scăzută. Dezinformare frecventă.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  epochtimes: {
    id: 'epochtimes',
    founders: ['Epoch Times International (SUA)'],
    currentOwner: 'Epoch Times International',
    parentCompany: 'Epoch Times (afiliată mișcării Falun Gong)',
    ownershipHistory:
      'Ediție locală a publicației internaționale Epoch Times. La nivel global, Epoch Times este asociată cu mișcarea religioasă Falun Gong (persecutată în China). Publicația internațională este catalogată ca sursă de dezinformare de NewsGuard și alte organizații de media literacy.',
    politicalConnections: [
      'Falun Gong — mișcare religioasă/spirituală cu centrul în SUA, anti-CCP',
      'Orientare globală puternic pro-Trump, anti-globalist',
      'Conexiuni documentate cu mișcarea QAnon și teorii ale conspirației globale',
    ],
    fundingSources: [
      'Rețea internațională Epoch Times',
      'Publicitate',
      'Abonamente',
    ],
    editorialLine:
      'Conținut de extremă dreapta: anti-globalist, anti-comunist, anti-UE, pro-naționalist. Dezinformare și teorii ale conspirației frecvente.',
    biasRationale:
      'Epoch Times are finanțare și directivă editorială internațională. Conexiunile cu Falun Gong și cu mișcarea de extremă dreapta americană (MAGA) se reflectă direct în conținutul românesc. Publicația amplifică narativele de extremă dreapta, conspiraționiste și anti-instituționale. Studii internaționale (NewsGuard, DFRLab) au catalogat Epoch Times ca sursă sistematică de dezinformare.',
    controversies: [
      'Catalogat ca sursă de dezinformare de NewsGuard',
      'Propagandă pentru mișcarea QAnon la nivel global',
      'Finanțare opacă prin rețeaua internațională',
      'Conținut anti-vaccinare documentat',
    ],
    biasScore: 90,
    factualityRationale: 'Factualitate scăzută. Dezinformare sistematică documentată internațional.',
    confidence: 'high',
    lastAnalysed: '2026-02-26',
  },

  // ===================== SATIRĂ =====================

  catavencii: {
    id: 'catavencii',
    foundedYear: 1991,
    founders: ['Ion Iuga', 'Mircea Cărtărescu', 'Cătălin Mihuleac', 'alți jurnaliști și scriitori'],
    currentOwner: 'Proprietate privată',
    ownershipHistory:
      'Revistă de satiră politică fondată în 1991. Una dintre cele mai longevive publicații satirice din România post-comunistă.',
    editorialLine:
      'Satiră politică și socială. Critică politicieni de toate culorile, cu tendință anti-corupție transpartinică.',
    biasRationale:
      'Publicație de satiră — "factualitatea" trebuie interpretată altfel. Satira lovește în toate direcțiile, dar critica stării democrației și a corupției are o nuanță ușor centru-stânga în contextul românesc.',
    strengths: ['Calitate literară', 'Independență editorială', 'Tradiție îndelungată'],
    biasScore: 0,
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  academiacatavencu: {
    id: 'academiacatavencu',
    foundedYear: 1990,
    founders: ['Ion Iuga', 'Ioana Bâldea Constantinescu', 'alții'],
    currentOwner: 'Proprietate privată',
    ownershipHistory:
      'Una dintre primele publicații satirice post-comuniste. Precursor sau legat editorial de Cațavencii.',
    editorialLine:
      'Satiră politică clasică. Critică transpartinică a politicienilor și a clasei dirigente.',
    biasRationale:
      'Similar cu Cațavencii — satiră care lovește transpartisan. Calitate literară ridicată. Bias politic minim.',
    biasScore: 0,
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  // ===================== TABLOID & GENERAL =====================

  wowbiz: {
    id: 'wowbiz',
    currentOwner: 'Proprietate privată',
    editorialLine:
      'Tabloid de entertainment și celebrities. Conținut de divertisment, vedete, scandal.',
    biasRationale:
      'Tabloid cu focus pe entertainment. Bias politic minimal — conținutul este preponderent apolitical. Factualitate mixtă specifică tabloide.',
    biasScore: 0,
    factualityRationale: 'Factualitate mixtă — tabloid entertainment.',
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  actualitate: {
    id: 'actualitate',
    currentOwner: 'Proprietate privată',
    editorialLine:
      'Site de știri generale. Conținut mixt.',
    biasRationale:
      'Publicație generalistă fără orientare politică clară documentată. Tendință ușor centristă.',
    biasScore: 5,
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  factual: {
    id: 'factual',
    currentOwner: 'Independent / structură ONG',
    editorialLine:
      'Platformă de fact-checking. Verificarea informațiilor false din spațiul public.',
    biasRationale:
      'Factual.ro încearcă să funcționeze transpartisan. Tendința ușor centristă reflectă că verificarea faptelor ca practică are o ușoară orientare pro-adevăr/anti-dezinformare, ceea ce în peisajul românesc este uneori perceput ca anti-dreapta extremă (deoarece dezinformarea vine preponderent din această zonă).',
    strengths: ['Verificarea informațiilor', 'Metodologie transparentă', 'Independență'],
    biasScore: 0,
    factualityRationale: 'Factualitate foarte ridicată prin definiție.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  jurnalul: {
    id: 'jurnalul',
    foundedYear: 1990,
    currentOwner: 'Proprietate privată',
    editorialLine:
      'Ziar național de știri generale. Acoperire politică și socială.',
    biasRationale:
      'Jurnalul are o orientare generală centristă cu ușoară tendință conservatoare în anumite perioade. Proprietatea și conexiunile politice nu sunt complet transparente.',
    biasScore: 10,
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  realitatea: {
    id: 'realitatea',
    foundedYear: 2001,
    founders: ['Sorin Ovidiu Vântu'],
    currentOwner: 'Maricel Păcuraru (prin fiica sa, Bertalan Alexandra Beatrice — 99,75% din Geopol International SRL)',
    parentCompany: 'Geopol International SRL',
    ownershipHistory:
      'Fondat în 2001 ca Realitatea TV de Sorin Ovidiu Vântu, condamnat penal pentru fraudă. Postul a intrat în insolvență (2011) și faliment (2019). Licența a fost retrasă pe 31 octombrie 2019. A fost înlocuit de Realitatea Plus, care a început emisiunea pe 1 noiembrie 2019. Până în 2021, Geopol International (operatorul licenței) era deținut de Strategies Research (acționari: Maricel Păcuraru și Cozmin Gușă). Din 2021, Cozmin Gușă nu mai figurează printre acționari, iar Bertalan Alexandra Beatrice (fiica lui Maricel Păcuraru) deține 99,75% din Geopol International.',
    politicalConnections: [
      'Sorin Ovidiu Vântu — fondatorul original, condamnat penal, conexiuni politice multiple',
      'Maricel Păcuraru — om de afaceri, controlează postul prin fiica sa',
      'Cozmin Gușă — fost acționar (până în 2021), analist politic, fost consilier al lui Traian Băsescu',
      'Poziționare anti-USR, critică la adresa UE în anumite contexte',
    ],
    fundingSources: ['Publicitate', 'Cablu/satelit'],
    editorialLine:
      'Canal de știri cu orientare conservatoare-naționalistă. Accent pe suveranitate națională, critică la adresa globalizării și a „corectitudinii politice". Talk-show-uri cu opinii puternice.',
    biasRationale:
      'Realitatea Plus (fost Realitatea TV) a oscilat semnificativ de-a lungul timpului în funcție de proprietar. Sub controlul lui Maricel Păcuraru, orientarea s-a cristalizat spre dreapta conservatoare-naționalistă. Talk-show-urile promovează frecvent narativele suveraniste și conservatoare. Nu atinge nivelul de dezinformare al Antena 3 sau România TV, dar are un bias editorial clar spre dreapta.',
    controversies: [
      'Fondatorul original Sorin Ovidiu Vântu — condamnat penal',
      'Dificultăți financiare recurente, insolvență și faliment',
      'Schimbări multiple de proprietar și structuri corporative opace',
      'Acuzații de partinitate politică în diverse perioade',
    ],
    notablePatterns: [
      'Talk-show-uri cu orientare conservatoare',
      'Accent pe suveranitate națională',
      'Critică selectivă a politicienilor din tabăra pro-europeană',
    ],
    strengths: ['Acoperire în timp real', 'Dezbateri politice'],
    biasScore: 60,
    factualityRationale: 'Factualitate mixtă — afectată de bias editorial în talk-show-uri, mai bună în știrile de actualitate.',
    confidence: 'medium',
    lastAnalysed: '2026-02-27',
  },

  b1tv: {
    id: 'b1tv',
    foundedYear: 2001,
    founders: ['Bobby Păunescu'],
    currentOwner: 'Sorin Oancea (50%), George Constantin Păunescu (40%), Luminița Elena Oancea (10%)',
    parentCompany: 'B1 TV Channel SRL',
    ownershipHistory:
      'Lansat în 2001 ca post generalist, transformat în canal de știri 24/7 în 2011. Acționariatul a fost împărțit între Sorin Oancea și George Constantin Păunescu (50/50). În februarie 2025, CNA a aprobat o nouă structură: Oancea 50%, Păunescu 40%, Luminița Elena Oancea (soția lui Sorin Oancea) 10%. Un conflict între familia Păunescu și Oancea pentru controlul postului este documentat din august 2022.',
    politicalConnections: [
      'George Constantin Păunescu — fiul lui Viorel Păunescu, controversat om de afaceri',
      'Bobby Păunescu — fondatorul, producător de film și om de afaceri cu conexiuni politice',
      'Sorin Oancea — director editorial cu influență asupra liniei postului',
    ],
    fundingSources: ['Publicitate', 'Cablu/satelit'],
    editorialLine:
      'Canal de știri cu orientare centru-dreapta. Istoric, B1 TV a fost considerat unul dintre puținele posturi cu acoperire echilibrată pro-europeană. În ianuarie 2025, înlocuirea prezentatorului Tudor Mușat cu Laura Chiriac (fostă colaboratoare la Antena 3 și România TV) a generat speculații privind o posibilă viraj spre dreapta suveranistă.',
    biasRationale:
      'B1 TV a fost tradițional un post centru-dreapta moderat, oferind spațiu opoziției democratice și perspectivei pro-europene. Conflictul intern de proprietate și schimbările editoriale din 2025 sugerează o posibilă reorientare spre dreapta. Clasificarea actuală reflectă starea curentă, dar necesită monitorizare.',
    controversies: [
      'Conflict de proprietate între familia Păunescu și Sorin Oancea (din 2022)',
      'Înlocuirea prezentatorului Tudor Mușat (ianuarie 2025) — speculații de reorientare editorială',
      'Laura Chiriac — prezentator nou cu istoric la posturi pro-PSD/suveraniste',
    ],
    notablePatterns: [
      'Dezbateri cu perspective multiple',
      'Acoperire a opoziției democratice',
      'Posibilă reorientare editorială în curs (2025)',
    ],
    strengths: ['Acoperire 24/7', 'Istoric de echilibru editorial relativ', 'Dezbateri politice'],
    biasScore: 30,
    factualityRationale: 'Factualitate mixtă — solidă în știrile de actualitate, variabilă în talk-show-uri.',
    confidence: 'medium',
    lastAnalysed: '2026-02-27',
  },

  aktual24: {
    id: 'aktual24',
    currentOwner: 'Independent (Ioan Ovidiu)',
    ownershipHistory: 'Publicație independentă activă în online, fondată de Ioan Ovidiu.',
    editorialLine: 'Site de știri cu focus pe politică, investigații și actualitate internă. Ton adesea anti-corupție și critic la adresa marilor partide.',
    biasRationale: 'Aktual24 are o orientare anti-corupție și critică la adresa sistemului politic tradițional (în special PSD/PNL). Tendința este ușor centru-dreapta / reformistă.',
    biasScore: 20,
    confidence: 'low',
    lastAnalysed: '2026-03-19',
  },

  redactia: {
    id: 'redactia',
    currentOwner: 'Proprietate privată',
    ownershipHistory: 'Site de știri online generalist, cu focus pe actualitate și click de tip agregator.',
    editorialLine: 'Știri generale, tabloid și actualitate rapidă. Focus pe trafic și audiență social media.',
    biasRationale: 'Conținut generalist / agregator fără o linie editorială politică asumată. Factualitatea poate varia în funcție de preluări.',
    biasScore: 0,
    confidence: 'low',
    lastAnalysed: '2026-03-19',
  },

  cotidianul: {
    id: 'cotidianul',
    foundedYear: 1991,
    founders: ['Ion Rațiu'],
    currentOwner: 'Cornel Nistorescu',
    ownershipHistory: 'Fondat în 1991 de Ion Rațiu cu orientare asumată de dreapta / țărănistă. După moartea sa a trecut prin mai multe patronate. În prezent este controlat de jurnalistul Cornel Nistorescu.',
    editorialLine: 'Publicație zilnică online de știri, analize și editoriale. Ton puternic dictat de opiniile lui Cornel Nistorescu.',
    biasRationale: 'Sub conducerea actuală, ziarul a adoptat o linie editorială frecvent critică la adresa decidenților pro-europeni, DNA, USR și pro-abordări suveraniste sau naționaliste. Are o tendință clară spre dreapta-suveranistă.',
    biasScore: 40,
    confidence: 'medium',
    lastAnalysed: '2026-03-19',
  },

  comisarul: {
    id: 'comisarul',
    currentOwner: 'Proprietate privată',
    ownershipHistory: 'Site online de știri, comentarii și sinteze, deseori cu un ton senzaționalist.',
    editorialLine: 'Abordare agresivă de tip tabloid politic, limbaj colorat și orientare puternic marcată anti-sistem.',
    biasRationale: 'Site-ul prezintă un jurnalism militant, partizan, cu un limbaj deseori injurios și neprofesionist. Tendința este populistă-dreapta.',
    biasScore: 45,
    confidence: 'low',
    lastAnalysed: '2026-03-19',
  },

  metropolatv: {
    id: 'metropolatv',
    foundedYear: 2020,
    currentOwner: 'Consiliul Local Voluntari (Florentin Pandele)',
    ownershipHistory: 'Canal TV lansat de televiziunea Consiliului Local Voluntari, primărie condusă de Florentin Pandele (soțul Gabrielei Firea, lider PSD).',
    editorialLine: 'Canal de știri, divertisment și talk-show-uri politice. Găzduiește emisiuni ale unor realizatori controversați.',
    biasRationale: 'Finanțarea publică din Voluntari subordonată lui Florentin Pandele implică legături directe cu PSD, dar și cu zona de conservatorism asumată de grupul condus de familia Pandele/Firea.',
    biasScore: 60,
    confidence: 'medium',
    lastAnalysed: '2026-03-19',
  },

  romaniajournal: {
    id: 'romaniajournal',
    foundedYear: 2014,
    currentOwner: 'Independent',
    ownershipHistory: 'Publicație independentă în limba engleză dedicată știrilor din România pentru expații și cititorii străini.',
    editorialLine: 'Ziar de știri online în limba engleză (politică, economie, societate). Stil și rapoarte bazate adesea pe agregarea agențiilor.',
    biasRationale: 'Acoperirea are un ton neutru, instituțional, specific publicațiilor destinate străinilor. Nu manifestă parti-pris politic vizibil.',
    biasScore: 0,
    confidence: 'medium',
    lastAnalysed: '2026-03-19',
  },

  romaniainsider: {
    id: 'romaniainsider',
    foundedYear: 2010,
    currentOwner: 'City Compass Media',
    ownershipHistory: 'Cea mai citită publicație exclusiv în limba engleză din România, fondată de Corina Chirileasa și Volker Moser.',
    editorialLine: 'Platformă de știri business, politică și lifestyle în engleză. Calitate editorială ridicată.',
    biasRationale: 'Fiind dedicată mediului corporate expat și antreprenorilor străini, abordează piața cu un ton economic pro-occidental, centrist, foarte echilibrat politic.',
    biasScore: 0,
    confidence: 'high',
    lastAnalysed: '2026-03-19',
  },
};

// ============================================================
//  UTILITARE
// ============================================================

/** Returnează profilul unei surse după ID, sau undefined dacă nu există. */
export function getSourceProfile(sourceId: string): SourceProfile | undefined {
  return SOURCE_PROFILES[sourceId];
}

/** Convertește un scor numeric în categorie de bias. */
export function scoreToBiasCategory(
  score: number,
): 'left' | 'center-left' | 'center' | 'center-right' | 'right' {
  if (score <= -55) return 'left';
  if (score <= -20) return 'center-left';
  if (score <= 19) return 'center';
  if (score <= 54) return 'center-right';
  return 'right';
}

/** Etichetă în română pentru nivelul de încredere al analizei. */
export function getConfidenceLabel(confidence: 'high' | 'medium' | 'low'): string {
  const labels = { high: 'Ridicată', medium: 'Medie', low: 'Scăzută' };
  return labels[confidence];
}

/** Returnează toate sursele sortate după biasScore (stânga → dreapta). */
export function getProfilesSortedByBias(): SourceProfile[] {
  return Object.values(SOURCE_PROFILES).sort((a, b) => a.biasScore - b.biasScore);
}

/** Returnează ID-urile de surse care NU au profil documentat. */
export function getMissingProfileIds(sourceIds: string[]): string[] {
  return sourceIds.filter((id) => !SOURCE_PROFILES[id]);
}

// ============================================================
//  TEMPLATE PENTRU SURSE NOI
//  Când adaugi o sursă nouă în api/shared.ts, completează
//  acest template și adaug-o în SOURCE_PROFILES de mai sus.
// ============================================================

/**
 * PAȘI PENTRU ANALIZA UNEI SURSE NOI:
 * 1. Identifică proprietarul și istoricul de ownership (Wikipedia, ANAF, registrul comerțului)
 * 2. Caută conexiunile politice ale proprietarului (dosare penale, afiliații de partid)
 * 3. Verifică sursele de finanțare (publicitate politică, granturi, abonamente)
 * 4. Analizează 20-30 de articole recente pentru a identifica tipare editoriale
 * 5. Caută sancțiuni CNA sau alte controverse documentate
 * 6. Compară cu alte publicații din aceeași categorie pentru a calibra scorul
 * 7. Setează confidence: 'low' inițial și crește pe măsură ce aduni mai multe date
 */
export const NEW_SOURCE_TEMPLATE: Omit<SourceProfile, 'id'> = {
  foundedYear: undefined,
  founders: [],
  currentOwner: 'Necunoscut — necesită cercetare',
  parentCompany: undefined,
  ownershipHistory: 'TODO: Descrie istoricul proprietății',
  politicalConnections: ['TODO: Identifică conexiunile politice'],
  knownFinancialInterests: ['TODO: Identifică interesele financiare'],
  fundingSources: ['TODO: Identifică sursele de finanțare'],
  editorialLine: 'TODO: Descrie linia editorială',
  biasRationale:
    'TODO: Explică raționamentul din spatele scorului de bias. Bazează-te pe: ' +
    '(1) proprietar/fondator și conexiunile sale, ' +
    '(2) sursele de finanțare, ' +
    '(3) tipare observate în acoperirea știrilor, ' +
    '(4) controverse documentate.',
  notablePatterns: ['TODO: Listează tipare editoriale observabile'],
  controversies: [],
  strengths: [],
  biasScore: 0, // TODO: Ajustează după analiză
  factualityRationale: 'TODO: Explică ratingul de factualitate',
  confidence: 'low', // Începe cu low, crește pe măsură ce strângi date
  lastAnalysed: new Date().toISOString().split('T')[0],
};
