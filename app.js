// --- MODUL UTAMA APLIKASI (CONTROLLER) ---
window.onload = function() {
    muatHalamanKas();
    muatHalamanPengurus();
    muatDaftarSaran();
}

function gantiTab(tab) {
    document.getElementById('section-laporan').classList.toggle('hidden', tab !== 'laporan');
    document.getElementById('section-pengurus').classList.toggle('hidden', tab !== 'pengurus');
    document.getElementById('section-saran').classList.toggle('hidden', tab !== 'saran');
    
    document.getElementById('tab-laporan').className = tab === 'laporan' 
        ? 'flex-1 py-2 font-semibold rounded-lg bg-blue-600 text-white transition' 
        : 'flex-1 py-2 font-semibold rounded-lg text-slate-600 transition';
        
    document.getElementById('tab-pengurus').className = tab === 'pengurus' 
        ? 'flex-1 py-2 font-semibold rounded-lg bg-blue-600 text-white transition' 
        : 'flex-1 py-2 font-semibold rounded-lg text-slate-600 transition';

    document.getElementById('tab-saran').className = tab === 'saran' 
        ? 'flex-1 py-2 font-semibold rounded-lg bg-blue-600 text-white transition' 
        : 'flex-1 py-2 font-semibold rounded-lg text-slate-600 transition';
}

async function muatHalamanKas() {
    let data = await ambilDataKas();
    let tbody = document.getElementById('tabel-transaksi');
    tbody.innerHTML = '';
    let totalMasuk = 0, totalKeluar = 0;

    if(data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-400">Belum ada data kas.</td></tr>`;
        return;
    }

    data.forEach(row => {
        if (row[0]) {
            let masuk = parseFloat(row[2]) || 0;
            let keluar = parseFloat(row[3]) || 0;
            totalMasuk += masuk;
            totalKeluar += keluar;
        }
    });

    document.getElementById('txt-masuk').innerText = 'Rp ' + totalMasuk.toLocaleString('id-ID');
    document.getElementById('txt-keluar').innerText = 'Rp ' + totalKeluar.toLocaleString('id-ID');
    document.getElementById('txt-saldo').innerText = 'Rp ' + (totalMasuk - totalKeluar).toLocaleString('id-ID');

    // URUTKAN OTOMATIS BERDASARKAN TANGGAL TERBARU (Kas)
    let dataUrut = data.filter(row => row[0]).sort((a, b) => {
        let tglA = new Date(a[0]);
        let tglB = new Date(b[0]);
        return tglB - tglA; // Tanggal terbaru di atas
    });

    let data10Terakhir = dataUrut.slice(0, 30);

    data10Terakhir.forEach(row => {
        let masuk = parseFloat(row[2]) || 0;
        let keluar = parseFloat(row[3]) || 0;

        tbody.innerHTML += `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-2 text-slate-500">${row[0]}</td>
                <td class="p-2 font-medium">${row[1]}</td>
                <td class="p-2 text-right text-emerald-600">${masuk > 0 ? 'Rp ' + masuk.toLocaleString('id-ID') : '-'}</td>
                <td class="p-2 text-right text-rose-600">${keluar > 0 ? 'Rp ' + keluar.toLocaleString('id-ID') : '-'}</td>
            </tr>
        `;
    });
}

async function muatHalamanPengurus() {
    let data = await ambilDataPengurus();
    let list = document.getElementById('list-pengurus');
    list.innerHTML = '';

    if(data.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">Belum ada data pengurus.</p>`;
        return;
    }

    data.forEach(row => {
        if (row[0]) {
            list.innerHTML += `
                <div class="flex justify-between items-center p-3 bg-slate-50 rounded-lg border text-xs">
                    <div>
                        <p class="font-bold text-slate-800">${row[1]}</p>
                        <p class="text-slate-500 text-[11px]">${row[0]}</p>
                    </div>
                    <a href="https://wa.me/${row[2]}" target="_blank" class="bg-emerald-500 text-white px-3 py-1.5 rounded-md font-semibold hover:bg-emerald-600 transition">WhatsApp</a>
                </div>
            `;
        }
    });
}

async function kirimDataKas(e) {
    e.preventDefault();
    let btn = document.getElementById('btn-simpan');
    btn.innerText = 'Menyimpan...';
    btn.disabled = true;

    let newData = {
        "Tanggal": document.getElementById('input-tgl').value,
        "Uraian": document.getElementById('input-uraian').value,
        "Pemasukan": document.getElementById('input-masuk').value || 0,
        "Pengeluaran": document.getElementById('input-keluar').value || 0
    };

    try {
        await simpanDataKasApi(newData);
        alert('Transaksi berhasil disimpan!');
        document.getElementById('form-kas').reset();
        await muatHalamanKas();
        btn.innerText = 'Simpan Transaksi';
        btn.disabled = false;
    } catch (err) {
        alert('Gagal menyimpan.');
        btn.innerText = 'Simpan Transaksi';
        btn.disabled = false;
    }
}

// --- MODUL POJOK WARGA ---
async function kirimSaran(e) {
    e.preventDefault();
    let btn = document.getElementById('btn-saran');
    btn.innerText = 'Mengirim...';
    btn.disabled = true;

    // Ambil tanggal otomatis secara real-time
    let d = new Date();
    let tanggalOtomatis = d.toISOString().split('T')[0];

    let dataBaru = {
        "Tanggal": tanggalOtomatis,
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
            listContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-2">Belum ada coretan. Jadilah yang pertama nulis!</p>`;
            return;
        }

        // URUTKAN OTOMATIS BERDASARKAN TANGGAL TERBARU (Pojok Warga)
        let dataUrutSaran = [...data].sort((a, b) => {
            let tglA = new Date(a.Tanggal || a[0]);
            let tglB = new Date(b.Tanggal || b[0]);
            return tglB - tglA; // Tanggal terbaru di atas
        });

        // Ambil 5 pesan terbaru
        let data5Terakhir = dataUrutSaran.slice(0, 5);

        data5Terakhir.forEach(row => {
            let nama = row.Nama || row[1] || 'Warga Anonim';
            let pesan = row.Pesan || row[2] || '';
            let tgl = row.Tanggal || row[0] || '';

            if (pesan) {
                listContainer.innerHTML += `
                    <div class="p-2.5 bg-slate-50 rounded-lg border text-xs space-y-1">
                        <div class="flex justify-between items-center text-[10px] text-slate-400">
                            <span class="font-bold text-blue-600">${nama}</span>
                            <span>${tgl}</span>
                        </div>
                        <p class="text-slate-700 italic">"${pesan}"</p>
                    </div>
                `;
            }
        });
    } catch (e) {
        listContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-2">Gagal memuat pesan.</p>`;
    }
}
    
