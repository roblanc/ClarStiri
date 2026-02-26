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
    currentOwner: 'Proprietate privată',
    editorialLine:
      'Post de radio cu știri și talk-show-uri politice. Prezentatori cu opinii puternice.',
    biasRationale:
      'Europa FM are o orientare generală centru-dreapta, vizibilă mai ales în talk-show-urile politice. Știrile propriu-zise sunt mai echilibrate decât conținutul de opinie. Proprietatea și conexiunile nu sunt complet transparente.',
    biasScore: 20,
    confidence: 'low',
    lastAnalysed: '2026-02-26',
  },

  // ===================== CENTRU-STÂNGA =====================

  digi24: {
    id: 'digi24',
    foundedYear: 2012,
    founders: ['RCS&RDS'],
    currentOwner: 'Zoltan Teszari (indirect prin Digi Communications N.V.)',
    parentCompany: 'Digi Communications N.V. / RCS&RDS',
    ownershipHistory:
      'Lansat în 2012 ca parte a grupului RCS&RDS, operator de telecomunicații. Zoltan Teszari, fondatorul RCS&RDS, este un antreprenor român-maghiar cu afaceri extinse în telecom și media.',
    politicalConnections: [
      'Zoltan Teszari — fără afiliații politice publice clare',
      'Interese în telecomunicații (reglementare ANCOM) pot afecta acoperirea subiectelor telecom',
    ],
    fundingSources: ['Publicitate', 'Inclus în pachetele Digi'],
    editorialLine:
      'Canal de știri 24/7 profesionist. Acoperire largă, echipe de investigație. Ușoară tendință pro-europeană și pro-reformă.',
    biasRationale:
      'Digi24 este considerat unul dintre posturile mai echilibrate din peisajul românesc. Teszari nu are un profil politic partizan evident, ceea ce reduce riscul de bias editorial explicit. Tendința centru-stânga se manifestă subtil prin alegerea subiectelor (pro-UE, pro-anticorupție, critici la adresa extremismului). Nu există dovezi de bias partizan sistematic.',
    notablePatterns: [
      'Investigații jurnalistice de calitate',
      'Dezbateri cu perspective multiple',
      'Acoperire extinsă a UE și politicii externe',
    ],
    strengths: ['Profesionalism', 'Investigații', 'Acoperire cuprinzătoare'],
    biasScore: -25,
    factualityRationale: 'Factualitate ridicată. Verificare bună a informațiilor.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
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
    founders: ['Victor Ilie', 'Andrei Mușcel', 'echipă de jurnaliști independenți'],
    currentOwner: 'Echipa fondatoare (independent)',
    ownershipHistory:
      'Fondată în 2017 de jurnaliști independenți. Pionier în jurnalismul finanțat prin abonamente în România. A crescut rapid prin documentare video de impact.',
    politicalConnections: ['Fără afiliații politice directe cunoscute'],
    fundingSources: ['Abonamente cititori', 'Granturi pentru jurnalism de investigație', 'Donații'],
    editorialLine:
      'Jurnalism de investigație independent. Focus pe subiecte de interes public: corupție, sănătate, educație, justiție. Documentare video de impact.',
    biasRationale:
      'Recorder este exemplul clar de publicație independentă finanțată prin abonamente, fără dependență de publicitate politică sau proprietari cu interese. Valorile editoriale (anti-corupție, transparență, responsabilizarea puterii) pot fi percepute ca centru-stânga în contextul românesc, dar reprezintă mai degrabă valori jurnalistice universale. Nu există bias partizan clar în favoarea unui partid.',
    notablePatterns: [
      'Investigații profunde documentate cu surse primare',
      'Documentare video de impact social',
      'Acoperire îndelungată a dosarelor',
    ],
    strengths: ['Independență editorială', 'Calitate investigativă ridicată', 'Transparență financiară'],
    biasScore: -35,
    factualityRationale: 'Factualitate foarte ridicată. Documentare riguroasă.',
    confidence: 'high',
    lastAnalysed: '2026-02-26',
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
    founders: ['Vice Media (SUA)'],
    currentOwner: 'Vice Media (sub restructurări financiare continue)',
    parentCompany: 'Vice Media International',
    ownershipHistory:
      'Ediție românească a brand-ului internațional Vice. Vice Media global a trecut prin dificultăți financiare semnificative în 2023-2024.',
    fundingSources: ['Publicitate', 'Conținut de brand'],
    editorialLine:
      'Conținut orientat spre tineri. Știri, cultură, investigații sociale. Abordare neconvențională.',
    biasRationale:
      'Vice Media are la nivel global o orientare stânga-progresistă clară. Ediția românească urmărește această tendință prin subiectele abordate (drepturi LGBTQ+, drepturile minorităților, critici sociale). Factualitatea poate fi mixtă din cauza stilului jurnalistic mai subiectiv.',
    biasScore: -35,
    factualityRationale: 'Factualitate mixtă — uneori subiectiv, alteori riguros.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  scena9: {
    id: 'scena9',
    currentOwner: 'Independent',
    fundingSources: ['Granturi culturale', 'Abonamente', 'Donații'],
    editorialLine:
      'Revistă culturală și de analiză socială. Conținut literar, artistic, investigații sociale profunde.',
    biasRationale:
      'Scena9 are o orientare progresistă clară, reflectată în temele abordate (artă, feminism, drepturi civile, societate). Nu este partizană politic, dar valorile promovate sunt sistematic centru-stânga.',
    strengths: ['Calitate editorială ridicată', 'Analize profunde', 'Conținut cultural valoros'],
    biasScore: -40,
    factualityRationale: 'Factualitate bună pentru conținut analitic și cultural.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
  },

  // ===================== STÂNGA =====================

  g4media: {
    id: 'g4media',
    foundedYear: 2015,
    founders: ['Paul Cristian Radu', 'Cristian Pantazi'],
    currentOwner: 'Structură editorială independentă',
    ownershipHistory:
      'Fondat în 2015. Paul Cristian Radu este co-fondator OCCRP (Organized Crime and Corruption Reporting Project), cea mai importantă rețea internațională de jurnalism de investigație.',
    politicalConnections: [
      'Paul Cristian Radu — OCCRP, rețea internațională de jurnalism anti-corupție',
      'Conexiuni cu organizații internaționale pro-press freedom (NED, USAID adjacent)',
    ],
    fundingSources: [
      'Granturi internaționale (OCCRP, NED, organizații pro-democrație)',
      'Publicitate',
      'Abonamente',
    ],
    editorialLine:
      'Jurnalism de investigație cu focus puternic pe anti-corupție, pro-UE, pro-NATO, anti-extremism. Cea mai explicită poziționare pro-europeană și anti-naționalistă din presa românească.',
    biasRationale:
      'G4Media are o orientare editorială clar de stânga în contextul românesc: puternic anti-naționalist, anti-AUR, critic al PSD, pro-USR, pro-UE, pro-NATO. Finanțarea prin granturi internaționale (organizații pro-democrație americane și europene) consolidează această orientare. Deși jurnalismul în sine este de calitate și factualitate ridicată, framing-ul editorial este explicit partizan în favoarea taberei pro-europene. Aceasta nu este o critică — G4Media este transparent cu privire la valorile sale.',
    controversies: [
      'Finanțare parțială din surse externe (ONG-uri internaționale) — considerată controversată de critica de dreapta',
    ],
    notablePatterns: [
      'Acoperire intensă a extremismului de dreapta',
      'Poziționare clară pro-UE/NATO',
      'Critici consistente la adresa PSD și AUR/SOS',
      'Monitorizare dezinformare',
    ],
    strengths: ['Calitate investigativă', 'Rețea internațională OCCRP', 'Standarde ridicate de verificare'],
    biasScore: -65,
    factualityRationale: 'Factualitate ridicată în ciuda bias-ului editorial puternic.',
    confidence: 'high',
    lastAnalysed: '2026-02-26',
  },

  criticatac: {
    id: 'criticatac',
    currentOwner: 'Colectiv editorial independent',
    fundingSources: ['Donații', 'Autofinanțare colectiv editorial'],
    editorialLine:
      'Publicație de analiză politică și socială de stânga. Critică capitalistă, perspectivă socialistă/social-democrată.',
    biasRationale:
      'CriticAtac este una dintre puținele publicații de stânga autentică din România. Perspectivă anti-capitalism, critică a inegalității sociale, analize din perspectivă marxistă sau social-democrată radicală.',
    biasScore: -80,
    factualityRationale: 'Factualitate mixtă — articolele de opinie pot fi subiective.',
    confidence: 'medium',
    lastAnalysed: '2026-02-26',
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
