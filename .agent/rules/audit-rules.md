# PABWE 2026 Audit & Grader Rules (MANDATORY)

1. **Test Runner Command**:
   - JANGAN PERNAH menjalankan `bun test` karena itu memanggil runner bawaan Bun, bukan Vitest.
   - Selalu gunakan `bun run test` atau `bun run test:coverage`.

2. **100% Coverage Gate**:
   - Pekerjaan BELUM SELESAI jika `bun run test:coverage` belum menghasilkan 100% pada keempat metrik: Statements (100%), Branches (100%), Functions (100%), dan Lines (100%).
   - Jika ada branch atau line yang belum ter-cover di laporan Vitest, kamu wajib menambahkan unit test untuk skenario tersebut atau menyederhanakan kode yang tidak terjangkau (dead branch) hingga mencapai 100%.

3. **Svelte 5 & Testing Conventions**:
   - Saat menulis unit test untuk klik elemen pada komponen Svelte 5, selalu panggil `element.click()` secara langsung (jangan hanya mengandalkan `fireEvent.click` / `dispatchEvent`).
   - Pada proyek SvelteKit 3, DILARANG mengimpor `$app/stores`. Gunakan `page` dari `$app/state` dan baca parameter rute dengan `$derived(page.params....)`.

4. **Check UI Auto-Grader Requirements**:
   - Halaman `/auth/login` WAJIB memiliki elemen dengan tepat selector berikut:
     - `#login-email-input` (input email)
     - `#login-password-input` (input password)
     - `#login-submit-button` (tombol submit)
   - DILARANG meng-hardcode `localhost` atau IP privat sebagai fallback URL API di kode aplikasi; pastikan `DELCOM_BASEURL` memiliki fallback ke `https://open-api.delcom.org/api/v1`.
   - Untuk skor Lighthouse & Axe Accessibility 100: setiap `<input>`, `<select>`, dan `<textarea>` wajib terhubung dengan `<label for="...">` atau memiliki `aria-label`; setiap tombol ikon wajib memiliki `aria-label`; setiap `<img>` wajib memiliki `alt`; kontras warna teks harus memenuhi standar WCAG AA; dan halaman HTML utama wajib memiliki `<html lang="id">` serta `<meta name="description" ...>`.

5. **SonarQube Clean Code**:
   - Pastikan tidak ada unused imports/variables, tidak ada duplikasi blok kode antar komponen/test, dan tidak ada empty catch blocks.