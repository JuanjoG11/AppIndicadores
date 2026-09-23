const PDFDocument = require('pdfkit');
const fs   = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'Acta_Entrega_Conocimientos_Zentra_Caja.pdf');
const LOGO   = path.join(__dirname, 'logo_tym.png');

const FECHA = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 50, left: 60, right: 60 } });
doc.pipe(fs.createWriteStream(OUTPUT));

const W = 492; // ancho útil

// ── LOGO ──────────────────────────────────────────────────────
if (fs.existsSync(LOGO)) {
    doc.image(LOGO, 60, 45, { height: 45, fit: [160, 45] });
}

// ── TÍTULO ────────────────────────────────────────────────────
doc.font('Helvetica-Bold').fontSize(15).fillColor('#1E3A5F')
   .text('ACTA DE ENTREGA DE CONOCIMIENTOS', 60, 105, { align: 'center', width: W });

doc.font('Helvetica-Bold').fontSize(11).fillColor('#2E6DA4')
   .text('Sistema ZENTRA – Área de Caja', 60, 125, { align: 'center', width: W });

// Línea separadora
doc.moveTo(60, 145).lineTo(552, 145).lineWidth(1).strokeColor('#2E6DA4').stroke();

// ── DATOS ─────────────────────────────────────────────────────
doc.font('Helvetica').fontSize(10).fillColor('#333')
   .text(`Fecha:   ${FECHA}`, 60, 158)
   .text('Empresa:   Tiendas y Marcas S.A.S.',  60, 173)
   .text('Objetivo:   Se hace entrega de los conocimientos para la alimentación del sistema ZENTRA en el área de caja.',
         60, 188, { width: W, lineGap: 2 });

// Línea separadora
doc.moveTo(60, 215).lineTo(552, 215).lineWidth(0.5).strokeColor('#AAAAAA').stroke();

// ── TEXTO ÚNICO ───────────────────────────────────────────────
doc.font('Helvetica').fontSize(10).fillColor('#222')
   .text(
    'Los abajo firmantes confirman haber recibido satisfactoriamente la capacitación ' +
    'sobre el uso y alimentación del sistema ZENTRA para el área de caja.',
    60, 228, { align: 'justify', width: W, lineGap: 3 }
   );

// ── COMPROMISOS ───────────────────────────────────────────────
doc.moveDown(1);
const bulletY = doc.y;
const bullets = [
    'Registrar diariamente las transacciones de caja en el sistema ZENTRA.',
    'Mantener al día el cuadre de planillas y arqueos según los procedimientos indicados.',
    'La bonificación está sujeta al cumplimiento de la carga diaria de información en el sistema.',
];
bullets.forEach((b) => {
    doc.font('Helvetica').fontSize(10).fillColor('#222')
       .text(`•  ${b}`, 68, doc.y, { width: W - 10, lineGap: 2 });
    doc.moveDown(0.5);
});

// ── FIRMAS ────────────────────────────────────────────────────
const firmas = [
    { titulo: 'Caja Alpina' },
    { titulo: 'Caja Zenú' },
    { titulo: 'Caja Fleischmann' },
];

const fY       = 480;          // Y donde empieza el bloque de firma
const colW     = W / 3;        // ~164 px por columna
const lineaLen = 130;

firmas.forEach((f, i) => {
    const cx = 60 + i * colW + (colW - lineaLen) / 2;

    // Línea de firma (arriba del nombre)
    doc.moveTo(cx, fY).lineTo(cx + lineaLen, fY)
       .lineWidth(1).strokeColor('#333').stroke();

    // Cargo / área
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#111')
       .text(f.titulo, cx - 5, fY + 6, { width: lineaLen + 10, align: 'center' });
});

// ── PIE ───────────────────────────────────────────────────────
const pieY = doc.page.height - 45;
doc.moveTo(60, pieY).lineTo(552, pieY).lineWidth(0.4).strokeColor('#CCCCCC').stroke();
doc.font('Helvetica').fontSize(8).fillColor('#999')
   .text(`Tiendas y Marcas S.A.S.  ·  ${FECHA}  ·  Uso interno`, 60, pieY + 7, { align: 'center', width: W });

doc.end();
doc.on('end', () => console.log(`\n✅ PDF generado: ${OUTPUT}\n`));
