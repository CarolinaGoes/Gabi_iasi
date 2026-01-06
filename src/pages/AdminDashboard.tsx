import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, setDoc, getDoc
} from "firebase/firestore";
import Header from "../components/Header";
import "../styles/adminDashboard.css";

// --- Interfaces ---
interface Artwork {
  id: string;
  title: string;
  price: number;
  category: string;
  status: "disponivel" | "vendido" | "por-encomenda";
  dimensions: string;
  description: string;
  image: string;
  views: number;
  date: string;
}

interface ProfileData {
  name: string;
  bio: string;
  quote: string;
  image: string;
}

interface HomeData {
  heroTitle: string;
  heroSubtitle: string;
  backgroundImage: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upload");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Estados de Dados
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "", bio: "", quote: "", image: ""
  });
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const [homeData, setHomeData] = useState<HomeData>({
    heroTitle: "", heroSubtitle: "", backgroundImage: ""
  });
  const [homePreview, setHomePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "", price: "", dimensions: "", category: "", description: "", image: ""
  });

  const [categories, setCategories] = useState<string[]>([]);

  // Carregamento de Dados
  useEffect(() => {
    const qArt = query(collection(db, "artworks"), orderBy("date", "desc"));
    const unsubArt = onSnapshot(qArt, (snapshot) => {
      setArtworks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artwork)));
    });

    const unsubCat = onSnapshot(doc(db, "settings", "categories"), (snapshot) => {
      if (snapshot.exists()) setCategories(snapshot.data().list || []);
    });

    const fetchData = async () => {
      const profileSnap = await getDoc(doc(db, "settings", "profile"));
      if (profileSnap.exists()) {
        const data = profileSnap.data() as ProfileData;
        setProfileData(data);
        setProfilePreview(data.image);
      }

      const homeSnap = await getDoc(doc(db, "settings", "home"));
      if (homeSnap.exists()) {
        const data = homeSnap.data() as HomeData;
        setHomeData(data);
        setHomePreview(data.backgroundImage);
      }
    };
    fetchData();

    return () => { unsubArt(); unsubCat(); };
  }, []);

  // Funções Auxiliares
  const handleLogout = async () => {
    if (window.confirm("Deseja realmente sair?")) {
      await signOut(auth);
      navigate("/admin");
    }
  };

  const compressImage = (file: File, callback: (base64: string) => void, maxWidth = 800) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL("image/jpeg", 0.7));
        setIsProcessing(false);
      };
    };
  };

  // Handlers de Salvamento
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "settings", "profile"), profileData);
      alert("Perfil atualizado!");
    } catch (err) { alert("Erro ao salvar perfil."); }
  };

  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      await setDoc(doc(db, "settings", "home"), homeData);
      alert("Página inicial atualizada!");
    } catch (err) { alert("Erro ao salvar home."); }
    finally { setIsProcessing(false); }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) return alert("Selecione a foto da obra!");
    try {
      setIsProcessing(true);
      await addDoc(collection(db, "artworks"), {
        ...formData,
        price: Math.abs(Number(formData.price)),
        status: "disponivel",
        views: 0,
        date: new Date().toISOString()
      });
      alert("Obra publicada!");
      setFormData({ title: "", price: "", dimensions: "", category: "", description: "", image: "" });
      setImagePreview(null);
      setActiveTab("inventory");
    } catch (error) { alert("Erro ao publicar."); } finally { setIsProcessing(false); }
  };

  const updateArtworkStatus = async (id: string, status: Artwork["status"]) => {
    await updateDoc(doc(db, "artworks", id), { status });
  };

  const deleteArtwork = async (id: string) => {
    if (window.confirm("Excluir definitivamente?")) await deleteDoc(doc(db, "artworks", id));
  };

  return (
    <div className="admin-dashboard-wrapper">
      <Header />

      <main className="dashboard-content">
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>Painel Gabi Iasi</h2>
          </div>
          <nav className="sidebar-nav">
            <button className={activeTab === "upload" ? "active" : ""} onClick={() => setActiveTab("upload")}>Novo Quadro</button>
            <button className={activeTab === "inventory" ? "active" : ""} onClick={() => setActiveTab("inventory")}>Gerenciar Acervo</button>
            <button className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>Tela de Início</button>
            <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Editar Perfil (Sobre)</button>
          </nav>
          <button className="logout-btn" onClick={handleLogout}>Sair do Sistema</button>
        </aside>

        {/* ÁREA PRINCIPAL DE CONTEÚDO */}
        <section className="dashboard-main-view">
          
          <div className="tab-container">
            {/* ABA HOME */}
            {activeTab === "home" && (
              <div className="upload-section">
                <h3>Configurar Página Inicial</h3>
                <form className="admin-form" onSubmit={handleSaveHome}>
                  <div className="form-group">
                    <label>Imagem de Fundo (Hero)</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) compressImage(file, (b64) => {
                        setHomeData({ ...homeData, backgroundImage: b64 });
                        setHomePreview(b64);
                      }, 1920);
                    }} />
                    {homePreview && (
                      <div className="home-bg-preview" style={{ backgroundImage: `url(${homePreview})` }}></div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Título de Boas-vindas</label>
                    <input type="text" value={homeData.heroTitle} onChange={e => setHomeData({ ...homeData, heroTitle: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Subtítulo</label>
                    <input type="text" value={homeData.heroSubtitle} onChange={e => setHomeData({ ...homeData, heroSubtitle: e.target.value })} required />
                  </div>
                  <button type="submit" className="save-btn primary" disabled={isProcessing}>Salvar Alterações</button>
                </form>
              </div>
            )}

            {/* ABA PROFILE */}
            {activeTab === "profile" && (
              <div className="upload-section">
                <h3>Editar Perfil (Sobre)</h3>
                <form className="admin-form" onSubmit={handleSaveProfile}>
                  <div className="form-group">
                    <label>Sua Foto</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) compressImage(file, (b64) => {
                        setProfileData({ ...profileData, image: b64 });
                        setProfilePreview(b64);
                      });
                    }} />
                    {profilePreview && <img src={profilePreview} alt="Perfil" className="profile-img-preview" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginTop: '10px' }} />}
                  </div>
                  <div className="form-group">
                    <label>Nome / Título Profissional</label>
                    <input type="text" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Biografia</label>
                    <textarea rows={6} value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} required />
                  </div>
                  <button type="submit" className="save-btn primary">Atualizar Sobre</button>
                </form>
              </div>
            )}

            {/* ABA UPLOAD */}
            {activeTab === "upload" && (
              <div className="upload-section">
                <h3>Cadastrar Nova Obra</h3>
                <form className="admin-form" onSubmit={handlePublish}>
                  <div className="form-group">
                    <label>Foto da Obra</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) compressImage(file, (b64) => {
                        setFormData({ ...formData, image: b64 });
                        setImagePreview(b64);
                      });
                    }} />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="img-preview-mini" style={{ width: '150px', marginTop: '10px', borderRadius: '8px' }} />}
                  </div>
                  <div className="form-row">
                    <div className="form-group flex-2"><label>Título</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
                    <div className="form-group flex-1"><label>Preço (R$)</label><input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group flex-1"><label>Categoria</label>
                      <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                        <option value="">Selecione...</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="save-btn primary" disabled={isProcessing}>
                    {isProcessing ? "Processando..." : "Publicar Obra"}
                  </button>
                </form>
              </div>
            )}

            {/* ABA INVENTÁRIO */}
            {activeTab === "inventory" && (
              <div className="inventory-section">
                <h3>Acervo ({artworks.length} obras)</h3>
                <div className="inventory-grid">
                  {artworks.map(art => (
                    <div key={art.id} className="inventory-card">
                      <img src={art.image} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div className="art-info">
                        <strong>{art.title}</strong>
                        <p>{art.category}</p>
                      </div>
                      <div className="art-actions">
                        <select 
                          value={art.status} 
                          onChange={(e) => updateArtworkStatus(art.id, e.target.value as any)}
                          className={`status-pill ${art.status}`}
                        >
                          <option value="disponivel">Disponível</option>
                          <option value="vendido">Vendido</option>
                          <option value="por-encomenda">Encomenda</option>
                        </select>
                        <button onClick={() => deleteArtwork(art.id)} className="del-btn">Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}