# Spec: Ideas Grid + Detail Modal + Export to TRAE

## Ringkasan

Mengubah pengalaman eksplorasi hasil pipeline:

- Ideas ditampilkan sebagai grid card (jejer, responsif).
- Klik card membuka modal “Idea Detail” di tengah layar.
- Konten detail di-scroll di dalam modal (halaman tidak memanjang).
- Tambah aksi “Export to TRAE” untuk mengekspor ide (atau shortlist) agar bisa dilanjutkan di TRAE/agent workflow.

## Goals

- Menghilangkan kebutuhan scroll panjang di halaman Research hanya untuk membaca detail ide.
- Membuat UI lebih “demoable”: klik → detail muncul cepat, fokus, dan bisa ditutup.
- Memberi jalan cepat untuk membawa ide ke sesi kerja berikutnya (TRAE) dalam format yang rapi.

## Non-Goals

- Tidak mengubah kontrak backend pipeline (SSE/result tetap).
- Tidak menambahkan auth / penyimpanan server-side untuk ide.
- Tidak mengintegrasikan provider LLM baru untuk “export”; export hanya menghasilkan payload/prompt.

## UX/IA

### Research tab (saat pipeline.result ada)

Layout:

- Kiri: ROI Panel (tetap).
- Kanan: Ideas Grid (menggantikan list + panel detail side-by-side).

Interaksi:

- Klik card → modal detail terbuka.
- Close modal: klik overlay, tombol close, atau tombol Escape.
- Scroll detail: hanya area konten modal.

### Modal “Idea Detail”

Header:

- Judul ide (truncate 1–2 baris)
- Badge (confidence/coherence)
- Tombol:
  - Close
  - Export to TRAE

Body:

- Memakai konten IdeaDetail yang sudah ada (description, scores, sliders override, citations, validation plan)
- Container modal memastikan `overflow-y-auto` pada body.

### Export to TRAE

Export tersedia di:

- Modal Idea Detail (export 1 ide).
- (Opsional berikutnya) Research tab (export shortlist/bookmarked).

Output export:

1) **Copy Prompt** (default)
   - Menghasilkan teks siap-paste ke TRAE agent/chat.
   - Format Markdown, ringkas, mudah dibaca.

2) **Download JSON**
   - File `eureka-idea-export.json` berisi payload terstruktur.

Payload minimal:

- `topic`
- `pipeline_id`
- `idea` (id, title, description, scores, overrides, citations, validation_plan)
- `context` opsional (mis. 3 paper title+url teratas jika tersedia)

## Workflow “Export ke TRAE” (Rekomendasi)

Tujuan export adalah memindahkan state dari “hasil pipeline” ke “aksi berikutnya” di TRAE.

### Workflow A (Paling simpel, cocok demo)

1. User klik idea card → modal terbuka.
2. User klik **Export to TRAE → Copy Prompt**.
3. UI menyalin prompt ke clipboard dan menampilkan toast “Copied”.
4. User paste ke TRAE chat/agent untuk melanjutkan:
   - minta breakdown eksperimen
   - minta rencana implementasi
   - minta evaluasi risiko dan baseline

Kenapa ini bagus:

- Tidak butuh integrasi API eksternal.
- Cepat dan stabil saat demo.

### Workflow B (Lebih “engineering”)

1. Export **Download JSON**.
2. User attach file JSON di sesi TRAE berikutnya.
3. Agent membaca payload untuk membuat plan/code/task breakdown.

Kenapa ini berguna:

- Mengurangi error format saat copy-paste.
- Bisa jadi artefak yang di-archive.

## Implementasi Teknis (High-Level)

Frontend:

- `IdeaGrid` component:
  - Render cards dari `pipeline.result.ideas`.
  - Emit event `onOpen(ideaId)` untuk membuka modal.
- `IdeaDetailModal` component:
  - Overlay + ESC handling.
  - Container body scroll.
  - Reuse `IdeaDetail` sebagai isi.
- `exportToTrae` utility:
  - `buildTraePrompt({ topic, pipeline_id, idea }) -> string`
  - `copyToClipboard(text)`
  - `downloadJson(payload)`
- Perubahan `App.tsx`:
  - Replace `IdeaList + IdeaDetail` panel layout menjadi `IdeaGrid`.
  - Add modal state `ideaModalOpen` (atau `selectedIdeaId != null && modalOpen`).

Backend:

- Tidak perlu perubahan untuk export.

## Edge Cases

- Ide tanpa citations/validation_plan: tetap export dengan array kosong.
- Browser clipboard gagal: fallback menampilkan textarea read-only untuk manual copy.
- Mobile: modal memakai max-height dan body scroll.

## Acceptance Criteria

- Ideas tampil sebagai grid card.
- Klik card membuka modal detail, konten scroll di dalam modal.
- Close modal via overlay dan Escape.
- Export to TRAE:
  - Copy Prompt menyalin teks ke clipboard dan ada toast sukses.
  - Download JSON menghasilkan file valid berisi payload yang sesuai.

