import { initKas, filterDataLaporan, bagikanKeWA, unduhPDF, kirimDataKas } from './modules/kas.js';
import { initPengurus } from './modules/pengurus.js';
import { initSaran, kirimSaran } from './modules/saran.js';
import { cekPasswordAdmin, bukaModalAdmin, tutupModalAdmin } from './auth.js';

window.onload = function() {
    initKas();
    initPengurus();
    initSaran();
};

window.gantiTab = function(tab) {
    document.getElementById('section-laporan').classList.toggle('hidden', tab !== 'laporan');
    document.getElementById('section-pengurus').classList.toggle('hidden', tab !== 'pengurus');
    document.getElementById('section-saran').classList.toggle('hidden', tab !== 'saran');
    document.getElementById('section-panduan').classList.toggle('hidden', tab !== 'panduan');
    
    let tabs = ['laporan', 'pengurus', 'saran', 'panduan'];
    tabs.forEach(t => {
        let el = document.getElementById(`tab-${t}`);
        if(el) {
            el.className = tab === t 
                ? 'flex flex-col items-center justify-center p-2 rounded-xl bg-blue-600 text-white transition space-y-1 font-medium' 
                : 'flex flex-col items-center justify-center p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition space-y-1 font-medium';
        }
    });
};

// Hubungkan fungsi global ke modul-modul
window.bukaModalAdmin = bukaModalAdmin;
window.tutupModalAdmin = tutupModalAdmin;
window.cekPasswordAdmin = cekPasswordAdmin;
window.filterDataLaporan = filterDataLaporan;
window.bagikanKeWA = bagikanKeWA;
window.unduhPDF = unduhPDF;
window.kirimDataKas = kirimDataKas;
window.kirimSaran = kirimSaran;
