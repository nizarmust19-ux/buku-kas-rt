// --- MODUL OTENTIKASI / LOGIN ADMIN ---
let isLogedIn = false;

function bukaAdmin() {
    if (isLogedIn) {
        let secAdmin = document.getElementById('section-admin');
        secAdmin.classList.remove('hidden');
        secAdmin.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    let pass = prompt("Masukkan Password Pengurus RT:");
    if (pass === CONFIG.passwordAdmin) {
        isLogedIn = true;
        let secAdmin = document.getElementById('section-admin');
        secAdmin.classList.remove('hidden');
        secAdmin.scrollIntoView({ behavior: 'smooth' });
    } else if (pass !== null) {
        alert("Password salah!");
    }
}

function tutupAdmin() {
    document.getElementById('section-admin').classList.add('hidden');
}
