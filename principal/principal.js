import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// COLOQUE SUAS CHAVES REAIS AQUI (As mesmas do login.js)
const firebaseConfig = {
  apiKey: "AIzaSyBwPhRfJYSdBU_mmxyuCpCAkKQlKBhGHLI",
  authDomain: "escatologiabiblica-c82c3.firebaseapp.com",
  projectId: "escatologiabiblica-c82c3",
  storageBucket: "escatologiabiblica-c82c3.firebasestorage.app",
  messagingSenderId: "156849616608",
  appId: "1:156849616608:web:a6eb47e0b00ca0ee824285",
  measurementId: "G-ZQRZ7CPBPH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 1. SEGURANÇA E USUÁRIO ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('userName').textContent = user.displayName || user.email.split('@')[0];
        // Carrega as pastas assim que logar
        carregarPastas();
    } else {
        window.location.href = "../login1/login.html";
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth).then(() => window.location.href = "../login1/login.html");
});

// --- 2. TEMA MODO ESCURO ---
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

// Verifica tema salvo ou preferência do sistema
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    if (isDark) {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        localStorage.setItem('theme', 'dark');
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        localStorage.setItem('theme', 'light');
    }
});

// --- 3. SISTEMA DINÂMICO (FIRESTORE) ---

// Função para buscar pastas no Banco de Dados
async function carregarPastas() {
    const folderList = document.getElementById('folderList');
    folderList.innerHTML = ''; // Limpa o carregando

    try {
        const querySnapshot = await getDocs(collection(db, "pastas"));
        
        if (querySnapshot.empty) {
            folderList.innerHTML = '<li class="nav-item">Nenhuma pasta encontrada</li>';
            document.getElementById('currentFolderTitle').textContent = "Vazio";
            return;
        }

        let isFirst = true;
        querySnapshot.forEach((doc) => {
            const pasta = doc.data();
            const li = document.createElement('li');
            li.className = `nav-item ${isFirst ? 'active' : ''}`;
            li.setAttribute('data-folder', doc.id);
            li.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                ${pasta.nome}
            `;
            
            // Evento de clique para mudar de pasta
            li.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                li.classList.add('active');
                document.getElementById('currentFolderTitle').textContent = pasta.nome;
                carregarPdfs(doc.id); // Carrega PDFs desta pasta específica
            });

            folderList.appendChild(li);
            
            // Carrega os PDFs da primeira pasta automaticamente
            if(isFirst) {
                document.getElementById('currentFolderTitle').textContent = pasta.nome;
                carregarPdfs(doc.id);
                isFirst = false;
            }
        });
    } catch (error) {
        console.error("Erro ao carregar pastas:", error);
        folderList.innerHTML = '<li class="nav-item">Erro ao conectar</li>';
    }
}

// Função para buscar PDFs de uma pasta específica
async function carregarPdfs(pastaId) {
    const pdfGrid = document.getElementById('pdfGrid');
    pdfGrid.innerHTML = '<p>Buscando arquivos...</p>';

    try {
        const q = query(collection(db, "pdfs"), where("pastaId", "==", pastaId));
        const querySnapshot = await getDocs(q);

        pdfGrid.innerHTML = ''; // Limpa

        if (querySnapshot.empty) {
            pdfGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">Nenhum material cadastrado nesta pasta.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const pdf = doc.data();
            
            const card = document.createElement('div');
            card.className = 'pdf-card';
            card.innerHTML = `
                <div class="pdf-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div class="pdf-info">
                    <h3>${pdf.titulo}</h3>
                    <span class="pdf-meta">Adicionado em: ${pdf.dataAdicao}</span>
                </div>
                <button class="btn-read" onclick="abrirPdf('${pdf.linkDrive}', '${pdf.titulo}')">Ler Agora</button>
            `;
            pdfGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar PDFs:", error);
        pdfGrid.innerHTML = '<p>Erro ao carregar arquivos.</p>';
    }
}

// --- 4. LEITOR DE PDF ---
const pdfViewerModal = document.getElementById('pdfViewerModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const pdfIframe = document.getElementById('pdfIframe');

window.abrirPdf = function(url, titulo) {
    document.getElementById('modalPdfTitle').textContent = titulo;
    pdfIframe.src = url;
    pdfViewerModal.style.display = 'flex';
}

closeModalBtn.addEventListener('click', () => {
    pdfViewerModal.style.display = 'none';
    pdfIframe.src = ""; 
});