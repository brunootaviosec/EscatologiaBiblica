import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
// 🔒 SISTEMA DE SEGURANÇA: APENAS ADMIN
// ==========================================
const EMAIL_ADMIN = "bruno.otavio.j.melo@gmail.com"; // Exatamente o seu e-mail

onAuthStateChanged(auth, (user) => {
    if (!user) {
        // 1. Se tentar entrar sem estar logado -> Expulsa para o Login
        window.location.href = "../login1/login.html";
    } else if (user.email !== EMAIL_ADMIN) {
        // 2. Se for um aluno logado tentando bancar o espertinho -> Expulsa para o Painel de Aluno
        alert("⚠️ Acesso Negado: Área restrita à administração.");
        window.location.href = "principal.html";
    } else {
        // 3. É você! Acesso autorizado.
        console.log("Acesso de Administrador Verificado.");
    }
});
// ==========================================

document.getElementById('formAdmin').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('btnSalvar');
    btn.textContent = "Publicando...";
    btn.disabled = true;

    const titulo = document.getElementById('titulo').value;
    let link = document.getElementById('link').value;
    
    const pastaSelect = document.getElementById('pastaSelect');
    const pastaId = pastaSelect.value;
    const pastaNome = pastaSelect.options[pastaSelect.selectedIndex].text;

    // Correção Automática do Link do Drive
    if (link.includes('/view')) {
        link = link.split('/view')[0] + '/preview';
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

        alert("✅ Estudo publicado com sucesso no site!");
        
        document.getElementById('titulo').value = '';
        document.getElementById('link').value = '';
        
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("❌ Erro ao publicar. Verifique o console.");
    } finally {
        btn.textContent = "Publicar no Site";
        btn.disabled = false;
    }
});