import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

    // Correção Automática do Link do Drive (Mágica!)
    if (link.includes('/view')) {
        link = link.split('/view')[0] + '/preview';
    }

    try {
        // 1. Cria ou garante que a pasta existe no banco
        await setDoc(doc(db, "pastas", pastaId), { nome: pastaNome });

        // 2. Adiciona o PDF lá dentro
        const hoje = new Date().toLocaleDateString('pt-BR');
        await addDoc(collection(db, "pdfs"), {
            titulo: titulo,
            linkDrive: link,
            pastaId: pastaId,
            dataAdicao: hoje
        });

        alert("✅ Estudo publicado com sucesso no site!");
        
        // Limpa o formulário para você colocar o próximo
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