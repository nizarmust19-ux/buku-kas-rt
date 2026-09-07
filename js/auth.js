import { CONFIG } from './config.js';

let isLoggedIn = false;

export function bukaModalAdmin() {
    let modal = document.getElementById('modal-admin');
    let boxPass = document.getElementById('box-password');
    let formKas = document.getElementById('form-kas');
    
    // Tampilkan modal
    modal.classList.remove('hidden');

    if (isLoggedIn) {
        // Jika sudah login sebelumnya, langsung buka form input kas
        boxPass.classList.add('hidden');
        formKas.classList.remove('hidden');
        document.getElementById('modal-title').innerText = "Input Transaksi Kas";
    } else {
        // Jika belum, tampilkan kotak password dulu dan reset inputannya
        boxPass.classList.remove('hidden');
        formKas.classList.add('hidden');
        document.getElementById('input-password').value = '';
        document.getElementById('modal-title').innerText = "Validasi Admin RT";
    }
}

export function tutupModalAdmin() {
    document.getElementById('modal-admin').classList.add('hidden');
}

export function cekPasswordAdmin() {
    let passInput = document.getElementById('input-password').value;
    
    if (passInput === CONFIG.passwordAdmin) {
        isLoggedIn = true;
        // Sembunyikan kotak password, tampilkan form kas
        document.getElementById('box-password').classList.add('hidden');
        document.getElementById('form-kas').classList.remove('hidden');
        document.getElementById('modal-title').innerText = "Input Transaksi Kas";
    } else {
        alert("Password salah, silakan coba lagi!");
        document.getElementById('input-password').value = '';
    }
}

