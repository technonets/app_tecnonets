"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/Button";

// Lista completa de países con códigos telefónicos
const COUNTRIES = [
  { name: 'Afganistán', code: '+93', flag: '🇦🇫', digits: 9 },
  { name: 'Albania', code: '+355', flag: '🇦🇱', digits: 9 },
  { name: 'Alemania', code: '+49', flag: '🇩🇪', digits: 11 },
  { name: 'Andorra', code: '+376', flag: '🇦🇩', digits: 6 },
  { name: 'Angola', code: '+244', flag: '🇦🇴', digits: 9 },
  { name: 'Arabia Saudita', code: '+966', flag: '🇸🇦', digits: 9 },
  { name: 'Argelia', code: '+213', flag: '🇩🇿', digits: 9 },
  { name: 'Argentina', code: '+54', flag: '🇦🇷', digits: 10 },
  { name: 'Armenia', code: '+374', flag: '🇦🇲', digits: 8 },
  { name: 'Australia', code: '+61', flag: '🇦🇺', digits: 9 },
  { name: 'Austria', code: '+43', flag: '🇦🇹', digits: 10 },
  { name: 'Azerbaiyán', code: '+994', flag: '🇦🇿', digits: 9 },
  { name: 'Bahamas', code: '+1242', flag: '🇧🇸', digits: 10 },
  { name: 'Bangladés', code: '+880', flag: '🇧🇩', digits: 10 },
  { name: 'Barbados', code: '+1246', flag: '🇧🇧', digits: 10 },
  { name: 'Bélgica', code: '+32', flag: '🇧🇪', digits: 9 },
  { name: 'Belice', code: '+501', flag: '🇧🇿', digits: 7 },
  { name: 'Bielorrusia', code: '+375', flag: '🇧🇾', digits: 9 },
  { name: 'Bolivia', code: '+591', flag: '🇧🇴', digits: 8 },
  { name: 'Bosnia y Herzegovina', code: '+387', flag: '🇧🇦', digits: 8 },
  { name: 'Botsuana', code: '+267', flag: '🇧🇼', digits: 8 },
  { name: 'Brasil', code: '+55', flag: '🇧🇷', digits: 11 },
  { name: 'Bulgaria', code: '+359', flag: '🇧🇬', digits: 9 },
  { name: 'Camboya', code: '+855', flag: '🇰🇭', digits: 9 },
  { name: 'Camerún', code: '+237', flag: '🇨🇲', digits: 9 },
  { name: 'Canadá', code: '+1', flag: '🇨🇦', digits: 10 },
  { name: 'Chile', code: '+56', flag: '🇨🇱', digits: 9 },
  { name: 'China', code: '+86', flag: '🇨🇳', digits: 11 },
  { name: 'Colombia', code: '+57', flag: '🇨🇴', digits: 10 },
  { name: 'Corea del Sur', code: '+82', flag: '🇰🇷', digits: 10 },
  { name: 'Costa Rica', code: '+506', flag: '🇨🇷', digits: 8 },
  { name: 'Croacia', code: '+385', flag: '🇭🇷', digits: 9 },
  { name: 'Cuba', code: '+53', flag: '🇨🇺', digits: 8 },
  { name: 'Dinamarca', code: '+45', flag: '🇩🇰', digits: 8 },
  { name: 'Ecuador', code: '+593', flag: '🇪🇨', digits: 9 },
  { name: 'Egipto', code: '+20', flag: '🇪🇬', digits: 10 },
  { name: 'El Salvador', code: '+503', flag: '🇸🇻', digits: 8 },
  { name: 'Emiratos Árabes Unidos', code: '+971', flag: '🇦🇪', digits: 9 },
  { name: 'Eslovaquia', code: '+421', flag: '🇸🇰', digits: 9 },
  { name: 'Eslovenia', code: '+386', flag: '🇸🇮', digits: 9 },
  { name: 'España', code: '+34', flag: '🇪🇸', digits: 9 },
  { name: 'Estados Unidos', code: '+1', flag: '🇺🇸', digits: 10 },
  { name: 'Estonia', code: '+372', flag: '🇪🇪', digits: 8 },
  { name: 'Etiopía', code: '+251', flag: '🇪🇹', digits: 9 },
  { name: 'Filipinas', code: '+63', flag: '🇵🇭', digits: 10 },
  { name: 'Finlandia', code: '+358', flag: '🇫🇮', digits: 10 },
  { name: 'Francia', code: '+33', flag: '🇫🇷', digits: 9 },
  { name: 'Georgia', code: '+995', flag: '🇬🇪', digits: 9 },
  { name: 'Ghana', code: '+233', flag: '🇬🇭', digits: 9 },
  { name: 'Grecia', code: '+30', flag: '🇬🇷', digits: 10 },
  { name: 'Guatemala', code: '+502', flag: '🇬🇹', digits: 8 },
  { name: 'Honduras', code: '+504', flag: '🇭🇳', digits: 8 },
  { name: 'Hong Kong', code: '+852', flag: '🇭🇰', digits: 8 },
  { name: 'Hungría', code: '+36', flag: '🇭🇺', digits: 9 },
  { name: 'India', code: '+91', flag: '🇮🇳', digits: 10 },
  { name: 'Indonesia', code: '+62', flag: '🇮🇩', digits: 11 },
  { name: 'Irak', code: '+964', flag: '🇮🇶', digits: 10 },
  { name: 'Irán', code: '+98', flag: '🇮🇷', digits: 10 },
  { name: 'Irlanda', code: '+353', flag: '🇮🇪', digits: 9 },
  { name: 'Islandia', code: '+354', flag: '🇮🇸', digits: 7 },
  { name: 'Israel', code: '+972', flag: '🇮🇱', digits: 9 },
  { name: 'Italia', code: '+39', flag: '🇮🇹', digits: 10 },
  { name: 'Jamaica', code: '+1876', flag: '🇯🇲', digits: 10 },
  { name: 'Japón', code: '+81', flag: '🇯🇵', digits: 10 },
  { name: 'Jordania', code: '+962', flag: '🇯🇴', digits: 9 },
  { name: 'Kazajistán', code: '+7', flag: '🇰🇿', digits: 10 },
  { name: 'Kenia', code: '+254', flag: '🇰🇪', digits: 10 },
  { name: 'Letonia', code: '+371', flag: '🇱🇻', digits: 8 },
  { name: 'Líbano', code: '+961', flag: '🇱🇧', digits: 8 },
  { name: 'Libia', code: '+218', flag: '🇱🇾', digits: 10 },
  { name: 'Lituania', code: '+370', flag: '🇱🇹', digits: 8 },
  { name: 'Luxemburgo', code: '+352', flag: '🇱🇺', digits: 9 },
  { name: 'Macedonia del Norte', code: '+389', flag: '🇲🇰', digits: 8 },
  { name: 'Malasia', code: '+60', flag: '🇲🇾', digits: 10 },
  { name: 'Malta', code: '+356', flag: '🇲🇹', digits: 8 },
  { name: 'Marruecos', code: '+212', flag: '🇲🇦', digits: 9 },
  { name: 'México', code: '+52', flag: '🇲🇽', digits: 10 },
  { name: 'Moldavia', code: '+373', flag: '🇲🇩', digits: 8 },
  { name: 'Montenegro', code: '+382', flag: '🇲🇪', digits: 8 },
  { name: 'Nicaragua', code: '+505', flag: '🇳🇮', digits: 8 },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬', digits: 10 },
  { name: 'Noruega', code: '+47', flag: '🇳🇴', digits: 8 },
  { name: 'Nueva Zelanda', code: '+64', flag: '🇳🇿', digits: 9 },
  { name: 'Países Bajos', code: '+31', flag: '🇳🇱', digits: 9 },
  { name: 'Pakistán', code: '+92', flag: '🇵🇰', digits: 10 },
  { name: 'Panamá', code: '+507', flag: '🇵🇦', digits: 8 },
  { name: 'Paraguay', code: '+595', flag: '🇵🇾', digits: 9 },
  { name: 'Perú', code: '+51', flag: '🇵🇪', digits: 9 },
  { name: 'Polonia', code: '+48', flag: '🇵🇱', digits: 9 },
  { name: 'Portugal', code: '+351', flag: '🇵🇹', digits: 9 },
  { name: 'Puerto Rico', code: '+1787', flag: '🇵🇷', digits: 10 },
  { name: 'Reino Unido', code: '+44', flag: '🇬🇧', digits: 10 },
  { name: 'República Checa', code: '+420', flag: '🇨🇿', digits: 9 },
  { name: 'República Dominicana', code: '+1809', flag: '🇩🇴', digits: 10 },
  { name: 'Rumania', code: '+40', flag: '🇷🇴', digits: 10 },
  { name: 'Rusia', code: '+7', flag: '🇷🇺', digits: 10 },
  { name: 'Serbia', code: '+381', flag: '🇷🇸', digits: 9 },
  { name: 'Singapur', code: '+65', flag: '🇸🇬', digits: 8 },
  { name: 'Sudáfrica', code: '+27', flag: '🇿🇦', digits: 9 },
  { name: 'Suecia', code: '+46', flag: '🇸🇪', digits: 9 },
  { name: 'Suiza', code: '+41', flag: '🇨🇭', digits: 9 },
  { name: 'Tailandia', code: '+66', flag: '🇹🇭', digits: 9 },
  { name: 'Taiwán', code: '+886', flag: '🇹🇼', digits: 9 },
  { name: 'Túnez', code: '+216', flag: '🇹🇳', digits: 8 },
  { name: 'Turquía', code: '+90', flag: '🇹🇷', digits: 10 },
  { name: 'Ucrania', code: '+380', flag: '🇺🇦', digits: 9 },
  { name: 'Uruguay', code: '+598', flag: '🇺🇾', digits: 8 },
  { name: 'Venezuela', code: '+58', flag: '🇻🇪', digits: 10 },
  { name: 'Vietnam', code: '+84', flag: '🇻🇳', digits: 10 },
];

export function ContactForm() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get('servicio') || '';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '',
    phone: '',
    country: '',
    service: initialService,
    otherService: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  // Estado para autocomplete de país
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);

  // Filtrar países mientras el usuario escribe
  const handleCountrySearch = (value: string) => {
    setCountrySearch(value);
    setShowCountryDropdown(true);
    
    if (!value.trim()) {
      setFilteredCountries(COUNTRIES);
      // Resetear país y código cuando se borra el campo
      setFormData(prev => ({
        ...prev,
        country: '',
        countryCode: ''
      }));
    } else {
      const filtered = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  };

  // Seleccionar un país del dropdown
  const selectCountry = (country: typeof COUNTRIES[0]) => {
    setFormData(prev => ({
      ...prev,
      country: country.name,
      countryCode: country.code
    }));
    setCountrySearch(country.name);
    setShowCountryDropdown(false);
    
    if (errors.country) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs.country;
        return newErrs;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validación de teléfono con longitud específica por país
    if (!formData.phone.trim()) {
      newErrors.phone = 'El número de teléfono es obligatorio';
    } else {
      const selectedCountry = COUNTRIES.find(c => c.code === formData.countryCode);
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (selectedCountry && phoneDigits.length !== selectedCountry.digits) {
        newErrors.phone = `Debe tener ${selectedCountry.digits} dígitos`;
      }
    }
    
    if (!formData.country.trim()) newErrors.country = 'El país es obligatorio';
    if (!formData.service.trim()) newErrors.service = 'Debes seleccionar un tipo de proyecto';
    if (formData.service === 'Otro' && !formData.otherService.trim()) {
      newErrors.otherService = 'Por favor especifica tu necesidad';
    }
    if (!formData.message.trim()) newErrors.message = 'El mensaje es obligatorio';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Limpiar error al escribir
    if (errors[id]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[id];
        return newErrs;
      });
    }
  };

  // Google Form Entry IDs
  const FORM_IDS = {
    name: "entry.347440041",
    email: "entry.2081612151",
    country: "entry.409570411",
    countryCode: "entry.936748144",
    phone: "entry.164976412",
    service: "entry.1708839588",
    otherService: "entry.297222494",
    message: "entry.1132130396",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSf4Kwgu1qcbkglAMCnFK5Rl_JGOfi7x_pmarCHKJqP19zBGEg/formResponse";
      
      const formDataToSubmit = new URLSearchParams();
      formDataToSubmit.append(FORM_IDS.name, formData.name);
      formDataToSubmit.append(FORM_IDS.email, formData.email);
      formDataToSubmit.append(FORM_IDS.country, formData.country);
      formDataToSubmit.append(FORM_IDS.countryCode, formData.countryCode);
      formDataToSubmit.append(FORM_IDS.phone, formData.phone.replace(/\s/g, ''));
      formDataToSubmit.append(FORM_IDS.service, formData.service);
      // Only append otherService if it has a value, or always append if the form accepts empty
      formDataToSubmit.append(FORM_IDS.otherService, formData.otherService || '');
      formDataToSubmit.append(FORM_IDS.message, formData.message);

      await fetch(formUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formDataToSubmit.toString(),
      });

      setIsSent(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      // Even if it fails (which we can't fully detect with no-cors), we might want to show an error or fallback
      // For now, assuming success or silent failure as per standard Google Forms no-cors behavior
      setIsSent(true); // Treat as success for user experience if request went out
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll to success message when shown
  const successRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (isSent && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSent]);

  if (isSent) {
    return (
      <div ref={successRef} className="text-center py-12 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">¡Mensaje Enviado!</h3>
        <p className="text-foreground/60 font-medium">Gracias por contactarnos. Te responderemos lo antes posible por email o WhatsApp.</p>
        <Button variant="outline" className="mt-8" onClick={() => {
          setIsSent(false);
          setFormData({
            name: '',
            email: '',
            countryCode: '',
            phone: '',
            country: '',
            service: initialService,
            otherService: '',
            message: ''
          });
          setCountrySearch('');
        }}>Enviar otro mensaje</Button>
      </div>
    );
  }

  const inputClasses = (field: string) => `
    w-full bg-foreground/5 border rounded-lg px-4 py-3 text-foreground focus:outline-none transition-all duration-300
    ${errors[field] 
      ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
      : 'border-border/50 focus:border-primary hover:border-border'}
  `;

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-foreground/70">Nombre <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            id="name" 
            value={formData.name}
            onChange={handleChange}
            className={inputClasses('name')} 
            placeholder="Tu nombre" 
          />
          {errors.name && <p className="text-xs text-red-400 mt-1 animate-in fade-in slide-in-from-top-1">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-foreground/70">Email <span className="text-red-500">*</span></label>
          <input 
            type="email" 
            id="email" 
            value={formData.email}
            onChange={handleChange}
            className={inputClasses('email')} 
            placeholder="tu@email.com" 
          />
          {errors.email && <p className="text-xs text-red-400 mt-1 animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
        </div>
        
        {/* Campo País con autocomplete */}
        <div className="space-y-2 relative">
          <label htmlFor="country" className="text-sm font-bold text-foreground/70">País <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="text"
              id="country"
              value={countrySearch}
              onChange={(e) => handleCountrySearch(e.target.value)}
              onBlur={() => {
                // Delay para permitir click en dropdown
                setTimeout(() => setShowCountryDropdown(false), 200);
              }}
              className={inputClasses('country') + " pl-10"}
              placeholder="🔍 Busca o selecciona tu país..."
              autoComplete="off"
            />
            {/* Ícono de búsqueda */}
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Dropdown de países filtrados */}
          {showCountryDropdown && filteredCountries.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-2xl max-h-60 overflow-y-auto">
              {filteredCountries.slice(0, 10).map(country => (
                <button
                  key={country.name}
                  type="button"
                  onClick={() => selectCountry(country)}
                  className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors text-foreground border-b border-border/50 last:border-0 flex items-center gap-3"
                >
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex-1">
                    <div className="font-bold">{country.name}</div>
                    <div className="text-xs text-foreground/50">{country.code}</div>
                  </div>
                </button>
              ))}
              {filteredCountries.length > 10 && (
                <div className="px-4 py-2 text-xs text-foreground/50 text-center border-t border-border/50 font-bold uppercase tracking-tight">
                  +{filteredCountries.length - 10} países más... Sigue escribiendo para filtrar
                </div>
              )}
            </div>
          )}
          
          {showCountryDropdown && filteredCountries.length === 0 && countrySearch && (
            <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-white/20 rounded-lg shadow-2xl p-4 text-center text-gray-400">
              No se encontraron países con "{countrySearch}"
            </div>
          )}
          
          {errors.country && <p className="text-xs text-red-400 mt-1 animate-in fade-in slide-in-from-top-1">{errors.country}</p>}
        </div>
        
        {/* Campo Teléfono con código de país auto-completado */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-foreground/70">Teléfono / WhatsApp <span className="text-red-500">*</span></label>
          <div className="flex gap-3">
            <input
              type="text"
              value={formData.countryCode}
              readOnly
              className="bg-foreground/5 border border-border/50 rounded-lg px-3 py-3 text-foreground focus:outline-none transition-all duration-300 w-[100px] cursor-not-allowed opacity-75 font-bold"
              title="Se completa automáticamente al seleccionar el país"
            />
            <div className="flex-1">
              <input 
                type="tel" 
                id="phone" 
                value={formData.phone}
                onChange={handleChange}
                className={inputClasses('phone')} 
                placeholder={formData.country ? "310 123 4567" : "Primero selecciona tu país"}
              />
            </div>
          </div>
          {errors.phone && <p className="text-xs text-red-400 mt-1 animate-in fade-in slide-in-from-top-1">{errors.phone}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="service" className="text-sm font-bold text-foreground/70">Tipo de Proyecto <span className="text-red-500">*</span></label>
        <select 
          id="service" 
          value={formData.service}
          onChange={handleChange}
          className={inputClasses('service') + " [&>option]:text-black"}
        >
          <option value="">Selecciona el tipo de proyecto</option>
          <option value="Sitio Corporativo">Sitio Corporativo</option>
          <option value="Landing Page">Landing Page</option>
          <option value="Automatización Google Sheets">Automatización Google Sheets</option>
          <option value="Otro">Otro</option>
        </select>
        {errors.service && <p className="text-xs text-red-400 mt-1 animate-in fade-in slide-in-from-top-1">{errors.service}</p>}
      </div>

      {formData.service === 'Otro' && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label htmlFor="otherService" className="text-sm font-medium text-gray-300">Especifica tu necesidad <span className="text-red-400">*</span></label>
          <input 
            type="text" 
            id="otherService" 
            value={formData.otherService}
            onChange={handleChange}
            className={inputClasses('otherService')} 
            placeholder="¿En qué podemos ayudarte?" 
          />
          {errors.otherService && <p className="text-xs text-red-400 mt-1 animate-in fade-in slide-in-from-top-1">{errors.otherService}</p>}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-bold text-foreground/70">Mensaje <span className="text-red-500">*</span></label>
        <textarea 
          id="message" 
          value={formData.message}
          onChange={handleChange}
          rows={4} 
          className={inputClasses('message')} 
          placeholder="Cuéntanos brevemente sobre tu proyecto..." 
        />
        {errors.message && <p className="text-xs text-red-400 mt-1 animate-in fade-in slide-in-from-top-1">{errors.message}</p>}
      </div>

      <Button className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enviando...
          </span>
        ) : 'Enviar Mensaje'}
      </Button>
    </form>
  );
}
