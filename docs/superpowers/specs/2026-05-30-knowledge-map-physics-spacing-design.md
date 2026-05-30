# Spec: Knowledge Map — Real Physics Spacing

## Ringkasan

Knowledge Map saat ini terlihat “sambung2” karena node terlalu rapat. Perubahan ini men-tuning “real physics” (d3-force) agar node lebih renggang dan tidak numpuk, dengan link tetap terlihat.

## Goals

- Node (cluster + paper) lebih menyebar sehingga mudah dibaca.
- Tidak ada overlap/penumpukan node (collision kuat).
- Link tetap ada, tetapi graph tidak menggumpal.
- Stabil (minim jitter) setelah beberapa saat.

## Non-Goals

- Tidak mengubah struktur graph (node/link) atau data pipeline.
- Tidak mengubah mode “cluster islands” / hide links default (hanya “lebih renggang”).
- Tidak mengganti renderer canvas/d3-force dengan engine lain.

## Pendekatan (Force Tuning)

Tuning dilakukan di `KnowledgeMapObsidian.tsx` pada konfigurasi simulation:

1) **Repulsion lebih kuat**
- `forceManyBody().strength(...)` dibuat lebih negatif agar node saling mendorong.

2) **Collision lebih besar**
- `forceCollide().radius(...)` diperbesar agar tidak saling overlap (tambahkan padding).

3) **Link lebih panjang dan tidak terlalu “menarik rapat”**
- `forceLink().distance(...)` diperbesar (spring length).
- `forceLink().strength(...)` diturunkan sedikit agar tidak mengunci node jadi gumpalan.

4) **Stabilisasi gerak**
- Set `velocityDecay` untuk mengurangi jitter.
- Sesuaikan `alpha/alphaDecay` agar settle rapi (tetap ada animasi awal lalu stabil).

## Parameter Target (Baseline)

Nilai final akan dipilih yang paling enak dilihat saat demo, tetapi arahnya:

- charge strength: lebih kuat (mis. ~2x dari sekarang)
- collision padding: naik (mis. +6 sampai +14)
- link distance: naik (mis. ~1.6–2.2x)
- link strength: turun (mis. 0.35–0.6)
- velocityDecay: dinaikkan sedikit agar cepat settle

## Acceptance Criteria

- Setelah result ada, map terlihat lebih renggang dan node tidak menumpuk.
- Zoom/pan/drag tetap berfungsi.
- Node tetap terhubung via link (link tidak disembunyikan).
- Setelah beberapa detik, posisi node relatif stabil (tidak terus bergerak besar).

