import { LegalShell } from "./LegalShell";

export default function PrivacyPolicyPage() {
  return (
    <LegalShell title="Kebijakan Privasi" updatedAt="15 September 2026">
      <section className="space-y-3">
        <p>
          Invite adalah layanan undangan digital yang memungkinkan Anda membuat, mengatur, dan
          membagikan undangan secara mandiri. Kebijakan ini menjelaskan data apa yang kami
          kumpulkan, bagaimana data itu digunakan, dan hak Anda atas data tersebut.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">1. Data yang kami kumpulkan</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Data akun: nama, alamat email, dan nomor WhatsApp (opsional) saat mendaftar, termasuk
            nama dan email dari akun Google bila Anda masuk lewat Google.
          </li>
          <li>
            Data undangan: nama mempelai, jadwal dan lokasi acara, cerita, foto, serta pengaturan
            tema yang Anda isi.
          </li>
          <li>
            Data tamu: nama tamu yang Anda tambahkan untuk membuat link personal. Data ini tidak
            dapat diakses publik.
          </li>
          <li>
            Interaksi tamu: konfirmasi kehadiran (RSVP) dan ucapan yang dikirim tamu pada undangan
            Anda.
          </li>
          <li>Data pembayaran: bukti transfer yang Anda unggah saat mengajukan upgrade paket.</li>
          <li>
            Data teknis: alamat IP dan informasi perangkat dasar dari log layanan, digunakan untuk
            keamanan dan pencegahan penyalahgunaan.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">2. Cara kami menggunakan data</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Menyediakan dan mengoperasikan layanan undangan digital.</li>
          <li>Mengautentikasi akun Anda, termasuk login lewat Google.</li>
          <li>Menyimpan konten undangan dan menampilkannya pada tautan yang Anda bagikan.</li>
          <li>Memproses konfirmasi kehadiran, ucapan, dan pengajuan upgrade paket.</li>
          <li>Menjaga keamanan layanan dan mencegah penyalahgunaan.</li>
          <li>Menghubungi Anda terkait akun atau layanan bila diperlukan.</li>
        </ul>
        <p>
          Kami tidak menjual data pribadi Anda dan tidak menggunakannya untuk iklan pihak ketiga.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          3. Penyimpanan dan pihak ketiga
        </h2>
        <p>
          Data disimpan pada infrastruktur penyedia layanan yang kami gunakan, yaitu Supabase
          (basis data, autentikasi, dan penyimpanan berkas) serta Cloudflare (hosting dan
          jaringan). Login Google diproses oleh Google. Data dapat disimpan atau diproses di luar
          Indonesia sesuai lokasi layanan penyedia tersebut.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          4. Akses dan penyimpanan lokal
        </h2>
        <p>
          Kami memakai penyimpanan lokal peramban (localStorage) untuk menyimpan sesi login agar
          Anda tidak perlu masuk berulang kali. Kami tidak memakai cookie periklanan.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">5. Hak Anda</h2>
        <p>Anda berhak untuk:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Mengakses dan memperbarui data profil serta konten undangan Anda.</li>
          <li>Meminta salinan atau penghapusan data akun Anda.</li>
          <li>Menarik persetujuan atas pemrosesan data yang berbasis persetujuan.</li>
        </ul>
        <p>
          Permintaan dapat dikirim ke alamat email kontak pada halaman ini. Kami akan menindaklanjuti
          dalam waktu yang wajar.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          6. Penyimpanan dan penghapusan
        </h2>
        <p>
          Data disimpan selama akun Anda aktif atau selama diperlukan untuk menyediakan layanan.
          Undangan yang telah kedaluwarsa dapat dihapus sesuai kebijakan paket. Anda dapat meminta
          penghapusan akun beserta datanya melalui email kontak.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">7. Keamanan</h2>
        <p>
          Akses data dibatasi dengan aturan keamanan tingkat baris (Row Level Security) sehingga
          tiap pengguna hanya dapat mengakses datanya sendiri. Koneksi ke layanan menggunakan
          HTTPS. Meski demikian, tidak ada sistem yang sepenuhnya bebas risiko.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">8. Anak-anak</h2>
        <p>
          Layanan ini tidak ditujukan untuk anak di bawah usia 18 tahun. Bila Anda membuat akun
          untuk pihak lain, pastikan Anda memiliki izin yang diperlukan.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          9. Perubahan kebijakan
        </h2>
        <p>
          Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan akan ditandai dengan
          tanggal pembaruan di bagian atas halaman.
        </p>
      </section>
    </LegalShell>
  );
}
