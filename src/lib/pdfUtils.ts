import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Aviso, Edición, Cliente, Campaña } from '../types';
import { formatDateES } from './dateUtils';

export function exportEdicionPDF(edicion: Edición, avisos: Aviso[], clientes: Cliente[]) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.text(`Salida para el ${formatDateES(edicion.fecha)}`, 14, 15);
  doc.text(`Edición Nº ${edicion.numero}`, 14, 25);
  
  const body = avisos.map(a => {
    const cliente = clientes.find(c => c.id === (a as any).cliente_id)?.nombre || 'Desconocido';
    const outputsTotal = (a as any).total_avisos || 1; // Assuming total is stored or passed
    return [
      cliente,
      a.producto,
      a.nombre,
      a.numero_salida.toString(),
      (outputsTotal - a.numero_salida).toString()
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

export function exportCampañaPDF(campaña: Campaña, avisos: Aviso[], clienteNombre: string) {
  const doc = new jsPDF();
  
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
