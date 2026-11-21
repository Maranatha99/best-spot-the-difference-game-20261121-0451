# Temukan Perbedaan — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Maranatha99/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Maranatha99/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

Dua gambar nyaris sama berdampingan — cari perbedaannya sebelum waktu habis. Entry untuk
[make.fun bounty best-spot-the-difference-game-20261121-0451](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).

## Cara main

- Klik perbedaan di gambar kiri **atau** kanan — keduanya bisa diklik.
- Perbedaan yang ketemu ditandai lingkaran hijau di kedua gambar.
- Klik salah: −5 detik dan −10 poin. Ketemu: +100 poin.
- **H** = petunjuk (3× per level), **R** = ulangi level, **P** = jeda, **N** = level berikutnya.
- Selesaikan level sebelum timer habis untuk bonus waktu (+5 poin/detik sisa).

## Level

| Level | Scene | Perbedaan | Waktu |
|-------|-------|-----------|-------|
| 1 | Pasar Malam | 7 | 120 detik |
| 2 | Taman Senja | 10 | 150 detik |

Semua gambar digambar lewat kode (canvas 2D) — tanpa foto, tanpa aset dari internet.
Suara disintesis dengan Web Audio, juga tanpa file.

## Jalankan lokal

```sh
node serve.ts
# buka http://localhost:8080
```

Screenshot memakai query `?shot=start|play|level2|end` (lihat `shots.json`).

## Struktur

```
game/
  index.html          halaman game (canvas 1280×720)
  src/
    config.js         konstanta, layout, skor
    differences.js    daftar perbedaan tiap level
    scenes.js         gambar Pasar Malam & Taman Senja (canvas 2D)
    state.js          aturan main: level, timer, petunjuk, skor
    render.js         HUD, marker, overlay layar
    input.js          keyboard + klik
    audio.js          bunyi Web Audio
    shots.js          staging screenshot ?shot=
    main.js           boot + loop utama
main.ts               menyalin game/ + screenshots/ ke /output, menulis dossier.json
```

## Lisensi

MIT — lihat [LICENSE](LICENSE).
