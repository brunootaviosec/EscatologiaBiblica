import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// COLOQUE SUAS CHAVES REAIS DO FIREBASE AQUI
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
const db = getFirestore(app);
const auth = getAuth(app);

// 🔒 SEGURANÇA
const EMAIL_ADMIN = "bruno.otavio.j.melo@gmail.com"; 

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../login1/login.html";
    } else if (user.email !== EMAIL_ADMIN) {
        alert("⚠️ Acesso Negado: Área restrita à administração.");
        window.location.href = "principal.html";
    } else {
        // Acesso liberado, carrega as pastas para sugestão
        carregarPastasExistentes();
    }
});

// Função para formatar o nome da pasta e criar um ID único e limpo
function criarIdDaPasta(nome) {
    return nome.toString().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/\s+/g, '-') // Troca espaços por hifens
        .replace(/[^\w\-]+/g, '') // Remove caracteres especiais
        .replace(/\-\-+/g, '-') // Remove hifens duplos
        .trim();
}

// Carrega as pastas do Firebase e joga na lista de sugestões (Datalist)
async function carregarPastasExistentes() {
    const pastasList = document.getElementById('pastasList');
    pastasList.innerHTML = ''; 
    try {
        const querySnapshot = await getDocs(collection(db, "pastas"));
        querySnapshot.forEach((doc) => {
            const option = document.createElement('option');
            option.value = doc.data().nome;
            pastasList.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar pastas: ", error);
    }
}

// Mostra mensagem na tela
function mostrarMensagem(texto, tipo) {
    const msgBox = document.getElementById('statusMsg');
    msgBox.textContent = texto;
    msgBox.className = tipo;
    msgBox.style.display = 'block';
    setTimeout(() => { msgBox.style.display = 'none'; }, 4000);
}

// Ação de Salvar
document.getElementById('formAdmin').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('btnSalvar');
    btn.textContent = "Publicando...";
    btn.disabled = true;

    const titulo = document.getElementById('titulo').value.trim();
    let link = document.getElementById('link').value.trim();
    const pastaNome = document.getElementById('pastaNome').value.trim();
    
    // Gera o ID automaticamente (ex: "A Volta de Cristo" vira "a-volta-de-cristo")
    const pastaId = criarIdDaPasta(pastaNome);

    // Correção Automática do Link do Drive
    if (link.includes('/view')) {
        link = link.split('/view')[0] + '/preview';
    } else if (!link.includes('/preview')) {
        // Tenta forçar o preview se for um link do drive genérico
        if (link.includes('drive.google.com/file/d/')) {
            link = link + '/preview';
        }
    }

    try {
        // 1. Cria a pasta (se já existir com esse ID, ele apenas confirma o nome)
        await setDoc(doc(db, "pastas", pastaId), { nome: pastaNome });

        // 2. Adiciona o PDF
        const hoje = new Date().toLocaleDateString('pt-BR');
        await addDoc(collection(db, "pdfs"), {
            titulo: titulo,
            linkDrive: link,
            pastaId: pastaId,
            dataAdicao: hoje
        });

        mostrarMensagem("✅ Estudo publicado com sucesso!", "success");
        
        // Limpa os campos do estudo, mas mantém a pasta selecionada para facilitar envio em lote
        document.getElementById('titulo').value = '';
        document.getElementById('link').value = '';
        document.getElementById('titulo').focus();
        
        // Atualiza a lista de sugestões
        carregarPastasExistentes();
        
    } catch (error) {
        console.error("Erro ao salvar:", error);
        mostrarMensagem("❌ Erro ao publicar. Verifique o console.", "error");
    } finally {
        btn.textContent = "Publicar na Plataforma";
        btn.disabled = false;
    }
});