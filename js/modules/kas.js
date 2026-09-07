import { ambilDataKas, simpanDataKasApi } from '../api.js';
import { tutupModalAdmin } from '../auth.js';

let seluruhDataKas = [];

export async function initKas() {
    seluruhDataKas = await ambilDataKas();
    isiPilihanBulan(seluruhDataKas);
    filterDataLaporan();
}

function isiPilihanBulan(data) {
    let select = document.getElementById('filter-bulan');
    if(!select) return;
    select.innerHTML = '';
    let setBulan = new Set();

    data.forEach(row => {
        if (row[0]) {
            let tglStr = String(row[0]).trim();
            let tgl = new Date(tglStr);
            
            if (isNaN(tgl) && tglStr.includes('/')) {
                let parts = tglStr.split('/');
                if(parts.length === 3) tgl = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }

            if (!isNaN(tgl)) {
                let keyBulan = `${tgl.getFullYear()}-${String(tgl.getMonth() + 1).padStart(2, '0')}`;
                setBulan.add(keyBulan);
            }
        }
    });

    let daftarSorted = Array.from(setBulan).sort().reverse();
    
    select.innerHTML += `<option value="semua">Semua Periode</option>`;
    
    daftarSorted.forEach(b => {
        let [thn, bln] = b.split('-');
        let namaBulan = new Date(thn, bln - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        select.innerHTML += `<option value="${b}">${namaBulan}</option>`;
    });

    let d = new Date();
    let bulanIni = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    if (daftarSorted.includes(bulanIni)) {
        select.value = bulanIni;
    } else if (daftarSorted.length > 0) {
        select.value = daftarSorted[0];
    } else {
        select.value = 'semua';
    }
}

export function filterDataLaporan() {
    let bulanDipilih = document.getElementById('filter-bulan').value;
    let tbody = document.getElementById('tabel-transaksi');
    if(!tbody) return;
    tbody.innerHTML = '';

    // 1. HITUNG SALDO KESELURUHAN (Seluruh transaksi dari awal sampai akhir tanpa filter)
    let totalMasukGlobal = 0, totalKeluarGlobal = 0;
    seluruhDataKas.forEach(row => {
        if (row[0]) {
            totalMasukGlobal += parseFloat(row[2]) || 0;
            totalKeluarGlobal += parseFloat(row[3]) || 0;
        }
    });
    let saldoGlobal = totalMasukGlobal - totalKeluarGlobal;

    // Tampilkan Saldo Keseluruhan ke kartu utama paling atas
    document.getElementById('txt-saldo').innerText = 'Rp ' + saldoGlobal.toLocaleString('id-ID');

    // 2. FILTER DATA UNTUK TABEL & TOTAL MASUK/KELUAR PERIODE TERKAIT
    let dataFiltered = seluruhDataKas.filter(row => {
        if (!row[0]) return false;
        if (bulanDipilih === 'semua') return true;
        return String(row[0]).includes(bulanDipilih);
    });

    let totalMasukPeriode = 0, totalKeluarPeriode = 0;
    dataFiltered.forEach(row => {
        if (row[0]) {
            totalMasukPeriode += parseFloat(row[2]) || 0;
            totalKeluarPeriode += parseFloat(row[3]) || 0;
        }
    });

    // Tampilkan Total Masuk & Keluar sesuai filter bulan yang dipilih di bawahnya
    document.getElementById('txt-masuk').innerText = 'Rp ' + totalMasukPeriode.toLocaleString('id-ID');
    document.getElementById('txt-keluar').innerText = 'Rp ' + totalKeluarPeriode.toLocaleString('id-ID');

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

export function bagikanKeWA() {
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
    pesan += `🟢 *Masuk Bulan Ini:* ${totalM}\n`;
    pesan += `🔴 *Keluar Bulan Ini:* ${totalK}\n`;
    pesan += `💰 *Sisa Kas Keseluruhan:* ${saldoA}\n\n`;
    pesan += `🔍 Cek selengkapnya di:\nhttps://bit.ly/DataRT0103\n\n`;
    pesan += `_Portal Warga RT 01/RW 03_`;

    let urlWA = `https://wa.me/?text=${encodeURIComponent(pesan)}`;
    window.open(urlWA, '_blank');
}

export function unduhPDF() {
    let filterVal = document.getElementById('filter-bulan').value;
    let namaPeriode = filterVal !== 'semua' ? filterVal : "Semua_Periode";
    let element = document.getElementById('area-laporan-kas');
    
    let opt = {
        margin:       0.3,
        filename:     `Laporan_Kas_RT01_RW03_${namaPeriode}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    if(typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(element).save();
    } else {
        alert('Library PDF belum siap.');
    }
}

export async function kirimDataKas(e) {
    e.preventDefault();
    let btn = document.getElementById('btn-simpan');
    if (btn.disabled) return; 

    let tglInput = document.getElementById('input-tgl').value;
    let uraianInput = document.getElementById('input-uraian').value.trim();
    let masukInput = document.getElementById('input-masuk').value;
    let keluarInput = document.getElementById('input-keluar').value;

    // 1. VALIDASI: Form wajib diisi lengkap (Tanggal, Uraian, dan salah satu nominal Masuk/Keluar)
    if (!tglInput || !uraianInput || (masukInput === '' && keluarInput === '')) {
        alert('Mohon isi Tanggal, Uraian, serta Nominal Pemasukan atau Pengeluaran dengan benar!');
        return;
    }

    // 2. CEK DUPLIKASI: Mencegah tanggal dan uraian yang kembar persis
    let sudahAda = seluruhDataKas.some(row => {
        let tglData = String(row[0]).trim();
        let uraianData = String(row[1]).trim().toLowerCase();
        return tglData === tglInput && uraianData === uraianInput.toLowerCase();
    });

    if (sudahAda) {
        alert(`Peringatan: Transaksi dengan tanggal "${tglInput}" dan uraian "${uraianInput}" sudah pernah dicatat sebelumnya!`);
        return;
    }

    btn.innerText = 'Menyimpan...';
    btn.disabled = true;

    let newData = {
        "Tanggal": tglInput,
        "Uraian": uraianInput,
        "Pemasukan": masukInput || 0,
        "Pengeluaran": keluarInput || 0
    };

    try {
        await simpanDataKasApi(newData);
        alert('Transaksi berhasil disimpan!');
        document.getElementById('form-kas').reset();
        await initKas();
        tutupModalAdmin();
    } catch (err) {
        alert('Gagal menyimpan, silakan coba lagi.');
    } finally {
        btn.innerText = 'Simpan Transaksi';
        btn.disabled = false;
    }
}
