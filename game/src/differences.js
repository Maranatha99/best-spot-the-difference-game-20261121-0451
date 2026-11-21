// The levels: name, time limit and the differences. A difference is a spot in scene
// coordinates (the 600x460 panel space) with a click radius and a short label. The scene
// painter in scenes.js reads the same ids: the left panel is drawn with no ids applied, the
// right panel with every id applied, so the two pictures are identical except at these spots.
//
// Fairness rule used when placing them: every difference is a real, visible change to an
// object that is already in the scene (a missing moon, a recoloured lantern, one orange
// fewer) — never a one-pixel speck, never hidden behind another object.

export const LEVELS = [
  {
    id: 'pasar-malam',
    name: 'Pasar Malam',
    subtitle: 'Level 1 · 7 perbedaan · 120 detik',
    timeLimit: 120,
    differences: [
      { id: 'bulan', x: 520, y: 58, r: 26, label: 'Bulan hilang' },
      { id: 'lentera', x: 430, y: 268, r: 20, label: 'Warna lentera berubah' },
      { id: 'balon', x: 548, y: 88, r: 22, label: 'Satu balon hilang' },
      { id: 'kucing', x: 180, y: 414, r: 26, label: 'Kucing hilang' },
      { id: 'harga', x: 140, y: 232, r: 24, label: 'Harga sate berubah' },
      { id: 'jeruk', x: 96, y: 296, r: 24, label: 'Satu jeruk berkurang' },
      { id: 'bendera', x: 442, y: 100, r: 20, label: 'Warna bendera berubah' },
    ],
  },
  {
    id: 'taman-senja',
    name: 'Taman Senja',
    subtitle: 'Level 2 · 10 perbedaan · 150 detik',
    timeLimit: 150,
    differences: [
      { id: 'burung', x: 300, y: 66, r: 20, label: 'Satu burung hilang' },
      { id: 'apel', x: 122, y: 178, r: 18, label: 'Satu apel hilang' },
      { id: 'bangku', x: 405, y: 348, r: 20, label: 'Papan bangku hilang' },
      { id: 'bebek', x: 178, y: 404, r: 24, label: 'Bebek hilang' },
      { id: 'bunga', x: 522, y: 420, r: 18, label: 'Warna bunga berubah' },
      { id: 'layang', x: 452, y: 196, r: 18, label: 'Pita layang-layang tambahan' },
      { id: 'lampu', x: 556, y: 258, r: 22, label: 'Lampu taman menyala' },
      { id: 'kupu', x: 468, y: 378, r: 18, label: 'Kupu-kupu hilang' },
      { id: 'bola', x: 344, y: 428, r: 20, label: 'Bola anjing hilang' },
      { id: 'awan', x: 140, y: 66, r: 26, label: 'Awan hilang' },
    ],
  },
];
