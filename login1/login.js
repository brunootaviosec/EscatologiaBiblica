// Desenvolvido Por Bruno Otávio Jeronimo Melo | Pedra-PE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// COLOQUE SUAS CHAVES DO FIREBASE AQUI (As mesmas do principal.js)
const firebaseConfig = {
    apiKey: "AIzaSyBwPhRfIY5d8U_nmxyuCpCAkKQlKBhGHli",
    authDomain: "escatologiabiblica-c82c3.firebaseapp.com",
    projectId: "escatologiabiblica-c82c3",
    storageBucket: "escatologiabiblica-c82c3.firebasestorage.app",
    messagingSenderId: "156849616608",
    appId: "1:156849616608:web:a6eb47e0b00ca0ee824285",
    measurementId: "G-ZQRZ7CP8PH"
};
// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DO TEMA (DARK/LIGHT MODE) ---
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

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

    // --- LÓGICA DE REVELAR SENHA ---
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeSlash = document.getElementById('eye-slash');

    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            eyeSlash.style.display = 'block';
        } else {
            eyeSlash.style.display = 'none';
        }
    });

    // --- LÓGICA DO FORMULÁRIO E AUTENTICAÇÃO REAL ---
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const emailInput = document.getElementById('email');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const email = emailInput.value;
        const password = passwordInput.value;
        
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = 'Autenticando...';
        submitBtn.disabled = true;

        // Autenticação com o Firebase
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // SUCESSO NO LOGIN!
                submitBtn.innerHTML = 'Acesso Liberado';
                submitBtn.style.backgroundColor = '#10b981'; // Verde sucesso
                submitBtn.style.color = '#ffffff'; 
                
                // Aguarda 1 segundo e redireciona para a página principal
                setTimeout(() => {
                    window.location.href = "../principal/principal.html"; 
                }, 1000);
            })
            .catch((error) => {
                // ERRO NO LOGIN (Senha ou email errados)
                console.error("Erro no login:", error.code, error.message);
                
                submitBtn.innerHTML = 'Dados Incorretos';
                submitBtn.style.backgroundColor = '#ef4444'; // Vermelho erro
                submitBtn.style.color = '#ffffff';
                
                // Reseta o botão após 2 segundos
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                    submitBtn.disabled = false;
                    passwordInput.value = ''; // Limpa a senha para tentar de novo
                }, 2000);
            });
    });
});