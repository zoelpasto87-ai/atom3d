# ATOM 3D — Interactive Periodic Table

**Jelajahi unsur. Pahami atom. Temukan dunia kimia.**

Media pembelajaran kimia interaktif dengan Periodic Table 118 unsur, Atom 3D, WebXR/AR, sifat keperiodikan, perbandingan 3 unsur, Virtual Chemistry Lab, Learning Journey, Challenge, Progress, dan PWA.

**Version:** 1.0.0  
**Design by ZP**

## GitHub Pages
Repository ini dikonfigurasi untuk GitHub Pages pada repository bernama `atom3d`. Workflow deployment berada di `.github/workflows/deploy-pages.yml`.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Notes
- Data utama disimpan secara lokal.
- Tidak membutuhkan database atau login.
- WebXR/AR hanya tersedia pada perangkat/browser yang mendukungnya; aplikasi menyediakan fallback ke Atom 3D.
- PWA menggunakan service worker untuk aset inti.
