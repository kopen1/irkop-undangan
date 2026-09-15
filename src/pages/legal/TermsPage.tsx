import { LegalShell } from "./LegalShell";

export default function TermsPage() {
  return (
    <LegalShell title="Syarat & Ketentuan" updatedAt="15 September 2026">
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">1. Penerimaan</h2>
        <p>
          Dengan membuat akun atau menggunakan layanan Invite, Anda setuju pada syarat dan ketentuan
          ini. Bila Anda tidak setuju, mohon tidak menggunakan layanan.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">2. Akun</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda.</li>
          <li>Anda harus memberikan informasi yang benar saat mendaftar.</li>
          <li>Anda bertanggung jawab atas seluruh aktivitas yang terjadi pada akun Anda.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">3. Konten pengguna</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Anda memiliki hak atas konten yang Anda unggah (teks, foto, dan data tamu) dan
            bertanggung jawab penuh atas konten tersebut.
          </li>
          <li>
            Anda menjamin memiliki hak atau izin untuk seluruh konten yang diunggah, termasuk foto
            dan data tamu.
          </li>
          <li>
            Kami berhak menghapus konten yang melanggar hukum, menyinggung, atau menyalahgunakan
            layanan.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">4. Paket dan pembayaran</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Layanan menyediakan paket Free, Medium, dan Premium dengan kuota yang berbeda.</li>
          <li>
            Upgrade paket dilakukan melalui pengajuan dan verifikasi pembayaran. Plan diterapkan
            setelah pembayaran diverifikasi.
          </li>
          <li>Pembayaran yang telah diverifikasi bersifat final, kecuali ditentukan lain oleh kami.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          5. Penggunaan yang dilarang
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Mengunggah konten ilegal, menyesatkan, atau melanggar hak pihak lain.</li>
          <li>Mengirim spam atau menyalahgunakan link undangan untuk tujuan penipuan.</li>
          <li>Mencoba mengakses data pengguna lain atau mengganggu keamanan layanan.</li>
          <li>Menggunakan layanan untuk aktivitas yang melanggar hukum yang berlaku.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          6. Hak kekayaan intelektual
        </h2>
        <p>
          Nama, logo, tema, dan perangkat lunak Invite dilindungi hak kekayaan intelektual. Anda
          tidak boleh menyalin atau menggunakan milik kami tanpa izin, kecuali untuk penggunaan
          layanan sebagaimana mestinya.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          7. Ketersediaan layanan
        </h2>
        <p>
          Kami berusaha menjaga layanan tetap tersedia, namun tidak menjamin layanan bebas
          gangguan. Kami dapat melakukan pemeliharaan, perubahan, atau penghentian fitur tertentu
          dengan atau tanpa pemberitahuan.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">8. Penafian</h2>
        <p>
          Layanan disediakan &quot;sebagaimana adanya&quot;. Kami tidak bertanggung jawab atas
          kerugian yang timbul dari penggunaan layanan, sejauh diizinkan oleh hukum yang berlaku.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          9. Batasan tanggung jawab
        </h2>
        <p>
          Sejauh diizinkan hukum, tanggung jawab kami atas klaim yang timbul dari layanan dibatasi
          pada jumlah yang Anda bayarkan kepada kami, atau nol bila Anda menggunakan paket gratis.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">10. Penghentian</h2>
        <p>
          Anda dapat berhenti menggunakan layanan kapan saja. Kami dapat menangguhkan atau
          menghentikan akses Anda bila terjadi pelanggaran terhadap ketentuan ini.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">11. Perubahan</h2>
        <p>
          Ketentuan ini dapat diperbarui dari waktu ke waktu. Versi terbaru berlaku sejak tanggal
          pembaruan yang tertera di bagian atas halaman.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          12. Hukum yang berlaku
        </h2>
        <p>
          Ketentuan ini diatur oleh hukum Republik Indonesia. Sengketa diselesaikan secara
          musyawarah terlebih dahulu sebelum menempuh jalur hukum.
        </p>
      </section>
    </LegalShell>
  );
}
