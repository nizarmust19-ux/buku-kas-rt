// --- MODUL OTENTIKASI KEAMANAN INPUT ---
let isLogedIn = false;

function bukaFormInput() {
    if (isLogedIn) {
        let secAdmin = document.getElementById('section-admin');
        secAdmin.classList.remove('hidden');
        secAdmin.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    let pass = prompt("Masukkan Password Khusus Pengurus:");
    if (pass === CONFIG.passwordAdmin) {
        isLogedIn = true;
        let secAdmin = document.getElementById('section-admin');
        secAdmin.classList.remove('hidden');
        secAdmin.scrollIntoView({ behavior: 'smooth' });
    } else if (pass !== null) {
        alert("Password salah!");
    }
}

function tutupFormInput() {
    document.getElementById('section-admin').classList.add('hidden');
}
