import React, { useState, useEffect, useMemo } from 'react';
import { 
  Newspaper, Database,
  Users, 
  Megaphone, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Menu,
  X,
  UserPlus,
  ChevronRight,
  FileSpreadsheet,
  Layout
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
  Feriado,
  PRODUCTOS
} from './types';
import { 
  ScreenCampañas, 
  ScreenEdiciones, 
  ScreenClientes, 
  ScreenConfig,
  ScreenUsuarios,
  ScreenPlanilla
} from './screens/AppScreens';
import { exportEdicionPDF } from './lib/pdfUtils';
import { addDays, startOfToday, format } from 'date-fns';
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
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    return stored !== null ? stored === 'true' : true;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'blue');

  // --- APP STATE ---
  const [users, setUsers] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ediciones, setEdiciones] = useState<Edición[]>([]);
  const [campañas, setCampañas] = useState<Campaña[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [productos, setProductos] = useState<string[]>(PRODUCTOS);
  
  const [currentScreen, setCurrentScreen] = useState<Screen>('PLANILLA');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [targetCampañaId, setTargetCampañaId] = useState<string | null>(null);
  const [planillaMasterEdId, setPlanillaMasterEdId] = useState<string | null>(null);
  const [planillaRowsByEdition, setPlanillaRowsByEdition] = useState<Record<string, any[]>>({});

  const defaultPlanillaRows = useMemo(() => Array(8).fill(null).map((_, i) => ({
    id: `default-${i}`,
    archivo: '',
    producto: PRODUCTOS[0],
    salidas: '1',
    ubicacion: '',
    cliente_id: '',
    new_cliente_name: '',
    observaciones: '',
    status: 'PENDING' as 'PENDING' | 'DONE'
  })), []);

  const getRowsForEdition = useMemo(() => (edId: string) => {
    const key = edId || 'default';
    if (planillaRowsByEdition[key]) return planillaRowsByEdition[key];
    return defaultPlanillaRows;
  }, [planillaRowsByEdition, defaultPlanillaRows]);

  const updateRowsForEdition = (edId: string, rowsOrFn: any | ((prev: any[]) => any[])) => {
    const key = edId || 'default';
    setPlanillaRowsByEdition(prevMap => {
      const currentRows = prevMap[key] || defaultPlanillaRows;
      
      const newRows = typeof rowsOrFn === 'function' ? rowsOrFn(currentRows) : rowsOrFn;
      return { ...prevMap, [key]: newRows };
    });
  };

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

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
      setAppLogo(data.appLogo || null);
      setProductos(data.productos || PRODUCTOS);
      setPlanillaRowsByEdition(data.planillaRowsByEdition || {});
        if (data.user) {
          // Ensure backward compatibility with missing fields
          const migratedUser = {
            ...data.user,
            menu_layout: data.user.menu_layout || 'TOP',
            sidebar_collapsed: data.user.sidebar_collapsed !== undefined ? data.user.sidebar_collapsed : true
          };
          // Force TOP layout if loading on a small screen for the first time or if layout is missing
          if (window.innerWidth < 1024 && !data.user.menu_layout) {
            migratedUser.menu_layout = 'TOP';
          }
          setUser(migratedUser);
          if (data.user.dark_mode !== undefined) setIsDark(data.user.dark_mode);
          if (data.user.theme !== undefined) setTheme(data.user.theme);
        }
    } else {
      // --- LOAD DEMO DATA ---
      const demoUsers: Usuario[] = [
        { id: 'admin-root', username: 'admin', password: 'admin', role: Role.ADMIN, theme: 'corporate', dark_mode: false, menu_layout: 'TOP', sidebar_collapsed: false }
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
    const suffix = Math.random().toString(36).slice(2, 5);
    
    // 10 Clientes
    const nombresClientes = [
      "Coca-Cola S.A.", "Banco Galicia", "YPF Argentina", "Movistar", "Personal Flow",
      "Mercado Libre", "Samsung Tech", "Nike Sport", "Adidas Group", "Toyota Motors"
    ];
    const demoClientes: Cliente[] = nombresClientes.map((n, i) => ({
      id: `c-demo-${i}-${suffix}`,
      nombre: n
    }));

    // 50 Ediciones desde mañana
    const demoEdiciones: Edición[] = [];
    const tomorrow = addDays(startOfToday(), 1);
    let count = 0;
    let offset = 0;
    const maxExisting = ediciones.length > 0 ? Math.max(...ediciones.map(e => parseInt(e.numero) || 0)) : 999;
    let startNum = maxExisting + 1;

    while (count < 50) {
      const d = addDays(tomorrow, offset);
      const day = d.getDay();
      const dateStr = format(d, 'yyyy-MM-dd');
      const holiday = feriados.find(f => f.fecha === dateStr);

      if (day !== 0 && day !== 6 && !holiday) {
        demoEdiciones.push({
          id: `ed-demo-${dateStr}-${suffix}`,
          fecha: dateStr,
          numero: (startNum + count).toString().padStart(4, '0')
        });
        count++;
      }
      offset++;
    }

    // Varias Campañas (2 por cliente)
    const demoCampañas: Campaña[] = [];
    const demoAvisos: Aviso[] = [];

    demoClientes.forEach((cli, cliIdx) => {
      for (let i = 1; i <= 2; i++) {
        const campId = `camp-demo-${cli.id}-${i}`;
        const startEdIdx = Math.floor(Math.random() * 5);
        const startDate = demoEdiciones[startEdIdx].fecha;
        
        demoCampañas.push({
          id: campId,
          nombre_campaña: `Campaña ${cli.nombre} - ${i === 1 ? 'Pauta Mensual' : 'Lanzamiento'}`,
          cliente_id: cli.id,
          fecha_inicio: startDate
        });

        // 3 avisos por campaña
        for (let j = 1; j <= 3; j++) {
          const edIdx = Math.floor(Math.random() * (demoEdiciones.length - 10)) + 5;
          const ed = demoEdiciones[edIdx];
          demoAvisos.push({
            id: `av-demo-${campId}-${j}`,
            campaña_id: campId,
            nombre: `Aviso ${j} - ${cli.nombre} ${i}`,
            producto: PRODUCTOS[Math.floor(Math.random() * PRODUCTOS.length)],
            fecha_publicacion: ed.fecha,
            edicion_id: ed.id,
            numero_salida: j
          });
        }
      }
    });

    setClientes(prev => [...prev, ...demoClientes]);
    setEdiciones(prev => [...prev, ...demoEdiciones]);
    setCampañas(prev => [...prev, ...demoCampañas]);
    setAvisos(prev => [...prev, ...demoAvisos]);

    setCurrentScreen('CAMPAÑAS');
    alert('Datos de demostración generados con éxito: 10 clientes, 50 ediciones y 20 campañas.');
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      clientes, ediciones, campañas, avisos, feriados, user, users, planillaRowsByEdition,
      appLogo, productos
    }));
  }, [clientes, ediciones, campañas, avisos, feriados, user, users, planillaRowsByEdition, productos]);

  // Sync isDark and theme with document
  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, String(isDark));
    localStorage.setItem(THEME_KEY, theme);
    
    // Set attributes and classes on root for CSS targeting
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-dark', String(isDark));
    
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
      const newUser = { 
          id: '1', 
          username: 'admin', 
          role: Role.ADMIN, 
          dark_mode: true, 
          theme: 'blue',
          menu_layout: 'SIDE',
          sidebar_collapsed: true
        };
      setUsers([newUser]);
      setUser(newUser);
      return;
    }

    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (found) {
      const loggedUser = { 
        ...found, 
        sidebar_collapsed: true 
      };
      setUser(loggedUser);
      // Adoption of user visual settings on login
      setIsDark(found.dark_mode);
      setTheme(found.theme);
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const updateUser = (updated: Usuario) => {
    setUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
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

  const synchronizeEdicionesWithHolidays = () => {
    if (ediciones.length === 0) return;
    if (!confirm('Esta acción reorganizará TODAS las fechas de las ediciones existentes para evitar fines de semana y los feriados cargados actualmente. Los avisos se moverán junto con sus ediciones. ¿Desea continuar?')) return;

    const sortedEdiciones = [...ediciones].sort((a, b) => a.numero.localeCompare(b.numero));
    const firstEd = sortedEdiciones[0];
    
    let currentDate = new Date(firstEd.fecha + 'T12:00:00');
    const updatedEdiciones: Edición[] = [];
    const dateMapping: Record<string, string> = {}; // oldId -> newDate

    sortedEdiciones.forEach(ed => {
      let found = false;
      while (!found) {
        const day = currentDate.getDay();
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const isWeekend = day === 0 || day === 6;
        const holiday = feriados.find(f => f.fecha === dateStr);

        if (!isWeekend && !holiday) {
          dateMapping[ed.id] = dateStr;
          updatedEdiciones.push({
            ...ed,
            fecha: dateStr
          });
          found = true;
        }
        currentDate = addDays(currentDate, 1);
      }
    });

    // Actualizar avisos
    const updatedAvisos = avisos.map(a => {
      if (a.edicion_id && dateMapping[a.edicion_id]) {
        return {
          ...a,
          fecha_publicacion: dateMapping[a.edicion_id]
        };
      }
      return a;
    });

    setEdiciones(updatedEdiciones);
    setAvisos(updatedAvisos);
    alert('Sincronización completada: Las ediciones y avisos han sido reubicados respetando el nuevo calendario.');
  };

  const deleteCampaña = (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta campaña y todos sus avisos asociados?')) return;
    setCampañas(prev => prev.filter(c => c.id !== id));
    setAvisos(prev => prev.filter(a => a.campaña_id !== id));
  };

  const clearEdicionesFrom = (fromNum: number) => {
    if (!confirm(`¿Está seguro de eliminar TODAS las ediciones desde el número ${fromNum} en adelante?`)) return;
    
    // Identificar IDs de ediciones a borrar
    const idsToBorrar = ediciones.filter(e => parseInt(e.numero) >= fromNum).map(e => e.id);
    
    setEdiciones(prev => prev.filter(e => parseInt(e.numero) < fromNum));
    setAvisos(prev => prev.map(a => idsToBorrar.includes(a.edicion_id) ? { ...a, edicion_id: '' } : a));
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
      className="min-h-screen font-sans flex flex-col transition-all duration-300"
      data-theme={theme}
      data-dark={isDark}
    >
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-[var(--surface)] relative"
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md modern-card border border-[var(--outline)] shadow-xl relative z-10">
              <div className="p-10">
                <div className="mb-10 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Database className="text-primary" size={32} />
                  </div>
                  <h1 className="text-3xl font-display font-black text-[var(--on-surface)] tracking-tight mb-2">AdManager</h1>
                  <p className="text-[var(--on-surface-variant)] font-semibold tracking-wide text-xs">SISTEMA ADMINISTRATIVO</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] ml-1">Usuario</label>
                    <input 
                      value={username}
                      onChange={e=>setUsername(e.target.value)}
                      className="modern-input" 
                      placeholder="admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] ml-1">Contraseña</label>
                    <input 
                      type="password"
                      value={password}
                      onChange={e=>setPassword(e.target.value)}
                      className="modern-input" 
                      placeholder="••••••••"
                    />
                  </div>
                  <button className="w-full modern-button-primary !py-4 !text-base mt-2">
                    Acceder al Sistema
                  </button>
                </form>
              </div>
              <div className="bg-[var(--surface)] p-4 text-center border-t border-[var(--outline)]">
                <p className="text-[10px] text-[var(--on-surface-variant)] font-bold tracking-widest uppercase">Seguridad Cifrada 256-bit</p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className={`min-h-screen flex ${user.menu_layout === 'TOP' ? 'flex-col' : 'flex-col lg:flex-row'} relative bg-[var(--surface)]`}>
            
            {/* --- SOLID SIDEBAR (Only if SIDE layout) --- */}
            {user.menu_layout !== 'TOP' && (
              <motion.aside 
                onMouseEnter={() => setIsSidebarHovered(true)}
                onMouseLeave={() => setIsSidebarHovered(false)}
                initial={false}
                animate={{ width: (user.sidebar_collapsed === false || isSidebarHovered) ? 280 : 80 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                className="hidden md:flex flex-col bg-[var(--surface-card)] border-r border-[var(--outline)] sticky top-0 h-screen z-[60] overflow-hidden shrink-0 shadow-sm"
              >
                <div className="h-20 flex items-center px-5 mt-2 mb-2 justify-between shrink-0 overflow-hidden relative">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                      {appLogo ? (
                        <img src={appLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                      ) : (
                        <Layout size={20} />
                      )}
                    </div>
                    <AnimatePresence>
                      {(user.sidebar_collapsed === false || isSidebarHovered) && (
                        <motion.h1 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-xl font-display font-black tracking-tighter text-[var(--on-surface)] truncate"
                        >
                          AMP<span className="text-primary text-2xl leading-none">.</span>
                        </motion.h1>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <AnimatePresence>
                    {(user.sidebar_collapsed === false || isSidebarHovered) && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => updateUser({...user, sidebar_collapsed: !user.sidebar_collapsed})}
                        className={`p-1.5 rounded-lg transition-all ${user.sidebar_collapsed === false ? 'bg-primary/10 text-primary' : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface)] hover:text-[var(--on-surface)]'}`}
                        title={user.sidebar_collapsed === false ? "Desanclar menú" : "Fijar menú"}
                      >
                        <ChevronRight size={16} className={user.sidebar_collapsed === false ? 'rotate-180' : ''} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {(user.sidebar_collapsed === false || isSidebarHovered) && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 mb-4"
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" size={16} />
                        <input 
                          className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--outline)] rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)]" 
                          placeholder="Buscar..." 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                  {[
                    { id: 'PLANILLA', label: 'Planilla', icon: FileSpreadsheet },
                    ...(user?.role !== Role.DIAGRAMACION ? [
                      { id: 'CAMPAÑAS', label: 'Campañas', icon: Megaphone },
                      { id: 'EDICIONES', label: 'Ediciones', icon: Newspaper },
                      { id: 'CLIENTES', label: 'Clientes', icon: Users },
                    ] : []),
                    ...(user?.role === Role.ADMIN ? [{ id: 'USUARIOS', label: 'Usuarios', icon: UserPlus }] : []),
                    { id: 'CONFIG', label: 'Ajustes', icon: Settings },
                  ].map(item => (
                    <button 
                      key={item.id}
                      onClick={() => setCurrentScreen(item.id as Screen)}
                      className={`w-full nav-item ${currentScreen === item.id ? 'nav-item-active' : 'nav-item-inactive'}`}
                    >
                      <item.icon size={22} className={currentScreen === item.id ? 'opacity-100' : 'opacity-60'} />
                      <AnimatePresence>
                        {(user.sidebar_collapsed === false || isSidebarHovered) && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-sm font-display font-black tracking-tight whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  ))}
                </nav>

                <div className="p-4 border-t border-white/10 mt-auto">
                  <button 
                    onClick={logout} 
                    className="w-full flex items-center gap-4 px-5 py-3 rounded-xl text-white/50 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 border border-transparent transition-all group"
                  >
                    <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
                    <AnimatePresence>
                      {(user.sidebar_collapsed === false || isSidebarHovered) && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-sm font-bold whitespace-nowrap"
                        >
                          Cerrar Sesión
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </motion.aside>
            )}

            <div className="flex-1 flex flex-col min-h-screen min-w-0">
              
              {/* --- TOP NAVIGATION (Shown if TOP layout OR on Mobile) --- */}
              {(user.menu_layout === 'TOP' || true) && (
                <header className={`${user.menu_layout === 'TOP' ? 'flex' : 'flex lg:hidden'} h-16 lg:h-20 border-b border-[var(--outline)] bg-[var(--surface-card)] sticky top-0 z-[100] px-4 lg:px-8 items-center justify-between shadow-md`}>
                   <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                          {appLogo ? <img src={appLogo} alt="Logo" className="w-full h-full object-contain p-1" /> : <Layout size={20} />}
                        </div>
                        <h1 className="text-xl font-display font-black tracking-tighter text-[var(--on-surface)] hidden md:block">
                          AMP<span className="text-primary text-2xl leading-none">.</span>
                        </h1>
                      </div>

                      <nav className="hidden lg:flex items-center gap-1">
                        {[
                          { id: 'PLANILLA', label: 'Planilla', icon: FileSpreadsheet },
                          ...(user?.role !== Role.DIAGRAMACION ? [
                            { id: 'CAMPAÑAS', label: 'Campañas', icon: Megaphone },
                            { id: 'EDICIONES', label: 'Ediciones', icon: Newspaper },
                            { id: 'CLIENTES', label: 'Clientes', icon: Users },
                          ] : []),
                          ...(user?.role === Role.ADMIN ? [{ id: 'USUARIOS', label: 'Usuarios', icon: UserPlus }] : []),
                          { id: 'CONFIG', label: 'Ajustes', icon: Settings },
                        ].map(item => (
                          <button 
                            key={item.id}
                            onClick={() => setCurrentScreen(item.id as Screen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${currentScreen === item.id ? 'bg-primary text-slate-900 font-bold shadow-lg shadow-primary/20' : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface)] hover:text-[var(--on-surface)]'}`}
                          >
                            <item.icon size={18} />
                            <span className="text-xs font-display font-black uppercase tracking-tight">{item.label}</span>
                          </button>
                        ))}
                      </nav>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="hidden sm:block relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" size={14} />
                         <input className="w-48 pl-9 pr-4 py-2 bg-[var(--surface)] border border-[var(--outline)] rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[var(--on-surface)]" placeholder="Buscar..." />
                      </div>
                      <div className="h-8 w-px bg-[var(--outline)] mx-2 hidden sm:block" />
                      <div className="flex items-center gap-3 bg-[var(--surface)] px-3 py-1.5 rounded-xl border border-[var(--outline)]">
                         <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">{user.username.substring(0, 2).toUpperCase()}</div>
                         <div className="hidden md:block">
                            <p className="text-[10px] font-black text-[var(--on-surface)] leading-none uppercase">{user.username}</p>
                            <p className="text-[8px] font-bold text-primary leading-none uppercase tracking-widest mt-1">{user.role}</p>
                         </div>
                         <button onClick={logout} className="ml-2 p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><LogOut size={16}/></button>
                      </div>
                      <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-[var(--on-surface)]"><Menu size={24} /></button>
                   </div>
                </header>
              )}

              {/* Main Content Area */}
              <main className="flex-1 p-4 lg:p-8 relative z-10 w-full max-w-[1600px] mx-auto">
                <div className="max-w-[1600px] mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentScreen}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentScreen === 'CAMPAÑAS' && (
                      <ScreenCampañas 
                        campañas={campañas}
                        avisos={avisos}
                        clientes={clientes}
                        ediciones={ediciones}
                        feriados={feriados}
                        onSaveCampaña={(c, a) => {
                          const campId = Math.random().toString(36).slice(2, 11);
                          setCampañas(prev => [...prev, { ...c, id: campId }]);
                          setAvisos(prev => [...prev, ...a.map(av => ({ ...av, campaña_id: campId }))]);
                          alert('Campaña guardada');
                        }}
                        onDeleteCampaña={deleteCampaña}
                        onUpdateAvisos={updateAvisosCampaña}
                        onUpdateCampaña={updateCampaña}
                        onAddCliente={(n) => setClientes(prev => [...prev, { id: Math.random().toString(36), nombre: n }])}
                        initialSelectedId={targetCampañaId}
                        onClearInitialId={() => setTargetCampañaId(null)}
                        appLogo={appLogo}
                        productos={productos}
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
                        feriados={feriados}
                        onExportPDF={(ed: Edición) => exportEdicionPDF(ed, avisos.filter(a => a.edicion_id === ed.id), clientes, campañas, avisos, appLogo)}
                      />
                    )}
                    {currentScreen === 'PLANILLA' && (
                      <ScreenPlanilla 
                        ediciones={ediciones}
                        clientes={clientes}
                        avisos={avisos}
                        campañas={campañas}
                        feriados={feriados}
                        productos={productos}
                        masterEdId={planillaMasterEdId}
                        setMasterEdId={setPlanillaMasterEdId}
                        rows={getRowsForEdition(planillaMasterEdId || '')}
                        setRows={(rows: any[]) => updateRowsForEdition(planillaMasterEdId || '', rows)}
                        onSaveCampaña={(c, a) => {
                          const campId = Math.random().toString(36).slice(2, 11);
                          setCampañas(prev => [...prev, { ...c, id: campId }]);
                          setAvisos(prev => [...prev, ...a.map(av => ({ ...av, campaña_id: campId }))]);
                        }}
                        onAddCliente={(n) => {
                          const exists = clientes.some((c: any) => c.nombre.toLowerCase() === n.toLowerCase());
                          if (exists) {
                            alert(`El cliente "${n}" ya existe.`);
                            return null;
                          }
                          const newClient = { id: Math.random().toString(36), nombre: n };
                          setClientes(prev => [...prev, newClient]);
                          return newClient;
                        }}
                        onNavigateToCampaña={(id: string) => {
                          setTargetCampañaId(id);
                          setCurrentScreen('CAMPAÑAS');
                        }}
                        userRole={user?.role}
                        appLogo={appLogo}
                        menuLayout={user?.menu_layout}
                      />
                    )}
                    {currentScreen === 'CLIENTES' && (
                      <ScreenClientes 
                        clientes={clientes} 
                        campañas={campañas}
                        avisos={avisos}
                        onNavigateToCampaña={(id) => { setTargetCampañaId(id); setCurrentScreen('CAMPAÑAS'); }}
                        onUpsert={(c) => {
                          const exists = clientes.some((x: any) => x.id !== c.id && x.nombre.toLowerCase() === c.nombre.toLowerCase());
                          if (exists) {
                            alert(`El cliente "${c.nombre}" ya existe.`);
                            return false;
                          }
                          if (c.id) setClientes(prev => prev.map(x => x.id === c.id ? c : x));
                          else setClientes(prev => [...prev, { ...c, id: Math.random().toString(36) }]);
                          return true;
                        }}
                        onDelete={(id) => setClientes(prev => prev.filter(c => c.id !== id))}
                      />
                    )}
                    {currentScreen === 'CONFIG' && (
                      <ScreenConfig 
                        user={user}
                        onUpdateUser={(u) => {
                          setUser(u);
                          setUsers(prev => prev.map(x => x.id === u.id ? u : x));
                          setIsDark(u.dark_mode);
                          setTheme(u.theme);
                        }}
                        onBatchGenerate={addBatchEdiciones}
                        onSyncEdiciones={synchronizeEdicionesWithHolidays}
                        appLogo={appLogo}
                        onUpdateLogo={setAppLogo}
                        ediciones={ediciones}
                        feriados={feriados}
                        onAddFeriado={(f, n) => setFeriados(prev => [...prev, { id: Math.random().toString(36), fecha: f, nombre: n }])}
                        onDeleteFeriado={(id) => setFeriados(prev => prev.filter(f => f.id !== id))}
                        onBulkAddFeriados={(nh) => setFeriados(prev => [...prev, ...nh])}
                        onLoadDemo={loadDemoData}
                        onClearEdiciones={clearEdicionesFrom}
                        productos={productos}
                        onUpdateProductos={setProductos}
                      />
                    )}
                    {currentScreen === 'USUARIOS' && (
                      <ScreenUsuarios 
                        users={users}
                        onUpsert={(u) => {
                          setUsers(prev => {
                            const exists = prev.find(x => x.id === u.id);
                            if (exists) return prev.map(x => x.id === u.id ? u : x);
                            return [...prev, u];
                          });
                        }}
                        onDelete={(id) => setUsers(prev => prev.filter(u => u.id !== id))}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                </div>
              </main>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[var(--surface)] z-[100] flex flex-col"
          >
             <div className="p-6 flex justify-between items-center border-b border-[var(--outline)] bg-[var(--surface-card)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Newspaper className="text-primary" size={20} />
                  </div>
                  <div>
                    <h1 className="text-lg font-display font-black tracking-tighter text-[var(--on-surface)]">AdManager<span className="text-primary">.</span></h1>
                    <p className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-wider leading-none">Gestión Editorial</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="w-10 h-10 bg-[var(--surface)] border border-[var(--outline)] rounded-lg flex items-center justify-center text-[var(--on-surface)] shadow-sm active:scale-90 transition-all"
                >
                  <X size={20}/>
                </button>
             </div>

             <div className="flex-1 flex flex-col gap-2 px-6 py-8 overflow-y-auto custom-scrollbar">
                {(() => {
                  const menuItems = [
                    { id: 'PLANILLA', label: 'Planilla', icon: FileSpreadsheet },
                    { id: 'CAMPAÑAS', label: 'Campañas', icon: Megaphone },
                    { id: 'EDICIONES', label: 'Ediciones', icon: Newspaper },
                    { id: 'CLIENTES', label: 'Clientes', icon: Users },
                    ...(user?.role === Role.ADMIN ? [{ id: 'USUARIOS', label: 'Usuarios', icon: UserPlus }] : []),
                    { id: 'CONFIG', label: 'Ajustes', icon: Settings },
                  ];
                  return menuItems.map(item => (
                    <motion.button 
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setCurrentScreen(item.id as Screen); setMobileMenuOpen(false); }}
                      className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all border ${
                        currentScreen === item.id 
                        ? 'bg-primary border-primary text-slate-900 shadow-md font-bold' 
                        : 'bg-[var(--surface-card)] border-[var(--outline)] text-[var(--on-surface)] hover:border-primary/30'
                      }`}
                    >
                      <item.icon size={22} className={currentScreen === item.id ? 'opacity-100' : 'opacity-60'} />
                      <span className="text-lg font-display font-black tracking-tight uppercase">{item.label}</span>
                    </motion.button>
                  ));
                })()}

                <div className="h-px bg-[var(--outline)] mx-4 my-6 shrink-0" />

                <button 
                  onClick={logout} 
                  className="flex items-center gap-4 px-6 py-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold text-lg shrink-0"
                >
                  <LogOut size={22} />
                  <span className="font-display font-black tracking-tight uppercase">Cerrar Sesión</span>
                </button>
             </div>

             <div className="p-6 border-t border-[var(--outline)] bg-[var(--surface-card)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-display font-black text-[var(--on-surface)] uppercase">{user.username}</p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mt-1">Sístema {user.role}</p>
                  </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
