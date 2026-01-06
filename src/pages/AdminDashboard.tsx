import React, { useState, useEffect } from "react";
import "../styles/adminDashboard.css";
import { db } from "../firebase";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, setDoc, getDoc
} from "firebase/firestore";

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

// Nova interface para a Home
interface HomeData {
  heroTitle: string;
  heroSubtitle: string;
  backgroundImage: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("upload");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "", bio: "", quote: "", image: ""
  });
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  // Estados para a Home
  const [homeData, setHomeData] = useState<HomeData>({
    heroTitle: "", heroSubtitle: "", backgroundImage: ""
  });
  const [homePreview, setHomePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "", price: "", dimensions: "", category: "", description: "", image: ""
  });

  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const qArt = query(collection(db, "artworks"), orderBy("date", "desc"));
    const unsubArt = onSnapshot(qArt, (snapshot) => {
      setArtworks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artwork)));
    });

    const unsubCat = onSnapshot(doc(db, "settings", "categories"), (snapshot) => {
      if (snapshot.exists()) setCategories(snapshot.data().list || []);
    });

    const fetchData = async () => {
      // Busca Perfil
      const profileSnap = await getDoc(doc(db, "settings", "profile"));
      if (profileSnap.exists()) {
        const data = profileSnap.data() as ProfileData;
        setProfileData(data);
        setProfilePreview(data.image);
      }

      // Busca dados da Home
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "settings", "profile"), profileData);
      alert("Perfil atualizado com sucesso!");
    } catch (err) { alert("Erro ao salvar perfil."); }
  };

  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      await setDoc(doc(db, "settings", "home"), homeData);
      alert("Página inicial atualizada com sucesso!");
    } catch (err) { alert("Erro ao salvar dados da home."); }
    finally { setIsProcessing(false); }
  };

  // ... (handlePublish, updateArtworkStatus, deleteArtwork permanecem iguais)
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.price) < 0) return alert("O preço não pode ser negativo!");
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
      setFormData({ title: "", price: "", dimensions: "", category: categories[0] || "", description: "", image: "" });
      setImagePreview(null);
      setActiveTab("inventory");
    } catch (error) { alert("Erro ao publicar obra."); } finally { setIsProcessing(false); }
  };

  const updateArtworkStatus = async (id: string, status: Artwork["status"]) => {
    await updateDoc(doc(db, "artworks", id), { status });
  };

  const deleteArtwork = async (id: string) => {
    if (window.confirm("Excluir definitivamente?")) await deleteDoc(doc(db, "artworks", id));
  };

  return (
    <div className="admin-dashboard-wrapper">
      <main className="dashboard-content">
        <aside className="dashboard-sidebar">
          <h2>Painel Gabi Iasi</h2>
          <button className={activeTab === "upload" ? "active" : ""} onClick={() => setActiveTab("upload")}>Novo Quadro</button>
          <button className={activeTab === "inventory" ? "active" : ""} onClick={() => setActiveTab("inventory")}>Gerenciar Acervo</button>
          <button className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>Tela de Início</button>
          <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Editar Perfil (Sobre)</button>
        </aside>

        <section className="dashboard-main-view">
          {/* ABA TELA DE INÍCIO */}
          {activeTab === "home" && (
            <div className="upload-section">
              <h3>Configurar Página Inicial (Hero)</h3>
              <form className="admin-form" onSubmit={handleSaveHome}>
                <div className="form-group">
                  <label>Background da Tela Inicial (Recomendado: 1920px)</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) compressImage(file, (b64) => {
                      setHomeData({ ...homeData, backgroundImage: b64 });
                      homePreview ? setHomePreview(b64) : setHomePreview(b64);
                    }, 1920); // Background maior para manter qualidade
                  }} />
                  {homePreview && (
                    <div className="home-bg-preview" style={{ 
                      marginTop: '10px', 
                      width: '100%', 
                      height: '150px', 
                      backgroundImage: `url(${homePreview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '8px'
                    }}></div>
                  )}
                </div>
                <div className="form-group">
                  <label>Título Principal (Hero Title)</label>
                  <input type="text" value={homeData.heroTitle} onChange={e => setHomeData({ ...homeData, heroTitle: e.target.value })} placeholder="Ex: Arte que Transforma" required />
                </div>
                <div className="form-group">
                  <label>Subtítulo ou Texto de Apoio</label>
                  <input type="text" value={homeData.heroSubtitle} onChange={e => setHomeData({ ...homeData, heroSubtitle: e.target.value })} placeholder="Ex: Obras exclusivas pintadas à mão" required />
                </div>
                <button type="submit" className="save-btn primary" disabled={isProcessing}>Salvar Página Inicial</button>
              </form>
            </div>
          )}

          {/* ... (Resto dos códigos: activeTab profile, upload, inventory) */}
          {activeTab === "profile" && (
            <div className="upload-section">
              <h3>Editar Informações do Perfil</h3>
              <form className="admin-form" onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label>Sua Foto Profissional</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) compressImage(file, (b64) => {
                      setProfileData({ ...profileData, image: b64 });
                      setProfilePreview(b64);
                    });
                  }} />
                  {profilePreview && <img src={profilePreview} alt="Perfil" className="img-preview-mini" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginTop: '10px' }} />}
                </div>
                <div className="form-group">
                  <label>Nome / Título Profissional</label>
                  <input type="text" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} placeholder="Ex: Gabi Iasi - Artista Plástica" required />
                </div>
                <div className="form-group">
                  <label>Texto "Sobre Mim"</label>
                  <textarea rows={6} value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} placeholder="Conte sua história e trajetória artística..." required />
                </div>
                <div className="form-group">
                  <label>Citação ou Frase Inspiradora (Opcional)</label>
                  <input type="text" value={profileData.quote} onChange={e => setProfileData({ ...profileData, quote: e.target.value })} placeholder="Ex: 'A arte limpa a alma da poeira do dia a dia.'" />
                </div>
                <button type="submit" className="save-btn primary" disabled={isProcessing}>Salvar Perfil</button>
              </form>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="upload-section">
              <h3>Cadastrar Nova Obra</h3>
              <form className="admin-form" onSubmit={handlePublish}>
                <div className="form-group">
                  <label>Foto do Quadro</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) compressImage(file, (b64) => {
                      setFormData({ ...formData, image: b64 });
                      setImagePreview(b64);
                    });
                  }} />
                  {imagePreview && <img src={imagePreview} alt="Preview" className="img-preview-mini" style={{ width: '150px', marginTop: '10px' }} />}
                </div>
                <div className="form-row">
                  <div className="form-group flex-2"><label>Título</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
                  <div className="form-group flex-1">
                    <label>Preço (R$)</label>
                    <input type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group flex-1"><label>Medidas</label><input type="text" value={formData.dimensions} onChange={e => setFormData({ ...formData, dimensions: e.target.value })} /></div>
                  <div className="form-group flex-1"><label>Categoria</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      <option value="">Selecione...</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Descrição</label><textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                <button type="submit" className="save-btn primary" disabled={isProcessing}>
                  {isProcessing ? "Processando..." : "Publicar Obra"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="inventory-section">
              <h3>Obras no Acervo ({artworks.length})</h3>
              <div className="inventory-grid">
                {artworks.map(art => (
                  <div key={art.id} className="inventory-card">
                    <img src={art.image} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                    <div className="art-details"><strong>{art.title}</strong><span>{art.category}</span></div>
                    <div className="art-management-actions">
                      <select
                        value={art.status}
                        onChange={(e) => updateArtworkStatus(art.id, e.target.value as any)}
                        className={`status-pill ${art.status}`}
                      >
                        <option value="disponivel">Disponível</option>
                        <option value="vendido">Vendido</option>
                        <option value="por-encomenda">Por Encomenda</option>
                      </select>
                      <button onClick={() => deleteArtwork(art.id)} className="del-btn">Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}