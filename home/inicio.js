// Script focado em adicionar animações sutis de entrada para dar um toque premium
document.addEventListener('DOMContentLoaded', () => {
    
    // Animação de entrada do texto e botão principal
    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-delayed');
    
    // Pequeno atraso para o efeito ficar mais elegante ao abrir a página
    setTimeout(() => {
        fadeElements.forEach((el) => {
            el.classList.add('visible');
        });
    }, 150);

    // Efeito sutil de movimento na imagem de fundo
    const heroBg = document.querySelector('.hero-background');
    if (heroBg) {
        // Remove o zoom inicial lentamente criando um efeito de respiração (Ken Burns effect)
        setTimeout(() => {
            heroBg.style.transform = 'scale(1)';
        }, 50);
    }
});