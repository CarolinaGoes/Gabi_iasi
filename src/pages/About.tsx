import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/about.css";

export default function About() {
    const bgStyle = {
    backgroundImage: `linear-gradient(rgba(30,15,10,.75), rgba(30,15,10,.9)), url("/bk2.jpg")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh'
  };
  return (
   <div style={bgStyle} className="about-page-wrapper">
      <Header />
      <main>
        <section className="about-container">
          
          <div className="about-photo">
            {/* Note que no Vite/React usamos caminhos sem "public" */}
            <img 
              src="/foto-gabi.jpg" 
              alt="Foto profissional da artista Gabi Iasi" 
            />
          </div>

          <div className="about-content">
            <h1>Gabi Iasi</h1>
            <h2>Artista Visual</h2>

            <p>
              Gabi Iasi é uma artista visual cuja produção transita entre o sensível
              e o simbólico, explorando emoções, memórias e paisagens internas.
            </p>

            <p>
              Seu trabalho se destaca pelo uso expressivo das cores, texturas
              e composições que convidam o observador à contemplação.
            </p>

            <p>
              Cada obra carrega uma narrativa silenciosa, conectando arte,
              introspecção e identidade.
            </p>

            <div className="about-highlight">
              “A pintura é um espaço de pausa, onde o tempo desacelera.”
            </div>
          </div>

        </section>
      </main>
      <Footer />
    </div>
  );
}