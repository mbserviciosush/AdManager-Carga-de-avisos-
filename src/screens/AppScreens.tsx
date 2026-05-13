import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  Edit3, 
  UserPlus, 
  Calendar,
  Save,
  X,
  Check,
  PlusCircle,
  Layout,
  Newspaper,
  Megaphone,
  Settings,
  AlertCircle,
  Database
} from 'lucide-react';
import { 
  Screen, 
  Cliente, 
  Campaña, 
  Aviso, 
  Edición, 
  Feriado, 
  PRODUCTOS,
  Role,
  Usuario
} from '../types';
import { generateValidDates, formatDateES } from '../lib/dateUtils';
import { exportEdicionPDF, exportCampañaPDF } from '../lib/pdfUtils';
import { motion, AnimatePresence } from 'motion/react';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { CustomSelect } from '../components/CustomSelect';

// --- SHARED COMPONENTS ---
const Card = ({ children, title, action, className = "" }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card bg-[var(--surface-card)] border border-transparent shadow-sm ${className}`}
  >
    {(title || action) && (
      <div className="px-4 md:px-8 py-4 md:py-6 border-b border-[#374151]/30 flex justify-between items-center bg-[var(--surface)] rounded-t-[inherit]">
        <h3 className="font-display font-extrabold text-base md:text-lg text-[var(--on-surface)] tracking-tight">{title}</h3>
        {action}
      </div>
    )}
    <div className="p-4 md:p-8">{children}</div>
  </motion.div>
);

// --- CAMPAÑAS ---
export function ScreenCampañas({ campañas, avisos, clientes, onAddCliente, ediciones, feriados, onSaveCampaña, onDeleteCampaña, onUpdateAvisos, onUpdateCampaña, initialSelectedId, onClearInitialId, appLogo }: any) {
  const [view, setView] = useState<'LIST' | 'CREATE' | 'DETAIL'>('LIST');
  const [selectedID, setSelectedID] = useState<string | null>(null);

  useEffect(() => {
    if (initialSelectedId) {
      setSelectedID(initialSelectedId);
      setView('DETAIL');
      if (onClearInitialId) onClearInitialId();
    }
  }, [initialSelectedId, onClearInitialId]);
  const [search, setSearch] = useState('');
  const [filterCliente, setFilterCliente] = useState('');

  // Estados para edición en detalle
  const [editNombre, setEditNombre] = useState('');
  const [editClienteId, setEditClienteId] = useState('');
  const [editFechaInicio, setEditFechaInicio] = useState('');
  const [editingAvisos, setEditingAvisos] = useState<Aviso[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const filtered = campañas.filter((c: any) => {
    const matchesSearch = c.nombre_campaña.toLowerCase().includes(search.toLowerCase());
    const matchesCliente = filterCliente === '' || c.cliente_id === filterCliente;
    return matchesSearch && matchesCliente;
  }).sort((a: any, b: any) => b.id.localeCompare(a.id));

  const selectedCampaña = campañas.find((c: any) => c.id === selectedID);

  useEffect(() => {
    if (view === 'DETAIL' && selectedCampaña) {
      setEditNombre(selectedCampaña.nombre_campaña);
      setEditClienteId(selectedCampaña.cliente_id);
      setEditFechaInicio(selectedCampaña.fecha_inicio);
      setEditingAvisos(avisos.filter((a: any) => a.campaña_id === selectedID));
      setHasChanges(false);
    }
  }, [view, selectedID, selectedCampaña, avisos]);

  const [searchAvisos, setSearchAvisos] = useState('');

  const filteredAvisos = useMemo(() => {
    if (!searchAvisos.trim()) return editingAvisos;
    return editingAvisos.filter((a: any) => 
      a.nombre.toLowerCase().includes(searchAvisos.toLowerCase()) ||
      a.producto.toLowerCase().includes(searchAvisos.toLowerCase()) ||
      a.fecha_publicacion.includes(searchAvisos)
    );
  }, [editingAvisos, searchAvisos]);

  const handleSaveChanges = () => {
    if (!selectedID) return;
    onUpdateCampaña({
      ...selectedCampaña,
      nombre_campaña: editNombre,
      cliente_id: editClienteId,
      fecha_inicio: editFechaInicio
    });
    onUpdateAvisos(selectedID, editingAvisos);
    setHasChanges(false);
    alert('Cambios guardados con éxito');
  };

  const handleDeleteCampaña = () => {
    if (selectedID) {
      onDeleteCampaña(selectedID);
      setView('LIST');
      setSelectedID(null);
    }
  };

  if (view === 'CREATE') {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setView('LIST')}
          className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-primary font-black uppercase text-[10px] tracking-widest transition-all mb-4"
        >
          <X size={16} /> Cancelar y Volver al Listado
        </button>
        <ScreenNuevaCampaña 
          clientes={clientes}
          onAddCliente={onAddCliente}
          ediciones={ediciones}
          feriados={feriados}
          onSaveCampaña={(camp: any, avs: any[]) => {
            onSaveCampaña(camp, avs);
            setView('LIST');
          }}
        />
      </div>
    );
  }

  if (view === 'DETAIL' && selectedCampaña) {
    const cliente = clientes.find((c: any) => c.id === editClienteId);
    return (
      <div className="space-y-10 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <button 
            onClick={() => setView('LIST')}
            className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-primary font-black uppercase text-[10px] tracking-widest transition-all"
          >
            <ChevronRight size={18} className="rotate-180" /> Volver al Histórico
          </button>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={handleDeleteCampaña} 
              className="px-6 py-3 bg-rose-50 text-rose-500 rounded-2xl text-xs font-black hover:bg-rose-100 transition-all flex items-center gap-2"
            >
              <Trash2 size={18} /> Eliminar Campaña
            </button>
            <button 
              onClick={() => exportCampañaPDF({ ...selectedCampaña, nombre_campaña: editNombre, cliente_id: editClienteId, fecha_inicio: editFechaInicio } as any, editingAvisos, cliente?.nombre || 'Desconocido', appLogo)} 
              className="modern-button-secondary bg-[var(--surface-card)] flex items-center gap-2"
            >
              <FileText size={18} /> Exportar PDF
            </button>
            {hasChanges && (
              <button 
                onClick={handleSaveChanges} 
                className="modern-button-primary bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2"
              >
                <Save size={18} /> Guardar Cambios
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8 relative z-20">
            <Card title="Detalles de la Campaña">
               <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-[var(--on-surface-variant)]">Nombre de Campaña</span>
                    <input 
                      value={editNombre}
                      onChange={e => { setEditNombre(e.target.value); setHasChanges(true); }}
                      className="w-full bg-[var(--surface)] border-none rounded-xl px-4 py-3 text-lg font-display font-black text-[var(--on-surface)] outline-none focus:ring-4 focus:ring-primary/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-[var(--on-surface-variant)]">Cliente</span>
                    <CustomSelect 
                      options={clientes.map((c: any) => ({ label: c.nombre, value: c.id }))}
                      value={editClienteId}
                      onChange={val => { setEditClienteId(val); setHasChanges(true); }}
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-[var(--on-surface-variant)]">Fecha de Inicio</span>
                    <CustomDatePicker 
                      value={editFechaInicio}
                      onChange={val => { setEditFechaInicio(val); setHasChanges(true); }}
                    />
                  </div>
                  <div className="pt-4 border-t border-[var(--outline)]">
                    <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-[var(--on-surface-variant)]">Total Avisos</span>
                       <span className="font-black text-primary">{editingAvisos.length}</span>
                    </div>
                  </div>
               </div>
            </Card>
          </div>
          <div className="lg:col-span-8">
            <Card 
              title="Cronograma de Salidas"
              action={
                <div className="flex items-center gap-4">
                  {editingAvisos.length > 5 && (
                    <div className="relative hidden md:block">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" />
                      <input 
                        placeholder="Buscar aviso..."
                        value={searchAvisos}
                        onChange={e => setSearchAvisos(e.target.value)}
                        className="modern-input !w-48 pl-9"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const lastAviso = editingAvisos[editingAvisos.length - 1];
                        const startCandidate = lastAviso ? new Date(lastAviso.fecha_publicacion + 'T12:00:00') : new Date(editFechaInicio + 'T12:00:00');
                        const start = addDaysSafe(startCandidate, 1);
                        const validDates = generateValidDates(start, 1, feriados, [1,2,3,4,5]);
                        
                        if (validDates.length > 0) {
                          const date = validDates[0];
                          const y = date.getFullYear();
                          const m = String(date.getMonth() + 1).padStart(2, '0');
                          const d = String(date.getDate()).padStart(2, '0');
                          const dateStr = `${y}-${m}-${d}`;
                          const ed = ediciones.find((e: any) => e.fecha === dateStr);
                          
                          const newAviso: Aviso = {
                            id: Math.random().toString(36).slice(2, 11),
                            campaña_id: selectedID || '',
                            nombre: lastAviso?.nombre || editNombre,
                            producto: lastAviso?.producto || 'PÁGINA COLOR',
                            fecha_publicacion: dateStr,
                            edicion_id: ed?.id || '',
                            numero_salida: editingAvisos.length + 1
                          };
                          
                          setEditingAvisos(prev => [...prev, newAviso]);
                          setHasChanges(true);
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl text-[11px] font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      <PlusCircle size={18} /> Agregar Aviso
                    </button>
                  </div>
                </div>
              }
            >
              <div className="space-y-4 px-4 py-8">
                {filteredAvisos.map((aviso: any) => {
                  const idx = editingAvisos.findIndex((a: any) => a.id === aviso.id);
                  const edicion = ediciones.find((e: any) => e.id === aviso.edicion_id);
                  return (
                    <motion.div 
                      key={aviso.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-[var(--surface)]/50 border border-transparent rounded-2xl flex flex-col lg:flex-row items-center gap-4 group hover:border-primary/30 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4 w-full lg:flex-grow">
                        <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 text-xs">
                          {idx + 1}
                        </span>
                        <div className="flex-grow">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-0.5 block">Aviso</label>
                          <input
                            className="w-full bg-transparent border-none outline-none font-bold text-base text-[var(--on-surface)]"
                            value={aviso.nombre}
                            onChange={(e) => {
                              const newArr = [...editingAvisos];
                              newArr[idx].nombre = e.target.value;
                              setEditingAvisos(newArr);
                              setHasChanges(true);
                            }}
                          />
                        </div>
                      </div>

                      <div className="w-full lg:w-32 shrink-0">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-0.5 block">Producto</label>
                        <CustomSelect
                          className="text-sm font-bold"
                          options={PRODUCTOS}
                          value={aviso.producto}
                          onChange={val => {
                            const newArr = [...editingAvisos];
                            newArr[idx].producto = val;
                            setEditingAvisos(newArr);
                            setHasChanges(true);
                          }}
                        />
                      </div>

                      <div className="w-full lg:w-48 shrink-0">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-0.5 block">Publicación</label>
                        <CustomDatePicker
                          className={edicion ? "text-sm font-bold pl-10" : "text-base font-bold pl-10"}
                          value={aviso.fecha_publicacion}
                          onChange={val => {
                            const newArr = [...editingAvisos];
                            newArr[idx].fecha_publicacion = val;
                            const ed = ediciones.find((x: any) => x.fecha === val);
                            newArr[idx].edicion_id = ed?.id || '';
                            setEditingAvisos(newArr);
                            setHasChanges(true);
                          }}
                        />
                      </div>

                      <div className="w-full lg:w-16 shrink-0 flex flex-col items-center justify-center gap-1.5 self-center lg:self-stretch pt-4 lg:pt-0">
                        {edicion && (
                          <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-md uppercase tracking-tighter">
                            #{edicion.numero}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setEditingAvisos(prev => prev.filter((_, i) => i !== idx));
                            setHasChanges(true);
                          }}
                          className="w-10 h-10 flex items-center justify-center text-[var(--on-surface-variant)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
           <h2 className="text-4xl font-display font-black text-[var(--on-surface)] tracking-tight">Campañas</h2>
           <p className="text-[var(--on-surface-variant)] font-medium">Histórico de pauta publicitaria y control de campañas.</p>
        </div>
        <button 
          onClick={() => setView('CREATE')}
          className="modern-button-primary flex items-center gap-2 !px-8 !py-4 shadow-xl shadow-primary/20"
        >
          <Plus size={20} /> Nueva Campaña
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" size={20} />
              <input 
                placeholder="Buscar por nombre de campaña..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-[var(--surface-card)] border border-transparent rounded-[2rem] outline-none shadow-sm font-medium text-[var(--on-surface)]"
              />
          </div>
          <div className="md:col-span-4 transition-all">
              <CustomSelect 
                options={[{ label: 'Todos los Clientes', value: '' }, ...clientes.map((c: any) => ({ label: c.nombre, value: c.id }))]}
                value={filterCliente}
                onChange={val => setFilterCliente(val)}
                placeholder="Todos los Clientes"
              />
          </div>
        </div>

        <div className="bg-[var(--surface-card)] rounded-[1.5rem] md:rounded-[2.5rem] border border-transparent shadow-sm overflow-hidden">
          <div className="overflow-x-auto md:overflow-visible min-h-[500px]">
            <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
              <thead>
                <tr className="bg-[var(--surface)] border-b border-[#374151]/30">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">Nombre Campaña</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">Cliente</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">Inicio</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] text-center">Avisos</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#374151]/30">
                {filtered.map((camp: any) => {
                  const cliente = clientes.find((c: any) => c.id === camp.cliente_id);
                  const numAvisos = avisos.filter((a: any) => a.campaña_id === camp.id).length;
                  return (
                    <motion.tr 
                      key={camp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group cursor-pointer hover:bg-[#374151]/50 border-b border-[#374151]/30 last:border-0 transition-all"
                      onClick={() => { setSelectedID(camp.id); setView('DETAIL'); }}
                    >
                      <td className="px-10 py-6">
                        <p className="font-display font-black text-[var(--on-surface)] text-lg">{camp.nombre_campaña}</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className="font-bold text-[var(--on-surface)]">{cliente?.nombre || 'N/A'}</span>
                      </td>
                      <td className="px-10 py-6 font-mono text-xs font-bold text-[var(--on-surface-variant)] uppercase">
                        {formatDateES(camp.fecha_inicio)}
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 bg-[var(--surface)] text-[var(--on-surface)] rounded-lg font-black text-xs">
                          {numAvisos}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-3 bg-[var(--surface-card)] shadow-sm rounded-xl text-primary border border-transparent group-hover:bg-primary group-hover:text-white transition-all">
                               <ChevronRight size={18} />
                            </button>
                         </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-32 text-center">
              <Megaphone className="mx-auto text-[var(--outline)] mb-6" size={64} />
              <h4 className="text-xl font-display font-bold text-[var(--on-surface-variant)] uppercase tracking-widest">Sin resultados</h4>
              <p className="text-[var(--on-surface-variant)] font-medium">No se encontraron campañas con los criterios de búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ScreenNuevaCampañaProps {
  clientes: Cliente[];
  onAddCliente: (nombre: string) => Cliente;
  ediciones: Edición[];
  feriados: Feriado[];
  onSaveCampaña: (campaña: Omit<Campaña, 'id'>, avisos: Aviso[]) => void;
  initialCampaña?: Partial<Campaña>;
  initialAvisos?: Aviso[];
}

// --- CAMPAÑA GENERATOR (Old Component Renamed) ---
export function ScreenNuevaCampaña({ 
  clientes, 
  onAddCliente, 
  ediciones, 
  feriados,
  onSaveCampaña,
  initialCampaña,
  initialAvisos
}: ScreenNuevaCampañaProps) {
  const [nombreCamp, setNombreCamp] = useState(initialCampaña?.nombre_campaña || '');
  const [clienteId, setClienteId] = useState(initialCampaña?.cliente_id || '');
  const [fechaInicio, setFechaInicio] = useState(initialCampaña?.fecha_inicio || new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');

  const [producto, setProducto] = useState(PRODUCTOS[0]);
  const [cantidad, setCantidad] = useState<number | ''>(1);
  const [diasSemana, setDiasSemana] = useState([1, 2, 3, 4, 5]); // L-V
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [extraCountInput, setExtraCountInput] = useState<number | ''>(1);
  const [avisosGenerated, setAvisosGenerated] = useState<Aviso[]>(initialAvisos || []);

  // Refs for navigation
  const clienteRef = useRef<HTMLSelectElement>(null);
  const nombreRef = useRef<HTMLInputElement>(null);
  const fechaRef = useRef<HTMLInputElement>(null);
  const productoRef = useRef<HTMLSelectElement>(null);
  const cantidadRef = useRef<HTMLInputElement>(null);
  const generateBtnRef = useRef<HTMLButtonElement>(null);

  const handleEnter = (e: React.KeyboardEvent, nextRef: React.RefObject<any>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const handleGenerate = (countOverride?: number) => {
    setErrorMsg(null);
    if (!nombreCamp.trim()) {
      setErrorMsg('Por favor ingrese el nombre de la campaña.');
      return;
    }
    if (!clienteId) {
      setErrorMsg('Por favor seleccione un cliente.');
      return;
    }
    
    const count = countOverride !== undefined ? countOverride : cantidad;
    if (count <= 0) {
      setErrorMsg('La cantidad de salidas debe ser mayor a 0.');
      return;
    }
    if (diasSemana.length === 0) {
      setErrorMsg('Debe seleccionar al menos un día de la semana permitido.');
      return;
    }
    
    const start = new Date(fechaInicio + 'T12:00:00');
    if (isNaN(start.getTime())) {
      setErrorMsg('Fecha de inicio inválida.');
      return;
    }

    const validDates = generateValidDates(start, count, feriados, diasSemana);
    
    if (validDates.length === 0) {
      setErrorMsg('No se pudieron encontrar fechas válidas con los parámetros actuales (verifique días seleccionados y feriados).');
      return;
    }
    
    const newAvisos: Aviso[] = validDates.map((date, index) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      
      const edicionMatch = ediciones.find((e: any) => e.fecha === dateStr);
      
      return {
        id: Math.random().toString(36).slice(2, 11),
        campaña_id: '', 
        nombre: nombreCamp,
        producto: producto,
        fecha_publicacion: dateStr,
        edicion_id: edicionMatch?.id || '',
        numero_salida: index + 1
      };
    });
    
    setAvisosGenerated(newAvisos);
    if (countOverride !== undefined) setCantidad(countOverride);
  };

  const handleAddMore = (count: number) => {
    if (count <= 0) return;

    if (avisosGenerated.length === 0) {
      return handleGenerate(count);
    }
    
    if (diasSemana.length === 0) return alert('Debe seleccionar al menos un día de la semana permitido.');
    
    const lastAviso = avisosGenerated[avisosGenerated.length - 1];
    const startCandidate = lastAviso 
      ? new Date(lastAviso.fecha_publicacion + 'T12:00:00') 
      : new Date(fechaInicio + 'T12:00:00');
    
    const start = lastAviso ? addDaysSafe(startCandidate, 1) : startCandidate;
    
    const validDates = generateValidDates(start, count, feriados, diasSemana);
    
    if (validDates.length === 0) {
      return alert('No se pudieron encontrar más fechas válidas a continuación de la última fecha.');
    }
    
    const additional: Aviso[] = validDates.map((date, index) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      
      const edicionMatch = ediciones.find((e: any) => e.fecha === dateStr);
      
      return {
        id: Math.random().toString(36).slice(2, 11),
        campaña_id: '',
        nombre: nombreCamp,
        producto: producto,
        fecha_publicacion: dateStr,
        edicion_id: edicionMatch?.id || '',
        numero_salida: avisosGenerated.length + index + 1
      };
    });
    
    setAvisosGenerated(prev => [...prev, ...additional]);
    setCantidad(prev => prev + count);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-display font-black text-[var(--on-surface)] tracking-tight">Nueva Campaña</h2>
          <p className="text-[var(--on-surface-variant)] font-medium mt-1">Configure los parámetros y genere los avisos automáticamente.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => exportCampañaPDF({ nombre_campaña: nombreCamp, cliente_id: clienteId, fecha_inicio: fechaInicio } as any, avisosGenerated, clientes.find((c:any)=>c.id === clienteId)?.nombre || '')} 
            className="modern-button-secondary bg-[var(--surface-card)] text-[var(--on-surface)] border-[var(--outline)] flex items-center gap-2"
          >
            <FileText size={18} /> Exportar PDF
          </button>
          <button 
            onClick={() => onSaveCampaña({ nombre_campaña: nombreCamp, cliente_id: clienteId, fecha_inicio: fechaInicio }, avisosGenerated)}
            className="modern-button-primary flex items-center gap-2"
          >
            <Save size={18} /> Guardar Campaña
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8 relative z-20">
          <Card title="Configuración de Campaña">
            <div className="space-y-8">
              {/* Sección: Datos del Cliente */}
              <div className="space-y-6 pb-6 border-b border-[#374151]/30">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-widest text-primary">1. Cliente</label>
                  {!showQuickAdd ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <CustomSelect 
                          options={[...clientes]
                            .sort((a:any, b:any) => (a.nombre || '').localeCompare(b.nombre || ''))
                            .map((c: any) => ({ label: c.nombre, value: c.id }))}
                          value={clienteId}
                          onChange={(val) => setClienteId(val)}
                          onKeyDown={(e) => handleEnter(e, nombreRef)}
                          placeholder="Seleccionar Cliente..."
                        />
                      </div>
                      <button 
                        onClick={() => setShowQuickAdd(true)} 
                        title="Nuevo Cliente rápido"
                        className="w-14 h-13 modern-button-secondary !p-0 flex items-center justify-center shrink-0"
                      >
                        <UserPlus size={22} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black uppercase text-primary">Carga Rápida de Cliente</span>
                        <button onClick={() => setShowQuickAdd(false)} className="text-[var(--on-surface-variant)] hover:text-rose-500"><X size={14}/></button>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          autoFocus
                          placeholder="Razón Social..."
                          value={quickClientName}
                          onChange={e => setQuickClientName(e.target.value)}
                          onKeyDown={e => {
                            if(e.key === 'Enter' && quickClientName.trim()) {
                              const newC = onAddCliente(quickClientName.trim());
                              if(newC) setClienteId(newC.id);
                              setQuickClientName('');
                              setShowQuickAdd(false);
                              setTimeout(() => nombreRef.current?.focus(), 10);
                            }
                          }}
                          className="modern-input h-10 text-sm"
                        />
                        <button 
                          onClick={() => {
                            if (quickClientName.trim()) {
                              const newC = onAddCliente(quickClientName.trim());
                              if(newC) setClienteId(newC.id);
                              setQuickClientName('');
                              setShowQuickAdd(false);
                            }
                          }}
                          className="w-10 h-10 modern-button-primary !p-0 flex items-center justify-center shrink-0"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-widest text-primary">2. Nombre y Fecha</label>
                  <input 
                    ref={nombreRef}
                    value={nombreCamp}
                    onChange={(e) => setNombreCamp(e.target.value)}
                    onKeyDown={(e) => handleEnter(e, fechaRef)}
                    className="modern-input"
                    placeholder="Ej: Promo Verano 2024"
                  />
                  <div className="relative">
                    <CustomDatePicker 
                      value={fechaInicio} 
                      onChange={setFechaInicio}
                      onKeyDown={(e) => handleEnter(e, productoRef)}
                    />
                  </div>
                  {fechaInicio && (
                    <div className="flex items-center gap-2 p-3 bg-[var(--surface)] rounded-2xl border border-transparent">
                      <Newspaper size={14} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--on-surface-variant)]">Edición:</span>
                      {(() => {
                        const ed = ediciones.find((e: any) => e.fecha === fechaInicio);
                        return ed ? (
                          <span className="text-xs font-black text-[var(--on-surface)]">#{ed.numero}</span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-500 italic">No existe edición para este día</span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Sección: Parámetros del Aviso */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-widest text-primary">3. Parámetros de Generación</label>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-[var(--on-surface-variant)] ml-1">Producto</span>
                    <CustomSelect 
                      options={PRODUCTOS}
                      value={producto}
                      onChange={setProducto}
                      onKeyDown={(e) => handleEnter(e, cantidadRef)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-[var(--on-surface-variant)] ml-1">Cant. Salidas</span>
                      <input 
                        ref={cantidadRef}
                        type="number"
                        inputMode="numeric"
                        value={cantidad}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCantidad(val === '' ? '' : parseInt(val));
                        }}
                        onKeyDown={(e) => handleEnter(e, generateBtnRef)}
                        className="modern-input"
                        min="1"
                        placeholder="1"
                      />
                    </div>
                    <div className="space-y-2">
                       <span className="text-[10px] font-black uppercase text-[var(--on-surface-variant)] ml-1">Selección de Días</span>
                       <div className="flex gap-1.5">
                          {[
                            { label: 'L', value: 1 },
                            { label: 'M', value: 2 },
                            { label: 'M', value: 3 },
                            { label: 'J', value: 4 },
                            { label: 'V', value: 5 }
                          ].map((d, idx) => {
                            const isActive = diasSemana.includes(d.value);
                            return (
                              <button 
                                key={idx}
                                onClick={() => {
                                  if (diasSemana.includes(d.value)) {
                                    setDiasSemana(diasSemana.filter(x => x !== d.value));
                                  } else {
                                    setDiasSemana([...diasSemana, d.value].sort());
                                  }
                                }}
                                type="button"
                                className={`flex-1 h-11 rounded-xl font-black text-xs transition-all border ${
                                  isActive 
                                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                                  : 'bg-[var(--surface)] text-[var(--on-surface-variant)] border-transparent hover:bg-[var(--outline)]'
                                }`}
                                title={['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][idx]}
                              >
                                {d.label}
                              </button>
                            );
                          })}
                       </div>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl">
                    <p className="text-xs font-bold text-rose-500 flex items-center gap-2">
                      <X size={14} /> {errorMsg}
                    </p>
                  </div>
                )}

                <button 
                  ref={generateBtnRef}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleGenerate();
                  }}
                  className="w-full h-14 modern-button-primary flex items-center justify-center gap-2 !bg-[var(--on-surface)] !text-[var(--surface-card)]"
                >
                  <Sparkles size={20} /> Generar Cronograma
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card 
            title="Listado de Pauta" 
            action={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[var(--surface)] rounded-xl px-3 py-1.5 border border-transparent">
                  <span className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase">Cant:</span>
                  <input 
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={extraCountInput}
                    onChange={e => {
                      const val = e.target.value;
                      setExtraCountInput(val === '' ? '' : parseInt(val));
                    }}
                    className="w-12 bg-transparent text-sm font-bold outline-none"
                    placeholder="1"
                  />
                </div>
                <button 
                  onClick={() => handleAddMore(extraCountInput || 1)} 
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  <PlusCircle size={18} /> Añadir Más
                </button>
              </div>
            }
          >
            {avisosGenerated.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                 <div className="w-24 h-24 bg-[var(--surface)] rounded-full flex items-center justify-center mb-6">
                    <Layout size={40} className="text-[var(--on-surface-variant)] opacity-20" />
                 </div>
                 <h4 className="text-xl font-display font-bold text-[var(--on-surface-variant)] uppercase tracking-widest">Sin pauta generada</h4>
                 <p className="text-[var(--on-surface-variant)] mt-2 max-w-xs">Configure los días y la cantidad para visualizar el cronograma de salidas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto md:overflow-visible -mx-4 md:-mx-8 -mb-4 md:-mb-8 pb-64">
                <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
                  <thead className="bg-[var(--surface)] border-y border-[var(--outline)]">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Orden</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] w-[40%]">Nombre Aviso</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] w-[20%]">Formato / Producto</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] text-center w-[30%]">Fecha Publicación</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] text-right w-[10%]">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#374151]/30">
                    {avisosGenerated.map((aviso, idx) => (
                      <tr key={aviso.id} className="group hover:bg-[#374151]/50 border-b border-[#374151]/30 last:border-0 transition-all">
                        <td className="px-8 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--surface)] text-[var(--on-surface-variant)] font-black text-xs">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <input 
                            value={aviso.nombre}
                            onChange={(e) => {
                              const newArr = [...avisosGenerated];
                              newArr[idx].nombre = e.target.value;
                              setAvisosGenerated(newArr);
                            }}
                            className="bg-transparent border-none outline-none font-bold text-[var(--on-surface)] w-full focus:bg-[var(--surface-card)] focus:ring-2 focus:ring-primary/20 rounded-lg px-3 py-1 transition-all"
                          />
                        </td>
                        <td className="px-8 py-4">
                           <CustomSelect 
                            className="text-sm font-bold"
                            options={PRODUCTOS}
                            value={aviso.producto}
                            onChange={(val) => {
                              const newArr = [...avisosGenerated];
                              newArr[idx].producto = val;
                              setAvisosGenerated(newArr);
                            }}
                          />
                        </td>
                        <td className="px-8 py-4 text-center">
                           <CustomDatePicker 
                            className={aviso.edicion_id ? "text-xs font-bold pl-10" : "text-sm font-bold pl-10"}
                            value={aviso.fecha_publicacion}
                            onChange={(val) => {
                              const newArr = [...avisosGenerated];
                              newArr[idx].fecha_publicacion = val;
                              const ed = ediciones.find((x:any) => x.fecha === val);
                              newArr[idx].edicion_id = ed?.id || '';
                              setAvisosGenerated(newArr);
                            }}
                           />
                        </td>
                        <td className="px-8 py-4 text-right">
                           <div className="flex flex-col items-center justify-center gap-1.5 min-w-[60px]">
                              {aviso.edicion_id ? (
                                <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-md uppercase tracking-tighter">
                                  #{ediciones.find((e:any)=>e.id === aviso.edicion_id)?.numero}
                                </span>
                              ) : (
                                <span className="text-[10px] font-black text-rose-500 px-2 py-0.5 bg-rose-500/10 rounded-md uppercase tracking-tighter">
                                  HUERFANO
                                </span>
                              )}
                              <button 
                                onClick={() => setAvisosGenerated(prev => prev.filter((_, i) => i !== idx))}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function addDaysSafe(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// --- EDICIONES ---
export function ScreenEdiciones({ ediciones, onExportPDF, clientes, avisos, onNavigateToCampaña, campañas }: any) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('LIST');
  const [viewDetail, setViewDetail] = useState<any>(null);

  const filtered = ediciones.filter((e: any) => 
    (e.numero || '').toString().includes(search) || 
    (e.fecha || '').toString().includes(search)
  ).sort((a:any, b:any) => (b.fecha || '').localeCompare(a.fecha || ''));

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
           <h2 className="text-4xl font-display font-black text-[var(--on-surface)] tracking-tight">Ediciones Diarias</h2>
           <p className="text-[var(--on-surface-variant)] font-medium">Cronograma de publicaciones y control de inventario editorial.</p>
        </div>
        <div className="flex bg-[var(--surface)] p-1.5 rounded-2xl border border-transparent">
          <button 
            onClick={() => setViewMode('GRID')}
            className={`p-3 rounded-xl flex items-center gap-2 font-black transition-all ${viewMode === 'GRID' ? 'bg-[var(--surface-card)] shadow-sm text-primary' : 'text-[var(--on-surface-variant)]'}`}
          >
            <Layout size={18} />
          </button>
          <button 
            onClick={() => setViewMode('LIST')}
            className={`p-3 rounded-xl flex items-center gap-2 font-black transition-all ${viewMode === 'LIST' ? 'bg-[var(--surface-card)] shadow-sm text-primary' : 'text-[var(--on-surface-variant)]'}`}
          >
            <Newspaper size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between bg-[var(--surface-card)] p-2 pl-6 rounded-2xl border border-transparent shadow-sm">
           <div className="relative flex-grow flex items-center">
              <Search className="text-slate-400" size={18} />
              <input 
                placeholder="Filtrar por número o fecha..." 
                value={search}
                onChange={e=>setSearch(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border-none outline-none font-medium text-sm"
              />
           </div>
           <div className="p-2 flex gap-2">
              <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-primary transition-all">
                <Filter size={18} />
              </button>
           </div>
        </div>

        {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
             {filtered.map((ed: any) => {
               const edAvisos = avisos.filter((a: any) => a.edicion_id === ed.id);
               return (
                 <motion.div 
                  key={ed.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group p-8 bg-[var(--surface-card)] border border-transparent rounded-[2rem] hover:ring-2 hover:ring-primary/40 transition-all cursor-default shadow-sm"
                 >
                    <div className="flex justify-between items-start mb-8">
                       <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-3">
                             <Calendar size={14}/>
                             <span className="text-[10px] font-black uppercase tracking-widest">{formatDateES(ed.fecha)}</span>
                          </div>
                          <h4 className="text-3xl font-display font-black text-[var(--on-surface)] leading-none">Edición {ed.numero}</h4>
                       </div>
                       <button 
                        onClick={() => onExportPDF(ed)}
                        className="w-14 h-14 bg-[var(--surface)] text-[var(--on-surface-variant)] rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                        title="Exportar Diagramación PDF"
                       >
                          <FileText size={24} />
                       </button>
                    </div>
                    <div className="flex justify-between items-center gap-4 bg-[var(--surface)] p-5 rounded-2xl border border-white/5">
                       <span className="font-black text-[var(--on-surface-variant)] text-[10px] uppercase tracking-widest leading-none"> {edAvisos.length} Avisos Programados</span>
                       <button 
                         onClick={() => setViewDetail(ed)}
                         className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform bg-primary/10 px-4 py-2 rounded-xl"
                       >
                          Detalles <ChevronRight size={14} />
                       </button>
                    </div>
                 </motion.div>
               );
             })}
          </div>
        ) : (
          <div className="bg-[var(--surface-card)] rounded-[var(--radius)] border border-transparent shadow-sm overflow-hidden">
            <div className="overflow-x-auto md:overflow-visible min-h-[500px]">
              <div className="w-full text-left min-w-[700px] md:min-w-0">
                <div className="bg-[var(--surface)] border-b border-[#374151]/30 rounded-t-[var(--radius)] flex">
                    <div className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] w-1/4">Edición</div>
                    <div className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] w-1/4">Fecha</div>
                    <div className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] text-center w-1/4">Avisos</div>
                    <div className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] text-right w-1/4">Acciones</div>
                </div>
                <div className="divide-y divide-[#374151]/30">
                  {filtered.map((ed: any) => {
                    const edAvisos = avisos.filter((a: any) => a.edicion_id === ed.id);
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={ed.id}
                        className="group hover:bg-[#374151]/50 border-b border-[#374151]/30 last:border-0 transition-all font-bold text-[var(--on-surface)] flex items-center"
                      >
                        <div className="px-8 py-6 w-1/4">
                           <span className="text-xl font-display font-black text-[var(--on-surface)]">#{ed.numero}</span>
                        </div>
                        <div className="px-8 py-6 font-mono text-xs uppercase text-[var(--on-surface-variant)] w-1/4">
                          {formatDateES(ed.fecha)}
                        </div>
                        <div className="px-8 py-6 text-center w-1/4">
                           <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-xs font-black transition-colors ${edAvisos.length > 0 ? 'bg-primary/10 text-primary' : 'bg-[var(--surface)] text-[var(--on-surface-variant)]'}`}>
                             {edAvisos.length} Avisos
                           </span>
                        </div>
                        <div className="px-8 py-6 text-right w-1/4">
                           <div className="flex justify-end gap-3 transition-all">
                              <button 
                                onClick={() => onExportPDF(ed)}
                                className="p-3 bg-[var(--surface-card)] text-[var(--on-surface-variant)] rounded-xl border border-transparent hover:bg-primary hover:text-white transition-all shadow-sm"
                                title="Exportar PDF"
                              >
                                <FileText size={18} />
                              </button>
                              <button 
                                onClick={() => setViewDetail(ed)}
                                className="p-3 bg-[var(--surface-card)] text-[var(--on-surface-variant)] rounded-xl border border-transparent hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-2"
                                title="Ver Detalles"
                              >
                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Detalle</span>
                                <ChevronRight size={18} />
                              </button>
                           </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {filtered.length === 0 && (
          <div className="py-32 text-center">
            <h4 className="text-2xl font-display font-black text-[var(--on-surface-variant)] opacity-30 uppercase tracking-widest">No se encontraron ediciones</h4>
            <p className="text-[var(--on-surface-variant)] font-medium">Use el panel superior para generar un nuevo lote de publicaciones.</p>
          </div>
        )}

        {/* MODAL DETALLE EDICION */}
        <AnimatePresence>
          {viewDetail && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[var(--surface-card)] rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-transparent max-h-[90vh] flex flex-col"
              >
                 <div className="px-10 py-8 border-b border-[#374151]/30 flex justify-between items-center bg-[var(--surface)]">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-1">
                        <Calendar size={14}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">{formatDateES(viewDetail.fecha)}</span>
                      </div>
                      <h3 className="text-3xl font-display font-black text-[var(--on-surface)]">Edición #{viewDetail.numero}</h3>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => onExportPDF(viewDetail)}
                        className="px-6 py-3 bg-[var(--surface-card)] text-primary border border-transparent rounded-2xl text-xs font-black hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                      >
                         <FileText size={18} /> PDF
                      </button>
                      <button onClick={() => setViewDetail(null)} className="p-3 bg-[var(--surface)] rounded-2xl text-[var(--on-surface-variant)] hover:bg-rose-50 hover:text-rose-500 transition-all">
                        <X size={24} />
                      </button>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-10">
                    <div className="mb-6 flex justify-between items-end">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">Avisos Programados</h4>
                       <span className="text-xs font-black text-primary bg-primary/5 px-3 py-1 rounded-lg">
                          TOTAL: {avisos.filter((a:any) => a.edicion_id === viewDetail.id).length}
                       </span>
                    </div>

                    <div className="space-y-4">
                       {(() => {
                         const edAvisos = avisos.filter((a:any) => a.edicion_id === viewDetail.id);
                         if (edAvisos.length === 0) {
                           return (
                             <div className="py-20 text-center bg-[var(--surface)] rounded-[2rem] border border-dashed border-[var(--outline)]">
                               <p className="text-[var(--on-surface-variant)] font-bold text-sm">No hay avisos programados para esta edición.</p>
                             </div>
                           );
                         }
                         return edAvisos.map((av: any) => {
                           // Buscar cliente
                           const campDetail = campañas?.find((c: any) => c.id === av.campaña_id);
                           const clientDetail = clientes.find((cl: any) => cl.id === campDetail?.cliente_id);

                           return (
                             <div key={av.id} className="p-6 bg-[var(--surface)] border border-transparent rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-5 flex-grow">
                                   <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-xs">
                                      {av.numero_salida}
                                   </div>
                                   <div>
                                      <p className="font-black text-[var(--on-surface)]">{av.nombre}</p>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-0.5">{av.producto}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="text-right">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] leading-none mb-1">Campaña / Cliente</p>
                                       <p className="text-xs font-bold text-[var(--on-surface)] leading-tight">{campDetail?.nombre_campaña || 'Nueva Campaña'}</p>
                                       <p className="text-[10px] text-primary font-bold">{clientDetail?.nombre || 'Sin Cliente'}</p>
                                    </div>
                                   <button 
                                      onClick={() => {
                                        onNavigateToCampaña(av.campaña_id);
                                        setViewDetail(null);
                                      }}
                                      className="p-3 bg-[var(--surface-card)] rounded-xl text-[var(--on-surface-variant)] hover:text-primary hover:bg-primary/5 transition-all border border-transparent"
                                   >
                                      <ChevronRight size={18} />
                                   </button>
                                </div>
                             </div>
                           );
                         });
                       })()}
                    </div>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- CLIENTES ---
export function ScreenClientes({ clientes, campañas, avisos, onNavigateToCampaña, onUpsert, onDelete }: any) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [viewDetail, setViewDetail] = useState<any>(null);

  const filtered = clientes.filter((c: any) => 
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h2 className="text-4xl font-display font-black text-[var(--on-surface)] tracking-tight">Clientes</h2>
            <p className="text-[var(--on-surface-variant)] font-medium">Anunciantes, agencias y contactos comerciales.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setEditing({ id: '', nombre: '', email: '', phone: '' })}
              className="modern-button-primary flex items-center gap-2"
            >
              <Plus size={20} /> Nuevo Cliente
            </button>
          </div>
       </div>

       <div className="space-y-6">
          <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" size={20} />
              <input 
                placeholder="Buscar por razón social..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-[var(--surface-card)] border border-transparent rounded-3xl outline-none focus:ring-4 focus:ring-primary/5 shadow-sm font-medium transition-all"
              />
          </div>

          <div className="flex flex-col gap-3 p-4 rounded-3xl backdrop-blur-xl bg-black/5 border border-black/5 dark:bg-white/5 dark:border-white/10 shadow-inner">
             {filtered.map((c: any) => {
               const clientCampañas = campañas.filter((camp: any) => camp.cliente_id === c.id);
               return (
                 <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                   className="p-5 bg-[var(--surface-card)]/40 hover:bg-primary/10 border border-transparent/50 hover:border-primary/30 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.15)] transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-5 cursor-pointer flex-grow" onClick={() => setViewDetail(c)}>
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--on-surface)] to-[var(--on-surface-variant)] text-white flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-[var(--surface)] shrink-0">
                          {c.nombre.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                          <span className="font-display font-bold text-[var(--on-surface)] text-lg leading-tight">{c.nombre}</span>
                          <div className="flex items-center gap-3 mt-1">
                             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--surface)]/50 group-hover:bg-primary/20 group-hover:text-primary group-hover:shadow-[0_0_10px_var(--primary)] rounded-lg text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-tighter transition-all">
                               <Megaphone size={10} className="text-primary group-hover:opacity-100 opacity-70" />
                               {clientCampañas.length} Campañas
                             </div>
                             {c.phone && <span className="text-[10px] text-[var(--on-surface-variant)] font-bold">{c.phone}</span>}
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-2">
                       <button onClick={()=>setEditing(c)} className="w-10 h-10 flex items-center justify-center text-[var(--on-surface-variant)] hover:text-primary transition-all rounded-xl hover:bg-primary/5">
                         <Edit3 size={18} />
                       </button>
                       <button onClick={()=>onDelete(c.id)} className="w-10 h-10 flex items-center justify-center text-[var(--on-surface-variant)] hover:text-rose-500 transition-all rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10">
                         <Trash2 size={18} />
                       </button>
                    </div>
                 </motion.div>
               );
             })}
          </div>
          
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-black uppercase tracking-widest">No hay resultados</p>
            </div>
          )}
       </div>

       {/* MODAL DETALLE CLIENTE (Campañas) */}
       {viewDetail && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl p-10 border border-white/20 max-h-[90vh] overflow-y-auto"
            >
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-display font-black text-slate-900 dark:text-white">{viewDetail.nombre}</h3>
                    <p className="text-slate-500 font-medium">{viewDetail.email || 'Sin correo registrado'}</p>
                  </div>
                  <button onClick={() => setViewDetail(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400">
                    <X size={24} />
                  </button>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Campañas Publicitarias</h4>
                      <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full">
                        TOTAL: {campañas.filter((ca:any) => ca.cliente_id === viewDetail.id).length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {campañas.filter((ca:any) => ca.cliente_id === viewDetail.id).length > 0 ? (
                        campañas.filter((ca:any) => ca.cliente_id === viewDetail.id).map((ca:any) => (
                          <div 
                            key={ca.id}
                            className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center group hover:border-primary/30 transition-all"
                          >
                            <div>
                               <p className="font-black text-slate-900 dark:text-white leading-tight">{ca.nombre_campaña}</p>
                               <div className="flex items-center gap-2 mt-1">
                                 <p className="text-[10px] text-slate-400 font-medium">Desde {formatDateES(ca.fecha_inicio)}</p>
                                 <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                 <p className="text-[10px] text-primary font-bold uppercase tracking-tight">{avisos?.filter((a:any) => a.campaña_id === ca.id).length || 0} avisos</p>
                               </div>
                             </div>
                            <button 
                              onClick={() => {
                                onNavigateToCampaña(ca.id);
                                setViewDetail(null);
                              }}
                              className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-black shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-900 hover:text-white transition-all"
                            >
                              Gestionar <ChevronRight size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                          <p className="text-slate-400 text-sm font-medium">No existen campañas para este cliente.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button 
                      onClick={() => { setEditing(viewDetail); setViewDetail(null); }}
                      className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-tight"
                    >
                      <Settings size={18} /> Editar Datos Cliente
                    </button>
                  </div>
               </div>
            </motion.div>
         </div>
       )}

       {editing && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[var(--surface-card)] rounded-[2.5rem] w-full max-w-lg shadow-2xl p-10 border border-transparent"
            >
               <h3 className="text-3xl font-display font-black mb-2 text-[var(--on-surface)]">Perfil Cliente</h3>
               <p className="text-[var(--on-surface-variant)] font-medium mb-8">Administre los datos legales del anunciante.</p>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] ml-1">Razón Social</label>
                    <input 
                      value={editing.nombre} 
                      onChange={e => setEditing({...editing, nombre: e.target.value})}
                      className="modern-input h-14"
                      placeholder="Nombre de la empresa"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email (Opcional)</label>
                      <input 
                        value={editing.email || ''} 
                        onChange={e => setEditing({...editing, email: e.target.value})}
                        className="modern-input"
                        placeholder="correo@ejemplo.com"
                        type="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono (Opcional)</label>
                      <input 
                        value={editing.phone || ''} 
                        onChange={e => setEditing({...editing, phone: e.target.value})}
                        className="modern-input"
                        placeholder="+54 11 ..."
                        type="tel"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button onClick={()=>setEditing(null)} className="flex-1 py-5 modern-button-secondary border-none !bg-slate-100 !text-slate-500">Cancelar</button>
                    <button onClick={()=>{onUpsert(editing); setEditing(null)}} className="flex-1 py-5 modern-button-primary">Guardar Registro</button>
                  </div>
               </div>
            </motion.div>
         </div>
       )}
    </div>
  );
}

// --- CONFIG ---
export function ScreenConfig({ user, onUpdateUser, onBatchGenerate, onSyncEdiciones, feriados, onAddFeriado, onDeleteFeriado, onBulkAddFeriados, ediciones, onLoadDemo, onClearEdiciones, appLogo, onUpdateLogo }: any) {
  const sortedFeriados = useMemo(() => {
    return [...feriados].sort((a: any, b: any) => a.fecha.localeCompare(b.fecha));
  }, [feriados]);

  // Calcular el siguiente número de edición sugerido
  const nextNumber = useMemo(() => {
    if (!ediciones || ediciones.length === 0) return '1';
    const top = Math.max(...ediciones.map((e: any) => e.numero || 0));
    return (top + 1).toString();
  }, [ediciones]);

  const [numIni, setNumIni] = useState(nextNumber);
  const [dateIni, setDateIni] = useState(new Date().toISOString().split('T')[0]);
  const [cant, setCant] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualName, setManualName] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // Actualizar numIni si cambia el sugerido (cuando se generan nuevas o se borra todo)
  useEffect(() => {
    setNumIni(nextNumber);
  }, [nextNumber]);

  const fetchHolidays = async () => {
    setIsFetching(true);
    try {
      const year = new Date().getFullYear();
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/AR`);
      if (!response.ok) throw new Error('Error al conectar con el servidor de feriados');
      const data = await response.json();
      
      const newHolidays = data.map((h: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        fecha: h.date,
        nombre: h.localName
      }));
      
      onBulkAddFeriados(newHolidays);
      alert(`${newHolidays.length} feriados importados correctamente para el año ${year}`);
    } catch (error) {
      console.error(error);
      alert('No se pudo obtener la lista de feriados internacionales.');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
       <div className="mb-4">
         <h2 className="text-4xl font-display font-black text-[var(--on-surface)] tracking-tight">Sistema y Ajustes</h2>
         <p className="text-[var(--on-surface-variant)] font-medium">Configuración de la plataforma y generación de recursos.</p>
       </div>

        {user.role === Role.ADMIN && (
          <Card title="Identidad Visual" className="relative z-40">
             <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-32 h-32 rounded-3xl bg-[var(--surface)] border-2 border-dashed border-[var(--outline)] flex items-center justify-center overflow-hidden shrink-0">
                   {appLogo ? (
                     <img src={appLogo} alt="App Logo" className="w-full h-full object-contain" />
                   ) : (
                     <div className="text-center p-4">
                       <Layout className="mx-auto text-slate-300 mb-2" size={32} />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sin Logo</p>
                     </div>
                   )}
                </div>
                <div className="flex-grow space-y-4">
                   <h4 className="text-lg font-display font-black text-[var(--on-surface)]">Logo de la Aplicación</h4>
                   <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">Este logo aparecerá en la cabecera del sistema y en todos los reportes PDF generados (Diagramación y Campañas). Se recomienda formato PNG con fondo transparente.</p>
                   <div className="flex items-center gap-4">
                      <label className="cursor-pointer">
                         <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                onUpdateLogo(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                         />
                         <span className="modern-button-primary !py-2.5 !px-5 flex items-center gap-2 text-xs">
                            <Plus size={16} /> {appLogo ? 'Cambiar Logo' : 'Subir Logo'}
                         </span>
                      </label>
                      {appLogo && (
                        <button 
                          onClick={() => onUpdateLogo(null)}
                          className="text-xs font-black text-rose-500 hover:underline"
                        >
                          Eliminar
                        </button>
                      )}
                   </div>
                </div>
             </div>
          </Card>
        )}

        {user.role === Role.ADMIN && (
          <Card title="Modo Demostración" className="relative z-30 border-primary/20 bg-primary/5">
             <div className="space-y-4">
               <p className="text-[var(--on-surface-variant)] text-sm font-medium">¿Necesita probar el sistema? Genere instantáneamente una estructura completa de datos.</p>
               <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-2xl border border-primary/20">
                  <div className="flex-grow">
                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Carga Masiva</p>
                    <p className="text-[11px] text-[var(--on-surface-variant)] font-medium">• 10 Clientes corporativos<br/>• 50 Ediciones diarias<br/>• 20 Campañas con avisos</p>
                  </div>
                  <button 
                   onClick={onLoadDemo}
                   className="modern-button-primary !py-3 !px-6 flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <Sparkles size={18} /> Cargar Demo
                  </button>
               </div>
             </div>
          </Card>
        )}

       <Card title="Generación de Ediciones" className="relative z-20">
          <div className="space-y-6">
            <p className="text-[var(--on-surface-variant)] text-sm font-medium">Cree un lote de ediciones diarias (Lunes a Viernes) de forma masiva.</p>
            <div className="flex flex-col sm:flex-row gap-6 items-end bg-[var(--surface)] p-6 rounded-3xl border border-transparent relative z-30 overflow-visible">
               <div className="space-y-2 w-full sm:w-1/3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] ml-1">Fecha Inicial</label>
                  <CustomDatePicker value={dateIni} onChange={setDateIni} />
               </div>
               <div className="space-y-2 w-full sm:w-1/3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] ml-1">Número Inicial</label>
                  <input type="number" value={numIni} onChange={e=>setNumIni(e.target.value)} className="modern-input" placeholder="0001" />
               </div>
               <div className="space-y-2 w-full sm:w-1/3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] ml-1">Cantidad de Días</label>
                  <input type="number" value={cant} onChange={e=>setCant(e.target.value)} className="modern-input" placeholder="30" />
               </div>
            </div>
            <button 
              onClick={() => {
                if(!numIni || !cant || !dateIni) return alert('Complete los parámetros de generación');
                
                const exists = ediciones.some((e: any) => e.fecha === dateIni);
                if (exists) {
                  if (!confirm(`Ya existe una edición para el día ${dateIni}. ¿Desea continuar de todas formas?`)) return;
                }

                onBatchGenerate(parseInt(numIni), parseInt(cant), dateIni);
                setCant('');
                alert('Ediciones generadas con éxito');
              }}
              className="w-full h-14 modern-button-primary flex items-center justify-center gap-2"
            >
              <Sparkles size={20} /> Ejecutar Proceso de Generación
            </button>
          </div>
       </Card>

        {user.role === Role.ADMIN && (
          <Card title="Mantenimiento de Ediciones" className="relative z-15">
             <div className="space-y-6">
               <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
                  <p className="text-xs font-bold text-amber-600 flex items-center gap-2">
                    <AlertCircle size={14} /> Zona de mantenimiento: Use con precaución.
                  </p>
               </div>
               <p className="text-[var(--on-surface-variant)] text-sm font-medium">Elimine un bloque de ediciones a partir de un número específico para permitir su regeneración.</p>
               <div className="flex flex-col sm:flex-row gap-6 items-end bg-[var(--surface)] p-6 rounded-3xl border border-transparent relative z-30 overflow-visible">
                  <div className="space-y-2 w-full sm:w-2/3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] ml-1">Borrar desde el número #</label>
                     <input 
                      type="number" 
                      id="clearFromInput"
                      placeholder="Ej: 0045" 
                      className="modern-input" 
                     />
                  </div>
                  <button 
                    onClick={() => {
                      const input = document.getElementById('clearFromInput') as HTMLInputElement;
                      const val = parseInt(input.value);
                      if (isNaN(val)) return alert('Ingrese un número válido');
                      onClearEdiciones(val);
                    }}
                    className="w-full sm:w-1/3 h-14 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} /> Limpiar bloque
                  </button>
               </div>
             </div>
          </Card>
        )}

       <Card title="Calendario de Feriados" className="relative z-10">
          <div className="space-y-6">
            <p className="text-[var(--on-surface-variant)] text-sm font-medium">Configure los días no laborables para que el generador de avisos y ediciones los omita automáticamente.</p>
            
             <div className="flex flex-col sm:flex-row gap-4">
                <button 
                 onClick={fetchHolidays}
                 disabled={isFetching}
                 className="flex-1 h-14 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  <Sparkles size={20} className={isFetching ? 'animate-spin' : ''} />
                  {isFetching ? 'Conectando...' : 'Importar Feriados Oficiales (AR)'}
                </button>
                {ediciones.length > 0 && (
                  <button 
                   onClick={onSyncEdiciones}
                   className="flex-1 h-14 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                  >
                     <Calendar size={20} /> Re-sincronizar Calendario
                  </button>
                )}
             </div>

            <div className="border-t border-slate-100 pt-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] ml-1">Agregar Feriado Manual</label>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <div className="w-full sm:w-64 shrink-0">
                  <CustomDatePicker value={manualDate} onChange={setManualDate} />
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    placeholder="Nombre del feriado (Ej: Navidad)"
                    className="modern-input" 
                  />
                </div>
                <button 
                  onClick={() => {
                    if(!manualDate) return;
                    onAddFeriado(manualDate, manualName);
                    setManualDate('');
                    setManualName('');
                  }}
                  className="px-8 h-14 modern-button-primary shrink-0"
                >
                  Agregar Feriado
                </button>
              </div>
            </div>

            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <table className="w-full text-left">
                <thead className="bg-[var(--surface)]">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[var(--on-surface-variant)]">Fecha</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[var(--on-surface-variant)]">Descripción</th>
                    <th className="px-6 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedFeriados.map((f: any) => (
                    <tr key={f.id} className="hover:bg-[#374151]/50 border-b border-[#374151]/30 last:border-0 transition-colors">
                      <td className="px-6 py-3 font-mono font-bold text-sm whitespace-nowrap">{formatDateES(f.fecha)}</td>
                      <td className="px-6 py-3 text-sm text-[var(--on-surface)] font-medium">{f.nombre || '-'}</td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => onDeleteFeriado(f.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {feriados.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-[var(--on-surface-variant)] text-xs font-bold uppercase italic tracking-widest">No hay feriados cargados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
       </Card>
       
       <Card title="Preferencias Visuales">
          <div className="space-y-10">
             <div className="flex items-center justify-between bg-[var(--surface)] p-8 rounded-[2.5rem] border border-transparent">
                <div>
                   <span className="font-black text-lg block leading-none mb-1 text-[var(--on-surface)]">Modo Nocturno</span>
                   <span className="text-[var(--on-surface-variant)] text-[10px] font-black uppercase tracking-widest">Active para entornos de poca luz</span>
                </div>
                <button 
                  onClick={() => onUpdateUser({...user, dark_mode: !user.dark_mode})}
                  className={`w-16 h-10 rounded-full transition-all relative ${user.dark_mode ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1.5 w-7 h-7 rounded-full shadow-sm transition-all transform ${user.dark_mode ? 'translate-x-[30px] bg-[var(--on-primary)]' : 'translate-x-[6px] bg-white'}`} style={{ left: 0 }} />
                </button>
             </div>

             <div className="space-y-6">
                 <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] ml-1">Estructura de Menú</span>
                 <div className="grid grid-cols-2 gap-6">
                    {[
                      { id: 'TOP' as const, label: 'Menú Superior', icon: Layout },
                      { id: 'SIDE' as const, label: 'Menú Lateral', icon: Newspaper }
                    ].map(layout => (
                      <button 
                        key={layout.id}
                        onClick={() => onUpdateUser({...user, menu_layout: layout.id})}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${(user.menu_layout || 'TOP') === layout.id ? 'border-primary bg-primary/5' : 'border-transparent bg-[var(--surface)] hover:border-primary/20'}`}
                      >
                         <layout.icon size={32} className={(user.menu_layout || 'TOP') === layout.id ? 'text-primary' : 'text-[var(--on-surface-variant)]'} />
                         <span className={`text-sm font-black uppercase tracking-widest ${(user.menu_layout || 'TOP') === layout.id ? 'text-primary' : 'text-[var(--on-surface-variant)]'}`}>{layout.label}</span>
                      </button>
                    ))}
                 </div>
              </div>
             
             <div className="space-y-6">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] ml-1">Ambiente de Trabajo</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { id: 'blue' as const, label: 'Sapphire Pro', desc: 'Modern Blue Business', color: '#2563eb', accent: '#3b82f6' },
                     { id: 'rust' as const, label: 'Crimson Rose', desc: 'Sophisticated Warm', color: '#be123c', accent: '#fb7185' },
                     { id: 'slate' as const, label: 'Midnight Slate', desc: 'Technical Elegance', color: '#475569', accent: '#94a3b8' }
                   ].map(t => (
                     <button 
                      key={t.id}
                      onClick={() => onUpdateUser({...user, theme: t.id})}
                      className={`group relative p-6 rounded-[2.5rem] border-4 text-left transition-all hover:translate-y-[-4px] ${
                        user.theme === t.id 
                        ? 'border-primary bg-[var(--surface-card)] shadow-2xl z-10' 
                        : 'border-transparent bg-[var(--surface)] opacity-70 grayscale'
                      }`}
                     >
                       <div className="flex flex-col h-full justify-between">
                          <div className="space-y-2">
                             <h4 className={`font-display font-black text-lg ${user.theme === t.id ? 'text-[var(--on-surface)]' : 'text-[var(--on-surface-variant)]'}`}>{t.label}</h4>
                             <p className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-tight">{t.desc}</p>
                          </div>
                          
                          <div className="mt-8 flex gap-2">
                             <div className="w-8 h-8 rounded-full shadow-inner border border-transparent" style={{ backgroundColor: t.color }} />
                             <div className="w-8 h-8 rounded-full shadow-inner border border-transparent" style={{ backgroundColor: t.accent }} />
                          </div>
                       </div>
                       
                       {user.theme === t.id && (
                         <motion.div layoutId="theme-check" className="absolute top-6 right-6 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                            <Check size={16} />
                         </motion.div>
                       )}
                     </button>
                   ))}
                </div>
             </div>
          </div>
       </Card>

    </div>
  );
}

// --- USUARIOS ---
export function ScreenUsuarios({ users, onUpsert, onDelete }: any) {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState(Role.USER);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = users.filter((u: any) => 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setEditUsername('');
    setEditPassword('');
    setEditRole(Role.USER);
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername) return alert('Nombre de usuario requerido');
    
    onUpsert({
      id: editingId || Math.random().toString(36).substring(2, 11),
      username: editUsername,
      password: editPassword,
      role: editRole,
      theme: 'blue',
      dark_mode: false
    });
    resetForm();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
           <h2 className="text-4xl font-display font-black text-[var(--on-surface)] tracking-tight">Gestión de Usuarios</h2>
           <p className="text-[var(--on-surface-variant)] font-medium">Controle los accesos y roles del sistema.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="modern-button-primary flex items-center gap-2 !px-8 !py-4 shadow-xl shadow-primary/20"
        >
          <UserPlus size={20} /> Crear Usuario
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card title={editingId ? "Editar Usuario" : "Nuevo Usuario"}>
               <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black uppercase text-[var(--on-surface-variant)] ml-1">Username</label>
                    <input 
                      value={editUsername}
                      onChange={e => setEditUsername(e.target.value)}
                      className="modern-input"
                      placeholder="nombre.usuario"
                    />
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</label>
                    <input 
                      type="password"
                      value={editPassword}
                      onChange={e => setEditPassword(e.target.value)}
                      className="modern-input"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black uppercase text-[var(--on-surface-variant)] ml-1">Rol</label>
                    <CustomSelect 
                      options={[
                        { label: 'Usuario (Operador)', value: Role.USER },
                        { label: 'Administrador', value: Role.ADMIN }
                      ]}
                      value={editRole}
                      onChange={val => setEditRole(val as Role)}
                    />
                  </div>
                  <div className="md:col-span-1 flex gap-2">
                    <button type="submit" className="flex-1 py-4 modern-button-primary">
                      {editingId ? 'Actualizar' : 'Crear'}
                    </button>
                    <button type="button" onClick={resetForm} className="px-6 py-4 modern-button-secondary">
                      Cancelar
                    </button>
                  </div>
               </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              placeholder="Buscar usuarios..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-[var(--surface-card)] border border-transparent rounded-[2rem] outline-none shadow-sm font-medium"
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((u: any) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-[var(--surface-card)] border border-transparent rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--on-surface)] to-[var(--on-surface-variant)] text-white flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-[var(--surface)] shrink-0 uppercase">
                  {u.username[0]}
                </div>
                <div>
                  <span className="text-xl font-display font-black text-[var(--on-surface)] block leading-tight">{u.username}</span>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black ${u.role === Role.ADMIN ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 'bg-[var(--surface)] text-[var(--on-surface-variant)] border border-transparent'}`}>
                      {u.role}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-auto pt-4 border-t border-[var(--outline)]">
                  <button
                    onClick={() => {
                      setEditingId(u.id);
                      setEditUsername(u.username);
                      setEditRole(u.role);
                      setShowAddForm(true);
                    }}
                    className="w-10 h-10 flex items-center justify-center text-[var(--on-surface-variant)] hover:text-primary transition-all rounded-xl hover:bg-primary/5"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if(confirm(`¿Eliminar al usuario ${u.username}?`)) onDelete(u.id);
                    }}
                    className="w-10 h-10 flex items-center justify-center text-[var(--on-surface-variant)] hover:text-rose-500 transition-all rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 size={18} />
                  </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-black uppercase tracking-widest">No hay resultados</p>
          </div>
        )}
      </div>
    </div>
  );
}
