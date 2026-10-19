import { chatCompletion } from "@/lib/ai";

/**
 * Senarai Subjek Utama Sains — taksonomi kategori untuk metadata dan
 * kataloging bahan rujukan sains. Kategori 1 "Sains Am" menjadi pilihan
 * lalai apabila tiada kategori lain dapat dipadankan dengan yakin.
 */
export const SUBJECT_CATEGORIES: ReadonlyArray<{ name: string; keywords: string[]; hint: string }> = [
  {
    name: "Sains Am",
    keywords: ["sains umum", "asas sains", "falsafah sains"],
    hint: "hanya untuk karya sains yang benar-benar umum/jalinan merentas bidang",
  },
  {
    name: "Matematik",
    keywords: [
      "matematik", "mathematics", "kalkulus", "calculus", "algebra", "geometri",
      "geometry", "statistik", "statistics", "kebarangkalian", "probability",
      "trigonometri", "persamaan pembezaan", "differential equation", "topologi",
      "pemodelan matematik", "mathematical modeling", "numerik", "nombor teori",
    ],
    hint: "matematik, statistik dan pemodelan matematik",
  },
  {
    name: "Fizik",
    keywords: [
      "fizik", "physics", "optik", "optics", "akustik", "acoustic", "mekanik kuantum",
      "quantum mechanic", "elektromagnet", "electromagnetic", "spektroskopi",
      "spektrometri jisim", "fizik bendalir", "fluid mechanic", "termodinamik",
      "termodinamika", "superkonduktor", "laser", "fotonik", "photonics", "zarah",
      "particle physics", "relativiti",
    ],
    hint: "fizik, optik, mekanik, kuantum",
  },
  {
    name: "Kimia",
    keywords: [
      "kimia", "chemistry", "organik", "inorganik", "kimia polimer", "mangkin",
      "catalyst", "tindak balas", "sintesis kimia", "chemical synthesis", "kromatografi",
      "chromatography", "keseimbangan ion", "elektrokimia", "electrochemistry",
      "kimia makanan", "spektroskopi ftir", "uv-visible", "atomic absorption",
    ],
    hint: "kimia organik/tak organik, tindak balas dan bahan kimia",
  },
  {
    name: "Biologi",
    keywords: [
      "biologi", "biology", "sel", "cell", "molekul biologi", "molecular biology",
      "genetik", "genetics", "mikrobiologi", "microbiology", "fisiologi", "physiology",
      "anatomi", "anatomy", "imunologi", "immunology", "taksonomi", "taxonomy",
      "evolusi", "evolution", "ekologi mikroba", "zoologi", "zoology", "bioassay",
      "sitologi", "histologi", "virologi", "parasitologi", "entomologi",
      "biokimia", "biochemistry", "protein", "peptida", "peptide", "kinase",
      "fosforilasi", "phosphoryl", "enzimologi", "metabolisme", "metabolism",
      "reseptor", "receptor", "transduksi isyarat", "signal transduction",
      "fungsi fisiologi", "stem cell", "sel stem",
    ],
    hint: "kajian benda hidup: sel, mikrobiologi, genetik, fisiologi, biologi molekul",
  },
  {
    name: "Bioteknologi",
    keywords: [
      "bioteknologi", "biotechnology", "enzim", "enzyme", "penapaian", "fermentation",
      "kultur tisu", "tissue culture", "bioreaktor", "bioreactor", "kloning", "cloning",
      "rekombinan", "recombinant", "kejuruteraan genetik", "genetic engineering",
      "bioinformatik", "biosensor", "metabolit sekunder", "mikropropagasi",
      "transformasi gen", "crispr", "fermenter",
    ],
    hint: "aplikasi organisma/enzim/fermentasi dalam teknologi",
  },
  {
    name: "Sains Kesihatan",
    keywords: [
      "kesihatan", "health", "perubatan", "medicine", "farmasi", "pharmacy",
      "farmakologi", "pharmacology", "klinikal", "clinical", "penyakit", "disease",
      "ubat", "drug", "epidemiologi", "epidemiology", "kanser", "cancer", "tumor",
      "dental", "pergigian", "kejururawatan", "nursing", "hospital", "vaksin",
      "vaccine", "terapi", "terapeutik", "toksikologi", "diagnosis", "patologi",
      "bioperubatan", "biomedical", "kesihatan awam", "public health", "antibiotik",
    ],
    hint: "perubatan, farmasi, penyakit, biomarker, bioperubatan, kesihatan awam",
  },
  {
    name: "Sains Makanan",
    keywords: [
      "sains makanan", "food science", "pemakanan", "nutrition", "nutrisi",
      "pemprosesan makanan", "food processing", "kualiti makanan", "food quality",
      "keselamatan makanan", "food safety", "sensorik", "sensory", "diet", "dietari",
      "salmonella makanan", "makanan berfungsi", "functional food", "bakteria makanan",
      "kejuruteraan makanan", "food engineering", "pengekalan makanan", "food preservation",
    ],
    hint: "makanan, pemakanan, pemprosesan dan keselamatan makanan",
  },
  {
    name: "Sains Pertanian",
    keywords: [
      "pertanian", "agricultur", "padi", "paddy", "tanaman", "crop", "sawit",
      "palm oil", "getah", "rubber", "koko", "cocoa", "baja", "fertiliser",
      "hortikultur", "horticulture", "agronomi", "agronomy", "tanah", "soil science",
      "irigasi", "irrigation", "perosak", "pest", "racun perosak", "pesticide",
      "agroforestri", "agroforestry", "ladang", "plantation", "pembiakan tanaman",
      "plant breeding", "kesuburan tanah", "masa simpan", "hasil pertanian",
    ],
    hint: "tanaman, agronomi, sawit, perosak tanaman, tanah ladang",
  },
  {
    name: "Sains Haiwan",
    keywords: [
      "haiwan", "animal", "ternakan", "livestock", "veterinar", "veterinary",
      "lembu", "cattle", "ayam", "poultry", "kambing", "goat", "biri-biri", "sheep",
      "akuakultur", "aquaculture", "pembiakan haiwan", "animal breeding", "makanan haiwan",
      "animal feed", "reproduksi haiwan", "husbandri", "husbandry", "rumen",
      "babi", "swine", "penyakit haiwan", "animal disease",
    ],
    hint: "ternakan, veterinar, akuakultur, pembiakan haiwan",
  },
  {
    name: "Sains Tumbuhan",
    keywords: [
      "tumbuhan", "plant", "botani", "botany", "fisiologi tumbuhan", "plant physiology",
      "fitokimia", "phytochemist", "ubat herba", "herbal", "tumbuh-tumbuhan ubatan",
      "orfkid", "orchid", "pokok hutan", "hutan", "perhutanan", "forestry", "silvikultur",
      "kayu", "timber", "kulat", "fungus", "cendawan", "mushroom", "rumpai", "weed",
      "biji benih", "seed", "percambahan", "germination", "paku-pakis",
    ],
    hint: "botani, tumbuhan ubatan, perhutanan, kulat/cendawan",
  },
  {
    name: "Sains Alam Sekitar",
    keywords: [
      "alam sekitar", "environment", "ekologi", "ecology", "pencemaran", "pollution",
      "sisa", "waste", "kualiti air", "water quality", "kualiti udara", "air quality",
      "biodiversiti", "biodiversity", "penilaian kesan", "environmental impact",
      "pemuliharaan", "conservation", "rawatan air", "wastewater", "pemulihan",
      "remediation", "bencana alam", "ekosistem", "ecosystem", "kepekatan logam berat",
      "bahan cemar", "contaminant", "paya bakau", "wetland",
    ],
    hint: "ekosistem, pencemaran, sisa, kualiti air/udara",
  },
  {
    name: "Sains Bumi & Geologi",
    keywords: [
      "geologi", "geology", "bumi", "mineral", "mineralogi", "seismologi", "seismology",
      "tektonik", "tecton", "karst", "gua", "cave", "geokimia", "geochemistry",
      "sedimen", "sediment", "hidrogeologi", "hidrologi", "hydrology", "air bawah tanah",
      "groundwater", "geofizik", "geophysic", "petroleum", "batuan", "rock", "fosil",
      "fossil", "bahan galian", "kuari", "tanah runtuh", "landslide", "geologi kejuruteraan",
    ],
    hint: "geologi, bumi, mineral, air bawah tanah",
  },
  {
    name: "Sains Marin",
    keywords: [
      "marin", "marine", "laut", "ocean", "karang", "coral", "perikanan", "fisheries",
      "ikan", "fish", "pantai", "coastal", "akuakultur marin", "lumba-lumba", "dugong",
      "plankton", "rumpai laut", "seaweed", "paya bakau", "mangrove", "muara", "estuary",
      "hidupan laut", "stock ikan", "hasil tangkapan", "biodiversiti marin", "lautan",
    ],
    hint: "laut, marin, perikanan, terumbu karang",
  },
  {
    name: "Sains Atmosfera & Iklim",
    keywords: [
      "atmosfera", "atmosphere", "iklim", "climate", "meteorologi", "meteorology",
      "cuaca", "weather", "monsun", "monsoon", "taburan hujan", "rainfall", "ozon",
      "ozone", "gas rumah hijau", "greenhouse", "pemanasan global", "global warming",
      "model iklim", "climate model", "klimatologi", "climatology", "kelembapan",
      "humidit", "angin", "wind", "sinaran suria",
    ],
    hint: "cuaca, iklim, atmosfera, pemanasan global",
  },
  {
    name: "Astronomi & Sains Angkasa",
    keywords: [
      "astronomi", "astronomy", "angkasa", "space", "astrofizik", "astrophysics",
      "satelit", "satellite", "galaksi", "galaxy", "planet", "solar", "bulan", "moon",
      "bintang", "star", "komet", "comet", "penderiaan jauh", "remote sensing",
      "geospatial", "orbit", "teleskop", "telescope", "kosmologi", "cosmology",
      "stesen angkasa", "baindra", "aurora",
    ],
    hint: "astronomi, angkasa lepas, satelit, penderiaan jauh",
  },
  {
    name: "Sains Nuklear",
    keywords: [
      "nuklear", "nuclear", "radiasi", "radiation", "radioisotop", "radioisotope",
      "radioaktif", "radioactiv", "reaktor nuklear", "nuclear reactor", "dosimetri",
      "dosimetry", "radiolisis", "radionuklid", "radioterapi", "anggaran dos",
      "penyinaran", "irradiation", "spektrum gamma", "gamma", "neutron", "fission",
      "fusion",
    ],
    hint: "nuklear, radiasi, radioisotop",
  },
  {
    name: "Sains Tenaga",
    keywords: [
      "tenaga", "energy", "boleh diperbaharui", "renewable", "biofuel", "biogas",
      "biojisim", "biomass", "sel bahan api", "fuel cell", "hidrogen", "hydrogen",
      "suria", "solar", "fotovoltan", "photovoltaic", "angin", "wind energy",
      "kecekapan tenaga", "energy efficiency", "bateri", "battery", "penyimpanan tenaga",
      "energy storage", "kuasa", "electrical power", "grid", "tenaga elektrik",
    ],
    hint: "tenaga, tenaga boleh diperbaharui, bateri, kecekapan tenaga",
  },
  {
    name: "Sains Bahan & Nanoteknologi",
    keywords: [
      "bahan", "material", "nano", "nanoteknologi", "nanotechnology", "polimer",
      "komposit", "composite", "seramik", "ceramic", "semikonduktor", "semiconductor",
      "salutan", "coating", "filem nipis", "thin film", "grafena", "graphene",
      "aloi", "alloy", "kakisan", "corrosion", "bahan bioperubatan", "biomaterial",
      "gentian", "fiber", "sifat mekanikal", "mechanical propert", "kekonduksian",
      "conductivity", "mikrostruktur", "microstructur", "logam", "metal",
    ],
    hint: "bahan, polimer, komposit, nano, sifat bahan",
  },
  {
    name: "Sains Forensik",
    keywords: [
      "forensik", "forensic", "jenayah", "crime", "cap jari", "fingerprint",
      "siasatan tapak", "crime scene", "toksikologi forensik", "analisis dna forensik",
      "forensic dna", "balu", "ballistics", "kesan darah", "bloodstain", "serologi",
      "identifikasi mayat", "kadaver", "antropologi forensik",
    ],
    hint: "sains forensik dan siasatan jenayah",
  },
  {
    name: "Sains Komputer & Teknologi Maklumat",
    keywords: [
      "komputer", "computer", "perisian", "software", "sistem maklumat", "information system",
      "rangkaian", "network", "pangkalan data", "database", "web", "awan", "cloud",
      "keselamatan siber", "cybersecurity", "kriptografi", "cryptography", "multimedia",
      "ict", "teknologi maklumat", "information technology", "pengaturcaraan", "programming",
      "pembelajaran elektronik", "e-learning", "interaksi manusia komputer", "human-computer",
      "pengkomputeran", "computing", "bayaran dalam talian", "mobile app", "sistem pintar",
      "serangan siber", "enkripsi",
    ],
    hint: "komputer, perisian, sistem maklumat, rangkaian, keselamatan siber",
  },
  {
    name: "Kecerdasan Buatan & Sains Data",
    keywords: [
      "kecerdasan buatan", "artificial intelligence", "pembelajaran mesin", "machine learning",
      "pembelajaran mendalam", "deep learning", "rangkaian neural", "neural network",
      "sains data", "data science", "perlombongan data", "data mining", "data besar",
      "big data", "pemprosesan bahasa semula jadi", "natural language", "visi komputer",
      "computer vision", "model ramalan", "predictive model", "tekanan penggunaan data",
      "analitis", "analytics", "data analytics", "fufuzi", "fuzzy logic", "sistem pakar",
      "expert system", "pengubahsuaian imej", "image recognition", "sentimen",
    ],
    hint: "AI, pembelajaran mesin, sains data, visi komputer, NLP",
  },
  {
    name: "Robotik & Automasi",
    keywords: [
      "robot", "robotik", "robotics", "automasi", "automation", "sistem kawalan",
      "control system", "mekatronik", "mechatronics", "penderia", "sensor", "penggerak",
      "actuator", "plc", "scada", "terbenam", "embedded", "internet benda", "internet of things",
      "iot", "lengan robot", "robot arm", "dron", "drone", "kenderaan pandu sendiri",
      "autonomous vehicle", "penglihatan robot", "simulasi kawalan", "proses kawalan",
    ],
    hint: "robotik, automasi, sistem kawalan, IoT",
  },
  {
    name: "Kejuruteraan & Teknologi",
    keywords: [
      "kejuruteraan", "engineering", "kejuruteraan awam", "civil engineering",
      "struktur", "structure", "kejuruteraan elektrik", "electrical engineering",
      "elektronik", "electronics", "kejuruteraan mekanikal", "mechanical engineering",
      "kejuruteraan kimia", "chemical engineering", "pembuatan", "manufacturing",
      "fabrikasi", "fabrication", "pemesinan", "machining", "besava", "bridge",
      "lebuh raya", "highway", "bangunan", "building", "pengairan", "jambatan",
      "kejuruteraan tanah", "geotechnical", "kimpalan", "welding", "pengawalan kualiti",
      "quality control", "industri", "industrial", "penyelenggaraan", "maintenance",
      "loji", "plant", "sistem kuasa", "power system", "akustik kejuruteraan",
    ],
    hint: "kejuruteraan awam/elektrik/mekanikal/kimia, pembuatan",
  },
  {
    name: "Penyelidikan, Sains & Inovasi",
    keywords: [
      "kajian tadbir urus sains", "dasar sains", "science policy", "indikator sains",
      "sistem inovasi", "sistem penyelidikan", "pembiayaan r&d", "pengkomersialan",
      "komersial", "pemindahan teknologi", "harta intelek", "bibliometrik",
      "analisis sitasi", "halatuju sains", "roadmap sains", "budaya sains",
      "literasi sains", "pembangunan sains", "sains untuk masyarakat",
      "governans sains", "science, technology and innovation", "sti indicators",
      "sains terbuka", "open science", "agensi kerajaan", "government agenc",
      "institusi penyelidikan", "research institut", "penerimagunaan teknologi",
      "technology adopt", "faktor penyumbang", "pelaksanaan dasar", "policy implement",
    ],
    hint: "HANYA karya tentang sistem sains itu sendiri: dasar S&T, indikator/inovasi, pengkomersialan, bibliometrik. BUKAN kajian saintifik biasa",
  },
] as const;

/** Nama kategori warisan yang akan digantikan oleh taksonomi subjek. */
export const LEGACY_CATEGORIES = [
  "Sains & Teknologi",
  "Kejuruteraan",
  "Teknologi Maklumat",
  "Perubatan & Kesihatan",
  "Sains Sosial",
  "Umum",
] as const;

export const SUBJECT_CATEGORY_NAMES: readonly string[] = SUBJECT_CATEGORIES.map(
  (c) => c.name
);

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Match a free-text answer (name or number) against the 25 categories. */
export function matchCategory(answer: string): string | null {
  if (!answer) return null;

  const asNumber = parseInt(answer.replace(/\D/g, ""), 10);
  if (!Number.isNaN(asNumber) && asNumber >= 1 && asNumber <= SUBJECT_CATEGORIES.length) {
    return SUBJECT_CATEGORIES[asNumber - 1].name;
  }

  const target = norm(answer);
  if (!target) return null;
  for (const c of SUBJECT_CATEGORIES) {
    if (norm(c.name) === target) return c.name;
  }
  for (const c of SUBJECT_CATEGORIES) {
    const n = norm(c.name);
    if (target.includes(n) || n.includes(target)) return c.name;
  }
  return null;
}

/** Keyword scoring over title/abstract/keywords text, sorted best-first. */
export function heuristicCategoryScores(text: string): Array<{ name: string; score: number }> {
  const haystack = " " + norm(text) + " ";
  const scores: Array<{ name: string; score: number }> = [];
  for (const c of SUBJECT_CATEGORIES) {
    let score = 0;
    for (const kw of c.keywords) {
      const k = norm(kw);
      if (!k || k.length < 4) continue;
      const needle = k.split(" ").length > 1 || k.length >= 8 ? k : ` ${k} `;
      const count = haystack.split(needle).length - 1;
      if (count > 0) score += count;
    }
    scores.push({ name: c.name, score });
  }
  return scores.sort((a, b) => b.score - a.score || norm(a.name).localeCompare(norm(b.name)));
}

/** Keyword scoring fallback over title/abstract/keywords text. */
export function heuristicCategory(text: string): string {
  return heuristicCategoryScores(text)[0]?.name ?? SUBJECT_CATEGORIES[0].name;
}

export function categoryHumanList(): string {
  return SUBJECT_CATEGORIES.map((c, i) => `${i + 1}. ${c.name}${c.hint ? ` — ${c.hint}` : ""}`).join(
    "\n"
  );
}

/** Kategori "perangkap umum" yang hanya dipakai apabila tiada cue bidang kuat. */
const GENERIC_TRAP = new Set([
  "Sains Am",
  "Kejuruteraan & Teknologi",
  "Penyelidikan, Sains & Inovasi",
]);

/**
 * Classify a thesis into one of the Senarai Subjek Utama Sains using the LLM
 * first and the keyword matcher as a fallback. Always returns one of the 25.
 */
export async function classifyBookCategory(
  book: { id: string; title: string; author: string; year: number },
  frontPages: string[],
  keywordText = ""
): Promise<string> {
  const keywords = keywordText.slice(0, 800);
  const front = frontPages
    .map((p, i) => `--- Halaman ${i + 1} ---\n${p.replace(/\s+/g, " ").trim()}`)
    .join("\n\n")
    .slice(0, 4000);

  const hintText = keywords || front ? `${book.title} ${keywords} ${front}` : book.title;
  const ranked = heuristicCategoryScores(hintText);
  const top = ranked.slice(0, 3);
  const anchor =
    top[0] && top[0].score >= 2
      ? `\n(Gambaran awal daripada istilah tajuk/kata kunci: ${top
          .filter((t) => t.score > 0)
          .map((t) => `${t.name} (${t.score})`)
          .join(", ")} — sahkan dengan tajuk, jangan ikut membabi buta.)`
      : "";

  const system =
    "Anda seorang pustakawan di Perpustakaan Digital MOSTI. Klasifikasikan terbitan kepada SATU subjek sahaja daripada senarai yang diberi. Jawab HANYA dengan nombor subjek.\n\n" +
    "PENTING: Subjek 'Penyelidikan, Sains & Inovasi' hanya untuk karya yang mengkaji sistem sains itu sendiri (dasar S&T, indikator, pengkomersialan, penerimaan teknologi, bibliometrik). Subjek 'Kejuruteraan & Teknologi' juga jangan dijadikan pilihan lalai — pilih hanya jika tajuk benar-benar karya kejuruteraan. Jika tajuknya adalah kajian saintifik dalam bidang tertentu (cth. kimia, biologi, perubatan, kejuruteraan awam), pilih subjek bidang tersebut.";
  const user =
    `Tajuk: ${book.title}\n` +
    `Pengarang: ${book.author}\n` +
    `Tahun: ${book.year}\n` +
    (keywords ? `Kata kunci: ${keywords}\n` : "") +
    (front ? `\nTeks dari halaman awal dokumen:\n\n${front}\n\n` : "\n") +
    `Senarai subjek:\n${categoryHumanList()}\n\n` +
    "Pilih nombor subjek yang paling sesuai." +
    anchor;

  let out = "";
  try {
    out = await chatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.1, maxTokens: 20 }
    );
  } catch (err) {
    console.warn("[kategori] percubaan LLM gagal, guna heuristik:", err);
  }
  const llm = matchCategory(out);

  if (llm && !GENERIC_TRAP.has(llm)) return llm;

  const best = ranked[0];
  if (best && best.score >= 2) return best.name;
  if (llm) return llm;
  return best?.name ?? SUBJECT_CATEGORIES[0].name;
}
