import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

// ==========================================
// 🔒 SEGURANÇA: LISTA VIP DE ADMINS
// ==========================================
const ADMIN_EMAILS = [
    "bruno.otavio.j.melo@gmail.com",
    "email_do_seu_auxiliar@gmail.com"
];

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../login1/login.html";
    } else if (!ADMIN_EMAILS.includes(user.email)) {
        alert("⚠️ Acesso Negado: Área restrita à administração.");
        window.location.href = "principal.html";
    } else {
        // Acesso liberado, carrega as listas
        carregarPastasExistentes();
        carregarEstudosParaGerenciar(); // Carrega a lista de excluir estudos
        carregarPastasParaGerenciar();  // Carrega a lista de excluir pastas
    }
});
// ==========================================

// Formata o nome da pasta para ID
function criarIdDaPasta(nome) {
    return nome.toString().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .trim();
}

// Mostra mensagem na tela
function mostrarMensagem(texto, tipo) {
    const msgBox = document.getElementById('statusMsg');
    msgBox.textContent = texto;
    msgBox.className = tipo;
    msgBox.style.display = 'block';
    setTimeout(() => { msgBox.style.display = 'none'; }, 4000);
}

// 1. CARREGAR PASTAS NO DATALIST (Sugestões do Formulário)
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

// 2. CARREGAR ESTUDOS PARA O GERENCIADOR (Para poder excluir Estudos)
async function carregarEstudosParaGerenciar() {
    const listaEstudos = document.getElementById('listaEstudos');
    listaEstudos.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 0.9rem;">Carregando...</p>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "pdfs"));
        listaEstudos.innerHTML = ''; 

        if (querySnapshot.empty) {
            listaEstudos.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 0.9rem;">Nenhum estudo publicado ainda.</p>';
            return;
        }

        querySnapshot.forEach((documento) => {
            const pdf = documento.data();
            const item = document.createElement('div');
            item.className = 'estudo-item';
            item.innerHTML = `
                <div class="estudo-info">
                    <strong>📄 ${pdf.titulo}</strong>
                    <small>Pasta: ${pdf.pastaId}</small>
                </div>
                <button class="btn-excluir" data-id="${documento.id}">Excluir</button>
            `;
            listaEstudos.appendChild(item);
        });

        // Adiciona a função de excluir em cada botão de estudo
        document.getElementById('listaEstudos').querySelectorAll('.btn-excluir').forEach(botao => {
            botao.addEventListener('click', async (e) => {
                const docId = e.target.getAttribute('data-id');
                
                if(confirm("Tem certeza que deseja APAGAR este estudo do site?")) {
                    e.target.textContent = "Apagando...";
                    try {
                        await deleteDoc(doc(db, "pdfs", docId));
                        mostrarMensagem("🗑️ Estudo removido com sucesso!", "success");
                        carregarEstudosParaGerenciar();
                    } catch (error) {
                        console.error("Erro ao excluir estudo:", error);
                        mostrarMensagem("❌ Erro ao excluir estudo.", "error");
                    }
                }
            });
        });
    } catch (error) {
        console.error("Erro ao carregar gerenciador de estudos: ", error);
    }
}

// 3. CARREGAR PASTAS PARA O GERENCIADOR (Para poder excluir Pastas)
async function carregarPastasParaGerenciar() {
    const listaPastas = document.getElementById('listaPastas');
    listaPastas.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 0.9rem;">Carregando...</p>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "pastas"));
        listaPastas.innerHTML = ''; 

        if (querySnapshot.empty) {
            listaPastas.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 0.9rem;">Nenhuma pasta criada ainda.</p>';
            return;
        }

        querySnapshot.forEach((documento) => {
            const pasta = documento.data();
            const item = document.createElement('div');
            item.className = 'estudo-item';
            item.innerHTML = `
                <div class="estudo-info">
                    <strong>📁 ${pasta.nome}</strong>
                </div>
                <button class="btn-excluir" data-id="${documento.id}">Excluir</button>
            `;
            listaPastas.appendChild(item);
        });

        // Adiciona a função de excluir em cada botão de pasta
        document.getElementById('listaPastas').querySelectorAll('.btn-excluir').forEach(botao => {
            botao.addEventListener('click', async (e) => {
                const docId = e.target.getAttribute('data-id');
                
                // Aviso extra: Se apagar a pasta, os arquivos dentro dela não aparecem mais.
                if(confirm("Tem certeza que deseja APAGAR esta pasta? (Se houver estudos nela, eles não aparecerão mais no site).")) {
                    e.target.textContent = "Apagando...";
                    try {
                        await deleteDoc(doc(db, "pastas", docId));
                        mostrarMensagem("📁 Pasta removida com sucesso!", "success");
                        // Atualiza as listas na tela
                        carregarPastasExistentes();
                        carregarPastasParaGerenciar();
                    } catch (error) {
                        console.error("Erro ao excluir pasta:", error);
                        mostrarMensagem("❌ Erro ao excluir pasta.", "error");
                    }
                }
            });
        });

    } catch (error) {
        console.error("Erro ao carregar gerenciador de pastas: ", error);
    }
}

// 4. AÇÃO DE SALVAR NOVO ESTUDO E PASTA
document.getElementById('formAdmin').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('btnSalvar');
    btn.textContent = "Publicando...";
    btn.disabled = true;

    const titulo = document.getElementById('titulo').value.trim();
    let link = document.getElementById('link').value.trim();
    const pastaNome = document.getElementById('pastaNome').value.trim();
    const pastaId = criarIdDaPasta(pastaNome);

    if (link.includes('/view')) {
        link = link.split('/view')[0] + '/preview';
    } else if (!link.includes('/preview') && link.includes('drive.google.com/file/d/')) {
        link = link + '/preview';
    }

    try {
        await setDoc(doc(db, "pastas", pastaId), { nome: pastaNome });

        const hoje = new Date().toLocaleDateString('pt-BR');
        await addDoc(collection(db, "pdfs"), {
            titulo: titulo,
            linkDrive: link,
            pastaId: pastaId,
            dataAdicao: hoje
        });

        mostrarMensagem("✅ Estudo publicado com sucesso!", "success");
        
        document.getElementById('titulo').value = '';
        document.getElementById('link').value = '';
        document.getElementById('titulo').focus();
        
        // Atualiza a tela automaticamente
        carregarPastasExistentes();
        carregarEstudosParaGerenciar();
        carregarPastasParaGerenciar();
        
    } catch (error) {
        console.error("Erro ao salvar:", error);
        mostrarMensagem("❌ Erro ao publicar. Verifique o console.", "error");
    } finally {
        btn.textContent = "Publicar na Plataforma";
        btn.disabled = false;
    }
});