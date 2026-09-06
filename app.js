// --- MODUL UTAMA APLIKASI (CONTROLLER) ---
window.onload = function() {
    muatHalamanKas();
    muatHalamanPengurus();
}

function gantiTab(tab) {
    document.getElementById('section-laporan').classList.toggle('hidden', tab !== 'laporan');
    document.getElementById('section-pengurus').classList.toggle('hidden', tab !== 'pengurus');
    
    document.getElementById('tab-laporan').className = tab === 'laporan' 
        ? 'flex-1 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white transition' 
        : 'flex-1 py-2 text-sm font-semibold rounded-lg text-slate-600 transition';
        
    document.getElementById('tab-pengurus').className = tab === 'pengurus' 
        ? 'flex-1 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white transition' 
        : 'flex-1 py-2 text-sm font-semibold rounded-lg text-slate-600 transition';
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

    // Hitung total keseluruhan untuk kartu ringkasan
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

    // Ambil maksimal 10 transaksi terakhir (dibalik agar data yang baru diinput muncul di atas)
    let dataTerbalik = [...data].reverse();
    let data10Terakhir = dataTerbalik.slice(0, 10);

    data10Terakhir.forEach(row => {
        if (row[0]) {
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
        }
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
        alert('Data kas berhasil disimpan!');
        document.getElementById('form-kas').reset();
        
        // Refresh tabel otomatis tanpa reload halaman
        await muatHalamanKas();
        
        btn.innerText = 'Simpan Transaksi';
        btn.disabled = false;
    } catch (err) {
        alert('Gagal menyimpan.');
        btn.innerText = 'Simpan Transaksi';
        btn.disabled = false;
    }
}
