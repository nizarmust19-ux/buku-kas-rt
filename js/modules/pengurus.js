import { ambilDataPengurus } from '../api.js';

export async function initPengurus() {
    let data = await ambilDataPengurus();
    let list = document.getElementById('list-pengurus');
    if(!list) return;
    list.innerHTML = '';

    if(!data || data.length === 0) {
        list.innerHTML = `<p class="text-xs sm:text-sm text-slate-400 text-center py-6">Belum ada data pengurus.</p>`;
        return;
    }

    data.forEach(row => {
        if (row[0]) {
            list.innerHTML += `
                <div class="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border text-xs sm:text-sm">
                    <div>
                        <p class="font-bold text-slate-800">${row[1]}</p>
                        <p class="text-slate-500 text-xs">${row[0]}</p>
                    </div>
                    <a href="https://wa.me/${row[2]}" target="_blank" class="bg-emerald-500 text-white px-3.5 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition">WhatsApp</a>
                </div>
            `;
        }
    });
}
