const fs = require('fs');
const path = require('path');

const users = [
    {
        name: "Sebastián Arias",
        role: "RESPONSABLE TAT - LOGÍSTICA DE ENTREGA",
        kpis: [
            { name: "Índice de Devoluciones", meta: "ALP: 1.5% | UNI: 2% | ZEN: 1.8%", bonus: "$75.000" },
            { name: "Productividad Auxiliares", meta: "ALP: 40 | UNI: 55 | ZEN: 70", bonus: "$75.000" },
            { name: "Productividad Vehículo", meta: "ALP: 60 | UNI: 50 | ZEN: 70", bonus: "$75.000" },
            { name: "Participación de Fletes", meta: "ALP: 4.8% | UNI: 4.2% | ZEN: 3.9%", bonus: "$75.000" }
        ]
    },
    {
        name: "David Aguirre",
        role: "ALPINA / FLEISCHMANN - LOGÍSTICA DE ENTREGA",
        kpis: [
            { name: "Índice de Devoluciones", meta: "ALP: 1.5% | UNI: 2% | ZEN: 1.8%", bonus: "$75.000" },
            { name: "Productividad Auxiliares", meta: "ALP: 40 | UNI: 55 | ZEN: 70", bonus: "$75.000" },
            { name: "Productividad Vehículo", meta: "ALP: 60 | UNI: 50 | ZEN: 70", bonus: "$75.000" },
            { name: "Participación de Fletes", meta: "ALP: 4.8% | UNI: 4.2% | ZEN: 3.9%", bonus: "$75.000" }
        ]
    },
    {
        name: "Felipe Murillo",
        role: "RESPONSABLE ZENU - LOGÍSTICA DE ENTREGA",
        kpis: [
            { name: "Índice de Devoluciones", meta: "ALP: 1.5% | UNI: 2% | ZEN: 1.8%", bonus: "$75.000" },
            { name: "Productividad Auxiliares", meta: "ALP: 40 | UNI: 55 | ZEN: 70", bonus: "$75.000" },
            { name: "Productividad Vehículo", meta: "ALP: 60 | UNI: 50 | ZEN: 70", bonus: "$75.000" },
            { name: "Participación de Fletes", meta: "ALP: 4.8% | UNI: 4.2% | ZEN: 3.9%", bonus: "$75.000" }
        ]
    },
    {
        name: "Anyi Mosquera",
        role: "Analista De Información",
        kpis: [
            { name: "Revisión de precios", meta: "META: 100%", bonus: "$75.000" },
            { name: "Cumplimiento de inventarios", meta: "META: 90%", bonus: "$75.000" },
            { name: "Revisión de margenes", meta: "META: 100%", bonus: "$75.000" },
            { name: "Exactitud de inventarios", meta: "META: 99%", bonus: "$75.000" }
        ]
    },
    {
        name: "Erika Valencia",
        role: "TYM Y TAT - TALENTO HUMANO",
        kpis: [
            { name: "Rotación de Personal", meta: "META: 5%", bonus: "N/A" },
            { name: "Índice de Ausentismo", meta: "META: 2.5%", bonus: "N/A" },
            { name: "Cumplimiento SST", meta: "META: 92%", bonus: "$100.000" },
            { name: "Actividades Cultura", meta: "META: 90%", bonus: "$100.000" },
            { name: "Cobertura Vacantes", meta: "META: 8 días", bonus: "$100.000" }
        ]
    },
    {
        name: "Karina Taba",
        role: "Analista de Gestión Humana",
        kpis: [
            { name: "Tiempo de cobertura de vacantes", meta: "META: 8", bonus: "$100.000" },
            { name: "Cumplimiento SST", meta: "META: 92%", bonus: "$100.000" },
            { name: "Actividades de cultura", meta: "META: 90%", bonus: "$100.000" }
        ]
    },
    {
        name: "María José Franco",
        role: "TYM - TALENTO HUMANO",
        kpis: [
            { name: "Cumplimiento SST", meta: "META: 92%", bonus: "$100.000" },
            { name: "Actividades de cultura", meta: "META: 90%", bonus: "$100.000" }
        ]
    },
    {
        name: "Sandra Milena",
        role: "LÍDER CAJA - CAJA",
        kpis: [
            { name: "Cumplimiento Arqueos", meta: "META: 8/mes", bonus: "N/A" },
            { name: "Indice de Arqueos", meta: "META: 0%", bonus: "$100.000" },
            { name: "Cierre de Planillas", meta: "META: 100%", bonus: "$100.000" },
            { name: "Vales en Cuadres", meta: "META: 0,5%", bonus: "$100.000" }
        ]
    },
    {
        name: "Diana García",
        role: "LÍDER CARTERA (TYM Y TAT)",
        kpis: [
            { name: "Cartera al Día", meta: "META: 10%", bonus: "$100.000" },
            { name: "Cartera > 30 Días", meta: "META: 5%", bonus: "$100.000" },
            { name: "Relación Cartera vs Ventas", meta: "META: 10%", bonus: "$100.000" }
        ]
    },
    {
        name: "Cristian Ballesteros",
        role: "CONTABILIDAD - RESPONSABLE",
        kpis: [
            { name: "Conciliaciones Bancarias", meta: "8/mes", bonus: "$100.000" },
            { name: "Arqueos de Caja", meta: "4/mes", bonus: "$100.000" },
            { name: "Cierre de planillas", meta: "100%", bonus: "$100.000" }
        ]
    },
    {
        name: "Oscar Giraldo",
        role: "CONTADOR PRINCIPAL",
        kpis: [
            { name: "Días de Cierre", meta: "META: 12 días", bonus: "N/A" },
            { name: "Ajustes Posteriores", meta: "META: 1 max", bonus: "N/A" },
            { name: "Ajustes Revisoría", meta: "META: 1 max", bonus: "N/A" },
            { name: "Rotación CxC", meta: "META: 1.5 veces", bonus: "N/A" },
            { name: "Conciliaciones Bancarias", meta: "META: 8/mes", bonus: "$100.000" },
            { name: "Cierre de Planillas", meta: "META: 100%", bonus: "$100.000" },
            { name: "Multas & Sanciones", meta: "META: 0.1%", bonus: "N/A" }
        ]
    },
    {
        name: "Esteban Loaiza",
        role: "ZENU Y FLEI - FACTURACIÓN",
        kpis: [
            { name: "Pedidos Facturados", meta: "META: 100%", bonus: "$100.000" },
            { name: "Control Operativo De Facturación", meta: "META: 100%", bonus: "$100.000" },
            { name: "Error sobre Facturación", meta: "META: 99.5%", bonus: "$100.000" }
        ]
    },
    {
        name: "Enrique Díaz",
        role: "ALPINA - FACTURACIÓN",
        kpis: [
            { name: "Pedidos Facturados", meta: "META: 100%", bonus: "$100.000" },
            { name: "Control Operativo De Facturación", meta: "META: 100%", bonus: "$100.000" },
            { name: "Error sobre Facturación", meta: "META: 99.5%", bonus: "$100.000" }
        ]
    },
    {
        name: "Mariana Gallego",
        role: "UNI Y FAM - FACTURACIÓN",
        kpis: [
            { name: "Pedidos Facturados", meta: "META: 100%", bonus: "$100.000" },
            { name: "Control Operativo De Facturación", meta: "META: 100%", bonus: "$100.000" },
            { name: "Error sobre Facturación", meta: "META: 99.5%", bonus: "$100.000" }
        ]
    },
    {
        name: "Daniel Arroyave",
        role: "AUXILIAR DE CAJA - TAT",
        kpis: [
            { name: "Cierre de planillas", meta: "META: 100%", bonus: "$100.000" },
            { name: "Vales en Cuadres", meta: "META: 0,5%", bonus: "$100.000" },
            { name: "Indice de Arqueos", meta: "META: 0%", bonus: "$100.000" }
        ]
    },
    {
        name: "Eliana Gonzalez",
        role: "AUXILIAR DE CAJA - TYM",
        kpis: [
            { name: "Cierre de planillas", meta: "META: 100%", bonus: "$100.000" },
            { name: "Vales en Cuadres", meta: "META: 0,5%", bonus: "$100.000" },
            { name: "Indice de Arqueos", meta: "META: 0%", bonus: "$100.000" }
        ]
    },
    {
        name: "Nataly Molina",
        role: "AUXILIAR DE CAJA - TYM",
        kpis: [
            { name: "Cierre de planillas", meta: "META: 100%", bonus: "$100.000" },
            { name: "Vales en Cuadres", meta: "META: 0,5%", bonus: "$100.000" },
            { name: "Indice de Arqueos", meta: "META: 0%", bonus: "$100.000" }
        ]
    }
];

const mainFolder = path.join(__dirname, 'Documentos_Usuarios');
if (!fs.existsSync(mainFolder)) {
    fs.mkdirSync(mainFolder);
}

const templateHTML = (userName, userRole, kpis) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentos - ${userName}</title>
    <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 40px; color: #333; }
        .page { max-width: 800px; margin: 0 auto; margin-bottom: 50px; padding: 40px; border: 1px solid #ddd; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { display: flex; flex-direction: column; align-items: center; justify-content: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px; text-align: center; }
        .logo-container { display: flex; align-items: center; gap: 15px; margin-bottom: 10px; }
        .logo-svg { width: 50px; height: 50px; }
        .logo-text { font-size: 28px; font-weight: 900; color: #1e293b; letter-spacing: 1px; margin: 0; line-height: 1; text-align: left; }
        .logo-sub { color: #6366f1; font-weight: 800; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; margin: 0; line-height: 1; text-align: left; }
        h1 { color: #1e293b; font-size: 20px; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px; width: 100%; }
        h2 { color: #334155; font-size: 18px; margin-top: 30px; }
        p { line-height: 1.6; color: #475569; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; border: 1px solid #cbd5e1; text-align: left; }
        th { background: #f1f5f9; color: #1e293b; font-weight: bold; }
        .signature-box { margin-top: 80px; display: flex; justify-content: space-between; gap: 40px; }
        .sig-line { flex: 1; border-top: 1px solid #000; text-align: center; padding-top: 10px; font-weight: bold; }
        @media print {
            body { padding: 0; background: #fff; }
            .page { border: none; box-shadow: none; margin: 0; padding: 0; page-break-after: always; }
        }
    </style>
</head>
<body>

    <!-- MANUAL DE USUARIO -->
    <div class="page">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; color: #444; font-family: sans-serif;">
            <tr>
                <td style="border: 1px solid #777; padding: 6px 10px; width: 25%;"><strong>Código:</strong> FOR-SST-050</td>
                <td rowspan="3" style="border: 1px solid #777; text-align: center; font-size: 18px; color: #666; font-weight: normal; letter-spacing: 1px;">COMUNICACIÓN INTERNA</td>
                <td rowspan="3" style="border: 1px solid #777; text-align: center; width: 25%; vertical-align: middle;">
                    <img src="../logo_tym.png" alt="Empresa" style="max-height: 70px; display: block; margin: 0 auto;" />
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid #777; padding: 6px 10px; background-color: #f6b297;"><strong>Versión:</strong> 01</td>
            </tr>
            <tr>
                <td style="border: 1px solid #777; padding: 6px 10px;"><strong>Fecha:</strong> 31-07-2017</td>
            </tr>
        </table>
        <div class="header">
            <div class="logo-container">
                <svg class="logo-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="zentraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#2563eb" />
                            <stop offset="50%" stop-color="#1d4ed8" />
                            <stop offset="100%" stop-color="#3730a3" />
                        </linearGradient>
                    </defs>
                    <rect width="100" height="100" rx="20" fill="url(#zentraGrad)"/>
                    <path d="M25 30H75L25 70H75" stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15 65 L40 45 L55 55 L75 35 L90 40" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="15" cy="65" r="4" fill="white"/>
                    <circle cx="40" cy="45" r="4" fill="white"/>
                    <circle cx="55" cy="55" r="4" fill="white"/>
                    <circle cx="75" cy="35" r="4" fill="white"/>
                    <path d="M85 35 L90 40 L85 45" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
                </svg>
                <div>
                    <div class="logo-text">ZENTRA</div>
                    <div class="logo-sub">Analytics</div>
                </div>
            </div>
            <h1>MANUAL DE USUARIO TÉCNICO Y OPERATIVO</h1>
        </div>
        <p><strong>Usuario:</strong> ${userName}<br>
        <strong>Rol / Área:</strong> ${userRole}</p>

        <h2>1. Acceso y Autenticación (Login)</h2>
        <p>El ingreso a ZENTRA Analytics requiere autenticación mediante el <strong>sistema Multi-Provider</strong>. Debes iniciar sesión con las credenciales asignadas a tu perfil. Al autenticarte, el sistema restringe automáticamente tus vistas y permisos según tu marca (Alpina, Zenú, etc.) y área, garantizando seguridad y confidencialidad.</p>
        
        <h2>2. Carga de Indicadores (Formularios)</h2>
        <ul>
            <li><strong>Módulo de Formularios:</strong> Utiliza el panel de carga rápida para registrar tus KPIs. Todos los formularios adaptan dinámicamente los campos requeridos basados en tu área.</li>
            <li><strong>Validación en Tiempo Real:</strong> Al cargar información, el sistema verificará automáticamente si los datos ingresados cumplen con los rangos esperados para evitar errores de digitación.</li>
        </ul>

        <h2>3. Periodicidad y Filtros Históricos</h2>
        <ul>
            <li><strong>Frecuencia de Carga:</strong> Respeta la periodicidad de tus indicadores (Diaria, Semanal o Mensual). El sistema lleva el rastro de la última vez que actualizaste un dato.</li>
            <li><strong>Cierres Mensuales:</strong> Zentra Analytics emplea un mecanismo de reinicio y filtrado mensual. Al cambiar de ciclo, los tableros se actualizan reflejando el periodo en curso.</li>
            <li><strong>Datos Históricos:</strong> El módulo de reportes consolidados te permite auditar información pasada filtrando exclusivamente por la marca y periodo que tienes autorizado gestionar.</li>
        </ul>

        <h2>4. Monitoreo y Calculadora de Metas</h2>
        <ul>
            <li><strong>Semaforización en el Dashboard:</strong> Una vez cargados, tus indicadores se reflejan de inmediato en el tablero principal. Zentra cruza automáticamente tus resultados con la "Meta Esperada" para pre-liquidar si serías acreedor del esquema de bonos vigente.</li>
            <li><strong>Calculadora Predictiva (Proyección):</strong> ZENTRA incorpora una potente calculadora en tiempo real. A medida que pones o simulas los valores de tu gestión, el sistema detecta de forma autónoma el margen de cumplimiento y te proyecta un color: estarás en <strong>Verde</strong> si tu tendencia cumple con el estándar, o en <strong>Rojo</strong> si existe una desviación negativa. Úsala proactivamente para entender cuánto esfuerzo falta para la meta ideal.</li>
        </ul>

        <p style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 14px;"><strong>Fin del Manual de Usuario</strong></p>
    </div>

    <!-- ACTA DE COMPROMISO -->
    <div class="page">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; color: #444; font-family: sans-serif;">
            <tr>
                <td style="border: 1px solid #777; padding: 6px 10px; width: 25%;"><strong>Código:</strong> FOR-SST-050</td>
                <td rowspan="3" style="border: 1px solid #777; text-align: center; font-size: 18px; color: #666; font-weight: normal; letter-spacing: 1px;">COMUNICACIÓN INTERNA</td>
                <td rowspan="3" style="border: 1px solid #777; text-align: center; width: 25%; vertical-align: middle;">
                    <img src="../logo_tym.png" alt="Empresa" style="max-height: 70px; display: block; margin: 0 auto;" />
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid #777; padding: 6px 10px; background-color: #f6b297;"><strong>Versión:</strong> 01</td>
            </tr>
            <tr>
                <td style="border: 1px solid #777; padding: 6px 10px;"><strong>Fecha:</strong> 31-07-2017</td>
            </tr>
        </table>
        <div class="header">
            <div class="logo-container">
                <svg class="logo-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="zentraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#2563eb" />
                            <stop offset="50%" stop-color="#1d4ed8" />
                            <stop offset="100%" stop-color="#3730a3" />
                        </linearGradient>
                    </defs>
                    <rect width="100" height="100" rx="20" fill="url(#zentraGrad)"/>
                    <path d="M25 30H75L25 70H75" stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15 65 L40 45 L55 55 L75 35 L90 40" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="15" cy="65" r="4" fill="white"/>
                    <circle cx="40" cy="45" r="4" fill="white"/>
                    <circle cx="55" cy="55" r="4" fill="white"/>
                    <circle cx="75" cy="35" r="4" fill="white"/>
                    <path d="M85 35 L90 40 L85 45" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
                </svg>
                <div>
                    <div class="logo-text">ZENTRA</div>
                    <div class="logo-sub">Analytics</div>
                </div>
            </div>
            <h1>ACTA DE SOCIALIZACIÓN Y COMPROMISO DE INDICADORES</h1>
        </div>
        
        <p style="text-align: right;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CO')}</p>

        <p>Yo, <strong>${userName}</strong>, en calidad de <strong>${userRole}</strong>, hago constar por medio de este documento que he sido informado/a y capacitado/a en el uso del panel de indicadores <strong>ZENTRA Analytics</strong>, y que asumo la responsabilidad sobre los siguientes KPIs (Key Performance Indicators) y sus respectivas metas y bonificaciones:</p>

        <table>
            <thead>
                <tr>
                    <th>Indicador</th>
                    <th>Meta Esperada</th>
                    <th>Bono Asignado</th>
                </tr>
            </thead>
            <tbody>
                ${parseFloatLines(kpis)}
            </tbody>
        </table>

        <p style="margin-top: 20px;">Comprendo que el cumplimiento de estas metas está directamente asociado al esquema de bonos estipulado y que es mi deber velar por el reporte oportuno y la veracidad de la información.</p>

        <p>Para constancia, se firma la presente acta:</p>

        <div class="signature-box">
            <div class="sig-line">
                Firma Colaborador(a)<br>
                ${userName}
            </div>
            <div class="sig-line">
                Firma Liderazgo / RH<br>
                Zentra Analytics 2026
            </div>
        </div>
    </div>

</body>
</html>
`;

function parseFloatLines(kpis) {
    return kpis.map(k => `
        <tr>
            <td>${k.name}</td>
            <td>${k.meta}</td>
            <td><strong>${k.bonus}</strong></td>
        </tr>
    `).join('');
}

users.forEach(u => {
    let html = templateHTML(u.name, u.role, u.kpis);
    let filename = `Documentos_${u.name.replace(/ /g, '_')}.html`;
    const fPath = path.join(mainFolder, filename);
    fs.writeFileSync(fPath, html, 'utf8');
    console.log("Generado:", filename);
});

console.log("Todos los documentos generados exitosamente en la carpeta:", mainFolder);
