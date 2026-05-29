// principal.js - Desenvolvido Por Bruno Otávio Jeronimo Melo | Pedra-PE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// Futuramente você importará getFirestore para carregar PDFs dinamicamente:
// import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// COLOQUE SUAS CHAVES DO FIREBASE AQUI
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 1. SISTEMA DE SEGURANÇA: Verificar se o usuário está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário está logado. Permite visualizar a página.
        document.getElementById('userName').textContent = user.displayName || user.email.split('@')[0];
        console.log("Acesso autorizado para:", user.email);
        
        // Aqui você chamaria uma função para carregar os PDFs do Firebase Firestore
        // carregarPdfsDaPasta('todos');
    } else {
        // Usuário NÃO está logado. Expulsa para a tela de login imediatamente.
        window.location.href = "../login1/login.html";
    }
});

// 2. SISTEMA DE LOGOUT
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            // Redireciona para o login após sair
            window.location.href = "../login1/login.html";
        }).catch((error) => {
            console.error("Erro ao sair:", error);
            alert("Ocorreu um erro ao tentar sair da conta.");
        });
    });
}

// 3. NAVEGAÇÃO DE PASTAS (Visual - Frontend)
const navItems = document.querySelectorAll('.nav-item');
const currentFolderTitle = document.getElementById('currentFolderTitle');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove a classe active de todos
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Adiciona ao clicado
        item.classList.add('active');
        
        // Atualiza o título do painel
        const folderName = item.textContent.trim();
        currentFolderTitle.textContent = folderName;
        
        // LÓGICA FUTURA: Aqui você faria um filtro no seu banco de dados
        const folderId = item.getAttribute('data-folder');
        console.log("Buscando PDFs da pasta:", folderId);
        // filtrarPdfs(folderId);
    });
});

// 4. LÓGICA DO MODAL DE LEITURA DE PDF
const pdfViewerModal = document.getElementById('pdfViewerModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const pdfIframe = document.getElementById('pdfIframe');
const modalPdfTitle = document.getElementById('modalPdfTitle');

// Esta função simula a abertura de um PDF
function abrirPdf(url, titulo) {
    modalPdfTitle.textContent = titulo;
    pdfIframe.src = url;
    pdfViewerModal.style.display = 'flex';
}

// Fechar Modal
closeModalBtn.addEventListener('click', () => {
    pdfViewerModal.style.display = 'none';
    pdfIframe.src = ""; // Limpa o iframe
});

// Associar botões estáticos de exemplo à função de abrir (Apenas para teste visual)
document.querySelectorAll('.btn-read').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const cardTitle = e.target.closest('.pdf-card').querySelector('h3').textContent;
        // Substitua este link pelo link real de Download/Leitura gerado pelo Firebase Storage
        abrirPdf("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", cardTitle);
    });
});