import React from 'react';
import '../styles/footer.css';

const Footer = () => (
  <footer className="admin-footer">
    <div className="footer-container">
      <p>© {new Date().getFullYear()} Gabriela Iasi Pilch. Todos os direitos reservados.</p>
      <p>
        Desenvolvido por <a href="https://carolinagoes.vercel.app/" target="_blank" rel="noopener noreferrer" className="dev-link">Carolina Goes</a>
      </p>
    </div>
  </footer>
);

export default Footer;