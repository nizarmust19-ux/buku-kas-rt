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
    select.innerHTML = '<option value="semua">Semua Periode</option>';
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
    daftarSorted.forEach(b => {
        let [thn, bln] = b.split('-');
        let namaBulan = new Date(thn, bln - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        select.innerHTML += `<option value="${b}">${namaBulan}</option>`;
    });
}

export function filterDataLaporan() {
    let bulanDipilih = document.getElementById('filter-bulan').value;
    let tbody = document.getElementById('tabel-transaksi');
    if(!tbody) return;
    tbody.innerHTML = '';

    // Filter data terlebih dahulu berdasarkan bulan yang dipilih
    let dataFiltered = seluruhDataKas.filter(row => {
        if (!row[0]) return false;
        if (bulanDipilih === 'semua') return true;
        return String(row[0]).includes(bulanDipilih);
    });

    // Hitung total masuk & keluar HANYA dari data yang lolos filter
    let totalMasuk = 0, totalKeluar = 0;
    dataFiltered.forEach(row => {
        if (row[0]) {
            totalMasuk += parseFloat(row[2]) || 0;
            totalKeluar += parseFloat(row[3]) || 0;
        }
    });

    // Tampilkan angka yang sudah difilter ke kartu saldo di atas
    document.getElementById('txt-masuk').innerText = 'Rp ' + totalMasuk.toLocaleString('id-ID');
    document.getElementById('txt-keluar').innerText = 'Rp ' + totalKeluar.toLocaleString('id-ID');
    document.getElementById('txt-saldo').innerText = 'Rp ' + (totalMasuk - totalKeluar).toLocaleString('id-ID');

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
    pesan += `🟢 *Total Masuk:* ${totalM}\n`;
    pesan += `🔴 *Total Keluar:* ${totalK}\n`;
    pesan += `💰 *Saldo Akhir:* ${saldoA}\n\n`;
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
        await initKas();
        btn.innerText = 'Simpan Transaksi';
        btn.disabled = false;
        tutupModalAdmin();
    } catch (err) {
        alert('Gagal menyimpan.');
        btn.innerText = 'Simpan Transaksi';
        btn.disabled = false;
    }
        }
        
