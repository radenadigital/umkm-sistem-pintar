import React from 'react';
import { AlertCircle, Database, ShieldAlert, AlertTriangle, Download, Upload, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Disclaimer() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <AlertCircle className="text-amber-600" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Disclaimer Penyimpanan Database</h1>
          <p className="text-slate-500 text-sm">Informasi penting tentang bagaimana sistem penyimpanan data</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Bagian Utama */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <Database className="text-indigo-600" size={24} />
            <h2 className="text-lg font-bold text-slate-800">Bagaimana Sistem Menyimpan Data?</h2>
          </div>
          <p className="text-slate-700 mb-4">
            Sistem <strong>UMKM Go Digital</strong> menyimpan seluruh data (profil bisnis, transaksi, pelanggan, dll.) di <strong>localStorage</strong> pada browser/perangkat Anda dengan mekanisme pengkategorian berdasarkan <code>userId</code>.
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
            <p className="text-sm text-slate-700">
              <span className="font-bold text-indigo-600">✓</span> Setiap pengguna memiliki database sendiri yang tidak saling tercampur dengan pengguna lain.
            </p>
          </div>
        </motion.div>

        {/* Penting Diketahui */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="text-rose-600" size={24} />
            <h2 className="text-lg font-bold text-slate-800">Penting untuk Diketahui!</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <h3 className="font-semibold text-rose-800 mb-2">1. LocalStorage Bukan Penyimpanan Aman untuk Data Sensitif</h3>
              <p className="text-rose-700 text-sm">
                Penyimpanan ini bersifat <strong>client-side</strong> dan <strong>tidak terenkripsi</strong> secara default. Hindari menyimpan informasi sensitif seperti nomor rekening, NIK/KTP, password lain, atau detail data keuangan pribadi.
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <h3 className="font-semibold text-amber-800 mb-2">2. Data Tersimpan Satu Perangkat Saja</h3>
              <p className="text-amber-700 text-sm">
                Data yang Anda masukkan di Perangkat A <strong>tidak otomatis sinkron</strong> dengan Perangkat B. Setiap perangkat/browser memiliki salinan data sendiri.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <h3 className="font-semibold text-orange-800 mb-2">3. Risiko Kehilangan Data</h3>
              <p className="text-orange-700 text-sm">
                Data bisa hilang jika membersihkan cache/history browser, menghapus data situs di pengaturan browser, menggunakan mode incognito/pribadi, atau jika browser mengalami kerusakan.
              </p>
            </div>
          </div>
          </motion.div>

        {/* Saran Tindakan */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-emerald-600" size={24} />
            <h2 className="text-lg font-bold text-slate-800">Saran Tindakan yang Dapat Anda Lakukan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Download size={18} className="text-emerald-600" />
                <h3 className="font-semibold text-emerald-800">1. Cadangkan Data Secara Berkala</h3>
              </div>
              <p className="text-emerald-700 text-sm">
                Buat sistem untuk mengekspor dan mengimpor data (contoh: export JSON/CSV) sehingga Anda dapat memulihkan data jika terjadi kehilangan.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-blue-600" />
                <h3 className="font-semibold text-blue-800">2. Pertimbangkan Migrasi ke Backend Nyata</h3>
              </div>
              <p className="text-blue-700 text-sm">
                Jika aplikasi digunakan untuk kebutuhan bisnis serius atau oleh banyak pengguna, migrasikan ke penyimpanan server-side seperti Firebase, Supabase, atau backend custom.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={18} className="text-purple-600" />
                <h3 className="font-semibold text-purple-800">3. Gunakan Pengkodean untuk Data Sensitif</h3>
              </div>
              <p className="text-purple-700 text-sm">
                Jika masih ingin menggunakan localStorage, pastikan untuk mengenkripsi data sensitif sebelum menyimpannya.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-slate-600" />
                <h3 className="font-semibold text-slate-800">4. Dokumentasikan Perubahan</h3>
              </div>
              <p className="text-slate-700 text-sm">
                Untuk pengembangan selanjutnya, pertimbangkan untuk menambahkan fitur auto-sync ke cloud, opsi backup manual/otomatis, dan konfirmasi sebelum menghapus data.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
