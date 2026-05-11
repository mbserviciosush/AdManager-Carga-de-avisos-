import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Users, 
  Megaphone, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Menu,
  X,
  UserPlus
} from 'lucide-react';
import { 
  Screen, 
  Usuario, 
  Role, 
  Theme, 
  Cliente, 
  Edición, 
  Campaña, 
  Aviso, 
  Feriado 
} from './types';
import { 
  ScreenCampañas, 
  ScreenEdiciones, 
  ScreenClientes, 
  ScreenConfig,
  ScreenUsuarios
} from './screens/AppScreens';
import { exportEdicionPDF } from './lib/pdfUtils';
import { nextDay, addDays, startOfToday, format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'admanager_state_v2';
const DARK_MODE_KEY = 'admanager_dark_mode';
const THEME_KEY = 'admanager_theme';

export default function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState<Usuario | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // --- VISUAL STATE (PERMANENT) ---
  const [isDark, setIsDark] = useState(() => localStorage.getItem(DARK_MODE_KEY) === 'true');
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'blue');

  // --- APP STATE ---
  const [users, setUsers] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ediciones, setEdiciones] = useState<Edición[]>([]);
  const [campañas, setCampañas] = useState<Campaña[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  
  const [currentScreen, setCurrentScreen] = useState<Screen>('CAMPAÑAS');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [targetCampañaId, setTargetCampañaId] = useState<string | null>(null);

  const addCliente = (nombre: string) => {
    const newC: Cliente = { 
      id: Math.random().toString(36).substring(2, 11), 
      nombre 
    };
    setClientes(prev => [...prev, newC]);
    return newC;
  };

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setUsers(data.users || []);
      setClientes(data.clientes || []);
      setEdiciones(data.ediciones || []);
      setCampañas(data.campañas || []);
      setAvisos(data.avisos || []);
      setFeriados(data.feriados || []);
      if (data.user) {
        setUser(data.user);
        // Visual states are already initialized from independent localStorage keys, 
        // but we sync them with the loaded user if they differ
        if (data.user.dark_mode !== undefined) setIsDark(data.user.dark_mode);
        if (data.user.theme !== undefined) setTheme(data.user.theme);
      }
    } else {
      // --- LOAD DEMO DATA ---
      const demoUsers: Usuario[] = [
        { id: 'admin-root', username: 'admin', password: 'admin', role: Role.ADMIN, theme: 'blue', dark_mode: false }
      ];
      const demoClientes: Cliente[] = [
        { id: 'c1', nombre: 'Agencia El Sol' },
        { id: 'c2', nombre: 'Supermercados Norte' },
        { id: 'c3', nombre: 'Banco Global' }
      ];
      const demoFeriados: Feriado[] = [
        { id: 'f1', fecha: '2026-05-25', nombre: 'Revolución de Mayo' },
        { id: 'f2', fecha: '2026-06-20', nombre: 'Día de la Bandera' }
      ];
      
      const demoEdiciones: Edición[] = [];
      const today = new Date();
      let count = 0;
      let dayOffset = 0;
      while (count < 15) {
        const d = new Date(today);
        d.setDate(today.getDate() + dayOffset);
        const day = d.getDay();
        if (day >= 1 && day <= 5) {
          const f = d.toISOString().split('T')[0];
          demoEdiciones.push({ id: `ed-${f}`, fecha: f, numero: (5420 + count).toString() });
          count++;
        }
        dayOffset++;
      }

      const demoCampaña: Campaña = {
        id: 'demo-c1',
        nombre_campaña: 'Ofertas Verano 2026',
        cliente_id: 'c1',
        fecha_inicio: demoEdiciones[0].fecha
      };

      const demoAvisos: Aviso[] = [
        { 
          id: 'a1', 
          campaña_id: 'demo-c1', 
          nombre: 'Aviso Página 3', 
          producto: '4x34',
          fecha_publicacion: demoEdiciones[0].fecha, 
          edicion_id: demoEdiciones[0].id,
          numero_salida: 1
        },
        { 
          id: 'a2', 
          campaña_id: 'demo-c1', 
          nombre: 'Aviso Contraportada', 
          producto: '4x34',
          fecha_publicacion: demoEdiciones[2].fecha, 
          edicion_id: demoEdiciones[2].id,
          numero_salida: 2
        }
      ];

      setUsers(demoUsers);
      setClientes(demoClientes);
      setFeriados(demoFeriados);
      setEdiciones(demoEdiciones);
      setCampañas([demoCampaña]);
      setAvisos(demoAvisos);
    }
  }, []);

  const loadDemoData = () => {
    // Generar IDs únicos
    const suffix = Math.random().toString(36).slice(2, 5);
    const demoClientes: Cliente[] = [
      { id: `dc1-${suffix}`, nombre: 'Distribuidora Patagónica' },
      { id: `dc2-${suffix}`, nombre: 'Turismo Extremo' },
      { id: `dc3-${suffix}`, nombre: 'Inmobiliaria Central' }
    ];
    
    const demoEdiciones: Edición[] = [];
    const today = new Date();
    let count = 0;
    let offset = 0;
    while (count < 15) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      const day = d.getDay();
      if (day >= 1 && day <= 5) {
        const f = d.toISOString().split('T')[0];
        demoEdiciones.push({ 
          id: `demo-ed-${f}-${suffix}`, 
          fecha: f, 
          numero: (8000 + count).toString(), 
        });
        count++;
      }
      offset++;
    }

    const demoCampaña: Campaña = { 
      id: `demo-camp-${suffix}`, 
      nombre_campaña: 'Campaña Invierno 2026', 
      cliente_id: demoClientes[1].id, 
      fecha_inicio: demoEdiciones[0].fecha 
    };

    const demoAvisos: Aviso[] = [
      { 
        id: `da1-${suffix}`, 
        campaña_id: demoCampaña.id, 
        nombre: 'Banner Principal', 
        producto: '4x34',
        fecha_publicacion: demoEdiciones[0].fecha, 
        edicion_id: demoEdiciones[0].id,
        numero_salida: 1
      },
      { 
        id: `da2-${suffix}`, 
        campaña_id: demoCampaña.id, 
        nombre: 'Zócalo de Ofertas', 
        producto: '2x8',
        fecha_publicacion: demoEdiciones[2].fecha, 
        edicion_id: demoEdiciones[2].id,
        numero_salida: 2
      },
      { 
        id: `da3-${suffix}`, 
        campaña_id: demoCampaña.id, 
        nombre: 'Aviso Clasificado', 
        producto: '1x8',
        fecha_publicacion: demoEdiciones[4].fecha, 
        edicion_id: demoEdiciones[4].id,
        numero_salida: 3
      }
    ];

    setClientes(prev => [...prev, ...demoClientes]);
    setEdiciones(prev => [...prev, ...demoEdiciones]);
    setCampañas(prev => [...prev, demoCampaña]);
    setAvisos(prev => [...prev, ...demoAvisos]);
    
    // Switch to Campaigns to show results
    setCurrentScreen('CAMPAÑAS');
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      clientes, ediciones, campañas, avisos, feriados, user, users
    }));
  }, [clientes, ediciones, campañas, avisos, feriados, user, users]);

  // Sync isDark and theme with document
  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, String(isDark));
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.className = theme;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Update current user visual settings if logged in
    if (user && (user.dark_mode !== isDark || user.theme !== theme)) {
      const updated = { ...user, dark_mode: isDark, theme };
      setUser(updated);
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    }
  }, [isDark, theme]);

  // --- LOGIC ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Default admin if no users exists or for first setup
    if (users.length === 0 && username.toLowerCase() === 'admin' && password === 'admin') {
      const initialAdmin: Usuario = { 
        id: 'admin-root', 
        username: 'admin', 
        password: 'admin', 
        role: Role.ADMIN, 
        theme: 'blue', 
        dark_mode: false 
      };
      setUsers([initialAdmin]);
      setUser(initialAdmin);
      return;
    }

    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (found) {
      setUser(found);
      // Adoption of user visual settings on login
      setIsDark(found.dark_mode);
      setTheme(found.theme);
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const logout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
  };

  const addBatchEdiciones = (numIni: number, cant: number, startDateStr?: string) => {
    const newEdiciones: Edición[] = [];
    let currentDate = startDateStr ? new Date(startDateStr + 'T12:00:00') : startOfToday();
    let currentNum = numIni;

    while (newEdiciones.length < cant) {
      // Logic: No Saturdays (6), No Sundays (0)
      const day = currentDate.getDay();
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const isWeekend = day === 0 || day === 6;
      const holiday = feriados.find(f => f.fecha === dateStr);

      if (!isWeekend && !holiday) {
        newEdiciones.push({
          id: Math.random().toString(36).slice(2, 11),
          numero: currentNum.toString().padStart(4, '0'),
          fecha: dateStr
        });
        currentNum++;
      }
      currentDate = addDays(currentDate, 1);
    }
    setEdiciones(prev => [...prev, ...newEdiciones]);
  };

  const deleteCampaña = (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta campaña y todos sus avisos asociados?')) return;
    setCampañas(prev => prev.filter(c => c.id !== id));
    setAvisos(prev => prev.filter(a => a.campaña_id !== id));
  };

  const updateAvisosCampaña = (campId: string, updatedAvisos: Aviso[]) => {
    setAvisos(prev => {
      const others = prev.filter(a => a.campaña_id !== campId);
      return [...others, ...updatedAvisos];
    });
  };

  const updateCampaña = (updatedCamp: Campaña) => {
    setCampañas(prev => prev.map(c => c.id === updatedCamp.id ? updatedCamp : c));
  };

  // Sincronización automática de avisos huérfanos con ediciones recién creadas
  useEffect(() => {
    if (ediciones.length > 0 && avisos.length > 0) {
      const huerfanos = avisos.filter(a => !a.edicion_id);
      if (huerfanos.length === 0) return;

      let changed = false;
      const nuevosAvisos = avisos.map(aviso => {
        if (!aviso.edicion_id) {
          const matchingEdicion = ediciones.find(e => e.fecha === aviso.fecha_publicacion);
          if (matchingEdicion) {
            changed = true;
            return { ...aviso, edicion_id: matchingEdicion.id };
          }
        }
        return aviso;
      });

      if (changed) {
        setAvisos(nuevosAvisos);
      }
    }
  }, [ediciones, avisos]);

  return (
    <div 
      className="min-h-screen font-sans flex flex-col text-[var(--on-surface)] transition-all duration-500"
      data-theme={theme}
      data-dark={isDark}
    >
      {/* Dynamic Atmospheric Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <img 
          src="https://excursionesenushuaia.com/wp-content/uploads/2023/10/1-85-2-e1700135504863.jpg" 
          className="w-full h-full object-cover blur-3xl opacity-40 dark:opacity-20 transition-opacity duration-1000"
          alt="Background Texture"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--surface)] via-[var(--surface)]/80 to-[var(--surface)]/40" />
      </div>

      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-[url('https://excursionesenushuaia.com/wp-content/uploads/2023/10/1-85-2-e1700135504863.jpg')] bg-cover bg-center relative"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl"></div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[var(--surface-card)] rounded-[2.5rem] shadow-2xl border border-[var(--outline)] overflow-hidden relative z-10">
              <div className="p-12">
                <div className="mb-10 text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Newspaper className="text-primary" size={40} />
                  </div>
                  <h1 className="text-4xl font-display font-black text-[var(--on-surface)] tracking-tight mb-2">AdManager</h1>
                  <p className="text-[var(--on-surface-variant)] font-medium tracking-wide">GESTIÓN EDITORIAL PROFESIONAL</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-tighter text-[var(--on-surface-variant)] ml-1">Usuario</label>
                    <input 
                      value={username}
                      onChange={e=>setUsername(e.target.value)}
                      className="modern-input" 
                      placeholder="admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-tighter text-[var(--on-surface-variant)] ml-1">Contraseña</label>
                    <input 
                      type="password"
                      value={password}
                      onChange={e=>setPassword(e.target.value)}
                      className="modern-input" 
                      placeholder="••••••••"
                    />
                  </div>
                  <button className="w-full py-5 modern-button-primary !text-lg">
                    Iniciar Sesión
                  </button>
                </form>
              </div>
              <div className="bg-black/20 p-6 text-center border-t border-[var(--outline)]">
                <span className="text-[10px] font-black text-[var(--on-surface-variant)] tracking-[0.2em]">VERSIÓN 2.5 • STABLE</span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            {/* Top Navigation */}
            <header className="sticky top-0 bg-[var(--surface-card)]/80 backdrop-blur-xl h-20 md:h-24 flex items-center justify-between px-4 md:px-8 z-50 border-b border-[var(--outline)]">
               <div className="flex items-center gap-4 md:gap-10">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-11 md:h-11 bg-primary/10 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                      <Newspaper className="text-primary" size={20} />
                    </div>
                    <h1 className="text-lg md:text-xl font-display font-black tracking-tighter text-[var(--on-surface)] truncate">AdManager<span className="text-primary">.</span></h1>
                  </div>

                  <nav className="hidden md:flex items-center gap-1">
                    {(() => {
                      const menuItems = [
                        { id: 'CAMPAÑAS', label: 'Campañas', icon: Megaphone },
                        { id: 'EDICIONES', label: 'Ediciones', icon: Newspaper },
                        { id: 'CLIENTES', label: 'Clientes', icon: Users },
                        ...(user?.role === Role.ADMIN ? [{ id: 'USUARIOS', label: 'Usuarios', icon: UserPlus }] : []),
                        { id: 'CONFIG', label: 'Ajustes', icon: Settings },
                      ];
                      return menuItems.map(item => (
                        <button 
                          key={item.id}
                          onClick={() => setCurrentScreen(item.id as Screen)}
                          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 group ${
                            currentScreen === item.id 
                            ? 'bg-primary/5 text-primary shadow-sm' 
                            : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface)] hover:text-[var(--on-surface)]'
                          }`}
                        >
                          <item.icon size={18} className={currentScreen === item.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} />
                          <span className="text-[13px] font-black tracking-tight">{item.label}</span>
                        </button>
                      ));
                    })()}
                  </nav>
               </div>

               <div className="flex items-center gap-6">
                  <div className="hidden lg:flex relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" size={16} />
                     <input className="pl-11 pr-6 py-2.5 bg-[var(--surface)] border border-[var(--outline)] rounded-2xl text-xs font-medium w-64 shadow-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all text-[var(--on-surface)]" placeholder="Buscar..." />
                  </div>

                  <div className="flex items-center gap-4 pl-6 border-l border-[var(--outline)]">
                     <button className="md:hidden p-3 bg-[var(--surface)] rounded-xl text-[var(--on-surface)]" onClick={() => setMobileMenuOpen(true)}>
                        <Menu size={20} />
                     </button>
                     <div className="hidden md:flex items-center gap-5">
                        <div className="flex items-center gap-3 pr-1">
                          <div className="text-right">
                            <p className="text-[13px] font-display font-bold text-[var(--on-surface)] tracking-tight leading-none uppercase">{user.username}</p>
                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.1em] mt-1 opacity-70">Sístema {user.role}</p>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                        </div>
                        <button onClick={logout} className="p-2.5 bg-[var(--surface-card)] hover:bg-rose-500 hover:text-white text-[var(--on-surface-variant)] rounded-2xl transition-all border border-[var(--outline)] shadow-sm group">
                          <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                     </div>
                  </div>
               </div>
            </header>

            <main className="flex-1 flex flex-col min-h-[calc(100vh-6rem)] relative max-w-[1600px] mx-auto w-full px-4 md:px-8 py-6 md:py-10">
              <AnimatePresence mode="wait">
                {currentScreen === 'CAMPAÑAS' && (
                  <ScreenCampañas 
                    clientes={clientes}
                    onAddCliente={addCliente}
                    ediciones={ediciones}
                    feriados={feriados}
                    campañas={campañas}
                    avisos={avisos}
                    onSaveCampaña={(camp: any, newAvisos: Aviso[]) => {
                      const campId = Math.random().toString(36).slice(2, 11);
                      setCampañas(prev => [...prev, { ...camp, id: campId }]);
                      setAvisos(prev => [...prev, ...newAvisos.map(a => ({ ...a, campaña_id: campId }))]);
                      alert('Campaña Guardada con éxito');
                    }}
                    onDeleteCampaña={deleteCampaña}
                    onUpdateAvisos={updateAvisosCampaña}
                    onUpdateCampaña={updateCampaña}
                    initialSelectedId={targetCampañaId}
                    onClearInitialId={() => setTargetCampañaId(null)}
                  />
                )}
                {currentScreen === 'EDICIONES' && (
                  <ScreenEdiciones 
                    ediciones={ediciones}
                    avisos={avisos}
                    clientes={clientes}
                    campañas={campañas}
                    onNavigateToCampaña={(id: string) => {
                      setTargetCampañaId(id);
                      setCurrentScreen('CAMPAÑAS');
                    }}
                    onExportPDF={(ed: Edición) => exportEdicionPDF(ed, avisos.filter(a => a.edicion_id === ed.id), clientes)}
                  />
                )}
                {currentScreen === 'CLIENTES' && (
                  <ScreenClientes 
                    clientes={clientes}
                    campañas={campañas}
                    onNavigateToCampaña={(id: string) => {
                      setTargetCampañaId(id);
                      setCurrentScreen('CAMPAÑAS');
                    }}
                    onUpsert={(c: any) => {
                      if (c.id) {
                        setClientes(prev => prev.map(x => x.id === c.id ? c : x));
                      } else {
                        addCliente(c.nombre);
                      }
                    }}
                    onDelete={(id: string) => setClientes(prev => prev.filter(x => x.id !== id))}
                  />
                )}
                {currentScreen === 'CONFIG' && (
                  <ScreenConfig 
                    user={user}
                    onUpdateUser={(updatedUser: Usuario) => {
                      setUser(updatedUser);
                      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                      setIsDark(updatedUser.dark_mode);
                      setTheme(updatedUser.theme);
                    }}
                    onBatchGenerate={addBatchEdiciones}
                    ediciones={ediciones}
                    feriados={feriados}
                    onAddFeriado={(fecha: string, nombre?: string) => setFeriados(prev => [...prev, { id: Math.random().toString(36).slice(2, 11), fecha, nombre }])}
                    onDeleteFeriado={(id: string) => setFeriados(prev => prev.filter(f => f.id !== id))}
                    onBulkAddFeriados={(newHolidays: any[]) => {
                      setFeriados(prev => {
                        const existingDates = new Set(prev.map(f => f.fecha));
                        const uniqueNew = newHolidays.filter(f => !existingDates.has(f.fecha));
                        return [...prev, ...uniqueNew];
                      });
                    }}
                    onLoadDemo={loadDemoData}
                  />
                )}
                {currentScreen === 'USUARIOS' && (
                  <ScreenUsuarios 
                    users={users}
                    onUpsert={(u: Usuario) => {
                      setUsers(prev => {
                        const exists = prev.find(x => x.id === u.id);
                        if (exists) return prev.map(x => x.id === u.id ? u : x);
                        return [...prev, u];
                      });
                      alert(u.id ? 'Usuario actualizado' : 'Usuario creado');
                    }}
                    onDelete={(id: string) => setUsers(prev => prev.filter(u => u.id !== id))}
                  />
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--on-surface)]/80 backdrop-blur-md z-[100] p-8"
          >
             <button onClick={() => setMobileMenuOpen(false)} className="absolute top-8 right-8 text-white"><X size={32}/></button>
             <div className="flex flex-col gap-6 mt-20">
                {(() => {
                  const menuItems = [
                    { id: 'CAMPAÑAS', label: 'Campañas', icon: Megaphone },
                    { id: 'EDICIONES', label: 'Ediciones', icon: Newspaper },
                    { id: 'CLIENTES', label: 'Clientes', icon: Users },
                    ...(user?.role === Role.ADMIN ? [{ id: 'USUARIOS', label: 'Usuarios', icon: UserPlus }] : []),
                    { id: 'CONFIG', label: 'Ajustes', icon: Settings },
                  ];
                  return menuItems.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => { setCurrentScreen(item.id as Screen); setMobileMenuOpen(false); }}
                      className="text-3xl font-black text-white text-left"
                    >
                      {item.label}
                    </button>
                  ));
                })()}
                <button onClick={logout} className="text-3xl font-black text-red-400 text-left mt-8">Logout</button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
