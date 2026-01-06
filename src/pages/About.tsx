import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/about.css";

// Interface para tipar os dados do perfil
interface ProfileData {
  name: string;
  bio: string;
  quote: string;
  image: string;
}

export default function About() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Sincronização em tempo real com o Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "profile"), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as ProfileData);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const bgStyle = {
    backgroundImage: `linear-gradient(rgba(30,15,10,.75), rgba(30,15,10,.9)), url("/bk2.jpg")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh'
  };

  if (loading) {
    return (
      <div style={bgStyle} className="about-page-wrapper">
        <Header />
        <div className="loading-container" style={{color: '#fff', textAlign: 'center', marginTop: '100px'}}>
          <p>Carregando biografia...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={bgStyle} className="about-page-wrapper">
      <Header />
      <main>
        <section className="about-container">
          
          <div className="about-photo">
            {/* Exibe a imagem cadastrada no Dashboard ou uma padrão se estiver vazio */}
            <img 
              src={profile?.image || "/foto-gabi.jpg"} 
              alt={`Foto de ${profile?.name || "Artista"}`} 
            />
          </div>

          <div className="about-content">
            <h1>{profile?.name || "Gabi Iasi"}</h1>
            
            <div className="bio-text">
              {/* Esta lógica divide o texto por quebras de linha e cria parágrafos automaticamente */}
              {profile?.bio ? (
                profile.bio.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p>Biografia em desenvolvimento.</p>
              )}
            </div>

            {/* Exibe a citação apenas se ela existir no banco */}
            {profile?.quote && (
              <div className="about-highlight">
                “{profile.quote}”
              </div>
            )}
          </div>

        </section>
      </main>
      <Footer />
    </div>
  );
}