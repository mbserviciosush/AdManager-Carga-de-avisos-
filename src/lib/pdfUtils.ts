import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Aviso, Edición, Cliente, Campaña } from '../types';
import { formatDateES } from './dateUtils';

function createEdicionDoc(edicion: Edición, avisosEnEdicion: Aviso[], clientes: Cliente[], campañas: Campaña[], allAvisos: Aviso[], logoUrl?: string | null) {
  const doc = new jsPDF();
  
  // Header Minimalista
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(20);
  doc.text(`Salida: ${formatDateES(edicion.fecha)}`, 14, 20);

  const edicionText = `Edición Nº ${edicion.numero}`;
  const edicionWidth = doc.getTextWidth(edicionText);
  doc.text(edicionText, 196 - edicionWidth, 20);

  // Línea decorativa
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, 28, 196, 28);
  
  const body = avisosEnEdicion.map(a => {
    const campaña = campañas.find(c => c.id === a.campaña_id);
    const cliente = clientes.find(c => c.id === campaña?.cliente_id)?.nombre || 'Desconocido';
    
    // Total de avisos que tiene esta campaña en todo el sistema
    const totalCampAvisos = allAvisos.filter(x => x.campaña_id === a.campaña_id).length;
    const restantes = totalCampAvisos - a.numero_salida;

    return [
      cliente,
      a.producto,
      a.nombre,
      a.numero_salida.toString(),
      restantes.toString()
    ];
  });

  autoTable(doc, {
    startY: 35,
    head: [['Cliente', 'Producto', 'Aviso', 'Número de salida', 'Salidas restantes']],
    body: body,
    theme: 'grid',
    headStyles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });

  return doc;
}

export function exportEdicionPDF(edicion: Edición, avisosEnEdicion: Aviso[], clientes: Cliente[], campañas: Campaña[], allAvisos: Aviso[], logoUrl?: string | null) {
  const doc = createEdicionDoc(edicion, avisosEnEdicion, clientes, campañas, allAvisos, logoUrl);
  doc.save(`Edicion_${edicion.numero}.pdf`);
}

export function previewEdicionPDF(edicion: Edición, avisosEnEdicion: Aviso[], clientes: Cliente[], campañas: Campaña[], allAvisos: Aviso[], logoUrl?: string | null) {
  const doc = createEdicionDoc(edicion, avisosEnEdicion, clientes, campañas, allAvisos, logoUrl);
  return doc.output('bloburl');
}

function createCampañaDoc(campaña: Campaña, avisos: Aviso[], clienteNombre: string, logoUrl?: string | null) {
  const doc = new jsPDF();
  
  // Header Minimalista
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(20);
  doc.text(`${campaña.nombre_campaña}`, 14, 20);
  
  doc.setFontSize(11);
  doc.text(`Cliente: ${clienteNombre}`, 14, 30);
  doc.text(`Inicio: ${formatDateES(campaña.fecha_inicio)}`, 14, 37);

  // Línea decorativa
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);
  
  const body = avisos.sort((a,b) => a.numero_salida - b.numero_salida).map(a => [
    a.nombre,
    a.producto,
    formatDateES(a.fecha_publicacion)
  ]);

  autoTable(doc, {
    startY: 48,
    head: [['Nombre', 'Producto', 'Fecha']],
    body: body,
    theme: 'grid',
    headStyles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });

  return doc;
}

export function exportCampañaPDF(campaña: Campaña, avisos: Aviso[], clienteNombre: string, logoUrl?: string | null) {
  const doc = createCampañaDoc(campaña, avisos, clienteNombre, logoUrl);
  doc.save(`Campaña_${campaña.nombre_campaña}.pdf`);
}

export function previewCampañaPDF(campaña: Campaña, avisos: Aviso[], clienteNombre: string, logoUrl?: string | null) {
  const doc = createCampañaDoc(campaña, avisos, clienteNombre, logoUrl);
  return doc.output('bloburl');
}
