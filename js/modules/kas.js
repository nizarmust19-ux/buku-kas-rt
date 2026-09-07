export function filterDataLaporan() {
    let bulanDipilih = document.getElementById('filter-bulan').value;
    let tbody = document.getElementById('tabel-transaksi');
    if(!tbody) return;
    tbody.innerHTML = '';

    // 1. Filter data terlebih dahulu berdasarkan bulan yang dipilih
    let dataFiltered = seluruhDataKas.filter(row => {
        if (!row[0]) return false;
        if (bulanDipilih === 'semua') return true;
        return String(row[0]).includes(bulanDipilih);
    });

    // 2. Hitung total masuk & keluar HANYA dari data yang lolos filter
    let totalMasuk = 0, totalKeluar = 0;
    dataFiltered.forEach(row => {
        if (row[0]) {
            totalMasuk += parseFloat(row[2]) || 0;
            totalKeluar += parseFloat(row[3]) || 0;
        }
    });

    // 3. Tampilkan angka yang sudah difilter ke kartu saldo di atas
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
