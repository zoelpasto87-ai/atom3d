export type AssessmentTopic =
  | 'struktur-atom'
  | 'keperiodikan'
  | 'reaksi-lab'
  | 'komprehensif';

export type QuestionDifficulty = 'Mudah' | 'Sedang' | 'Tinggi';

export interface AssessmentQuestion {
  id: string;
  topic: AssessmentTopic;
  difficulty: QuestionDifficulty;
  question: string;
  contextSnippet?: string;
  dataSnippet?: {
    symbol?: string;
    atomicNumber?: number;
    period?: number;
    group?: number | string;
    valence?: number;
    config?: string;
    elements?: string[];
  };
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedFeature: 'table' | 'atom3d' | 'trends' | 'compare3' | 'lab' | 'journey';
  recommendationHint: string;
}

export interface AssessmentPackage {
  id: AssessmentTopic;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  badgeColor: string;
  accentGradient: string;
  estimatedMinutes: number;
  questionCount: number;
  questions: AssessmentQuestion[];
}

export interface SpeedChallengeItem {
  id: string;
  prompt: string;
  hint: string;
  targetSymbol: string;
  targetName: string;
  options: string[]; // 4 symbol options
  correctIndex: number;
}

export interface CaseStudyMission {
  id: string;
  title: string;
  subtitle: string;
  scenario: string;
  clues: string[];
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  targetElementSymbol: string;
  targetElementName: string;
}

export const ASSESSMENT_PACKAGES: Record<AssessmentTopic, AssessmentPackage> = {
  'struktur-atom': {
    id: 'struktur-atom',
    title: 'Paket 1: Struktur Atom & Konfigurasi Elektron',
    shortTitle: 'Struktur Atom',
    description: 'Evaluasi pemahaman nomor atom, nomor massa, proton, neutron, kulit Bohr, dan elektron valensi.',
    iconName: 'Atom',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    accentGradient: 'from-cyan-500/20 via-teal-500/10 to-transparent',
    estimatedMinutes: 8,
    questionCount: 6,
    questions: [
      {
        id: 'sa-1',
        topic: 'struktur-atom',
        difficulty: 'Mudah',
        question: 'Pada atom netral dengan nomor atom (Z) = 11 dan nomor massa (A) = 23, berapakah jumlah proton, elektron, dan neutron di dalam atom tersebut?',
        contextSnippet: 'Natrium (Na): Z = 11, A = 23',
        options: [
          'A. 11 proton, 11 elektron, dan 12 neutron',
          'B. 11 proton, 12 elektron, dan 11 neutron',
          'C. 12 proton, 11 elektron, dan 11 neutron',
          'D. 23 proton, 11 elektron, dan 12 neutron',
        ],
        correctIndex: 0,
        explanation: 'Pada atom netral, jumlah proton = jumlah elektron = nomor atom (Z = 11). Jumlah neutron dihitung dari selisih nomor massa dan nomor atom: N = A - Z = 23 - 11 = 12 neutron.',
        relatedFeature: 'atom3d',
        recommendationHint: 'Buka Atom 3D untuk Natrium (Na) untuk melihat komposisi 11 proton dan 12 neutron di inti atom.',
      },
      {
        id: 'sa-2',
        topic: 'struktur-atom',
        difficulty: 'Mudah',
        question: 'Berdasarkan model atom Bohr, rumus jumlah maksimum elektron yang dapat menempati kulit ke-n adalah 2n². Berapakah jumlah elektron maksimum pada kulit M (n = 3)?',
        options: [
          'A. 8 elektron',
          'B. 18 elektron',
          'C. 32 elektron',
          'D. 10 elektron',
        ],
        correctIndex: 1,
        explanation: 'Untuk kulit M (n = 3), jumlah maksimum elektron = 2(3)² = 2 × 9 = 18 elektron. Kulit K (n=1) maksimal 2e⁻, kulit L (n=2) maksimal 8e⁻, kulit M (n=3) maksimal 18e⁻.',
        relatedFeature: 'atom3d',
        recommendationHint: 'Buka tab Kulit Atom pada detail unsur untuk melihat diagram kapasitas kulit Bohr.',
      },
      {
        id: 'sa-3',
        topic: 'struktur-atom',
        difficulty: 'Sedang',
        question: 'Suatu unsur netral memiliki konfigurasi elektron 1s² 2s² 2p⁶ 3s² 3p⁴. Berapakah jumlah elektron valensi dan letak periode unsur tersebut?',
        dataSnippet: {
          config: '1s² 2s² 2p⁶ 3s² 3p⁴',
          period: 3,
          valence: 6,
        },
        options: [
          'A. 4 elektron valensi, Periode 3',
          'B. 6 elektron valensi, Periode 3 (Belerang / S)',
          'C. 6 elektron valensi, Periode 4',
          'D. 2 elektron valensi, Periode 3',
        ],
        correctIndex: 1,
        explanation: 'Kulit terluar adalah n = 3 dengan subkulit 3s² dan 3p⁴, sehingga elektron valensi = 2 + 4 = 6 elektron. Tingkat energi tertinggi n = 3 menentukan bahwa unsur ini berada pada Periode 3 (yaitu Belerang / S, Z = 16, Golongan 16/VIA).',
        relatedFeature: 'table',
        recommendationHint: 'Periksa Belerang (S, Z=16) pada Tabel Periodik untuk memverifikasi elektron valensinya.',
      },
      {
        id: 'sa-4',
        topic: 'struktur-atom',
        difficulty: 'Sedang',
        question: 'Unsur Kalsium (Ca, Z = 20) memiliki susunan elektron per kulit Bohr: 2, 8, 8, 2. Berapakah elektron valensinya dan ion apakah yang paling stabil dibentuk oleh Ca?',
        dataSnippet: {
          symbol: 'Ca',
          atomicNumber: 20,
          valence: 2,
        },
        options: [
          'A. Valensi 2, membentuk ion Ca²⁺ dengan melepas 2 elektron',
          'B. Valensi 8, membentuk ion Ca²⁻ dengan menerima 2 elektron',
          'C. Valensi 2, membentuk ion Ca⁻ dengan menarik 1 elektron',
          'D. Valensi 4, tidak dapat membentuk ion',
        ],
        correctIndex: 0,
        explanation: 'Kalsium memiliki 2 elektron pada kulit terluar (kulit N). Untuk mencapai konfigurasi oktet stabil seperti gas mulia Argon ([Ar]), Ca lebih mudah melepaskan 2 elektron valensinya sehingga membentuk kation kalsium Ca²⁺.',
        relatedFeature: 'atom3d',
        recommendationHint: 'Lihat simulasi 3D Kalsium (Ca, Z=20) dan amati 2 elektron berputar di kulit paling luar.',
      },
      {
        id: 'sa-5',
        topic: 'struktur-atom',
        difficulty: 'Tinggi',
        question: 'Mengapa atom netral unsur gas mulia seperti Neon (Ne, Z = 10) dan Argon (Ar, Z = 18) bersifat sangat stabil dan sukar bereaksi secara kimia?',
        options: [
          'A. Karena jumlah protonnya lebih sedikit daripada jumlah neutronnya',
          'B. Karena memiliki kulit elektron terluar yang terisi penuh (oktet 8e⁻ / duplet 2e⁻) dengan energi stabilisasi tinggi',
          'C. Karena jari-jari atomnya adalah yang paling besar di periodenya',
          'D. Karena memiliki nilai afinitas elektron yang sangat positif',
        ],
        correctIndex: 1,
        explanation: 'Gas mulia memiliki kulit valensi yang terisi penuh (Ne: 2,8; Ar: 2,8,8). Konfigurasi subkulit s dan p yang penuh menciptakan kestabilan termodinamika maksimum, energi ionisasi sangat tinggi, dan keengganan melepas maupun menerima elektron.',
        relatedFeature: 'trends',
        recommendationHint: 'Cek nilai Energi Ionisasi Gas Mulia di menu Sifat Keperiodikan untuk melihat puncaknya di setiap periode.',
      },
      {
        id: 'sa-6',
        topic: 'struktur-atom',
        difficulty: 'Tinggi',
        question: 'Spesies ion O²⁻, F⁻, Ne, Na⁺, dan Mg²⁺ memiliki kesamaan jumlah elektron (10 elektron). Urutan jari-jari ion/spesies tersebut dari yang paling besar ke yang paling kecil adalah...',
        options: [
          'A. Mg²⁺ > Na⁺ > Ne > F⁻ > O²⁻',
          'B. O²⁻ > F⁻ > Ne > Na⁺ > Mg²⁺',
          'C. Ne > O²⁻ > F⁻ > Na⁺ > Mg²⁺',
          'D. Na⁺ > Mg²⁺ > O²⁻ > F⁻ > Ne',
        ],
        correctIndex: 1,
        explanation: 'Spesies isoelektronik (sama-sama 10 elektron): makin besar muatan positif inti (jumlah proton Z), tarikan inti terhadap awan elektron makin kuat sehingga jari-jari makin mengecil. Z(O)=8, Z(F)=9, Z(Ne)=10, Z(Na)=11, Z(Mg)=12. Oleh karena itu O²⁻ memiliki jari-jari terbesar dan Mg²⁺ terkecil.',
        relatedFeature: 'trends',
        recommendationHint: 'Gunakan fitur Bandingkan 3 Unsur untuk membandingkan muatan inti efektif dan jari-jari.',
      },
    ],
  },
  'keperiodikan': {
    id: 'keperiodikan',
    title: 'Paket 2: Tabel Periodik & Sifat Keperiodikan',
    shortTitle: 'Sifat Keperiodikan',
    description: 'Uji kemampuan membaca tren periodik jari-jari atom, energi ionisasi, elektronegativitas, dan perbandingan 3 unsur.',
    iconName: 'TrendingUp',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentGradient: 'from-amber-500/20 via-rose-500/10 to-transparent',
    estimatedMinutes: 9,
    questionCount: 6,
    questions: [
      {
        id: 'kp-1',
        topic: 'keperiodikan',
        difficulty: 'Mudah',
        question: 'Dalam satu periode dari kiri ke kanan pada tabel periodik, bagaimana kecenderungan umum jari-jari atom non-ikatan?',
        options: [
          'A. Secara umum membesar karena jumlah kulit bertambah',
          'B. Secara umum mengecil karena muatan inti efektif (Z_eff) meningkat',
          'C. Selalu konstan untuk semua golongan',
          'D. Membesar tajam pada golongan halogen',
        ],
        correctIndex: 1,
        explanation: 'Dari kiri ke kanan dalam satu periode, jumlah kulit utama tetap sama (misal n=3), namun jumlah proton di inti bertambah sehingga muatan inti efektif (Z_eff) semakin besar dan menarik awan elektron lebih kuat ke arah inti.',
        relatedFeature: 'trends',
        recommendationHint: 'Buka menu Sifat Keperiodikan dan pilih "Jari-jari Atom" untuk melihat gradien warna dari kiri ke kanan.',
      },
      {
        id: 'kp-2',
        topic: 'keperiodikan',
        difficulty: 'Mudah',
        question: 'Unsur manakah di seluruh tabel periodik yang memiliki nilai elektronegativitas skala Pauling tertinggi (χ = 3.98)?',
        options: [
          'A. Oksigen (O)',
          'B. Klorin (Cl)',
          'C. Fluorin (F)',
          'D. Sesium (Cs)',
        ],
        correctIndex: 2,
        explanation: 'Fluorin (F, Z=9) memiliki nilai elektronegativitas tertinggi dalam skala Pauling yaitu 3.98. Hal ini karena Fluorin memiliki jari-jari kecil dan muatan inti efektif yang sangat kuat untuk menarik pasangan elektron ikatan.',
        relatedFeature: 'trends',
        recommendationHint: 'Pilih sifat "Elektronegativitas" pada menu Sifat Keperiodikan untuk melihat posisi puncak Fluorin.',
      },
      {
        id: 'kp-3',
        topic: 'keperiodikan',
        difficulty: 'Sedang',
        question: 'Diberikan tiga unsur periode 3: ₁₁Na, ₁₂Mg, dan ₁₇Cl. Urutan energi ionisasi pertama (EI₁) dari yang paling rendah ke yang paling tinggi adalah...',
        dataSnippet: {
          elements: ['Na', 'Mg', 'Cl'],
        },
        options: [
          'A. Na (495.8) < Mg (737.7) < Cl (1251.2 kJ/mol)',
          'B. Cl < Mg < Na',
          'C. Mg < Na < Cl',
          'D. Na < Cl < Mg',
        ],
        correctIndex: 0,
        explanation: 'Natrium (Na) adalah logam alkali dengan tarikan inti paling lemah di periode 3 (EI₁ = 495.8 kJ/mol), Magnesium lebih tinggi (737.7 kJ/mol), dan Klorin sebagai nonlogam halogen memiliki tarikan inti sangat kuat sehingga energi pelepasan elektronnya paling tinggi (1251.2 kJ/mol).',
        relatedFeature: 'compare3',
        recommendationHint: 'Gunakan fitur Bandingkan 3 Unsur dengan memilih Na, Mg, dan Cl untuk melihat tabel perbandingan angka energinya.',
      },
      {
        id: 'kp-4',
        topic: 'keperiodikan',
        difficulty: 'Sedang',
        question: 'Dalam satu golongan (dari atas ke bawah, misalnya Golongan 1: Li → Na → K → Rb → Cs), mengapa energi ionisasi pertama justru semakin menurun?',
        options: [
          'A. Karena jumlah proton di inti semakin berkurang',
          'B. Karena jumlah kulit bertambah sehingga jarak elektron valensi ke inti makin jauh dan perisai elektron (shielding) meningkat',
          'C. Karena unsur di bawah tidak memiliki elektron valensi',
          'D. Karena massa atom unsur tidak berpengaruh',
        ],
        correctIndex: 1,
        explanation: 'Dari atas ke bawah dalam satu golongan, setiap langkah ke bawah menambah satu kulit elektron utama. Elektron valensi berada semakin jauh dari inti dan terlindungi oleh kulit-kulit dalam (efek perisai), sehingga gaya tarik inti melemah dan elektron lebih mudah dilepaskan.',
        relatedFeature: 'trends',
        recommendationHint: 'Amati kolom Golongan 1 pada visualisasi Energi Ionisasi untuk melihat penurunan nilai dari atas ke bawah.',
      },
      {
        id: 'kp-5',
        topic: 'keperiodikan',
        difficulty: 'Tinggi',
        question: 'Mengapa energi ionisasi pertama Berilium (₄Be, 1s² 2s²) lebih tinggi daripada Boron (₅B, 1s² 2s² 2p¹), meskipun nomor atom Boron lebih besar?',
        options: [
          'A. Karena Berilium adalah gas mulia',
          'B. Karena subkulit 2s pada Be terisi penuh (stabil), sedangkan elektron 2p pada B lebih mudah dilepas karena tingkat energinya lebih tinggi dan terlindungi subkulit 2s',
          'C. Karena jari-jari atom Boron jauh lebih kecil dari Berilium',
          'D. Karena Boron tidak memiliki elektron valensi',
        ],
        correctIndex: 1,
        explanation: 'Ini adalah anomali periodik terkenal: subkulit 2s² penuh pada Be memiliki simetri dan stabilitas lebih tinggi. Elektron terluar pada B berada di subkulit 2p¹ yang energinya sedikit lebih tinggi dan terperisai oleh elektron 2s², sehingga memerlukan energi lebih rendah untuk dilepaskan.',
        relatedFeature: 'compare3',
        recommendationHint: 'Bandingkan Be dan B di menu Bandingkan 3 Unsur untuk mempelajari anomali subkulit penuh.',
      },
      {
        id: 'kp-6',
        topic: 'keperiodikan',
        difficulty: 'Tinggi',
        question: 'Unsur A, B, dan C berada dalam periode yang sama. Unsur A bereaksi hebat dengan air membentuk basa dan gas H₂. Unsur B adalah konduktor listrik buruk namun membentuk asam kuat dengan hidrogen. Unsur C dapat bereaksi dengan asam maupun basa (amfoter). Urutan letak unsur dari kiri ke kanan adalah...',
        options: [
          'A. A → C → B (Logam alkali → Metaloid/Amfoter → Nonlogam halogen)',
          'B. B → C → A',
          'C. C → A → B',
          'D. B → A → C',
        ],
        correctIndex: 0,
        explanation: 'Sifat kelogaman menurun dari kiri ke kanan: A adalah logam alkali (kiri, basa kuat), C adalah logam/metaloid amfoter seperti Al (tengah), dan B adalah nonlogam seperti Cl (kanan, pembentuk asam kuat). Jadi urutannya adalah A → C → B.',
        relatedFeature: 'table',
        recommendationHint: 'Periksa kategori unsur pada Tabel Periodik untuk membedakan Logam Alkali, Metaloid, dan Halogen.',
      },
    ],
  },
  'reaksi-lab': {
    id: 'reaksi-lab',
    title: 'Paket 3: Reaksi Kimia & Laboratorium Virtual',
    shortTitle: 'Reaksi Lab',
    description: 'Asesmen pengamatan reaksi cuka dan soda kue, identifikasi gas, perubahan suhu endoterm/eksoterm, dan hukum kekekalan massa.',
    iconName: 'FlaskConical',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    accentGradient: 'from-teal-500/20 via-emerald-500/10 to-transparent',
    estimatedMinutes: 8,
    questionCount: 5,
    questions: [
      {
        id: 'rl-1',
        topic: 'reaksi-lab',
        difficulty: 'Mudah',
        question: 'Pada eksperimen Chemistry Lab, ketika larutan Asam Cuka (CH₃COOH) direaksikan dengan Soda Kue (NaHCO₃), gas apakah yang dihasilkan sehingga membentuk letupan buih pada gelas beker?',
        contextSnippet: 'CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + Gas (?)',
        options: [
          'A. Karbon dioksida (CO₂)',
          'B. Gas Oksigen (O₂)',
          'C. Gas Hidrogen (H₂)',
          'D. Gas Amonia (NH₃)',
        ],
        correctIndex: 0,
        explanation: 'Reaksi asam asetat (cuka) dengan natrium bikarbonat (soda kue) adalah reaksi asam-basa yang menghasilkan natrium asetat, air, dan gas Karbon Dioksida (CO₂). Gas CO₂ inilah yang menimbulkan efek berbuih nyata.',
        relatedFeature: 'lab',
        recommendationHint: 'Buka menu Chemistry Lab dan uji coba eksperimen Cuka + Soda Kue untuk membaca persamaan reaksinya.',
      },
      {
        id: 'rl-2',
        topic: 'reaksi-lab',
        difficulty: 'Sedang',
        question: 'Saat melarutkan garam dapur (NaCl) ke dalam air (H₂O) di laboratorium, terjadi proses pelarutan fisik. Mengapa larutan garam dapat menghantarkan arus listrik?',
        options: [
          'A. Karena kristal NaCl terbakar menghasilkan elektron bebas',
          'B. Karena NaCl terdisosiasi di dalam air menjadi ion-ion bebas yang bergerak bebas (Na⁺ dan Cl⁻)',
          'C. Karena air berubah wujud menjadi logam cair',
          'D. Karena molekul garam berubah menjadi gas klorin',
        ],
        correctIndex: 1,
        explanation: 'NaCl adalah senyawa ionik. Saat dilarutkan dalam air, molekul polar air menguraikan kisi kristal NaCl menjadi ion Na⁺ dan ion Cl⁻ yang bebas bergerak di dalam larutan (larutan elektrolit kuat), sehingga mampu menghantarkan arus listrik.',
        relatedFeature: 'lab',
        recommendationHint: 'Amati deskripsi bahan Garam Dapur (NaCl) pada bank bahan Chemistry Lab.',
      },
      {
        id: 'rl-3',
        topic: 'reaksi-lab',
        difficulty: 'Sedang',
        question: 'Reaksi antara asam cuka dan soda kue terasa sedikit dingin jika disentuh. Jenis reaksi termokimia apakah yang menyerap kalor dari lingkungan tersebut?',
        options: [
          'A. Reaksi Eksoterm',
          'B. Reaksi Endoterm',
          'C. Reaksi Pembakaran',
          'D. Reaksi Nuklir',
        ],
        correctIndex: 1,
        explanation: 'Reaksi yang menyerap energi kalor dari lingkungan sekitar sehingga menyebabkan penurunan suhu lingkungan disebut reaksi Endoterm (ΔH > 0).',
        relatedFeature: 'lab',
        recommendationHint: 'Buka lembar pengamatan di Chemistry Lab untuk melihat catatan termokimia reaksi.',
      },
      {
        id: 'rl-4',
        topic: 'reaksi-lab',
        difficulty: 'Tinggi',
        question: 'Menurut Hukum Kekekalan Massa (Lavoisier), jika 100 gram cuka dan 10 gram soda kue direaksikan dalam wadah tertutup rapat, berapakah massa total campuran setelah reaksi selesai?',
        options: [
          'A. Kurang dari 110 gram karena ada gas yang terbentuk',
          'B. Tepat 110 gram, karena dalam sistem tertutup massa zat sebelum dan sesudah reaksi adalah sama',
          'C. Lebih dari 110 gram karena ada gelembung buih yang bertambah',
          'D. Menjadi 0 gram karena zat habis bereaksi',
        ],
        correctIndex: 1,
        explanation: 'Hukum Kekekalan Massa menyatakan bahwa dalam sistem tertutup, massa zat sebelum reaksi sama dengan massa zat sesudah reaksi. Meskipun terbentuk gas CO₂, karena wadah tertutup rapat, gas tidak hilang ke udara bebas sehingga massa total tetap 110 gram.',
        relatedFeature: 'lab',
        recommendationHint: 'Pelajari ringkasan stoikiometri dan hukum kekekalan massa di panduan belajar.',
      },
      {
        id: 'rl-5',
        topic: 'reaksi-lab',
        difficulty: 'Tinggi',
        question: 'Jika larutan asam cuka diuji dengan indikator lakmus biru, perubahan warna apakah yang akan terjadi?',
        options: [
          'A. Lakmus biru tetap berwarna biru',
          'B. Lakmus biru berubah menjadi merah',
          'C. Lakmus biru berubah menjadi hijau',
          'D. Lakmus biru memudar menjadi putih transparan',
        ],
        correctIndex: 1,
        explanation: 'Asam cuka bersifat asam (pH < 7). Sifat khas larutan asam adalah dapat memerahkan kertas lakmus biru, sedangkan lakmus merah tetap berwarna merah.',
        relatedFeature: 'lab',
        recommendationHint: 'Cek sifat larutan asam di menu Chemistry Lab.',
      },
    ],
  },
  'komprehensif': {
    id: 'komprehensif',
    title: 'Paket 4: Grand Challenge — Evaluasi Komprehensif',
    shortTitle: 'Grand Challenge',
    description: 'Tantangan puncak 8 soal komprehensif mengintegrasikan Struktur Atom 3D, Tabel Periodik, Sifat Keperiodikan, dan Reaksi Kimia.',
    iconName: 'Trophy',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    accentGradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    estimatedMinutes: 12,
    questionCount: 8,
    questions: [
      {
        id: 'gc-1',
        topic: 'komprehensif',
        difficulty: 'Mudah',
        question: 'Unsur Besi memiliki simbol kimia Fe dengan nomor atom 26. Berdasarkan letak bloknya pada tabel periodik, Besi termasuk ke dalam golongan...',
        options: [
          'A. Logam Alkali (Blok s)',
          'B. Logam Transisi (Blok d)',
          'C. Halogen (Blok p)',
          'D. Lantanida (Blok f)',
        ],
        correctIndex: 1,
        explanation: 'Besi (Fe, Z=26) memiliki elektron valensi pada subkulit 3d⁶ 4s² yang menjadikannya unsur Logam Transisi (Golongan 8 / VIIIB) pada Blok d.',
        relatedFeature: 'table',
        recommendationHint: 'Buka Tabel Periodik dan amati blok warna untuk Fe (Besi).',
      },
      {
        id: 'gc-2',
        topic: 'komprehensif',
        difficulty: 'Sedang',
        question: 'Manakah pernyataan yang paling tepat mengenai hubungan antara elektron valensi dengan reaktivitas kimia unsur?',
        options: [
          'A. Elektron valensi tidak memiliki pengaruh terhadap ikatan kimia',
          'B. Elektron valensi pada kulit terluar adalah elektron yang paling mudah terlibat dalam pelepasan, penangkapan, atau pemakaian bersama elektron untuk mencapai susunan oktet',
          'C. Hanya neutron yang menentukan jenis ikatan antaratom',
          'D. Unsur dengan 8 elektron valensi adalah unsur yang paling reaktif',
        ],
        correctIndex: 1,
        explanation: 'Elektron valensi menentukan sifat kimia dan valensi ikatan atom karena berada pada tingkat energi terluar yang paling mudah berinteraksi dengan atom lain untuk mencapai kestabilan konfigurasi oktet.',
        relatedFeature: 'atom3d',
        recommendationHint: 'Buka Atom 3D dan amati lintasan kulit terluar tempat elektron valensi beredar.',
      },
      {
        id: 'gc-3',
        topic: 'komprehensif',
        difficulty: 'Sedang',
        question: 'Dua unsur X (Z = 12) dan Y (Z = 17) bereaksi membentuk senyawa stabil. Rumus kimia senyawa dan jenis ikatan yang terbentuk adalah...',
        options: [
          'A. XY, ikatan kovalen',
          'B. XY₂, ikatan ionik (Mg dan Cl membentuk MgCl₂)',
          'C. X₂Y, ikatan logam',
          'D. X₂Y₃, ikatan hidrogen',
        ],
        correctIndex: 1,
        explanation: 'X adalah Magnesium (Z=12, valensi 2 melepas 2e⁻ membentuk X²⁺). Y adalah Klorin (Z=17, valensi 7 menarik 1e⁻ membentuk Y⁻). Kombinasi muatan menghasilkan senyawa ionik XY₂ (MgCl₂).',
        relatedFeature: 'compare3',
        recommendationHint: 'Bandingkan Mg dan Cl di fitur Bandingkan 3 Unsur untuk melihat perbedaan valensinya.',
      },
      {
        id: 'gc-4',
        topic: 'komprehensif',
        difficulty: 'Sedang',
        question: 'Unsur manakah di antara pilihan berikut yang memiliki afinitas elektron paling eksotermik (paling mudah melepaskan energi saat menangkap elektron)?',
        options: [
          'A. Natrium (Na)',
          'B. Klorin (Cl = 349.0 kJ/mol)',
          'C. Neon (Ne)',
          'D. Magnesium (Mg)',
        ],
        correctIndex: 1,
        explanation: 'Klorin (Cl, Z=17) memiliki nilai afinitas elektron tertinggi (349.0 kJ/mol) di antara seluruh unsur periodik karena hanya membutuhkan 1 elektron untuk mencapai konfigurasi oktet stabil [Ar] dengan jari-jari yang pas.',
        relatedFeature: 'trends',
        recommendationHint: 'Pilih "Afinitas Elektron" pada menu Sifat Keperiodikan.',
      },
      {
        id: 'gc-5',
        topic: 'komprehensif',
        difficulty: 'Tinggi',
        question: 'Sebuah atom netral memiliki 3 kulit elektron terisi dan memiliki 2 elektron tidak berpasangan pada subkulit 3p. Unsur tersebut adalah...',
        options: [
          'A. Silikon (Si, Z = 14) atau Belerang (S, Z = 16)',
          'B. Natrium (Na, Z = 11)',
          'C. Kalsium (Ca, Z = 20)',
          'D. Argon (Ar, Z = 18)',
        ],
        correctIndex: 0,
        explanation: 'Konfigurasi 3p² (Silikon, Z=14) memiliki 2 elektron tidak berpasangan di orbital px dan py. Konfigurasi 3p⁴ (Belerang, Z=16) juga memiliki 2 elektron tidak berpasangan karena 1 orbital berisi pasangan dan 2 orbital lainnya berisi 1 elektron.',
        relatedFeature: 'table',
        recommendationHint: 'Lihat konfigurasi elektron Silikon dan Belerang pada kartu detail unsur.',
      },
      {
        id: 'gc-6',
        topic: 'komprehensif',
        difficulty: 'Tinggi',
        question: 'Pada teknologi visualisasi spasial seperti WebXR / Atom AR, mengapa model orbital atom 3D lebih efektif daripada diagram lingkaran 2D datar?',
        options: [
          'A. Karena model 3D membebani kinerja perangkat sehingga lebih lambat',
          'B. Karena atom di alam semesta nyata memiliki volume spasial tiga dimensi dan sudut pandang 360° memudahkan persepsi jarak antar kulit elektron dan inti',
          'C. Karena diagram 2D tidak boleh digunakan lagi oleh para ilmuwan',
          'D. Karena model 3D menghilangkan inti atom sama sekali',
        ],
        correctIndex: 1,
        explanation: 'Ruang lingkup atom adalah struktur spasial tiga dimensi (panjang, lebar, kedalaman). Mode 3D dan AR memungkinkan siswa berjalan memutari atom, mengamati simetri kulit bola, dan memahami distribusi elektron dalam ruang nyata.',
        relatedFeature: 'atom3d',
        recommendationHint: 'Buka mode Atom 3D atau AR untuk mengeksplorasi sudut pandang kamera bebas.',
      },
      {
        id: 'gc-7',
        topic: 'komprehensif',
        difficulty: 'Tinggi',
        question: 'Mengapa unsur Logam Alkali (Golongan 1) seperti Kalium (K) disimpan di dalam minyak tanah atau parafin cair di laboratorium kimia?',
        options: [
          'A. Supaya logam Kalium tidak mencair pada suhu kamar',
          'B. Karena Kalium sangat reaktif dan mudah terbakar saat bereaksi spontan dengan oksigen dan uap air di udara terbuka',
          'C. Untuk menambah berat timbangan saat eksperimen',
          'D. Agar warna logamnya berubah menjadi emas mengkilap',
        ],
        correctIndex: 1,
        explanation: 'Logam alkali memiliki energi ionisasi sangat rendah dan sangat elektropositif. Kalium bereaksi sangat hebat (eksotermik) dengan uap air dan oksigen di udara menghasilkan gas H₂ yang mudah terbakar. Minyak tanah mencegah kontak Kalium dengan udara.',
        relatedFeature: 'lab',
        recommendationHint: 'Pelajari sifat reaktivitas logam alkali di Chemistry Lab atau detail Kalium (K, Z=19).',
      },
      {
        id: 'gc-8',
        topic: 'komprehensif',
        difficulty: 'Tinggi',
        question: 'Perhatikan perbandingan 3 unsur satu golongan: Fluorin (F, per. 2), Klorin (Cl, per. 3), dan Bromin (Br, per. 4). Wujud zat ketiga unsur ini berturut-turut pada suhu kamar (25°C, 1 atm) adalah...',
        options: [
          'A. Padat, Cair, Gas',
          'B. Gas (F₂), Gas (Cl₂), Cair (Br₂)',
          'C. Cair semua',
          'D. Padat semua',
        ],
        correctIndex: 1,
        explanation: 'F₂ berwujud Gas kuning muda, Cl₂ berwujud Gas hijau kekuningan, dan Br₂ berwujud Cairan merah kecokelatan yang mudah menguap. Hal ini membuktikan bahwa seiring membesarnya massa molekul dan gaya van der Waals dari atas ke bawah golongan VIIA, titik didih dan wujud zat meningkat ke fase yang lebih padat.',
        relatedFeature: 'compare3',
        recommendationHint: 'Bandingkan F, Cl, dan Br pada Tabel Periodik dan amati indikator wujud zatnya.',
      },
    ],
  },
};

export const SPEED_CHALLENGE_BANK: SpeedChallengeItem[] = [
  {
    id: 'sc-1',
    prompt: 'Unsur paling ringan di alam semesta, nomor atom 1',
    hint: 'Bahan bakar bintang dan komponen utama air',
    targetSymbol: 'H',
    targetName: 'Hidrogen',
    options: ['H', 'He', 'Li', 'O'],
    correctIndex: 0,
  },
  {
    id: 'sc-2',
    prompt: 'Nomor atom 8, gas esensial untuk pernapasan manusia',
    hint: 'Membentuk 21% atmosfer bumi',
    targetSymbol: 'O',
    targetName: 'Oksigen',
    options: ['N', 'O', 'F', 'C'],
    correctIndex: 1,
  },
  {
    id: 'sc-3',
    prompt: 'Logam alkali nomor atom 11, komponen garam dapur (NaCl)',
    hint: 'Bereaksi kuat dengan air, warna nyala kuning',
    targetSymbol: 'Na',
    targetName: 'Natrium',
    options: ['K', 'Mg', 'Na', 'Ca'],
    correctIndex: 2,
  },
  {
    id: 'sc-4',
    prompt: 'Gas mulia nomor atom 2, pengisi balon terbang',
    hint: 'Memiliki konfigurasi duplet stabil 1s²',
    targetSymbol: 'He',
    targetName: 'Helium',
    options: ['Ne', 'Ar', 'He', 'Kr'],
    correctIndex: 2,
  },
  {
    id: 'sc-5',
    prompt: 'Unsur paling elektronegatif di tabel periodik (Z = 9)',
    hint: 'Halogen paling atas dengan Pauling 3.98',
    targetSymbol: 'F',
    targetName: 'Fluorin',
    options: ['Cl', 'F', 'Br', 'I'],
    correctIndex: 1,
  },
  {
    id: 'sc-6',
    prompt: 'Logam transisi Z = 26, bahan baku baja dan hemoglobin darah',
    hint: 'Memiliki simbol dari bahasa Latin Ferrum',
    targetSymbol: 'Fe',
    targetName: 'Besi',
    options: ['Cu', 'Fe', 'Zn', 'Ni'],
    correctIndex: 1,
  },
  {
    id: 'sc-7',
    prompt: 'Nomor atom 6, dasar dari seluruh senyawa kimia organik',
    hint: 'Dapat membentuk intan, grafit, dan grafena',
    targetSymbol: 'C',
    targetName: 'Karbon',
    options: ['Si', 'N', 'C', 'B'],
    correctIndex: 2,
  },
  {
    id: 'sc-8',
    prompt: 'Logam mulia nomor atom 79, simbol Aurum',
    hint: 'Konduktor luar biasa, berwarna kuning berkilau',
    targetSymbol: 'Au',
    targetName: 'Emas',
    options: ['Ag', 'Pt', 'Au', 'Cu'],
    correctIndex: 2,
  },
  {
    id: 'sc-9',
    prompt: 'Halogen Z = 17, gas pembunuh kuman pada air minum',
    hint: 'Memiliki 7 elektron valensi pada periode 3',
    targetSymbol: 'Cl',
    targetName: 'Klorin',
    options: ['F', 'Cl', 'Br', 'S'],
    correctIndex: 1,
  },
  {
    id: 'sc-10',
    prompt: 'Logam alkali tanah Z = 20, penyusun utama tulang dan gigi',
    hint: 'Memiliki 2 elektron valensi pada periode 4',
    targetSymbol: 'Ca',
    targetName: 'Kalsium',
    options: ['Mg', 'Ca', 'Ba', 'Sr'],
    correctIndex: 1,
  },
];

export const CASE_STUDY_MISSIONS: CaseStudyMission[] = [
  {
    id: 'cs-1',
    title: 'Misi 1: Misteri Sampel Unsur X dari Meteorit',
    subtitle: 'Analisis Spektroskopi dan Karakteristik Atom',
    scenario: 'Sebuah laboratorium astrobiologi menerima sampel mineral meteorit luar angkasa. Pengujian spektroskopi menemukan atom netral unsur X yang memiliki 15 proton di intinya. Uji nyala menunjukkan reaksi khas dengan oksigen membentuk senyawa oksida asam X₂O₅.',
    clues: [
      'Memiliki nomor atom Z = 15.',
      'Terletak pada Periode 3 dan memiliki 5 elektron valensi (Golongan 15 / VA).',
      'Susunan konfigurasi elektron: [Ne] 3s² 3p³.',
      'Di bumi merupakan komponen vital asam nukleat (DNA/RNA) dan molekul energi ATP.',
    ],
    question: 'Berdasarkan data analisis di atas, unsur apakah sampel misterius X tersebut?',
    options: [
      'A. Belerang (S)',
      'B. Fosfor (P)',
      'C. Nitrogen (N)',
      'D. Silikon (Si)',
    ],
    correctIndex: 1,
    explanation: 'Unsur dengan nomor atom Z = 15 adalah Fosfor (P, Phosphorus). Terletak pada Golongan 15, Periode 3, dan memiliki 5 elektron valensi ([Ne] 3s² 3p³). Fosfor membentuk oksida asam P₂O₅ dan merupakan unsur kunci pembentuk materi genetik DNA dan ATP.',
    targetElementSymbol: 'P',
    targetElementName: 'Fosfor',
  },
  {
    id: 'cs-2',
    title: 'Misi 2: Investigasi Anomali Reaktivitas di Ruang Lab',
    subtitle: 'Mengapa Tabung Reaksi A Menggelembung Lebih Cepat?',
    scenario: 'Dua orang siswa mereaksikan dua logam dari golongan yang sama dengan larutan asam klorida encer. Siswa A menggunakan pita Magnesium (Mg, Z = 12), sedangkan Siswa B menggunakan potongan Kalsium (Ca, Z = 20). Reaksi pada tabung Siswa B terjadi jauh lebih dahsyat dan cepat.',
    clues: [
      'Magnesium (Mg, Z=12) berada di Periode 3, Golongan 2.',
      'Kalsium (Ca, Z=20) berada di Periode 4, Golongan 2.',
      'Jari-jari atom Kalsium (2.31 Å) lebih besar daripada Magnesium (1.73 Å).',
      'Energi ionisasi pertama Kalsium (589.8 kJ/mol) lebih kecil daripada Magnesium (737.7 kJ/mol).',
    ],
    question: 'Penjelasan ilmiah yang paling tepat mengapa Kalsium bereaksi jauh lebih cepat daripada Magnesium adalah...',
    options: [
      'A. Kalsium memiliki massa atom lebih kecil daripada Magnesium',
      'B. Karena jari-jari atom Ca lebih besar dan energi ionisasinya lebih kecil, elektron valensi Ca jauh lebih mudah dilepaskan untuk bereaksi',
      'C. Kalsium adalah unsur nonlogam sedangkan Magnesium adalah logam',
      'D. Karena Magnesium tidak dapat melepaskan elektron di dalam air',
    ],
    correctIndex: 1,
    explanation: 'Dalam satu golongan (alkali tanah), reaktivitas logam meningkat dari atas ke bawah. Kalsium (Periode 4) memiliki jari-jari lebih besar dan energi ionisasi lebih rendah (589.8 kJ/mol vs 737.7 kJ/mol), sehingga elektron valensinya ditarik lebih lemah oleh inti dan lebih spontan dilepaskan saat bereaksi.',
    targetElementSymbol: 'Ca',
    targetElementName: 'Kalsium',
  },
];
