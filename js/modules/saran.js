import { ambilDataSaran, kirimSaranApi } from '../api.js';

export async function initSaran() {
    await muatDaftarSaran();
}

export async function kirimSaran(e) {
    e.preventDefault();
    let btn = document.getElementById('btn-saran');
    btn.innerText = 'Mengirim...';
    btn.disabled = true;

    let d = new Date();
    let waktuRealtime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

    let dataBaru = {
        "Tanggal": waktuRealtime,
        "Nama": document.getElementById('saran-nama').value,
        "Pesan": document.getElementById('saran-pesan').value
    };

    try {
        await kirimSaranApi(dataBaru);
        alert('Yeay! Pesan / coret-coretan kamu berhasil dikirim. 🎉');
        document.getElementById('form-saran').reset();
        await muatDaftarSaran();
        btn.innerText = 'Kirim Pesan 🚀';
        btn.disabled = false;
    } catch (err) {
        alert('Gagal mengirim pesan, coba lagi ya.');
        btn.innerText = 'Kirim Pesan 🚀';
        btn.disabled = false;
    }
}

async function muatDaftarSaran() {
    let listContainer = document.getElementById('list-saran');
    if (!listContainer) return;

    try {
        let data = await ambilDataSaran();
        listContainer.innerHTML = '';

        if (!data || data.length === 0) {
            listContainer.innerHTML = `<p class="text-xs sm:text-sm text-slate-400 text-center py-4">Belum ada coretan. Jadilah yang pertama nulis!</p>`;
            return;
        }

        let dataUrutSaran = [...data].sort((a, b) => new Date(b.Tanggal || b[0] || 0) - new Date(a.Tanggal || a[0] || 0));

        dataUrutSaran.forEach(row => {
            let nama = row.Nama || row[1] || 'Warga Anonim';
            let pesan = row.Pesan || row[2] || '';

            if (pesan) {
                listContainer.innerHTML += `
                    <div class="p-3 bg-slate-50 rounded-xl border text-xs sm:text-sm space-y-1">
                        <span class="font-bold text-blue-600 block">${nama}</span>
                        <p class="text-slate-700 italic">"${pesan}"</p>
                    </div>
                `;
            }
        });
    } catch (e) {
        listContainer.innerHTML = `<p class="text-xs sm:text-sm text-slate-400 text-center py-4">Gagal memuat pesan.</p>`;
    }
}
