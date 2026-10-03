export type JourneySection = 'memahami' | 'mengaplikasikan' | 'merefleksikan';

export interface UnderstandingActivity {
  id: string;
  number: number;
  title: string;
  instruction: string;
  targetFeature: 'table' | 'atom3d' | 'trends' | 'compare3';
  checklist?: string[];
  learningGoal: string;
}

export interface ApplicationChallenge {
  id: string;
  number: number;
  title: string;
  infoSnippet?: {
    atomicNumber?: number;
    period?: number;
    valenceElectrons?: number;
    elements?: string[];
  };
  task?: string;
  question: string;
  options: string[];
  correctIndex: number;
  correctFeedback: string;
  incorrectFeedback: string;
  targetFeature?: 'compare3' | 'lab' | 'ar' | 'atom3d';
  predictionQuestion?: string;
  predictionOptions?: string[];
  steps?: string[];
}

export interface ReflectionQuestion {
  id: string;
  number: number;
  question: string;
  placeholder: string;
  guidanceNote?: string;
}

export interface LearningJourneyData {
  title: string;
  subtitle: string;
  sections: {
    memahami: {
      id: 'memahami';
      title: 'MEMAHAMI';
      subtitle: 'Eksplorasi konsep';
      goal: 'Siswa mengamati dan membangun pemahaman konsep melalui eksplorasi.';
      activities: UnderstandingActivity[];
    };
    mengaplikasikan: {
      id: 'mengaplikasikan';
      title: 'MENGAPLIKASIKAN';
      subtitle: 'Terapkan pengetahuan';
      goal: 'Siswa menggunakan konsep yang telah dipahami untuk menganalisis situasi.';
      challenges: ApplicationChallenge[];
    };
    merefleksikan: {
      id: 'merefleksikan';
      title: 'MEREFLEKSIKAN';
      subtitle: 'Renungkan temuanmu';
      goal: 'Siswa menghubungkan hasil eksplorasi dengan pemahamannya sendiri.';
      questions: ReflectionQuestion[];
    };
  };
}

export const LEARNING_JOURNEY_DATA: LearningJourneyData = {
  title: 'LEARNING JOURNEY',
  subtitle: 'Jelajahi atom, pahami unsur, dan temukan pola kimia.',
  sections: {
    memahami: {
      id: 'memahami',
      title: 'MEMAHAMI',
      subtitle: 'Eksplorasi konsep',
      goal: 'Siswa mengamati dan membangun pemahaman konsep melalui eksplorasi.',
      activities: [
        {
          id: 'und-1',
          number: 1,
          title: 'Kenali Unsur',
          instruction: 'Pilih satu unsur dari tabel periodik.',
          targetFeature: 'table',
          learningGoal: 'Memahami identitas dasar unsur, nomor atom, konfigurasi elektron, dan elektron valensi.',
        },
        {
          id: 'und-2',
          number: 2,
          title: 'Amati Struktur Atom',
          instruction: 'Buka Atom 3D dan amati distribusi elektron.',
          targetFeature: 'atom3d',
          checklist: [
            'Saya mengamati inti atom',
            'Saya mengamati kulit elektron',
            'Saya mengamati elektron valensi',
          ],
          learningGoal: 'Memvisualisasikan tata letak spasial proton, neutron, kulit elektron, dan elektron valensi dalam model 3D.',
        },
        {
          id: 'und-3',
          number: 3,
          title: 'Amati Pola Periodik',
          instruction: 'Pilih sifat keperiodikan dan amati perubahannya pada tabel periodik.',
          targetFeature: 'trends',
          learningGoal: 'Menemukan tren periodik jari-jari atom, energi ionisasi, elektronegativitas, dan afinitas elektron.',
        },
        {
          id: 'und-4',
          number: 4,
          title: 'Bandingkan 3 Unsur',
          instruction: 'Pilih tiga unsur dan bandingkan sifatnya.',
          targetFeature: 'compare3',
          learningGoal: 'Melakukan analisis komparatif langsung terhadap 3 unsur pilihan berdampingan.',
        },
      ],
    },
    mengaplikasikan: {
      id: 'mengaplikasikan',
      title: 'MENGAPLIKASIKAN',
      subtitle: 'Terapkan pengetahuan',
      goal: 'Siswa menggunakan konsep yang telah dipahami untuk menganalisis situasi.',
      challenges: [
        {
          id: 'app-1',
          number: 1,
          title: 'Tantangan 1 — Tebak Unsur',
          infoSnippet: {
            atomicNumber: 17,
            period: 3,
            valenceElectrons: 7,
          },
          question: 'Unsur apakah ini?',
          options: ['A. Na', 'B. Mg', 'C. Cl', 'D. Ar'],
          correctIndex: 2,
          correctFeedback: 'Benar. Cl memiliki nomor atom 17.',
          incorrectFeedback: 'Periksa kembali nomor atom dan posisi unsur pada tabel periodik.',
        },
        {
          id: 'app-2',
          number: 2,
          title: 'Tantangan 2 — Distribusi Elektron',
          question: 'Suatu atom memiliki distribusi elektron 2,8,1. Unsur apakah yang paling sesuai?',
          options: ['A. Na', 'B. Mg', 'C. Al', 'D. K'],
          correctIndex: 0,
          correctFeedback: 'Benar! Natrium (Na) memiliki nomor atom 11, dengan susunan kulit K=2, L=8, M=1 serta 1 elektron valensi pada kulit terluar.',
          incorrectFeedback: 'Periksa kembali total elektronnya: 2 + 8 + 1 = 11 elektron. Unsur manakah yang memiliki 11 elektron pada keadaan netral?',
        },
        {
          id: 'app-3',
          number: 3,
          title: 'Tantangan 3 — Sifat Keperiodikan',
          infoSnippet: {
            elements: ['Na', 'Mg', 'Cl'],
          },
          question: 'Bagaimana kecenderungan energi ionisasi dari Na menuju Cl dalam satu periode?',
          options: [
            'A. Cenderung meningkat',
            'B. Cenderung menurun',
            'C. Tidak memiliki pola sama sekali',
            'D. Selalu tetap',
          ],
          correctIndex: 0,
          correctFeedback: 'Tepat sekali! Secara umum energi ionisasi cenderung meningkat dari kiri ke kanan (Na menuju Cl) dalam satu periode karena muatan inti efektif (Z_eff) semakin besar, sehingga elektron valensi terikat lebih kuat.',
          incorrectFeedback: 'Ingat kembali tren periodik: dari Na (kiri) ke Cl (kanan), jari-jari atom mengecil dan tarikan inti makin kuat terhadap elektron.',
        },
        {
          id: 'app-4',
          number: 4,
          title: 'Tantangan 4 — Bandingkan 3 Unsur',
          task: 'Pilih tiga unsur dari satu periode (misal: Na, Mg, Cl) lalu amati jari-jari atom dan energi ionisasi.',
          question: 'Apa pola yang kamu temukan mengenai hubungan jari-jari atom dan energi ionisasi?',
          options: [
            'A. Jari-jari atom mengecil dan energi ionisasi cenderung meningkat',
            'B. Jari-jari atom membesar dan energi ionisasi cenderung menurun',
            'C. Jari-jari atom dan energi ionisasi sama-sama membesar',
            'D. Tidak ada kaitan sama sekali antara jari-jari dan energi ionisasi',
          ],
          correctIndex: 0,
          correctFeedback: 'Hebat! Ketika jari-jari atom mengecil, jarak elektron terluar ke inti semakin dekat sehingga gaya tarik Coulomb meningkat dan membutuhkan energi pelepasan (energi ionisasi) yang lebih tinggi.',
          incorrectFeedback: 'Buka kembali fitur Bandingkan 3 Unsur dan amati baris Jari-jari atom serta Energi ionisasi untuk memastikannya.',
          targetFeature: 'compare3',
        },
        {
          id: 'app-5',
          number: 5,
          title: 'Tantangan 5 — Chemistry Lab',
          targetFeature: 'lab',
          task: 'Pilih eksperimen Cuka + Soda Kue pada Chemistry Lab.',
          predictionQuestion: 'Sebelum simulasi: Prediksikan apa yang akan terjadi saat Cuka dicampur dengan Soda Kue?',
          predictionOptions: [
            'Terjadi letupan buih gas nyata dan sedikit penurunan suhu',
            'Larutan berubah warna menjadi biru pekat tanpa buih',
            'Terbentuk endapan logam padat yang mengapung',
          ],
          question: 'Berdasarkan reaksi CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂, gas apa yang terbentuk?',
          options: [
            'A. Karbon dioksida (CO₂)',
            'B. Oksigen (O₂)',
            'C. Hidrogen (H₂)',
            'D. Gas Klorin (Cl₂)',
          ],
          correctIndex: 0,
          correctFeedback: 'Benar! Gas yang terbentuk adalah Karbon dioksida (CO₂), yang menyebabkan efek berbuih pada reaksi asam cuka dengan soda kue.',
          incorrectFeedback: 'Buka Chemistry Lab, jalankan reaksi Cuka + Soda Kue, dan periksa persamaan reaksi serta persamaan gas pada panel hasil pengamatan.',
        },
        {
          id: 'app-6',
          number: 6,
          title: 'Tantangan 6 — Atom AR',
          targetFeature: 'ar',
          task: 'Tempatkan atom pada permukaan nyata di sekitarmu menggunakan kamera.',
          steps: [
            'Pilih unsur yang ingin diamati (misalnya Oksigen atau Kalsium)',
            'Buka mode AR (atau Atom 3D jika AR tidak didukung pada perangkat ini)',
            'Arahkan kamera ke permukaan datar dan tempatkan atom',
            'Amati struktur inti dan kulit elektron dari berbagai sudut',
            'Putar atom dan cermati gerakan elektron',
            'Identifikasi elektron valensi pada kulit paling luar',
          ],
          question: 'Setelah menempatkan dan mengamati model atom dalam ruang 3D / AR, apakah kamu dapat mengidentifikasi elektron valensi?',
          options: [
            'A. Ya, elektron valensi berada pada lintasan kulit terluar dan menentukan sifat kimia atom',
            'B. Tidak, elektron valensi selalu menempel di pusat inti atom',
            'C. Elektron valensi tidak memiliki orbit dan tidak dapat diamati',
          ],
          correctIndex: 0,
          correctFeedback: 'Sempurna! Elektron valensi berada di kulit paling luar dan berperan utama dalam pembentukan ikatan kimia dengan atom lain.',
          incorrectFeedback: 'Coba buka kembali model Atom 3D atau AR, amati kulit lingkaran paling luar tempat elektron valensi beredar.',
        },
      ],
    },
    merefleksikan: {
      id: 'merefleksikan',
      title: 'MEREFLEKSIKAN',
      subtitle: 'Renungkan temuanmu',
      goal: 'Siswa menghubungkan hasil eksplorasi dengan pemahamannya sendiri.',
      questions: [
        {
          id: 'ref-1',
          number: 1,
          question: 'Apa hubungan nomor atom dengan jumlah elektron pada atom netral?',
          placeholder: 'Tulis jawabanmu di sini... (misal: Pada atom netral, nomor atom (Z) sama dengan...)',
          guidanceNote: 'Hubungkan dengan muatan positif proton di inti atom.',
        },
        {
          id: 'ref-2',
          number: 2,
          question: 'Apa yang kamu amati tentang jumlah elektron valensi pada unsur-unsur dalam satu golongan?',
          placeholder: 'Tulis jawabanmu di sini... (misal: Unsur dalam satu golongan memiliki jumlah elektron valensi yang...)',
          guidanceNote: 'Perhatikan contoh Golongan 1 (Alkali) atau Golongan 17 (Halogen).',
        },
        {
          id: 'ref-3',
          number: 3,
          question: 'Bagaimana posisi unsur dalam tabel periodik membantu kamu memperkirakan sifat atomnya?',
          placeholder: 'Tulis jawabanmu di sini... (misal: Letak periode memberi tahu jumlah kulit, sedangkan golongan...)',
          guidanceNote: 'Gunakan hukum keperiodikan jari-jari atom dan elektronegativitas.',
        },
        {
          id: 'ref-4',
          number: 4,
          question: 'Setelah menggunakan Atom 3D dan AR, konsep atom apa yang sekarang lebih mudah kamu pahami?',
          placeholder: 'Tulis jawabanmu di sini... (misal: Visualisasi 3D membantu saya membayangkan bentuk kulit elektron dan...)',
          guidanceNote: 'Ceritakan pengalaman melihat model spasial dibandingkan gambar 2D.',
        },
        {
          id: 'ref-5',
          number: 5,
          question: 'Apa hal paling menarik yang kamu temukan selama eksplorasi?',
          placeholder: 'Tulis jawabanmu di sini... (misal: Eksperimen cuka dan soda kue, atau membandingkan 3 unsur...)',
          guidanceNote: 'Tuliskan temuan atau hal yang paling berkesan bagi proses belajarmu.',
        },
      ],
    },
  },
};
