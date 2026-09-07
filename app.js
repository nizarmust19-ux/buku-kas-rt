let seluruhDataKas = [];

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
        ? 'flex flex-col items-center justify-center py-2.5 rounded-xl bg-blue-600 text-white transition shadow-sm space-y-1' 
        : 'flex flex-col items-center justify-center py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition space-y-1';
        
    document.getElementById('tab-pengurus').className = tab === 'pengurus' 
        ? 'flex flex-col items-center justify-center py-2.5 rounded-xl bg-blue-600 text-white transition shadow-sm space-y-1' 
        : 'flex flex-col items-center justify-center py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition space-y-1';

    document.getElementById('tab-saran').className = tab === 'saran' 
        ? 'flex flex-col items-center justify-center py-2.5 rounded-xl bg-blue-600 text-white transition shadow-sm space-y-1' 
        : 'flex flex-col items-center justify-center py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition space-y-1';
}

// --- MODUL KAS (FILTER, WA, & PDF) ---
async function muatHalamanKas() {
    seluruhDataKas = await ambilDataKas();
    isiPilihanBulan(seluruhDataKas);
    filterDataLaporan();
}

function isiPilihanBulan(data) {
    let select = document.getElementById('filter-bulan');
    select.innerHTML = '<option value="semua">Semua Periode</option>';
    let setBulan = new Set();

    data.forEach(row => {
        if (row[0]) {
            let tgl = new Date(row[0]);
            if (!isNaN(tgl)) {
                let keyBulan = `${tgl.getFullYear()}-${String(tgl.getMonth() + 1).padStart(2, '0')}`;
                setBulan.add(keyBulan);
            }
        }
    });

    let daftarSorted = Array.from(setBulan).sort().reverse();
    daftarSorted.forEach(b => {
        let [thn, bln] = b.split('-');
        let namaBulan = new Date(thn, bln - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        select.innerHTML += `<option value="${b}">${namaBulan}</option>`;
    });
}

function filterDataLaporan() {
    let bulanDipilih = document.getElementById('filter-bulan').value;
    let tbody = document.getElementById('tabel-transaksi');
    tbody.innerHTML = '';

    let totalMasuk = 0, totalKeluar = 0;
    
    // Hitung Total Kas Keseluruhan untuk Kartu Saldo Utama
    seluruhDataKas.forEach(row => {
        if (row[0]) {
            totalMasuk += parseFloat(row[2]) || 0;
            totalKeluar += parseFloat(row[3]) || 0;
        }
    });

    document.getElementById('txt-masuk').innerText = 'Rp ' + totalMasuk.toLocaleString('id-ID');
    document.getElementById('txt-keluar').innerText = 'Rp ' + totalKeluar.toLocaleString('id-ID');
    document.getElementById('txt-saldo').innerText = 'Rp ' + (totalMasuk - totalKeluar).toLocaleString('id-ID');

    // Filter Data Berdasarkan Pilihan Bulan
    let dataFiltered = seluruhDataKas.filter(row => {
        if (!row[0]) return false;
        if (bulanDipilih === 'semua') return true;
        return row[0].startsWith(bulanDipilih);
    });

    let dataUrut = dataFiltered.sort((a, b) => new Date(b[0]) - new Date(a[0]));

    if (dataUrut.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-slate-400">Tidak ada transaksi pada periode ini.</td></tr>`;
        return;
    }

    dataUrut.forEach(row => {
        let masuk = parseFloat(row[2]) || 0;
        let keluar = parseFloat(row[3]) || 0;

        tbody.innerHTML += `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-2.5 text-slate-500">${row[0]}</td>
                <td class="p-2.5 font-medium">${row[1]}</td>
                <td class="p-2.5 text-right text-emerald-600">${masuk > 0 ? 'Rp ' + masuk.toLocaleString('id-ID') : '-'}</td>
                <td class="p-2.5 text-right text-rose-600">${keluar > 0 ? 'Rp ' + keluar.toLocaleString('id-ID') : '-'}</td>
            </tr>
        `;
    });
}

// Fitur Bagikan Rekap ke WA
function bagikanKeWA() {
    let filterVal = document.getElementById('filter-bulan').value;
    let namaPeriode = "Semua Periode";
    
    if(filterVal !== 'semua') {
        let [thn, bln] = filterVal.split('-');
        namaPeriode = new Date(thn, bln - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    }

    let totalM = document.getElementById('txt-masuk').innerText;
    let totalK = document.getElementById('txt-keluar').innerText;
    let saldoA = document.getElementById('txt-saldo').innerText;

    let pesan = `*📢 LAPORAN KAS RT 01 / RW 03*\n`;
    pesan += `*Periode:* ${namaPeriode}\n\n`;
    pesan += `🟢 *Total Masuk:* ${totalM}\n`;
    pesan += `🔴 *Total Keluar:* ${totalK}\n`;
    pesan += `💰 *Saldo Akhir:* ${saldoA}\n\n`;
    pesan += `_Transparansi Keuangan Warga RT 01/RW 03_`;

    let urlWA = `https://wa.me/?text=${encodeURIComponent(pesan)}`;
    window.open(urlWA, '_blank');
}

// Fitur Unduh PDF Laporan
function unduhPDF() {
    let filterVal = document.getElementById('filter-bulan').value;
    let namaPeriode = "Semua_Periode";
    
    if(filterVal !== 'semua') {
        namaPeriode = filterVal;
    }

    let element = document.getElementById('area-laporan-kas');
    
    let opt = {
        margin:       0.3,
        filename:     `Laporan_Kas_RT01_RW03_${namaPeriode}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

// --- MODUL PENGURUS & POJOK WARGA ---
async function muatHalamanPengurus() {
    let data = await ambilDataPengurus();
    let list = document.getElementById('list-pengurus');
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
        tutupModalAdmin();
    } catch (err) {
        alert('Gagal menyimpan.');
        btn.innerText = 'Simpan Transaksi';
        btn.disabled = false;
    }
}

async function kirimSaran(e) {
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
