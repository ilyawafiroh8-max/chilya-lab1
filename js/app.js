// ==========================================
// A. LOGIKA UTAMA FORM BER cabang & MULTI-STEP
// ==========================================
function keStep2() {
    const nama = document.getElementById('nama').value.trim();
    const nik = document.getElementById('nik').value.trim();
    const alamat = document.getElementById('alamat').value.trim();
    const nohp = document.getElementById('nohp').value.trim();

    if (!nama || !nik || !alamat || !nohp) {
        alert("Mohon lengkapi semua data field bertanda * pada Step 1!");
        return;
    }
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
}

function keStep1() {
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
}

function pilihCabangLayanan() {
    const layanan = document.getElementById('jenisLayanan').value;
    if (layanan === "Pemeriksaan Langsung") {
        document.getElementById('areaPemeriksaan').style.display = 'block';
        document.getElementById('areaKonsultasi').style.display = 'none';
    } else {
        document.getElementById('areaPemeriksaan').style.display = 'none';
        document.getElementById('areaKonsultasi').style.display = 'block';
    }
}

function toggleAcc(header) {
    const body = header.nextElementSibling;
    const icon = header.querySelector('i');
    if (body.style.display === 'block') {
        body.style.display = 'none';
        icon.className = "fas fa-chevron-down";
    } else {
        body.style.display = 'block';
        icon.className = "fas fa-chevron-up";
    }
}

// Handler Simpan Data dan Redirect ke Tiket Cetak
function simpanPendaftaran() {
    const db = JSON.parse(localStorage.getItem('chilya_db')) || [];
    const layanan = document.getElementById('jenisLayanan').value;
    
    let detailPemeriksaan = "-";
    let dokter = "-";
    let jadwal = "-";

    if (layanan === "Pemeriksaan Langsung") {
        const checkedBoxes = document.querySelectorAll('input[name="pemeriksaan"]:checked');
        let arrPeriksa = [];
        checkedBoxes.forEach(cb => arrPeriksa.push(cb.value));
        if (arrPeriksa.length === 0) {
            alert("Harap pilih minimal satu parameter pemeriksaan laboratorium!");
            return;
        }
        detailPemeriksaan = arrPeriksa.join(', ');
    } else {
        dokter = document.getElementById('dokter').value;
        jadwal = document.getElementById('jadwal').value;
    }

    const nextIndex = db.length + 1;
    const dataPasien = {
        noRegistrasi: `CCL-${String(nextIndex).padStart(3, '0')}`,
        noAntrian: nextIndex,
        nama: document.getElementById('nama').value.trim(),
        nik: document.getElementById('nik').value.trim(),
        jk: document.getElementById('jk').value,
        alamat: document.getElementById('alamat').value.trim(),
        nohp: document.getElementById('nohp').value.trim(),
        layanan: layanan,
        pemeriksaan: detailPemeriksaan,
        dokter: dokter,
        jadwal: jadwal,
        tanggal: new Date().toISOString().split('T')[0]
    };

    db.push(dataPasien);
    localStorage.setItem('chilya_db', JSON.stringify(db));
    localStorage.setItem('chilya_tiket_last', JSON.stringify(dataPasien));
    
    window.location.href = 'tiket.html';
}

// Rendering Cetakan Tiket Pasien
function muatTiketPasien() {
    const t = JSON.parse(localStorage.getItem('chilya_tiket_last'));
    if (!t) {
        alert("Data rekam struk tidak ditemukan!");
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('t-noreg').innerText = t.noRegistrasi;
    document.getElementById('t-antrian').innerText = t.noAntrian;
    document.getElementById('t-nama').innerText = `: ${t.nama} (${t.jk})`;
    document.getElementById('t-nik').innerText = `: ${t.nik}`;
    document.getElementById('t-nohp').innerText = `: ${t.nohp}`;
    document.getElementById('t-layanan').innerText = `: ${t.layanan}`;
    document.getElementById('t-tanggal').innerText = `: ${t.tanggal}`;

    if (t.layanan === "Konsultasi Dokter") {
        document.getElementById('t-row-dokter').style.display = 'table-row';
        document.getElementById('t-dokter').innerText = `: ${t.dokter} / [${t.jadwal}]`;
    } else {
        document.getElementById('t-row-periksa').style.display = 'table-row';
        document.getElementById('t-periksa').innerText = `: ${t.pemeriksaan}`;
    }
}

// ==========================================
// B. ENGINE SISTEM VERIFIKASI LOGIN ADMIN
// ==========================================
function prosesLoginAdmin(event) {
    event.preventDefault();
    const user = document.getElementById('userInput').value.trim();
    const pass = document.getElementById('passInput').value;

    if (user === "chilyalab" && pass === "060120") {
        localStorage.setItem('session_admin', 'active');
        window.location.href = 'dashboard.html';
    } else {
        document.getElementById('errorBox').style.display = 'block';
    }
}

function cekKeamananAdmin() {
    if (localStorage.getItem('session_admin') !== 'active') {
        alert("Akses Terblokir! Anda wajib login terlebih dahulu.");
        window.location.href = 'admin-login.html';
    }
}

function keluarAdmin() {
    localStorage.removeItem('session_admin');
    window.location.href = 'index.html';
}

// ==========================================
// C. DASHBOARD PANEL HUB & TABULAR SYSTEM
// ==========================================
function gantiTabAdmin(tabId, menuId) {
    document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.menu li').forEach(m => m.classList.remove('active'));
    
    document.getElementById(tabId).style.display = 'block';
    document.getElementById(menuId).classList.add('active');

    if (tabId === 'tab-ringkasan') initDashboardAdmin();
    if (tabId === 'tab-pasien') renderTabelPasien();
}

function initDashboardAdmin() {
    const db = JSON.parse(localStorage.getItem('chilya_db')) || [];
    const hariIni = new Date().toISOString().split('T')[0];

    document.getElementById('countHariIni').innerText = db.filter(x => x.tanggal === hariIni).length;
    document.getElementById('countBulanIni').innerText = db.length;
    document.getElementById('countKonsul').innerText = db.filter(x => x.layanan === "Konsultasi Dokter").length;
    document.getElementById('countPeriksa').innerText = db.filter(x => x.layanan === "Pemeriksaan Langsung").length;
}

function renderTabelPasien() {
    const db = JSON.parse(localStorage.getItem('chilya_db')) || [];
    const keyword = document.getElementById('cariPasien').value.toLowerCase();
    const tbody = document.getElementById('tabelPasienBody');
    tbody.innerHTML = "";

    const filtered = db.filter(p => p.nama.toLowerCase().includes(keyword) || p.nik.includes(keyword));
    filtered.forEach(p => {
        tbody.innerHTML += `<tr>
            <td><strong>${p.noRegistrasi}</strong></td>
            <td>${p.nama}</td>
            <td>${p.nik}</td>
            <td>${p.nohp}</td>
            <td>${p.layanan}</td>
            <td>${p.tanggal}</td>
            <td><button class="btn btn-batal" style="padding: 5px 10px; font-size:0.8rem;" onclick="hapusPasien('${p.noRegistrasi}')"><i class="fas fa-trash"></i></button></td>
        </tr>`;
    });
}

function hapusPasien(noReg) {
    if (confirm(`Hapus permanen data registrasi ${noReg}?`)) {
        let db = JSON.parse(localStorage.getItem('chilya_db')) || [];
        db = db.filter(x => x.noRegistrasi !== noReg);
        localStorage.setItem('chilya_db', JSON.stringify(db));
        renderTabelPasien();
    }
}

function filterRekapHarian() {
    const db = JSON.parse(localStorage.getItem('chilya_db')) || [];
    const tgl = document.getElementById('filterTgl').value;
    const tbody = document.getElementById('tabelHarianBody');
    tbody.innerHTML = "";

    const matched = db.filter(x => x.tanggal === tgl);
    document.getElementById('totalHarianText').innerText = matched.length;

    matched.forEach(p => {
        tbody.innerHTML += `<tr><td>${p.noRegistrasi}</td><td>${p.nama}</td><td>${p.nik}</td><td>${p.layanan}</td></tr>`;
    });
}

function filterRekapBulanan() {
    const db = JSON.parse(localStorage.getItem('chilya_db')) || [];
    const bln = document.getElementById('filterBln').value;
    
    const matched = db.filter(x => x.tanggal.startsWith(bln));
    document.getElementById('mBlnTotal').innerText = matched.length;
    document.getElementById('mBlnKonsul').innerText = matched.filter(x => x.layanan === "Konsultasi Dokter").length;
    document.getElementById('mBlnPeriksa').innerText = matched.filter(x => x.layanan === "Pemeriksaan Langsung").length;
}

// ==========================================
// D. DOWNLOAD REAL EXCEL COMPATIBLE ENGINE
// ==========================================
function eksporExcel(tipe) {
    const db = JSON.parse(localStorage.getItem('chilya_db')) || [];
    let targetData = [];
    let filename = "Rekap_Data_ChilyaLab.xls";

    if (tipe === 'hari') {
        const tgl = document.getElementById('filterTgl').value;
        if(!tgl) { alert("Pilih tanggal terlebih dahulu!"); return; }
        targetData = db.filter(x => x.tanggal === tgl);
        filename = `Rekap_Harian_${tgl}.xls`;
    } else {
        const bln = document.getElementById('filterBln').value;
        if(!bln) { alert("Pilih bulan terlebih dahulu!"); return; }
        targetData = db.filter(x => x.tanggal.startsWith(bln));
        filename = `Rekap_Bulanan_${bln}.xls`;
    }

    if(targetData.length === 0) {
        alert("Tidak ada data pasien pada periode ini untuk diunduh!");
        return;
    }

    let excelTemplate = `
    <xml xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns="http://www.w3.org/TR/REC-html40">
    <head></head></xml>`;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}