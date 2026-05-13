import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Aviso, Edición, Cliente, Campaña } from '../types';
import { formatDateES } from './dateUtils';

export function exportEdicionPDF(edicion: Edición, avisosEnEdicion: Aviso[], clientes: Cliente[], campañas: Campaña[], allAvisos: Aviso[], logoUrl?: string | null) {
  const doc = new jsPDF();
  
  if (logoUrl) {
    try {
      doc.addImage(logoUrl, 'PNG', 160, 10, 35, 20); // Logo en la esquina superior derecha
    } catch (e) {
      console.warn("Error adding logo to PDF", e);
    }
  }
  
  // Header
  doc.setFontSize(16);
  doc.text(`Salida para el ${formatDateES(edicion.fecha)}`, 14, 15);
  doc.text(`Edición Nº ${edicion.numero}`, 14, 25);
  
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
    headStyles: { fillColor: [200, 200, 200], textColor: 20 },
  });

  doc.save(`Edicion_${edicion.numero}.pdf`);
}

export function exportCampañaPDF(campaña: Campaña, avisos: Aviso[], clienteNombre: string, logoUrl?: string | null) {
  const doc = new jsPDF();
  
  if (logoUrl) {
    try {
      doc.addImage(logoUrl, 'PNG', 160, 10, 35, 20);
    } catch (e) {
      console.warn("Error adding logo to PDF", e);
    }
  }
  
  doc.setFontSize(16);
  doc.text(`Campaña: ${campaña.nombre_campaña}`, 14, 15);
  doc.text(`Cliente: ${clienteNombre}`, 14, 25);
  doc.text(`Fecha Inicio: ${formatDateES(campaña.fecha_inicio)}`, 14, 35);
  
  const body = avisos.sort((a,b) => a.numero_salida - b.numero_salida).map(a => [
    a.nombre,
    a.producto,
    formatDateES(a.fecha_publicacion)
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Nombre', 'Producto', 'Fecha']],
    body: body,
    theme: 'grid',
  });

  doc.save(`Campaña_${campaña.nombre_campaña}.pdf`);
}
