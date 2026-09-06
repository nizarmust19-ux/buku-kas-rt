// --- MODUL UTAMA APLIKASI (CONTROLLER) ---
let cacheDataKas = []; // Menyimpan data mentah agar filter cepat

window.onload = function() {
    // Set default input bulan ke bulan saat ini (Format: YYYY-MM)
    let sekarang = new Date();
    let tahun = sekarang.getFullYear();
    let bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
    document.getElementById('pilih-bulan').value = `${tahun}-${bulan}`;

    muatDataAwal();
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

async function muatDataAwal() {
    cacheDataKas = await ambilDataKas();
    filterDataBulan();
}

// Fungsi untuk menyaring data berdasarkan bulan yang dipilih di dropdown
function filterDataBulan() {
    let bulanPilihan = document.getElementById('pilih-bulan').value; // Contoh: "2026-06"
    let tbody = document.getElementById('tabel-transaksi');
    tbody.innerHTML = '';
    
    let totalMasukBulanIni = 0;
    let totalKeluarBulanIni = 0;
    let transaksiBulanIni = [];

    // Filter data sesuai bulan
    cacheDataKas.forEach(row => {
        let tgl = row[0]; // Kolom tanggal (YYYY-MM-DD)
        if (tgl && tgl.startsWith(bulanPilihan)) {
            let masuk = parseFloat(row[2]) || 0;
            let keluar = parseFloat(row[3]) || 0;
            totalMasukBulanIni += masuk;
            totalKeluarBulanIni += keluar;
            transaksiBulanIni.push(row);
        }
    });

    // Update Kartu Ringkasan
    document.getElementById('txt-masuk').innerText = 'Rp ' + totalMasukBulanIni.toLocaleString('id-ID');
    document.getElementById('txt-keluar').innerText = 'Rp ' + totalKeluarBulanIni.toLocaleString('id-ID');
    document.getElementById('txt-saldo').innerText = 'Rp ' + (totalMasukBulanIni - totalKeluarBulanIni).toLocaleString('id-ID');

    // Tampilkan beberapa baris transaksi terbaru pada bulan tersebut (maksimal 5 baris)
    if(transaksiBulanIni.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-400">Tidak ada transaksi pada bulan ini.</td></tr>`;
        document.getElementById('info-jumlah-trx').innerText = "0 transaksi";
        return;
    }

    // Ambil 5 transaksi teratas saja untuk tampilan ringkas
    let transaksiRingkas = transaksiBulanIni.slice(0, 5);
    document.getElementById('info-jumlah-trx').innerText = `Menampilkan ${transaksiRingkas.length} dari ${transaksiBulanIni.length} transaksi`;

    transaksiRingkas.forEach(row => {
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

// Fungsi Export Laporan ke PDF
function exportPDF() {
    let bulanPilih = document.getElementById('pilih-bulan').value;
    let element = document.getElementById('area-pdf');
    
    let opt = {
        margin:       10,
        filename:     `Laporan-Keuangan-RT01-${bulanPilih}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Proses unduh PDF otomatis dari web
    html2pdf().from(element).set(opt).save();
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
        
        // Perbarui data lokal secara otomatis tanpa reload halaman
        await muatDataAwal();
        
        btn.innerText = 'Simpan Transaksi';
        btn.disabled = false;
    } catch (err) {
        alert('Gagal menyimpan.');
        btn.innerText = 'Simpan Transaksi';
        btn.disabled = false;
    }
       }
            
