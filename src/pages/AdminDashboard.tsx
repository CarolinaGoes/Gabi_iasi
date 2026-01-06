import React, { useState, useEffect } from "react";
import Header from "../components/Header";
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

  // --- Funções de Categoria ---
  const handleAddCategory = async () => {
    const name = prompt("Nome da nova categoria:");
    if (name && !categories.includes(name)) {
      const newList = [...categories, name];
      await setDoc(doc(db, "settings", "categories"), { list: newList });
    }
  };

  const handleEditCategory = async (oldName: string) => {
    const newName = prompt("Editar nome da categoria:", oldName);
    if (newName && newName !== oldName) {
      const newList = categories.map(cat => cat === oldName ? newName : cat);
      await setDoc(doc(db, "settings", "categories"), { list: newList });
    }
  };

  const handleDeleteCategory = async (name: string) => {
    if (window.confirm(`Excluir a categoria "${name}"?`)) {
      const newList = categories.filter(cat => cat !== name);
      await setDoc(doc(db, "settings", "categories"), { list: newList });
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
        callback(canvas.toDataURL("image/jpeg", 0.5));
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

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de todos os campos obrigatórios
    if (!formData.image) return alert("Por favor, selecione a foto da obra!");
    if (!formData.title.trim()) return alert("O título é obrigatório!");
    if (!formData.price) return alert("O preço é obrigatório!");
    if (!formData.dimensions.trim()) return alert("As medidas são obrigatórias!");
    if (!formData.category) return alert("Selecione uma categoria!");
    if (!formData.description.trim()) return alert("A descrição é obrigatória!");
    
    if (Number(formData.price) < 0) return alert("O preço não pode ser negativo!");

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
    } catch (error) { 
      alert("Erro ao publicar obra."); 
    } finally { 
      setIsProcessing(false); 
    }
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
          <h2>Painel Gabi Iasi</h2>
          <button className={activeTab === "upload" ? "active" : ""} onClick={() => setActiveTab("upload")}>Novo Quadro</button>
          <button className={activeTab === "inventory" ? "active" : ""} onClick={() => setActiveTab("inventory")}>Gerenciar Acervo</button>
          <button className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>Tela de Início</button>
          <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Editar Perfil (Sobre)</button>
        </aside>

        <section className="dashboard-main-view">
          {activeTab === "home" && (
            <div className="upload-section">
              <h3>Configurar Página Inicial (Hero)</h3>
              <form className="admin-form" onSubmit={handleSaveHome}>
                <div className="form-group">
                  <label>Imagem de fundo da Tela Inicial </label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) compressImage(file, (b64) => {
                      setHomeData({ ...homeData, backgroundImage: b64 });
                      setHomePreview(b64);
                    }, 1920);
                  }} />
                  {homePreview && (
                    <div className="home-bg-preview" style={{ 
                      marginTop: '10px', width: '100%', height: '150px', 
                      backgroundImage: `url(${homePreview})`, backgroundSize: 'cover', 
                      backgroundPosition: 'center', borderRadius: '8px' 
                    }}></div>
                  )}
                </div>
                <div className="form-group">
                  <label>Título Principal</label>
                  <input type="text" value={homeData.heroTitle} onChange={e => setHomeData({ ...homeData, heroTitle: e.target.value })} placeholder="Ex: Arte que Transforma" required />
                </div>
                <div className="form-group">
                  <label>Texto de Apoio</label>
                  <input type="text" value={homeData.heroSubtitle} onChange={e => setHomeData({ ...homeData, heroSubtitle: e.target.value })} placeholder="Ex: Obras exclusivas pintadas à mão" required />
                </div>
                <button type="submit" className="save-btn primary" disabled={isProcessing}>Salvar Página Inicial</button>
              </form>
            </div>
          )}

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
                  <label>Foto do Quadro (Obrigatório)</label>
                  <input type="file" accept="image/*" required onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) compressImage(file, (b64) => {
                      setFormData({ ...formData, image: b64 });
                      setImagePreview(b64);
                    });
                  }} />
                  {imagePreview && <img src={imagePreview} alt="Preview" className="img-preview-mini" style={{ width: '150px', marginTop: '10px' }} />}
                </div>
                <div className="form-row">
                  <div className="form-group flex-2">
                    <label>Título (Obrigatório)</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                  </div>
                  <div className="form-group flex-1">
                    <label>Preço R$ (Obrigatório)</label>
                    <input type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Medidas (Obrigatório)</label>
                    <input type="text" value={formData.dimensions} onChange={e => setFormData({ ...formData, dimensions: e.target.value })} required placeholder="Ex: 50x70cm" />
                  </div>
                  <div className="form-group flex-1">
                    <label>Categoria (Obrigatório)</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                      <option value="">Selecione...</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Descrição (Obrigatório)</label>
                  <textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                </div>
                <button type="submit" className="save-btn primary" disabled={isProcessing}>
                  {isProcessing ? "Processando..." : "Publicar Obra"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="inventory-section">
              <div className="management-block" style={{ marginBottom: '30px' }}>
                <div className="cat-manager-box">
                  <div className="view-top-bar" style={{ marginBottom: '15px', border: 'none' }}>
                    <h4 style={{ margin: 0 }}>Categorias do Site</h4>
                    <button className="save-btn primary" style={{ width: 'auto', padding: '8px 20px' }} onClick={handleAddCategory}>+ Nova Categoria</button>
                  </div>
                  <div className="cat-tags-container">
                    {categories.map(cat => (
                      <div key={cat} className="cat-editable-tag">
                        <span onClick={() => handleEditCategory(cat)}>{cat}</span>
                        <button className="cat-del" onClick={() => handleDeleteCategory(cat)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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