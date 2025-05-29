document.addEventListener('DOMContentLoaded', function() {
  // Evita delay no hover em mobile
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('touchstart', function() {
      this.classList.add('active');
    });
    el.addEventListener('touchend', function() {
      this.classList.remove('active');
    });
  });
  
  // Fecha menu ao clicar em um link
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('mobile-menu').classList.add('hidden');
    });
  });
});