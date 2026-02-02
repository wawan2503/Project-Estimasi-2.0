import React, { useState } from 'react';
import { Search, Book, MessageCircle, FileText, Video, ChevronDown, ChevronRight, ExternalLink, Mail, Phone } from 'lucide-react';
import MobileHeader from '../../components/MobileHeader';

const faqs = [
  { q: 'Bagaimana cara menambah project baru?', a: 'Klik tombol "New Project" di halaman Projects, isi form yang muncul, lalu klik Save.' },
  { q: 'Bagaimana cara mengedit material panel?', a: 'Buka detail project, klik panel yang ingin diedit, lalu klik icon Edit. Anda bisa mengubah qty, factor, discount, dll.' },
  { q: 'Apa itu Level View (L1-L4)?', a: 'Level View mengatur detail kolom yang ditampilkan. L1 = basic, L2 = +specs, L3 = +pricing, L4 = full calculation.' },
  { q: 'Bagaimana cara export ke Excel/Word?', a: 'Di halaman Project Detail, klik tombol Excel atau Word di header untuk mengunduh dokumen.' },
  { q: 'Bagaimana cara mengubah kurs USD?', a: 'Saat ini kurs diset default Rp 16.000. Fitur pengaturan kurs akan tersedia di update mendatang.' },
];

const guides = [
  { title: 'Memulai dengan GAE System', desc: 'Panduan dasar untuk pengguna baru', icon: Book },
  { title: 'Manajemen Project', desc: 'Cara membuat dan mengelola project', icon: FileText },
  { title: 'Panel & Material', desc: 'Menambah panel dan mengatur material', icon: FileText },
  { title: 'Export Dokumen', desc: 'Export ke Excel dan Word', icon: FileText },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800">
      <button onClick={() => setOpen(!open)} className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50">
        <span className="font-medium text-slate-800 dark:text-slate-200">{q}</span>
        {open ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400">{a}</div>}
    </div>
  );
};

const HelpCenter = ({ setSidebarOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Help Center" />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-12 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-3">Hai, ada yang bisa kami bantu?</h1>
          <p className="text-blue-100 mb-6">Cari jawaban atau hubungi tim support kami</p>
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Cari pertanyaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-white/30"
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto w-full">
        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {guides.map((g, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all">
              <g.icon size={24} className="text-blue-600 mb-2" />
              <h3 className="font-semibold text-sm text-slate-800 dark:text-white">{g.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{g.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <MessageCircle size={18} className="text-blue-600" /> Pertanyaan Umum (FAQ)
            </h2>
          </div>
          <div>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)
            ) : (
              <div className="p-8 text-center text-slate-400">Tidak ada hasil untuk "{searchTerm}"</div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white">
          <h2 className="font-bold text-lg mb-2">Masih butuh bantuan?</h2>
          <p className="text-slate-300 text-sm mb-4">Tim support kami siap membantu Anda</p>
          <div className="flex flex-wrap gap-3">
            <a href="mailto:dashboard.monitoring@senzo.id?subject=GAE%20System%20-%20Bantuan&body=Halo%20Tim%20Support,%0A%0ASaya%20butuh%20bantuan%20mengenai:%0A%0A" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
              <Mail size={16} /> dashboard.monitoring@senzo.id
            </a>
            <a href="tel:+6281234567890" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
              <Phone size={16} /> +62 812-3456-7890
            </a>
          </div>
        </div>

        {/* Version */}
        <div className="mt-8 text-center text-xs text-slate-400">
          GAE Enterprise System v1.0.0 • © 2026
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
