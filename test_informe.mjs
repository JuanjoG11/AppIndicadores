try {
  const mod = await import('./generar_informe_junio.mjs');
} catch(e) {
  console.error('ERROR:', e.message);
  console.error(e.stack);
}
