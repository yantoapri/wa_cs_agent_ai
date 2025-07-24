<template>
  <!-- Header Logo & Judul -->
  <div class="w-full flex flex-col items-center mb-8 mt-8">
    <img
      src="/assets/img/nutra.png"
      alt="Nutra Logo"
      class="h-12 md:h-16 mb-2"
    />
    <h1 class="text-3xl font-bold mt-2">
      Dokumentasi Penggunaan Nutra AI Chat
    </h1>
  </div>
  <div
    class="flex flex-col md:flex-row max-w-6xl mx-auto p-4 md:p-8 bg-white rounded-lg shadow"
  >
    <!-- Sidebar -->
    <nav class="md:w-64 md:mr-8 mb-6 md:mb-0 flex-shrink-0">
      <div class="sticky top-8">
        <h2 class="text-lg font-bold mb-4">Menu Dokumentasi</h2>
        <ul class="space-y-2">
          <li>
            <a href="#get-started" class="text-blue-600 hover:underline"
              >Get Started</a
            >
          </li>
          <li>
            <a href="#inbox" class="text-blue-600 hover:underline">Inbox</a>
          </li>
          <li>
            <a href="#kontak" class="text-blue-600 hover:underline">Kontak</a>
          </li>
          <li>
            <a href="#chanel" class="text-blue-600 hover:underline">Chanel</a>
          </li>
          <li>
            <a href="#agent-ai" class="text-blue-600 hover:underline"
              >Agent AI</a
            >
          </li>
          <li>
            <a href="#agent-manusia" class="text-blue-600 hover:underline"
              >Agent Manusia</a
            >
          </li>
          <li>
            <a href="#my-profile" class="text-blue-600 hover:underline"
              >My Profile</a
            >
          </li>
          <li>
            <a href="#navigasi" class="text-blue-600 hover:underline"
              >Navigasi & Mobile</a
            >
          </li>
          <li>
            <a href="#logout" class="text-blue-600 hover:underline">Logout</a>
          </li>
        </ul>
      </div>
    </nav>
    <!-- Main Content -->
    <div class="flex-1">
      <h2 id="get-started" class="text-xl font-semibold mb-2">Get Started</h2>
      <div class="mb-6 text-gray-700">
        <p class="mb-3">
          Nutra AI Chat adalah platform chat multi-channel yang memudahkan Anda
          mengelola percakapan pelanggan melalui Agent AI maupun Agent Manusia,
          terintegrasi dengan WhatsApp dan channel lain.
        </p>
        <p class="mb-2 font-semibold">Fitur Unggulan:</p>
        <ul class="list-disc ml-6 mb-4">
          <li>
            Multi-agent: kelola Agent AI dan Agent Manusia dalam satu dashboard.
          </li>
          <li>
            Integrasi WhatsApp: mudah menghubungkan channel WhatsApp ke sistem.
          </li>
          <li>Inbox terpusat: semua percakapan masuk dalam satu tampilan.</li>
          <li>Manajemen kontak dan channel yang mudah.</li>
          <li>Switch percakapan antara AI dan manusia secara instan.</li>
          <li>
            Pengaturan Agent AI yang fleksibel (nama, deskripsi, kepintaran,
            status aktif).
          </li>
          <li>Update profil dan password user secara mandiri.</li>
          <li>Desain responsif, optimal di desktop dan mobile.</li>
          <li>Keamanan login dan pengelolaan user.</li>
        </ul>
        <h3 class="text-lg font-semibold mt-6 mb-2">Login</h3>
        <ul class="list-disc ml-6 mb-4">
          <li>
            Masukkan email dan password yang sudah terdaftar pada form login.
          </li>
          <li>Klik tombol <b>Login</b> untuk masuk ke aplikasi.</li>
          <li>
            Jika data benar, Anda akan diarahkan ke halaman utama aplikasi.
          </li>
          <li>Jika lupa password, hubungi admin untuk reset password.</li>
        </ul>
        <h3 class="text-lg font-semibold mt-6 mb-2">Register</h3>
        <ul class="list-disc ml-6 mb-4">
          <li>Klik link <b>Register</b> di halaman login.</li>
          <li>Isi form pendaftaran dengan email dan password yang valid.</li>
          <li>Klik tombol <b>Register</b> untuk membuat akun baru.</li>
          <li>
            Setelah berhasil, Anda bisa langsung login menggunakan akun
            tersebut.
          </li>
        </ul>
      </div>

      <h2 id="inbox" class="text-xl font-semibold mt-6 mb-2">1. Inbox</h2>
      <ul class="list-disc ml-6 mb-4">
        <li>Lihat daftar percakapan dari Agent AI dan Agent Manusia.</li>
        <li>Klik percakapan untuk melihat detail chat.</li>
        <li>
          Gunakan tab di atas list untuk beralih antara percakapan Agent AI dan
          Manusia.
        </li>
        <li>
          Di mobile, klik percakapan untuk masuk ke detail, gunakan tombol back
          untuk kembali ke list.
        </li>
      </ul>
      <h2 id="kontak" class="text-xl font-semibold mt-6 mb-2">2. Kontak</h2>
      <ul class="list-disc ml-6 mb-4">
        <li>Lihat, tambah, edit, dan hapus kontak.</li>
        <li>Klik tombol plus untuk menambah kontak baru.</li>
        <li>
          Klik kontak untuk melihat detail dan chat dengan kontak tersebut.
        </li>
      </ul>
      <h2 id="chanel" class="text-xl font-semibold mt-6 mb-2">3. Chanel</h2>
      <ul class="list-disc ml-6 mb-4">
        <li>Lihat daftar chanel.</li>
        <li>Klik tombol plus untuk menambah chanel baru.</li>
        <li>Klik chanel untuk melihat detail dan melakukan integrasi.</li>
        <li>
          Langkah-langkah integrasi WhatsApp:
          <ul class="list-decimal ml-6 mt-2">
            <li>Pilih chanel WhatsApp dari daftar.</li>
            <li>Jika belum terhubung, akan muncul status dan QR code.</li>
            <li>
              Buka aplikasi WhatsApp di HP, pilih menu
              <b>Linked Devices</b> lalu scan QR code yang muncul di web.
            </li>
            <li>
              Tunggu status koneksi berubah menjadi <b>Ready</b> atau
              <b>Authenticated</b>.
            </li>
            <li>
              Jika ingin menghubungkan Agent AI ke chanel, klik tombol
              <b>Hubungkan</b> pada daftar Agent AI di bawah detail chanel.
            </li>
            <li>
              Jika ingin memutuskan koneksi, klik <b>Putuskan Hubungan</b>.
            </li>
            <li>
              Status integrasi dan agent aktif akan tampil di halaman detail
              chanel.
            </li>
          </ul>
        </li>
      </ul>
      <h2 id="agent-ai" class="text-xl font-semibold mt-6 mb-2">4. Agent AI</h2>
      <ul class="list-disc ml-6 mb-4">
        <li>Lihat daftar Agent AI.</li>
        <li>Klik tombol plus untuk menambah Agent AI baru.</li>
        <li>Klik agent untuk melihat detail dan mengelola konfigurasi.</li>
        <li>
          Langkah-langkah konfigurasi Agent AI:
          <ul class="list-decimal ml-6 mt-2">
            <li>Pilih Agent AI dari daftar.</li>
            <li>Isi atau edit <b>Nama</b> Agent AI sesuai kebutuhan.</li>
            <li>
              Isi <b>Deskripsi</b> untuk menjelaskan peran atau karakter Agent
              AI (opsional).
            </li>
            <li>
              Pilih tingkat <b>Kepintaran</b> (misal: Basic, Advanced) jika
              tersedia.
            </li>
            <li>
              Set <b>Status Aktif</b> untuk mengaktifkan atau menonaktifkan
              Agent AI.
            </li>
            <li>Simpan perubahan konfigurasi.</li>
            <li>
              Untuk mengintegrasikan Agent AI ke chanel, buka detail chanel lalu
              hubungkan Agent AI yang diinginkan.
            </li>
          </ul>
        </li>
      </ul>
      <h2 id="agent-manusia" class="text-xl font-semibold mt-6 mb-2">
        5. Agent Manusia
      </h2>
      <ul class="list-disc ml-6 mb-4">
        <li>Lihat daftar Agent Manusia.</li>
        <li>Klik tombol plus untuk menambah Agent Manusia baru.</li>
        <li>Klik agent untuk melihat detail, edit, atau hapus agent.</li>
      </ul>
      <h2 id="my-profile" class="text-xl font-semibold mt-6 mb-2">
        6. My Profile
      </h2>
      <ul class="list-disc ml-6 mb-4">
        <li>Lihat email user yang sedang login.</li>
        <li>Update password melalui form yang tersedia.</li>
      </ul>
      <h2 id="navigasi" class="text-xl font-semibold mt-6 mb-2">
        7. Navigasi & Mobile
      </h2>
      <ul class="list-disc ml-6 mb-4">
        <li>Gunakan sidebar (☰) di mobile untuk navigasi menu utama.</li>
        <li>
          Tab dan list akan otomatis menyesuaikan tampilan mobile/desktop.
        </li>
      </ul>
      <h2 id="logout" class="text-xl font-semibold mt-6 mb-2">8. Logout</h2>
      <ul class="list-disc ml-6 mb-4">
        <li>
          Gunakan menu avatar (kanan atas/di sidebar mobile) untuk logout.
        </li>
      </ul>
      <div class="mt-8 text-gray-500 text-sm">
        Dokumentasi ini akan terus diperbarui sesuai pengembangan fitur
        aplikasi.
      </div>
    </div>
  </div>
</template>
