import type { Faculty, Thesis } from "@/lib/types";

export const FACULTIES: Faculty[] = [
  "Pendidikan",
  "Kejuruteraan",
  "Sains Sosial",
  "Sains Komputer",
  "Sains Hayat",
  "Ekonomi & Pengurusan",
  "Perubatan",
];

export const UNIVERSITIES = [
  "Universiti Kebangsaan Malaysia",
  "Universiti Malaya",
  "Universiti Putra Malaysia",
  "Universiti Sains Malaysia",
  "Universiti Teknologi Malaysia",
  "Universiti Utara Malaysia",
  "Universiti Islam Antarabangsa Malaysia",
  "Universiti Malaysia Pahang",
  "Universiti Malaysia Perlis",
  "Universiti Malaysia Sarawak",
  "Universiti Teknologi MARA",
  "Universiti Tun Hussein Onn Malaysia",
];

export const AUTHORS = [
  "Nurul Ain Zulkifli",
  "Mohd Haziq Rahman",
  "Farah Adilah Hassan",
  "Amirul Danish Osman",
  "Siti Rohana Yaakob",
  "Chong Wei Ling",
  "Lim Jun Wei",
  "Dr. Nadia Iskandar",
  "Ahmad Faiz Arifin",
  "Puteri Balqis Azman",
  "Tan Wei Jie",
  "Nurul Huda Mat Isa",
  "Marcus Gabriel Anak Tingang",
  "Hana Selina Jones",
  "Ridzuan Kamaruddin",
  "Kavitha a/p Sivanathan",
];

const CALL_PREFIX: Record<Faculty, string> = {
  Pendidikan: "PD",
  Kejuruteraan: "KJ",
  "Sains Sosial": "SS",
  "Sains Komputer": "SK",
  "Sains Hayat": "SH",
  "Ekonomi & Pengurusan": "EK",
  Perubatan: "PB",
};

type Seed = { title: string; abstract: string; keywords: string[] };

const SEEDS: Record<Faculty, Seed[]> = {
  Pendidikan: [
    {
      title:
        "Kesan Pembelajaran Teradun Terhadap Pencapaian Akademik Pelajar Tingkatan Empat",
      abstract:
        "Kajian ini meninjau kesan pendekatan pembelajaran teradun terhadap pencapaian akademik pelajar Tingkatan Empat di dua buah sekolah menengah di Selangor. Menggunakan reka bentuk kuasi-eksperimen, seramai 214 pelajar terlibat sepanjang satu semester. Dapatan menunjukkan peningkatan signifikan dalam pencapaian ujian bagi kumpulan rawatan berbanding kumpulan kawalan, terutamanya dalam domain pemahaman konseptual.",
      keywords: ["pembelajaran teradun", "pencapaian akademik", "kuasi-eksperimen", "pendidikan menengah"],
    },
    {
      title: "Kepimpinan Instruksional Guru Besar dan Hubungannya dengan Komitmen Guru Sekolah Rendah",
      abstract:
        "Mengkaji hubungan antara kepimpinan instruksional guru besar dengan komitmen guru di 32 sekolah rendah negeri Johor. Data yang dikumpul daripada 480 responden melalui soal selidik dianalisis menggunakan Model Persamaan Struktur. Kepimpinan instruksional didapati menjadi peramal signifikan komitmen afektif dan normatif guru.",
      keywords: ["kepimpinan instruksional", "komitmen guru", "sekolah rendah", "model persamaan struktur"],
    },
    {
      title: "Penggunaan Gamifikasi dalam Pengajaran Matematik Tambahan: Persepsi dan Impak",
      abstract:
        "Kajian tindakan ini menilai penggunaan element gamifikasi dalam pengajaran Matematik Tambahan bagi 96 pelajar tingkatan lima. Peningkatan min skor motivasi dan pencapaian ujian pasca didapati signifikan selepas enam minggu intervensi. Fokus perbincangan diberi kepada reka bentuk aktiviti permainan yang menyokong penguasaan konsep.",
      keywords: ["gamifikasi", "motivasi pembelajaran", "matematik tambahan", "kajian tindakan"],
    },
    {
      title: "Kesejahteraan Psikologi Guru Baharu di Kawasan Luar Bandar Sabah",
      abstract:
        "Kajian kualitatif ini meneroka pengalaman serta strategi daya tindak 15 guru baharu yang berkhidmat di sekolah luar bandar Sabah. Tema utama yang dikenal pasti termasuk cabaran kekangan sumber, ketahanan emosi, dan sokongan komuniti setempat. Cadangan penambahbaikan program mentor-mentee diketengahkan untuk institusi pendidikan guru.",
      keywords: ["kesejahteraan psikologi", "guru baharu", "pendidikan luar bandar", "kajian kualitatif"],
    },
    {
      title: "Literasi Digital dalam Kalangan Murid Sekolah Menengah Kebangsaan Agama",
      abstract:
        "Mengukur tahap literasi digital dan peramalnya dalam kalangan 520 murid dari lapan sekolah menengah kebangsaan agama. Analisis regresi menunjukkan akses peranti, sokongan keluarga dan efikasi kendiri digital menyumbang 47% varians. Implikasi kepada kurikulum pendidikan digital di sekolah dicadangkan.",
      keywords: ["literasi digital", "efikasi kendiri", "sekolah agama", "regresi"],
    },
    {
      title: "Pembelajaran Berasaskan Projek Rentas Kurikulum dalam Pendidikan STEM",
      abstract:
        "Kajian eksperimen ini menguji kesan pembelajaran berasaskan projek rentas kurikulum terhadap kemahiran pemikiran aras tinggi pelajar STEM. 180 pelajar terlibat dalam projek kejuruteraan ringkas selama sepuluh minggu. Hasil menunjukkan peningkatan signifikan dalam kemahiran menyelesaikan masalah dan komunikasi saintifik.",
      keywords: ["PBL", "STEM", "kemahiran berfikir aras tinggi", "eksperimen"],
    },
    {
      title: "Pengaruh Kemahiran Pengurusan Bilik Darjah terhadap Penglibatan Pelajar dalam Talian",
      abstract:
        "Meneliti hubungan kemahiran pengurusan bilik darjah digital guru dengan penglibatan pelajar semasa pembelajaran dalam talian pasca-pandemik. Data 310 guru dikumpul melalui tinjauan dalam talian dan dianalisis secara korelasi. Kejelasan rutin dan maklum balas segera dikenal pasti sebagai amalan paling berpengaruh.",
      keywords: ["pengurusan bilik darjah", "penglibatan pelajar", "pembelajaran dalam talian", "tinjauan"],
    },
    {
      title: "Efikasi Kendiri Guru dan Keberkesanan Pentaksiran Autentik di Sekolah Vokasional",
      abstract:
        "Kajian ini mengkaji tahap efikasi kendiri guru vokasional dalam melaksanakan pentaksiran autentik serta peramalnya. 220 guru dari kolej vokasional seluruh semenanjung terlibat dalam kajian ini. Latihan pensijilan dan pengalaman industri menunjukkan sumbangan paling besar terhadap efikasi pentaksiran guru.",
      keywords: ["efikasi kendiri", "pentaksiran autentik", "pendidikan vokasional", "guru"],
    },
  ],
  Kejuruteraan: [
    {
      title: "Sifat Mekanikal Komposit Gentian Kenaf untuk Aplikasi Bahagian Dalaman Automotif",
      abstract:
        "Tesis ini menyiasat sifat tegangan, lenturan dan hentaman komposit gentian kenaf-polipropilena sebagai alternatif mesra alam kepada gentian kaca dalam komponen dalaman kenderaan. Keputusan ujian menunjukkan nisbah kekuatan-berat yang setanding pada kandungan gentian 30%, dengan potensi pengurangan kos bahan sebanyak 18% berbanding komposit konvensional.",
      keywords: ["komposit", "gentian kenaf", "kejuruteraan automotif", "bahan mesra alam"],
    },
    {
      title: "Pemodelan Dinamik Turbin Angin Paksi Menegak untuk Kawasan Cerun",
      abstract:
        "Membangunkan model dinamik turbin angin paksi menegak yang dioptimumkan untuk kawasan cerun berangin di Malaysia. Simulasi CFD dan ujian terowong angin berskala digunakan untuk mengkaji kesan penyusunan bilah dan sudut serang. Penggandaan pekali kuasa sehingga 12% berbanding reka bentuk konvensional direkodkan.",
      keywords: ["turbin angin", "CFD", "tenaga boleh diperbaharui", "aerodinamik"],
    },
    {
      title: "Sistem Penggera Awal Banjir Berasaskan IoT dan LoRa untuk Komuniti Pinggir Sungai",
      abstract:
        "Kajian ini mereka bentuk sistem penggera awal banjir berasaskan sensor IoT dan komunikasi LoRa untuk perkampungan pinggir sungai. Sistem dengan jejaring sensor yang menjana data aras air secara masa nyata berjaya memberi amaran 45 minit lebih awal. Kebolehpercayaan transmisi melebihi 98% pada jarak 3 km dicatatkan.",
      keywords: ["IoT", "LoRa", "penggera banjir", "sistem pengesanan"],
    },
    {
      title: "Prestasi Termal Sistem Penyejukan Adsorpsi Tenaga Suria untuk Bangunan Hijau",
      abstract:
        "Menilai prestasi termal dan ketumpatan tenaga sistem penyejukan adsorpsi tenaga suria berskala bangunan. Prototaip dengan pengumpul suria plat rata dan penjerap silika gel diuji sepanjang musim kering. COP purata 0.42 dicapai bersama penjimatan tenaga pengendalian sehingga 38%.",
      keywords: ["penyejukan adsorpsi", "tenaga suria", "bangunan hijau", "kecekapan tenaga"],
    },
    {
      title: "Pengoptimuman Proses Kimpalan Geseran-kacau Aloi Aluminium 6061",
      abstract:
        "Kajian eksperimen ini mengoptimumkan parameter kimpalan geseran-kacau bagi aloi aluminium 6061 menggunakan kaedah permukaan tindak balas. Parameter halaju putaran, halaju suapan dan sudut pin dikaji terhadap kekuatan sambungan. Keadaan optimum yang diperoleh meningkatkan kekuatan tegangan sehingga 15% berbanding jasad asal.",
      keywords: ["kimpalan geseran-kacau", "aluminium 6061", "RSM", "pengoptimuman proses"],
    },
    {
      title: "Penggunaan Sisa Buangan Pertanian sebagai Agregat Ringan dalam Konkrit PRISMA",
      abstract:
        "Menyelidik kebolehlaksanaan menggunakan sekam padi dan tempurung kelapa sebagai agregat ringan dalam konkrit kekuatan normal. Konkrit yang dihasilkan mencatat kekuatan mampatan 28 hari sehingga 28 MPa dengan pengurangan ketumpatan 20%. Penemuan menyokong pembangunan bahan binaan mampan tempatan.",
      keywords: ["agregat ringan", "konkrit hijau", "sisa pertanian", "bahan mampan"],
    },
    {
      title: "Perancangan Laluan Robot Autonomi untuk Penyusunan Gudang menggunakan Algoritma A* Hibrid",
      abstract:
        "Kajian ini membangunkan algoritma perancangan laluan A* hibrid dengan pengelakan halangan dinamik untuk robot gudang autonomi. Pengujian simulas berbanding algoritma sedia ada menunjukkan pengurangan masa penyusunan sebanyak 23%. Pelaksanaan pada robot fizikal berskala kecil mengesahkan kebolehlaksanaan sistem.",
      keywords: ["robot autonomi", "perancangan laluan", "algoritma A*", "automasi gudang"],
    },
    {
      title: "Penilaian Kebolehkitaran Semula Komposit Polimer Ditambah Nanobentonit",
      abstract:
        "Menilai prestasi mekanikal komposit polimer dengan nanobentonit selepas tiga kitaran kitar semula. Penurunan sifat mekanikal kekal di bawah 9% selepas kitar semula, menunjukkan daya tahan yang baik bagi aplikasi automotif sekunder. Kajian ini turut menilai aspek kos dan impak alam sekitar kitar semula.",
      keywords: ["polimer komposit", "nanobentonit", "kitar semula", "prestasi mekanikal"],
    },
  ],
  "Sains Sosial": [
    {
      title: "Peranan Media Sosial dalam Pembentukan Identiti Sosial Belia Bandar",
      abstract:
        "Menggunakan kaedah kualitatif temu bual mendalam terhadap 24 responden berusia 18-25 tahun, kajian ini meneroka bagaimana platform media sosial membentuk semula konsep identiti sosial belia bandar di Pulau Pinang. Tema utama yang muncul termasuk tekanan perbandingan sosial, pembentukan identiti berlapis, dan peranan komuniti maya dalam sokongan emosi.",
      keywords: ["media sosial", "identiti sosial", "belia", "kajian kualitatif"],
    },
    {
      title: "Amalan Tadbir Urus Komuniti di Kawasan Perumahan Kos Rendah Lembah Klang",
      abstract:
        "Menganalisis amalan tadbir urus komuniti dalam tiga kawasan perumahan kos rendah di Lembah Klang. Kajian kes menggunakan pemerhatian, temu bual dan analisis dokumen turut melibatkan jawatankuasa penduduk serta pihak berkuasa tempatan. Ketelusan dan penyertaan penduduk dikenal pasti sebagai teras kejayaan tadbir urus komuniti.",
      keywords: ["tadbir urus komuniti", "perumahan kos rendah", "kajian kes", "penyertaan penduduk"],
    },
    {
      title: "Representasi Wanita dalam Ruang Publik Politik Malaysia Pasca 2018",
      abstract:
        "Kajian ini mengkaji representasi dan partisipasi wanita dalam politik Malaysia selepas perubahan politik 2018. Analisis kandungan media dan temu bual dengan lima ahli politik wanita digunakan. Halangan struktur dan budaya yang mengekang keterlibatan wanita dalam ruang publik turut dibincangkan.",
      keywords: ["representasi wanita", "politik Malaysia", "analisis media", "gender"],
    },
    {
      title: "Transformasi Ekonomi Desa melalui Industri Kreatif: Kajian Komuniti Anak Muda",
      abstract:
        "Meneroka bagaimana industri kreatif desa membantu transformasi ekonomi komuniti anak muda di tiga daerah luar bandar. Kajian mengadaptasi pendekatan etnografi dengan 18 informan utama. Kejayaan dipacu oleh kombinasi modal sosial tempatan, platform digital dan dominasi inovasi mikro.",
      keywords: ["industri kreatif", "ekonomi desa", "etnografi", "anak muda"],
    },
    {
      title: "Kesedaran dan Amalan Pengasingan Sisa Pepejal dalam Kalangan Isi Rumah Bandar",
      abstract:
        "Mengkaji tahap kesedaran dan amalan pengasingan sisa pepejal isi rumah di daerah Kota Bharu. Data 400 responden menunjukkan jurang signifikan antara kesedaran tinggi dan amalan rendah. Insentif kewangan dan kemudahan infrastruktur dikenal pasti sebagai faktor penggalak paling berkesan.",
      keywords: ["pengasingan sisa", "amalan isi rumah", "kesedaran alam sekitar", "sisa pepejal"],
    },
    {
      title: "Diskriminasi Harga dalam Industri Perkhidmatan: Persepsi Pengguna Muslim",
      abstract:
        "Menganalisis persepsi pengguna Muslim terhadap amalan diskriminasi harga dalam industri perkhidmatan di Malaysia. Melalui eksperimen vignette terhadap 340 responden, bentuk-bentuk diskriminasi harga yang dianggap tidak adil dikenal pasti. Kajian ini menyumbang kepada perbincangan etika perniagaan dan ekonomi Islam.",
      keywords: ["diskriminasi harga", "persepsi pengguna", "etika perniagaan", "ekonomi Islam"],
    },
    {
      title: "Migrasi Tenaga Kerja Asing dan Implikasi Sosial di Negeri Perak",
      abstract:
        "Meneliti corak migrasi tenaga kerja asing dan implikasi sosialnya terhadap masyarakat tempatan di tiga daerah Perak. Gabungan data sekunder dan temu bual dengan majikan, penduduk serta buruh digunakan. Cadangan dasar penggabungan sosial dan perlindungan buruh diketengahkan.",
      keywords: ["migrasi buruh", "tenaga kerja asing", "dasar sosial", "komuniti tempatan"],
    },
    {
      title: "Ingatan Sosial Generasi Muda terhadap Peristiwa Sejarah Negara",
      abstract:
        "Menyiasat cara generasi muda Malaysia mengingati dan memahami peristiwa sejarah negara melalui lensa teori ingatan sosial. Sesi perbincangan kumpulan terfokus dijalankan terhadap 48 pelajar universiti. Hasil menunjukkan sejarah yang dipersembahkan melalui media sosial membentuk pemahaman yang selektif dan beremosi.",
      keywords: ["ingatan sosial", "sejarah negara", "generasi muda", "focus group"],
    },
  ],
  "Sains Komputer": [
    {
      title: "Pembangunan Sistem Pengesanan Penyakit Daun Padi Menggunakan Rangkaian Neural Konvolusi",
      abstract:
        "Kajian ini membangunkan model CNN untuk mengesan dan mengklasifikasikan empat jenis penyakit daun padi daripada imej lapangan. Model yang dilatih menggunakan set data 8,600 imej mencapai ketepatan 96.2% pada set ujian, dengan masa inferens purata 0.4 saat setiap imej, sesuai untuk pelaksanaan pada peranti mudah alih ladang.",
      keywords: ["rangkaian neural konvolusi", "pertanian pintar", "pengesanan penyakit", "pembelajaran mesin"],
    },
    {
      title: "Chatbot Berasaskan Transformer untuk Soal Jawab Korporat Berbahasa Melayu",
      abstract:
        "Membangunkan chatbot soal jawab Bahasa Melayu berasaskan seni bina transformer untuk pusat perkhidmatan korporat. Dataset sebenar interaksi pelanggan digunakan untuk latihan dan penilaian. Ketepatan jawapan mencapai 84% dengan pengurangan masa respons 40% berbanding pengecaman soalan lazim.",
      keywords: ["chatbot", "transformer", "NLU", "Bahasa Melayu"],
    },
    {
      title: "Segmentasi Objek Masa Nyata Menggunakan YOLO untuk Peranti Tepi Berkuasa Rendah",
      abstract:
        "Kajian ini menyesuaikan seni bina YOLO untuk segmentasi objek dalam persekitaran rakaman keselamatan tepi laut. Model seberat 8 MB yang dioptimumkan dengan kuantisasi INT8 mencapai mAP 67% pada peranti bersumber rendah. Pelaksanaan dilaporkan sesuai untuk sistem pemantauan masa nyata.",
      keywords: ["YOLO", "segmentasi objek", "penglihatan komputer", "peranti tepi"],
    },
    {
      title: "Privasi Data dalam Sistem Rekod Kesihatan Elektronik menggunakan Blockchain",
      abstract:
        "Menilai pelaksanaan teknologi blockchain untuk memastikan privasi dan audit kebolehkesanan data rekod kesihatan elektronik. Prototaip rangka kerja hibrid off-chain on-chain dibangunkan dan diuji. Latensi transaksi konsisten di bawah 1.2 saat dengan kebolehskalaan sehingga 10,000 transaksi seminit.",
      keywords: ["blockchain", "rekod kesihatan elektronik", "privasi data", "kebolehkesanan"],
    },
    {
      title: "Pengesan Anomali Kewangan Menggunakan Pembelajaran Mesin Tak Terlibat",
      abstract:
        "Mengkaji penggunaan pembelajaran mesin tak terlibat untuk mengesan anomali transaksi dalam sistem kewangan institusi. Teknik pengasingan hutan dan autoenkoder digabungkan dalam rangka kerja berperingkat. Kadar pengesanan anomali sebenar mencapai 91% dengan kadar amaran palsu rendah.",
      keywords: ["pengesanan anomali", "pembelajaran tak terlibat", "keselamatan kewangan", "autoenkoder"],
    },
    {
      title: "Peningkatan Kualiti Imej Jauh Sinar X Menggunakan Super Resolution",
      abstract:
        "Mengaplikasikan rangkaian super resolution kepada imej sinar X bagi membantu diagnostik jarak jauh di kemudahan kesihatan luar bandar. Menggunakan seni bina EDSR yang dilatih pada dataset perubatan tempatan. Peningkatan perincian struktur mencapai PSNR 38.4 dB dengan kos pengiraan sederhana.",
      keywords: ["super resolution", "imej perubatan", "penglihatan komputer", "diagnostik"],
    },
    {
      title: "Simulasi Penyebaran Wabak menggunakan Model Ejen untuk Kawalan Kesihatan",
      abstract:
        "Membangunkan model simulasi berasaskan agen untuk mengkaji strategi kawalan penyebaran wabak dalam komuniti bandar. Simulasi dengan parameter demografi dan mobiliti tempatan dilaksanakan pada skala 500,000 agen. Campur tangan pengasingan dan pemvaksinan berperingkat menunjukkan kesan pengurangan puncak paling ketara.",
      keywords: ["simulasi agen", "model wabak", "epidemiologi", "kesihatan awam"],
    },
    {
      title: "Analisis Sentimen Tweet Mengenai Polisi Pendidikan menggunakan Model Multibahasa",
      abstract:
        "Menganalisis sentimen awam terhadap polisi pendidikan melalui 85,000 tweet dalam Bahasa Melayu, Inggeris dan Mandarin. Model multibahasa yang difine-tune mencapai F1 0.89 berbanding basline monolingual. Dinamik sentimen berubah mengikut peristiwa utama dan media bekas turut dibincangkan.",
      keywords: ["analisis sentimen", "NLU", "polisi pendidikan", "media sosial"],
    },
  ],
  "Sains Hayat": [
    {
      title: "Kajian Etnobotani Tumbuhan Ubatan Tradisional Masyarakat Orang Asli di Pahang",
      abstract:
        "Kajian etnobotani ini mendokumentasikan 47 spesies tumbuhan ubatan yang digunakan oleh komuniti Orang Asli Semai di daerah Cameron Highlands, Pahang, berserta kaedah penyediaan dan kegunaan tradisional bagi setiap spesies. Penemuan turut merangkumi cadangan pemuliharaan bagi lima spesies yang dikenal pasti berisiko pupus akibat pembangunan tanah.",
      keywords: ["etnobotani", "tumbuhan ubatan", "Orang Asli", "pemuliharaan biodiversiti"],
    },
    {
      title: "Kepelbagaian Mikrob Endofit Mangrove Pesisir Selangor dan Potensi Bioaktifnya",
      abstract:
        "Mengkaji kepelbagaian mikroorganisma endofit daripada empat spesies mangrove di pesisir Selangor. Sebanyak 132 isolat berjaya dipencilkan dengan 18 strain menunjukkan aktiviti antimikrob terhadap patogen terpilih. Analisis filogenetik mengesahkan kehadiran genus baharu yang berpotensi sebagai sumber metabolit sekunder.",
      keywords: ["mikrob endofit", "mangrove", "biodiversiti", "bioaktif"],
    },
    {
      title: "Kesan Pencemaran Mikroplastik terhadap Komuniti Bentos Sungai Perlis",
      abstract:
        "Menilai kepekatan mikroplastik dan kesannya terhadap komuniti bentos di lima stesen Sungai Perlis. Kepekatan tertinggi dikesan di kawasan muara dengan polimer utama polipropilena dan polietilena. Kelimpahan dan kepelbagaian komuniti bentos menunjukkan korelasi negatif signifikan dengan kepekatan mikroplastik.",
      keywords: ["mikroplastik", "bentos", "pencemaran sungai", "biomonitoring"],
    },
    {
      title: "Fermentasi Sisa Tumpi Isi Sawit untuk Pengeluaran Protein Mikrob",
      abstract:
        "Kajian ini menilai kebolehlaksanaan penggunaan sisa tumpi isi sawit sebagai medium fermentasi bagi pengeluaran protein mikrobial. Pencirian parameter suhu, pH dan masa fermentasi dijalankan menggunakan reka bentuk faktorial. Kandungan protein hasil fermentasi mencapai 32% sekali gus menawarkan laluan kitar semula sisa agro.",
      keywords: ["bioteknologi", "fermentasi", "protein mikrob", "sisa sawit"],
    },
    {
      title: "Pemetaan Rizab Karbon Hutan Paya Laut Merbok menggunakan Penderiaan Jauh",
      abstract:
        "Menganggarkan rizab karbon dan dinamiknya dalam ekosistem hutan paya laut Merbok menggunakan imej satelit dan data lapangan. Estimasi karbon atas tanah sepadan dengan kit pengukuran sedia ada dalam lingkungan 12% ketepatan. Kajian mendedahkan kadar pengurangan karbon 3.4% setahun akibat aktiviti pembangunan.",
      keywords: ["penderiaan jauh", "karbon hutan", "paya laut", "GIS"],
    },
    {
      title: "Keupayaan Fitoremediasi Keladi Bunting untuk Rawatan Air Sisa Pertanian",
      abstract:
        "Menilai keupayaan keladi bunting dalam merawat air sisa ladang ternakan daripada nutrien nitrogen dan fosforus. Eksperimen proto-skala menunjukkan pengurangan beban nutrien sehingga 86% dalam tempoh 14 hari. Kesan saling tindak sampingan terhadap kepekatan oksigen terlarut dan pH turut dikaji.",
      keywords: ["fitoremediasi", "air sisa", "keladi bunting", "rawatan alam sekitar"],
    },
    {
      title: "Diversiti Genetik Ikan Haruan menggunakan Penanda Mitochondrial",
      abstract:
        "Menganalisis diversiti genetik ikan haruan di populasi Semenanjung Malaysia menggunakan penanda DNA mitokondria. Sebanyak 14 haplotip dikenal pasti dengan diversiti haplotip keseluruhan 0.87. Struktur populasi yang tersusun mengikut koridor sungai menunjukkan implikasi penting bagi pengurusan perikanan.",
      keywords: ["genetik", "DNA mitokondria", "ikan haruan", "perikanan"],
    },
    {
      title: "Kesan Suhu Tinggi Terhadap Fisiologi Tanaman Padi Varieti Tempatan",
      abstract:
        "Kajian rumah hijau ini mengkaji kesan tekanan suhu tinggi terhadap fisiologi dan hasil tiga varieti padi tempatan. Pengurangan kadar fotosintesis dan keberkesanan pengunaan air direkodkan pada suhu 40°C. Varieti berpotensi toleran haba dikenal pasti untuk pemilihan baka tahan iklim panas.",
      keywords: ["tekanan haba", "fisiologi tanaman", "padi", "perubahan iklim"],
    },
  ],
  "Ekonomi & Pengurusan": [
    {
      title: "Impak Dasar Fiskal Terhadap Pertumbuhan Industri Kecil dan Sederhana Pasca-Pandemik",
      abstract:
        "Menganalisis data panel 320 IKS di rantau utara Semenanjung, tesis ini menilai keberkesanan pakej rangsangan fiskal 2021-2022 terhadap kelangsungan dan pertumbuhan perniagaan kecil. Dapatan menunjukkan kesan positif ketara bagi geran mikro berbanding pinjaman bercagar, terutamanya dalam sektor perkhidmatan dan peruncitan.",
      keywords: ["dasar fiskal", "IKS", "pemulihan ekonomi", "kajian panel"],
    },
    {
      title: "Faktor Penentu Kejayaan Usahawan Digital Bumiputera dalam Perniagaan Dropship",
      abstract:
        "Mengkaji faktor penentu kejayaan usahawan digital Bumiputera dalam perniagaan dropship e-dagang. Kajian soal selidik terhadap 380 usahawan dianalisis menggunakan PLS-SEM. Kemahiran pemasaran digital dan modal sosial didapati menyumbang signifikan kepada prestasi perniagaan.",
      keywords: ["usahawan digital", "dropship", "e-dagang", "PLS-SEM"],
    },
    {
      title: "Kesediaan Bank untuk Pembiayaan Hijau kepada Projek Pelaburan Tenaga Boleh Diperbaharui",
      abstract:
        "Menilai kesediaan institusi kewangan Malaysia menyediakan pembiayaan hijau kepada projek tenaga boleh diperbaharui. Temu bual dengan 12 pegawai risiko dan pembiayaan dijalankan. Kerangka penilaian risiko alam sekitar dan insentif kerajaan didapati menjadi peramal utama pelaksanaan pembiayaan hijau.",
      keywords: ["pembiayaan hijau", "kewangan Islam", "tenaga boleh diperbaharui", "kajian kualitatif"],
    },
    {
      title: "Kesan Pemindahan Teknologi terhadap Produktiviti Syarikat Pembuatan Perabot",
      abstract:
        "Menganalisis kesan mekanisme pemindahan teknologi terhadap produktiviti syarikat pembuatan perabot di Muar. Data panel 28 firma selama enam tahun digunakan. Perolehan mesin CNC dan kerjasama R&D universiti menunjukkan sumbangan produktiviti paling besar.",
      keywords: ["pemindahan teknologi", "produktiviti", "industri perabot", "panel data"],
    },
    {
      title: "Kepuasan Kerja dan Niat Turnover dalam Industri Perhotelan Pasca Pandemik",
      abstract:
        "Menilai hubungan kepuasan kerja, penglibatan pekerja dan niat pusingan ganti dalam industri perhotelan. Kaji selidik terhadap 460 kakitangan hotel di Kuala Lumpur dijalankan selepas pembukaan semula sempadan. Faktor sokongan penyeliaan didapati pengantara hubungan beban kerja dengan niat berhenti.",
      keywords: ["kepuasan kerja", "turnover", "perhotelan", "penglibatan pekerja"],
    },
    {
      title: "Dinamik Pasaran Padi dan Keselamatan Makanan Nasional",
      abstract:
        "Mengkaji dinamik pasaran padi tempatan dan implikasinya terhadap keselamatan makanan nasional menggunakan model harga positif. Analisis siri masa 20 tahun data harga dan pengeluaran digunakan. Hasil menunjukkan keperluan dasar harga lantai yang berimbang untuk kesejahteraan pesawah dan pengguna.",
      keywords: ["ekonomi pertanian", "pasaran padi", "keselamatan makanan", "siri masa"],
    },
    {
      title: "Keberkesanan Insentif Cukai Digitalisasi terhadap PKS di Negeri Sembilan",
      abstract:
        "Menilai keberkesanan insentif cukai digitalisasi terhadap penerimaan teknologi dalam kalangan PKS di Negeri Sembilan. Perbandingan kumpulan rawatan dan kawalan menunjukkan kumpulan penerima insentif mencatat peningkatan 21% dalam penggunaan sistem digital. Kos dan keupayaan pekerja didapati halangan penyertaan utama.",
      keywords: ["insentif cukai", "digitalisasi PKS", "dasar awam", "penilaian impak"],
    },
    {
      title: "Pengaruh Kualiti Perkhidmatan Aplikasi Pembayaran terhadap Kesetiaan Pengguna",
      abstract:
        "Menganalisis pengaruh kualiti perkhidmatan, keselamatan dan kemudahan penggunaan aplikasi pembayaran digital terhadap kesetiaan pengguna. Sebanyak 500 pengguna aplikasi pembayaran aktif menjadi responden kajian. Keselamatan dan privasi muncul sebagai peramal terkuat kesetiaan melangkaui kualiti fungsi.",
      keywords: ["pembayaran digital", "kesetiaan pengguna", "kualiti perkhidmatan", "fintech"],
    },
  ],
  Perubatan: [
    {
      title: "Kesan Terapi Muzik Terhadap Tahap Kebimbangan Pesakit Pra-Pembedahan",
      abstract:
        "Ujian klinikal rawak terkawal ini menilai kesan sesi terapi muzik 20 minit terhadap tahap kebimbangan 90 pesakit sebelum menjalani pembedahan elektif di sebuah hospital pendidikan. Kumpulan yang menerima terapi muzik mencatatkan penurunan skor kebimbangan yang signifikan secara statistik berbanding kumpulan kawalan, dengan kesan lebih ketara dalam kalangan pesakit wanita.",
      keywords: ["terapi muzik", "kebimbangan pra-pembedahan", "ujian klinikal rawak", "kesihatan mental"],
    },
    {
      title: "Prevalens dan Faktor Risiko Diabetes Jenis 2 di Komuniti Persisiran Terengganu",
      abstract:
        "Kajian keratan rentas ini menilai prevalens dan faktor risiko diabetes jenis 2 dalam kalangan 1,250 orang dewasa komuniti persisiran Terengganu. Prevalens keseluruhan 18.7% dikesan dengan hubungan signifikan terhadap indeks jisim badan dan sejarah keluarga. Penemuan menyokong program saringan masyarakat yang disasarkan.",
      keywords: ["diabetes", "epidemiologi", "keratan rentas", "saringan kesihatan"],
    },
    {
      title: "Keberkesanan Protokol Fisioterapi Digital untuk Rehabilitasi Pasca Strok",
      abstract:
        "Menilai keberkesanan protokol fisioterapi digital tanpa kehadiran dalam rehab pasca strok ringan. Pesakit dalam kumpulan digital menunjukkan peningkatan skor fungsi yang setara dengan kumpulan konvensional pada 12 minggu. Keterlibatan harian yang tinggi direkodkan dengan kos rawatan lebih rendah.",
      keywords: ["fisioterapi digital", "strok", "rehabilitasi", "telekesihatan"],
    },
    {
      title: "Corak Penggunaan Antibiotik Secara Sendiri di Kawasan Bandar Alor Setar",
      abstract:
        "Mengkaji corak dan faktor berkaitan penggunaan antibiotik tanpa preskripsi dalam kalangan penduduk Alor Setar. Daripada 640 responden, 27% mengakui pernah menggunakan antibiotik secara sendiri. Faktor pendapatan dan kepercayaan terhadap resistensi antibiotik didapati berkait dengan amalan ini.",
      keywords: ["resistensi antibiotik", "amalan kesihatan", "kajian komuniti", "penggunaan ubat"],
    },
    {
      title: "Analisis Biomarker Radang pada Pesakit Penyakit Gusi dan Penyakit Kardiovaskular",
      abstract:
        "Menganalisis kaitan biomarker radang sistemik pada pesakit periodontitis dengan penanda risiko kardiovaskular. Sample darah dan pemeriksaan klinikal diambil daripada 96 pesakit. Tahap CRP dan IL-6 yang tinggi dilihat seiring dengan kesihatan periodontal yang buruk.",
      keywords: ["periodontitis", "biomarker", "kardiovaskular", "imunologi"],
    },
    {
      title: "Kepuasan Pesakit terhadap Perkhidmatan Pergigian di Klinik Kesihatan Luar Bandar",
      abstract:
        "Menilai tahap kepuasan pesakit terhadap perkhidmatan pergigian di klinik kesihatan luar bandar Pahang. Tinjauan 420 pesakit menunjukkan dimensi kemudahan capaian dan komunikasi jururawat sebagai penggerak utama kepuasan. Cadangan pengurangan masa menunggu turut diketengahkan.",
      keywords: ["kepuasan pesakit", "kesihatan luar bandar", "kualiti perkhidmatan", "kaji selidik"],
    },
    {
      title: "Tahap Kemurungan, Kebimbangan dan Stres dalam Kalangan Doktor Kontrak Sektor Awam",
      abstract:
        "Mengukur prevalens kemurungan, kebimbangan dan stres dalam kalangan doktor projek Covid di hospital kerajaan. Menggunakan skala DASS-21, 22% responden dikategorikan mengalami tekanan psikologi sederhana hingga teruk. Beban kerja dan ketidakseimbangan masa rehat dikenal pasti sebagai peramal utama kesejahteraan.",
      keywords: ["kesihatan mental", "doktor projek", "DASS-21", "beban kerja"],
    },
    {
      title: "Kejituan Skrin Kecerdasan Digital untuk Pengesanan Awal Demensia dalam Bahasa Melayu",
      abstract:
        "Menilai kejituan versi Bahasa Melayu skrin kecerdasan digital untuk pengesanan awal demensia dalam klinik geriatrik awam. Skrin ini menjalani validasi silang terhadap penilaian klinikal rujukan. Sensitiviti 87% dan spesifisiti 82% dicapai dengan kekurangan bias budaya yang minimum.",
      keywords: ["demensia", "penilaian kognitif", "alat saringan", "geriatrik"],
    },
  ],
};

function buildTheses(): Thesis[] {
  const theses: Thesis[] = [];
  let id = 1;
  FACULTIES.forEach((faculty, f) => {
    SEEDS[faculty].forEach((seed, i) => {
      const year = 2019 + ((f * 2 + i * 3) % 6);
      const university = UNIVERSITIES[(f * 3 + i) % UNIVERSITIES.length];
      const author = AUTHORS[(f * 2 + i) % AUTHORS.length];
      const pages = 120 + ((f * 17 + i * 13) % 130);
      const partial = (f * 5 + i) % 7 === 0;
      theses.push({
        id: id++,
        call: `${CALL_PREFIX[faculty]}/${year}/${String(100 + ((f * 11 + i * 7) % 90))}`,
        faculty,
        title: seed.title,
        author,
        university,
        degree: year > 2021 ? "Sarjana" : "Ijazah Doktor Falsafah",
        year,
        pages,
        ocrPages: partial ? pages - [1, 2, 3][i % 3] : pages,
        ocrAccuracy: (96.4 + ((f + i) % 8) * 0.4).toFixed(1) + "%",
        abstract: seed.abstract,
        keywords: seed.keywords,
      });
    });
  });
  return theses;
}

export const THESES: Thesis[] = buildTheses();

export const STATS = {
  total: THESES.length,
  ocrPages: THESES.reduce((a, t) => a + t.ocrPages, 0),
  faculties: FACULTIES.length,
  universities: new Set(THESES.map((t) => t.university)).size,
  asOf: "2025",
};
