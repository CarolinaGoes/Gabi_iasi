import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/contacts.css";

export default function Contacts() {
  const socialLinks = [
    { label: "Instagram", url: "https://www.instagram.com/gabrielaiasipilch/", pos: { top: '40%', left: '61%' } },
    { label: "Facebook", url: "https://www.facebook.com/gabi.iasipilch.9", pos: { top: '65%', left: '45%' } },
    { label: "WhatsApp", url: "https://wa.me/+5511913297566", pos: { top: '87%', left: '44%' } },
    { label: "E-mail", url: "mailto:nic.rubini@hotmail.com", pos: { top: '89%', left: '68%' } },
  ];

  return (
    <div className="contacts-page-wrapper">
      <Header />
      <main className="contacts-main">
        <div className="contacts-quote">
          “A arte é uma forma de diálogo sem palavras.”
        </div>

        <div className="interactive-map">
          <img src="/social.png" alt="Estante de contatos" className="map-background" />
          
          {socialLinks.map((social, index) => (
            <a 
              key={index} 
              href={social.url} 
              className="social-hotspot"
              /* Nota: mailto funciona melhor sem target="_blank", 
                 mas mantê-lo não impede o funcionamento */
              target="_blank"
              rel="noopener noreferrer"
              style={{ top: social.pos.top, left: social.pos.left }}
            >
              <div className="anchor-content">{social.label}</div>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}