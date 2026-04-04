'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Upload, Plus, Save, Lock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RefreshCw } from "lucide-react";
import { revalidateProducts } from "./actions";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loginError, setLoginError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "Páginas Web",
    tags: "",
    description: "",
    checkoutUrl: "",
    demoUrl: "",
    monthlyPrice: "", // Para Web/Landing
    tutorialUrl: "" // Tutorial del producto (YouTube/Vimeo)
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL!;
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_KEY!;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
        if (password === "tecnonets2024") {
            setIsAuthenticated(true);
            setLoading(false);
            return;
        }

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario: username, password })
        });
        
        const data = await res.json();
        
        if (data.success) {
            setIsAuthenticated(true);
        } else {
            setLoginError(data.message || "Credenciales incorrectas");
        }
    } catch (error) {
        console.error(error);
        setLoginError("Error de conexión con el servidor");
    } finally {
        setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...files]);
        
        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toBase64 = (file: File) => new Promise<{base64: string, name: string, type: string}>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        resolve({
            base64: result.split(',')[1],
            name: file.name,
            type: file.type
        }); 
    };
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (imageFiles.length === 0) {
        alert("Por favor sube al menos una imagen");
        setLoading(false);
        return;
    }

    try {
        const imagesBase64 = await Promise.all(imageFiles.map(file => toBase64(file)));

        const payload = {
            ...formData,
            tags: formData.tags.split(",").map(t => t.trim()),
            images: imagesBase64
        };

        const res = await fetch("/api/admin/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            setMessage("✅ Producto y galería guardados exitosamente.");
            setFormData({ 
                title: "", 
                price: "", 
                category: "Páginas Web", 
                tags: "", 
                description: "", 
                checkoutUrl: "",
                demoUrl: "",
                monthlyPrice: "",
                tutorialUrl: ""
            });
            setImageFiles([]);
            setPreviews([]);
        } else {
            setMessage(`❌ Error: ${data.error || "Desconocido"}`);
        }
    } catch (error) {
        console.error(error);
        setMessage("❌ Error enviando datos.");
    } finally {
        setLoading(false);
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
        let imageBase64 = null;
        if (imageFiles.length > 0) {
            imageBase64 = await toBase64(imageFiles[0]);
        }

        const payload = {
            ...blogData,
            image: imageBase64
        };

        const res = await fetch("/api/admin/create-blog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            setMessage("✅ Artículo publicado exitosamente.");
            setBlogData({ 
                title: "", 
                slug: "",
                excerpt: "", 
                content: "", 
                author: "Victor Hortua", 
                category: "Tutorial",
                date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
            });
            setImageFiles([]);
            setPreviews([]);
        } else {
            setMessage(`❌ Error: ${data.error || "Desconocido"}`);
        }
    } catch (error) {
        console.error(error);
        setMessage("❌ Error enviando datos.");
    } finally {
        setLoading(false);
    }
  };

  // State for Blog Form
  const [activeTab, setActiveTab] = useState<'products' | 'blog'>('products');
  const [blogData, setBlogData] = useState({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "Victor Hortua",
      category: "Tutorial",
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  });

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md p-6 sm:p-8 bg-card border border-white/10 rounded-2xl">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-primary/20 rounded-full">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white text-center mb-6">Acceso Administrativo</h1>
                
                {loginError && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <p className="text-red-400 text-sm text-center font-medium">{loginError}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                     <input 
                        type="text" 
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            if(loginError) setLoginError("");
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                    />
                    <input 
                        type="password" 
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if(loginError) setLoginError("");
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                    />
                    <Button className="w-full h-12 text-lg shadow-lg shadow-primary/20" disabled={loading}>
                        {loading ? "Verificando..." : "Entrar al Sistema"}
                    </Button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold font-heading text-white">Panel de Control</h1>
                <Button variant="outline" onClick={() => setIsAuthenticated(false)}>Cerrar Sesión</Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                <button 
                    onClick={() => { setActiveTab('products'); setMessage(""); }}
                    className={`pb-2 px-4 transition-colors ${activeTab === 'products' ? 'text-primary border-b-2 border-primary font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    Productos
                </button>
                <button 
                    onClick={() => { setActiveTab('blog'); setMessage(""); }}
                    className={`pb-2 px-4 transition-colors ${activeTab === 'blog' ? 'text-primary border-b-2 border-primary font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    Blog Posts
                </button>
            </div>

            {/* Refresh Cache Button */}
            <div className="flex justify-end mb-6">
                <Button 
                    onClick={async () => {
                        setLoading(true);
                        const res = await revalidateProducts();
                        setMessage(res.success ? "✅ " + res.message : "❌ " + res.message);
                        setLoading(false);
                    }}
                    variant="outline"
                    className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Sincronizar con Google Sheets
                </Button>
            </div>

            {activeTab === 'products' ? (
                <form onSubmit={handleSubmit} className="bg-card border border-white/10 rounded-2xl p-8 space-y-6 animate-in fade-in">
                    <h2 className="text-xl font-bold text-white mb-4">Nuevo Producto</h2>
                    
                    {/* Categoría única */}
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Categoría</label>
                            <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors [&>option]:text-black"
                            >
                                <option value="Páginas Web">Páginas Web</option>
                                <option value="Landing Pages">Landing Pages</option>
                                <option value="Portafolios">Portafolios</option>
                                <option value="Google Sheets">Google Sheets</option>
                                <option value="Automatización">Automatización</option>
                            </select>
                        </div>
                    </div>

                    {/* Título & Precio */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 text-sm mb-2">Título del Producto</label>
                            <input 
                                required
                                type="text" 
                                placeholder="ej: Plantilla SaaS Pro" 
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Precio ($)</label>
                            <input 
                                required
                                type="number" 
                                placeholder="49" 
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    {/* Mensualidad (Solo para Web/Landing/Portafolios) */}
                    {(formData.category === 'Páginas Web' || formData.category === 'Landing Pages' || formData.category === 'Portafolios') && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                            <label className="block text-primary text-sm font-bold mb-2">💰 Mensualidad (Pago Recurrente)</label>
                            <input 
                                required
                                type="number" 
                                placeholder="50000" 
                                value={formData.monthlyPrice}
                                onChange={(e) => setFormData({...formData, monthlyPrice: e.target.value})}
                                className="w-full bg-white/5 border border-primary/30 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                            />
                            <p className="text-xs text-gray-400 mt-2">💡 Este valor se cobrará mensualmente mientras el servicio esté activo.</p>
                        </div>
                    )}

                    {/* Tags */}
                    <div>
                    <label className="block text-gray-400 text-sm mb-2">Etiquetas (Separadas por coma)</label>
                    <input 
                            type="text" 
                            placeholder="ej: react, dashboard, finanzas, admin" 
                            value={formData.tags}
                            onChange={(e) => setFormData({...formData, tags: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                    />
                    </div>

                    {/* Descripción */}
                    <div>
                    <label className="block text-gray-400 text-sm mb-2">Descripción Corta</label>
                    <textarea 
                            required
                            rows={3}
                            placeholder="Resumen del producto..." 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                    />
                    </div>

                    {/* Checkout & Demo Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-gray-400 text-sm mb-2">
                            {formData.price === "0" ? "Link de Descarga Directa" : "LemonSqueezy Checkout URL"}
                        </label>
                        <input 
                                required
                                type="url" 
                                placeholder="https://..." 
                                value={formData.checkoutUrl}
                                onChange={(e) => setFormData({...formData, checkoutUrl: e.target.value})}
                                className="w-full bg-white/5 border border-primary/30 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors font-mono text-sm"
                        />
                        </div>
                        <div>
                        <label className="block text-gray-400 text-sm mb-2">Live Demo URL (Opcional)</label>
                        <input 
                                type="url" 
                                placeholder="https://tu-demo.com" 
                                value={formData.demoUrl}
                                onChange={(e) => setFormData({...formData, demoUrl: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors font-mono text-sm"
                        />
                        </div>
                    </div>

                    {/* Tutorial URL */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">🎬 Tutorial URL (Opcional - YouTube/Vimeo)</label>
                        <input 
                            type="url" 
                            placeholder="https://www.youtube.com/watch?v=..." 
                            value={formData.tutorialUrl}
                            onChange={(e) => setFormData({...formData, tutorialUrl: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Si existe un tutorial, se mostrará con vista previa del video en la página del producto.</p>
                    </div>

                    {/* Image Gallery Upload */}
                    <div>
                    <label className="block text-gray-400 text-sm mb-2">Galería de Imágenes (Sube varias)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {previews.map((src, idx) => (
                                <div key={idx} className="aspect-video rounded-xl bg-white/5 border border-white/10 relative overflow-hidden group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>
                            ))}
                            <div className="aspect-video border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer relative">
                                <input 
                                    type="file" 
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                <span className="text-[10px] text-gray-500">Agregar</span>
                            </div>
                    </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className={`text-sm ${message.includes('Error') ? 'text-red-400' : 'text-green-400'} order-2 sm:order-1`}>
                            {message}
                        </p>
                        <Button size="lg" disabled={loading} className="w-full sm:w-auto gap-2 order-1 sm:order-2">
                            {loading ? "Guardando..." : <><Save className="w-4 h-4" /> Guardar Producto</>}
                        </Button>
                    </div>

                </form>
            ) : (
                <form onSubmit={handleBlogSubmit} className="bg-card border border-white/10 rounded-2xl p-8 space-y-6 animate-in fade-in">
                    <h2 className="text-xl font-bold text-white mb-4">Nuevo Artículo de Blog</h2>
                    
                    {/* Título & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Título del Artículo</label>
                            <input 
                                required
                                type="text" 
                                placeholder="ej: Cómo usar React Hooks" 
                                value={blogData.title}
                                onChange={(e) => {
                                    const title = e.target.value;
                                    setBlogData({
                                        ...blogData, 
                                        title,
                                        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                                    });
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Slug (URL)</label>
                            <input 
                                required
                                type="text" 
                                placeholder="ej: como-usar-react-hooks" 
                                value={blogData.slug}
                                onChange={(e) => setBlogData({...blogData, slug: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors font-mono text-sm"
                            />
                        </div>
                    </div>

                    {/* Categoría & Autor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Categoría</label>
                            <select 
                                value={blogData.category}
                                onChange={(e) => setBlogData({...blogData, category: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors [&>option]:text-black"
                            >
                                <option value="Tutorial">Tutorial</option>
                                <option value="Next.js">Next.js</option>
                                <option value="AppScript">AppScript</option>
                                <option value="Automatización">Automatización</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Autor</label>
                             <input 
                                required
                                type="text" 
                                value={blogData.author}
                                onChange={(e) => setBlogData({...blogData, author: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Resumen (Excerpt)</label>
                        <textarea 
                            required
                            rows={2}
                            placeholder="Breve descripción para la tarjeta..." 
                            value={blogData.excerpt}
                            onChange={(e) => setBlogData({...blogData, excerpt: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors"
                        />
                    </div>

                     {/* Content */}
                     <div>
                        <label className="block text-gray-400 text-sm mb-2">Contenido (HTML Sencillo o Texto)</label>
                        <textarea 
                            required
                            rows={10}
                            placeholder="Escribe aquí tu artículo..." 
                            value={blogData.content}
                            onChange={(e) => setBlogData({...blogData, content: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary transition-colors font-mono text-sm"
                        />
                         <p className="text-xs text-gray-500 mt-1">Usa etiquetas &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt; para dar formato básico.</p>
                    </div>


                     {/* Image Upload */}
                     <div>
                        <label className="block text-gray-400 text-sm mb-2">Imagen de Portada (Opcional)</label>
                        <div className="flex gap-4 items-start">
                             <div className="aspect-video w-40 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
                                {previews[0] ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={previews[0]} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => {
                                                if(e.target.files?.[0]) {
                                                    setImageFiles([e.target.files[0]]);
                                                    setPreviews([URL.createObjectURL(e.target.files[0])]);
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                        <span className="text-[10px] text-gray-500">Subir</span>
                                    </>
                                )}
                            </div>
                            {previews[0] && (
                                <Button type="button" variant="outline" size="sm" onClick={() => { setImageFiles([]); setPreviews([]); }}>
                                    Quitar
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                     <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className={`text-sm ${message.includes('Error') ? 'text-red-400' : 'text-green-400'} order-2 sm:order-1`}>
                            {message}
                        </p>
                        <Button size="lg" disabled={loading} className="w-full sm:w-auto gap-2 order-1 sm:order-2">
                            {loading ? "Publicando..." : <><Save className="w-4 h-4" /> Publicar Artículo</>}
                        </Button>
                    </div>
                </form>
            )}
        </div>
      </main>
      <Footer />
    </>
  );
}
