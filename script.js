// ================================================================
// script.js - Girişimci Mühendisler Kulübü (GMK)
// ================================================================

window.toggleCardFocus = function(card) {
    const container = card.parentElement;
    const allCards = container.querySelectorAll('.gmk-card');
    const isFocused = card.classList.contains('focused-card');

    if (isFocused) {
        // Kartı Küçült
        allCards.forEach(c => c.style.display = '');
        card.classList.remove('focused-card');
        container.classList.remove('grid-focus-mode');
    } else {
        // Kartı Büyüt
        allCards.forEach(c => c.style.display = 'none');
        card.style.display = 'block';
        card.classList.add('focused-card');
        container.classList.add('grid-focus-mode');

        // YENİ: Büyüyen karta otomatik odaklan ve ekranı kaydır
        setTimeout(() => {
            // Sabit menünün (navbar) kartın üstünü kapatmaması için -100 piksel pay bırakıyoruz
            const yOffset = -100; 
            const y = card.getBoundingClientRect().top + window.scrollY + yOffset;
            
            window.scrollTo({
                top: y, 
                behavior: 'smooth'
            });
        }, 50); // Tarayıcının yeni boyutları hesaplaması için milisaniyelik bir pay
    }
};

document.addEventListener('DOMContentLoaded', function() {

    // ---------- 1. MOBİL MENÜ (YENİ DROPDOWN SİSTEMİ) ----------
    const dropdownBtn = document.getElementById('mobile-dropdown-btn');
    const dropdownMenu = document.getElementById('mobile-dropdown-menu');
    const dropdownArrow = document.getElementById('dropdown-arrow');
    const currentSectionText = document.getElementById('current-section-text');

    if (dropdownBtn && dropdownMenu) {
        // Butona tıklanınca menüyü aç/kapat ve oku döndür
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
            dropdownArrow.classList.toggle('rotate-180');
        });

        // Sayfada boş bir yere tıklanırsa menüyü otomatik kapat
        document.addEventListener('click', function(e) {
            if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
                dropdownArrow.classList.remove('rotate-180');
            }
        });

        // Menüdeki bir linke tıklanınca menüyü kapat
        document.querySelectorAll('.nav-link-mobile').forEach(link => {
            link.addEventListener('click', function() {
                dropdownMenu.classList.add('hidden');
                dropdownArrow.classList.remove('rotate-180');
            });
        });
    }

    // ---------- 2. SAYFA GEÇİŞLERİ VE DİNAMİK YAZI ----------
    const navLinks = document.querySelectorAll('.nav-link, .nav-link-mobile');
    const sections = {
        anasayfa: document.getElementById('section-anasayfa'),
        faaliyetler: document.getElementById('section-faaliyetler'),
        uyeler: document.getElementById('section-uyeler'),
        bultenler: document.getElementById('section-bultenler'),
        basari: document.getElementById('section-basari'),
        iletisim: document.getElementById('section-iletisim'),
        sertifika: document.getElementById('section-sertifika')
    };

    // Bölüm ID'lerini ekranda görünecek Türkçe isimlerle eşleştir
    const sectionNames = {
        'anasayfa': 'Anasayfa',
        'faaliyetler': 'Faaliyetler',
        'uyeler': 'Üyeler',
        'bultenler': 'Bültenler',
        'basari': 'Başarılar',
        'iletisim': 'İletişim',
        'sertifika': 'Sertifika Kontrol'
    };

    function switchSection(sectionId) {
        // Tüm sayfaları gizle, seçileni göster
        Object.keys(sections).forEach(key => {
            if (sections[key]) sections[key].classList.remove('active');
        });
        if (sections[sectionId]) sections[sectionId].classList.add('active');

        // Menü linklerinin aktifliğini (mor rengi) ayarla
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) link.classList.add('active');
        });

        // YENİ: Mobilde üstte yazan başlığı güncelle
        if (currentSectionText && sectionNames[sectionId]) {
            currentSectionText.textContent = sectionNames[sectionId];
        }
        
        // Odaklanmış kart varsa sıfırla
        document.querySelectorAll('.grid-focus-mode').forEach(container => {
            container.classList.remove('grid-focus-mode');
            container.querySelectorAll('.gmk-card').forEach(c => {
                c.style.display = '';
                c.classList.remove('focused-card');
            });
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.dataset.section;
            if (sectionId) {
                switchSection(sectionId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // ---------- 3. ETKİNLİK MODAL SİSTEMİ ----------
    const etkinlikModal = document.getElementById('etkinlik-modal');
    const etkinlikIcerik = document.getElementById('etkinlik-modal-icerik');

    window.openEtkinlikModal = async function() {
        etkinlikModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; 
        await loadEtkinlikler();
    };

    window.closeEtkinlikModal = function() {
        etkinlikModal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    if (etkinlikModal) {
        etkinlikModal.addEventListener('click', function(e) {
            if (e.target === etkinlikModal) closeEtkinlikModal();
        });
    }

    async function loadEtkinlikler() {
        try {
            const response = await fetch('Etkinlikler/etkinlikler.json');
            if (!response.ok) throw new Error('JSON bulunamadı');
            const data = await response.json();
            renderEtkinlikler(data);
        } catch (error) {
            etkinlikIcerik.innerHTML = `<p class="text-red-400 text-center py-4">Etkinlikler yüklenirken bir hata oluştu.</p>`;
        }
    }

    function renderEtkinlikler(data) {
        etkinlikIcerik.className = "grid grid-cols-1 sm:grid-cols-2 gap-4";

        if (!data || data.length === 0) {
            etkinlikIcerik.innerHTML = `<p class="col-span-full text-gray-400 text-center py-4">Şu an başvuruya açık bir etkinlik bulunmamaktadır.</p>`;
            return;
        }

        const bugun = new Date();
        bugun.setHours(0, 0, 0, 0);

        // Tarihe göre sıralama: En yeniden (veya gelecikten) eskiye doğru sırala
        data.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

        let html = '';

        data.forEach(etk => {
            const sonBasvuruTarihi = new Date(etk.tarih);
            let butonHtml = '';

            if (sonBasvuruTarihi >= bugun) {
                butonHtml = `<a href="${etk.link}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition shadow-lg mt-4">Başvur</a>`;
            } else {
                butonHtml = `<div onclick="event.stopPropagation()" class="block w-full text-center bg-red-900/30 border border-red-800/50 text-red-400 font-medium py-3 rounded-xl mt-4 cursor-not-allowed">Bu etkinliğin başvuru tarihi geçti</div>`;
            }

            const trTarih = sonBasvuruTarihi.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
            const resim = etk.resim_yolu || 'https://via.placeholder.com/400x600/1a1a1a/4f46e5?text=Afi%C5%9F+Yok';

            html += `
                <div class="gmk-card" title="Afişi ve detayları büyütmek için tıklayın" onclick="toggleCardFocus(this)">
                    <img src="${resim}" alt="${etk.baslik || 'Etkinlik Afişi'}" loading="lazy" class="object-cover" />
                    
                    <div class="card-title">${etk.baslik || ''}</div>
                    
                    <div class="card-sub flex flex-col sm:flex-row justify-between gap-2 mt-2 border-b border-white/5 pb-2">
                        <span class="flex items-center gap-1">📍 ${etk.konum || 'Belirtilmedi'}</span>
                        <span class="flex items-center gap-1 font-medium ${sonBasvuruTarihi >= bugun ? 'text-green-400' : 'text-red-400'}">
                            ⏳ Son Başvuru: ${trTarih}
                        </span>
                    </div>
                    
                    <div class="card-desc mt-3">${etk.aciklama || ''}</div>
                    
                    ${butonHtml}
                </div>
            `;
        });
        
        etkinlikIcerik.innerHTML = html;
    }

    // ---------- 4. FAALİYETLER VE KATILIMLAR ----------
    async function loadFaaliyetler() {
        try {
            const response = await fetch('Faaliyetler/faaliyetler_index.json');
            const data = await response.json();
            const cards = await Promise.all(data.map(async item => {
                let metin = '';
                try { const res = await fetch(item.metin_yolu); if(res.ok) metin = await res.text(); } catch(e){}
                return { ...item, metin };
            }));
            renderCards(cards, 'faaliyetler-container');
        } catch (error) {}
    }

    async function loadKatilimlar() {
        try {
            const response = await fetch('Faaliyetler/katilimlar_index.json');
            const data = await response.json();
            const cards = await Promise.all(data.map(async item => {
                let metin = '';
                try { const res = await fetch(item.metin_yolu); if(res.ok) metin = await res.text(); } catch(e){}
                return { ...item, metin };
            }));
            renderCards(cards, 'katilimlar-container');
        } catch (error) {}
    }

    function renderCards(data, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!data || data.length === 0) { container.innerHTML = `<div class="col-span-full text-gray-400 text-center py-10">Veri bulunamadı.</div>`; return; }
        
        let html = '';
        data.forEach(item => {
            html += `
                <div class="gmk-card" onclick="toggleCardFocus(this)">
                    <img src="${item.resim_yolu}" alt="${item.baslik}" loading="lazy" />
                    <div class="card-title">${item.baslik}</div>
                    <div class="card-sub">${item.tarih}</div>
                    <div class="card-desc">${item.metin}</div>
                </div>`;
        });
        container.innerHTML = html;
    }

    // ---------- 5. ÜYELER VE ORGANİZASYON ----------
    async function loadUyeler() {
        try {
            const response = await fetch('Uyeler/uyeler_index.json');
            const data = await response.json();
            const cards = await Promise.all(data.map(async item => {
                let metin = '';
                try { const res = await fetch(item.metin_yolu); if(res.ok) metin = await res.text(); } catch(e){}
                return { ...item, metin };
            }));
            
            const container = document.getElementById('uyeler-container');
            if(!container) return;
            
            let html = '';
            cards.forEach(item => {
                html += `
                    <div class="gmk-card text-center" onclick="toggleCardFocus(this)">
                        <!-- YENİ: Resim boyutlandırması kare (aspect-square) olacak şekilde ayarlandı ve css kısıtlaması (height: auto !important) ezip geçildi -->
                        <img src="${item.resim_yolu}" alt="${item.ad_soyad}" loading="lazy" class="w-full aspect-square object-cover rounded-xl" style="height: auto !important;" />
                        <div class="card-title mt-4">${item.ad_soyad}</div>
                        <div class="card-sub">${item.unvan}</div>
                        <div class="card-desc text-sm mt-2">${item.metin}</div>
                    </div>`;
            });
            container.innerHTML = html;
        } catch (error) {}
    }

    async function loadOrganizasyon() {
        const container = document.getElementById('organizasyon-container');
        try {
            const response = await fetch('Uyeler/uyeler.csv');
            const text = await response.text();
            
            const rows = text.split('\n').map(r => r.trim()).filter(r => r !== '');
            const sep = rows[0].includes(';') ? ';' : ',';
            
            let html = '';
            rows.forEach(row => {
                const cols = row.split(sep).map(c => c.trim()).filter(c => c !== '');
                if (cols.length === 0) return;
                
                const header = cols[0];
                const uyeler = cols.slice(1);
                if (uyeler.length === 0) return;

                html += `
                    <div class="bg-black/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl transition hover:border-indigo-400/50">
                        <h5 class="text-lg font-bold text-white flex items-center justify-between cursor-pointer select-none" 
                            onclick="const ul = this.nextElementSibling; ul.classList.toggle('hidden'); this.querySelector('.toggle-icon').textContent = ul.classList.contains('hidden') ? '▼' : '▲';">
                            <span class="flex items-center gap-2">${header}</span>
                            <span class="toggle-icon text-indigo-400 text-sm transition-transform">▼</span>
                        </h5>
                        <ul class="text-sm text-gray-300 space-y-2 mt-4 hidden">
                            ${uyeler.map(u => `<li><span class="text-white">${u}</span></li>`).join('')}
                        </ul>
                    </div>`;
            });
            container.innerHTML = html;
        } catch (error) {}
    }

    // ---------- 6. BAŞARILAR (DİNAMİK ORAN-ORANTI ALGORİTMASI) ----------
    async function loadBasarilar() {
        const container = document.getElementById('basarilar-container');
        try {
            const response = await fetch('Basarilar/basarilar.json');
            const data = await response.json();
            
            let html = '';
            data.forEach(item => {
                const baslik = item.baslik || '';
                
                // Eğer metinde <br> varsa ilk satırı baz al, yoksa tamamını
                const birinciSatir = baslik.includes('<br>') ? baslik.split('<br>')[0] : baslik;
                const karakterSayisi = birinciSatir.length;

                // MATEMATİKSEL ORAN-ORANTI FORMÜLÜ:
                // Karakter sayısı arttıkça font boyutunu ters orantıyla pürüzsüzce küçültüyoruz.
                // Taban boyut 3.2rem (kısa yazılar için devasa), sınır ise 1.2rem'in altına düşmeyecek (uzun yazılar için güvenli).
                let fontSize = 3.2 - (karakterSayisi * 0.20);
                if (fontSize < 1.3) fontSize = 1.3; // Çok uzun yazılarda okunabilirliği korumak için alt sınır
                if (fontSize > 3.2) fontSize = 3.2; // Çok kısa yazılarda üst sınır

                html += `
                    <div class="bg-black/50 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-white/10 shadow-xl transition hover:border-indigo-400/50 min-h-[160px]">
                        <div class="font-bold text-indigo-400 break-words w-full" style="font-size: ${fontSize}rem; line-height: 1.2;">${baslik}</div>
                        <div class="text-xs md:text-sm text-gray-300 mt-2 leading-relaxed break-words w-full">${item.aciklama}</div>
                    </div>`;
            });
            container.innerHTML = html;
        } catch (error) {}
    }

    // ---------- 7. SERTİFİKA KONTROL ----------
    let certData = [];
    async function loadCertData() {
        try {
            const response = await fetch('Sertifikalar/data.json');
            certData = await response.json();
        } catch (error) {}
    }

    const certBtn = document.getElementById('cert-check-btn');
    const certInput = document.getElementById('cert-input');
    if (certBtn && certInput) {
        certBtn.addEventListener('click', () => {
            const code = certInput.value.trim().toUpperCase();
            const resBox = document.getElementById('cert-result');
            const icon = document.getElementById('result-icon');
            const msg = document.getElementById('result-message');
            
            resBox.className = 'cert-result mt-6 p-4 rounded-xl border-2 flex items-center gap-3 text-sm shadow-md ';
            
            if (!code) {
                resBox.classList.add('default');
                icon.textContent = '⏳'; msg.textContent = 'Sertifika numarası girin.';
                return;
            }
            
            const record = certData.find(i => i.id.toUpperCase() === code);
            if (record) {
                resBox.classList.add('success');
                icon.textContent = '✅'; 
                
                // YENİ: Hem adı soyadı hem de JSON'daki türü (type) ekrana yazdırıyoruz
                // (Eğer JSON'da alan adı 'type' yerine başka bir şeyse, örn record.etkinlik yapabilirsin)
                const sertifikaTuru = record.type ? `(${record.type})` : '';
                msg.textContent = `Doğrulandı: ${record.name} ${sertifikaTuru}`;
            } else {
                resBox.classList.add('error');
                icon.textContent = '❌'; msg.textContent = 'Kayıt Bulunamadı.';
            }
        });
    }

    // ---------- BÜLTENLER (Dinamik Render) ----------
    const bultenContainer = document.getElementById('bultenler-container');

    async function loadBultenler() {
        try {
            const response = await fetch('Bultenler/bultenler.json');
            if (!response.ok) throw new Error('bultenler.json yüklenemedi');
            const data = await response.json();
            renderBultenler(data);
        } catch (error) {
            console.error('Bültenler yüklenirken hata:', error);
            if (bultenContainer) {
                bultenContainer.innerHTML = `<div class="col-span-full text-center text-red-400 bg-red-900/20 p-6 rounded-xl border border-red-800">⚠️ Bültenler yüklenirken bir sorun oluştu.</div>`;
            }
        }
    }

    function renderBultenler(data) {
        if (!bultenContainer) return;

        if (!data || data.length === 0) {
            bultenContainer.innerHTML = `<div class="col-span-full text-gray-400 text-center py-10">Henüz bülten eklenmemiş.</div>`;
            return;
        }

        let html = '';
        data.forEach(item => {
            const resim = item.resim_yolu || 'https://via.placeholder.com/400x300/1a1a1a/4f46e5?text=Bülten';
            
            // Link kaldırıldı, diğer kartlar gibi tıklandığında direkt büyüyen sade yapıya çevrildi
            html += `
                <div class="gmk-card" title="Detayları görmek için tıklayın" onclick="toggleCardFocus(this)">
                    <img src="${resim}" alt="${item.baslik || 'Bülten'}" loading="lazy" />
                    <div class="card-title">${item.baslik || 'Başlıksız'}</div>
                    <div class="card-sub">${item.tarih || ''}</div>
                </div>
            `;
        });
        bultenContainer.innerHTML = html;
    }

    // ---------- BAŞLATICI ----------
    async function init() {
        await loadCertData();
        await Promise.all([
            loadFaaliyetler(),
            loadKatilimlar(),
            loadUyeler(),
            loadOrganizasyon(),
            loadBasarilar(),
            loadBultenler()
        ]);
    }

    init();

});