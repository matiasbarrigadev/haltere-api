export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Haltere API</h1>
      <p>Backend para la aplicación móvil de Club Haltere.</p>
      <p>Endpoints disponibles:</p>
      <ul>
        <li><code>/api/health</code> - Estado del servicio</li>
      </ul>
    </main>
  );
}