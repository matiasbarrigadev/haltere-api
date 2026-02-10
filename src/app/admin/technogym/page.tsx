'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

interface ConfigStatus {
  configured: boolean;
  apiKey: boolean;
  username: boolean;
  password: boolean;
  facilityUrl: boolean;
  environment: string;
  baseUrl: string;
}

interface TechnogymUser {
  userId: string;
  facilityUserId: string;
  permanentToken?: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CreateUserResult {
  userId: string;
  facilityUserId: string;
  permanentToken: string;
  result: 'Created' | 'AlreadyExists';
}

interface ImportRow {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
}

interface ImportResult {
  email: string;
  status: 'success' | 'error' | 'matched';
  message: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  backgroundColor: '#0d0d0d',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
};

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export default function TechnogymAdminPage() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [facilityId, setFacilityId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'lookup' | 'import' | 'sync'>('create');
  
  const [createForm, setCreateForm] = useState({
    firstName: '', lastName: '', email: '', dateOfBirth: '', gender: '' as '' | 'M' | 'F', externalId: '',
    membershipStartOn: new Date().toISOString().split('T')[0],
    membershipExpiresOn: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [createResult, setCreateResult] = useState<CreateUserResult | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [lookupId, setLookupId] = useState('');
  const [lookupType, setLookupType] = useState<'externalId' | 'permanentToken' | 'userId'>('externalId');
  const [lookupResult, setLookupResult] = useState<TechnogymUser | null>(null);
  const [isLooking, setIsLooking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [webhookUrl, setWebhookUrl] = useState('');

  const getAuthHeaders = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');
    return { 'Authorization': `Bearer ${session.access_token}` };
  }, []);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/admin/technogym?action=status', { headers });
      const result = await response.json();
      setConfigStatus(result.data);
      if (result.data?.configured) {
        const testResponse = await fetch('/api/admin/technogym?action=test', { headers });
        if (testResponse.ok) {
          const testResult = await testResponse.json();
          setFacilityId(testResult.data?.facilityId || '');
        }
      }
      setWebhookUrl(`${window.location.origin}/api/technogym/webhook`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    setCreateResult(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/admin/technogym', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'onboard', ...createForm, gender: createForm.gender || undefined }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setCreateResult(result.data);
      setSuccess('Usuario creado en Technogym');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupId.trim()) return;
    setIsLooking(true);
    setError(null);
    setLookupResult(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/admin/technogym?${lookupType}=${lookupId}`, { headers });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'User not found');
      setLookupResult(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsLooking(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows: ImportRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: ImportRow = { firstName: '', lastName: '', email: '' };
        headers.forEach((h, idx) => {
          const v = values[idx] || '';
          if (h.includes('first') || h.includes('nombre')) row.firstName = v;
          else if (h.includes('last') || h.includes('apellido')) row.lastName = v;
          else if (h.includes('email')) row.email = v;
          else if (h.includes('birth') || h.includes('date')) row.dateOfBirth = v;
          else if (h.includes('gender') || h.includes('sexo')) row.gender = v.toUpperCase().startsWith('M') ? 'M' : v.toUpperCase().startsWith('F') ? 'F' : undefined;
        });
        if (row.email && row.firstName) rows.push(row);
      }
      setImportData(rows);
      setImportResults([]);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (importData.length === 0) return;
    setIsImporting(true);
    setImportProgress(0);
    const results: ImportResult[] = [];
    const headers = await getAuthHeaders();
    for (let i = 0; i < importData.length; i++) {
      const row = importData[i];
      try {
        const response = await fetch('/api/admin/technogym', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', ...row }),
        });
        const result = await response.json();
        results.push({
          email: row.email,
          status: response.ok ? (result.data.result === 'AlreadyExists' ? 'matched' : 'success') : 'error',
          message: response.ok ? (result.data.result === 'AlreadyExists' ? 'Vinculado' : 'Creado') : result.error,
        });
      } catch {
        results.push({ email: row.email, status: 'error', message: 'Error de conexión' });
      }
      setImportProgress(Math.round(((i + 1) / importData.length) * 100));
      setImportResults([...results]);
      await new Promise(r => setTimeout(r, 200));
    }
    setIsImporting(false);
    setSuccess(`Importación: ${results.filter(r => r.status !== 'error').length}/${results.length} exitosos`);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setSuccess('URL copiada');
    setTimeout(() => setSuccess(null), 2000);
  };

  if (loading) return <div style={{ padding: '80px', textAlign: 'center', color: '#666' }}>Cargando...</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', margin: 0 }}>🏋️ Technogym Integration</h1>
        <p style={{ color: '#888', fontSize: '14px', margin: '8px 0 0' }}>Server-to-Server API (S2S)</p>
      </div>

      {error && <div style={{ padding: '16px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#ef4444', marginBottom: '24px' }}>⚠️ {error}</div>}
      {success && <div style={{ padding: '16px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', color: '#22c55e', marginBottom: '24px' }}>✅ {success}</div>}

      <div style={{ backgroundColor: '#111', borderRadius: '16px', padding: '24px', border: '1px solid #1a1a1a', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#fff' }}>⚙️ Configuración</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', backgroundColor: '#0d0d0d', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Estado</div>
            <div style={{ color: configStatus?.configured ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{configStatus?.configured ? '● Conectado' : '○ No configurado'}</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#0d0d0d', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Entorno</div>
            <div style={{ color: '#fff' }}>{configStatus?.environment || '-'}</div>
          </div>
          {facilityId && <div style={{ padding: '12px', backgroundColor: '#0d0d0d', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Facility ID</div>
            <div style={{ color: '#d4af37', fontSize: '11px', wordBreak: 'break-all' }}>{facilityId}</div>
          </div>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {(['create', 'lookup', 'import', 'sync'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', backgroundColor: activeTab === tab ? '#00b4d8' : '#1a1a1a',
            border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', cursor: 'pointer'
          }}>
            {tab === 'create' ? '👤 Crear' : tab === 'lookup' ? '🔍 Buscar' : tab === 'import' ? '📥 Importar CSV' : '🔄 Webhooks'}
          </button>
        ))}
      </div>

      {activeTab === 'create' && (
        <div style={{ backgroundColor: '#111', borderRadius: '16px', padding: '24px', border: '1px solid #1a1a1a' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600, color: '#fff' }}>Crear Contacto en Mywellness</h2>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
            Crea un nuevo contacto directamente en Technogym Mywellness. Si incluyes fechas de membresía, se activará como miembro.
          </p>
          <form onSubmit={handleCreateUser}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>Nombre *</label><input type="text" value={createForm.firstName} onChange={e => setCreateForm(f => ({ ...f, firstName: e.target.value }))} required style={inputStyle} placeholder="Juan" /></div>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>Apellido *</label><input type="text" value={createForm.lastName} onChange={e => setCreateForm(f => ({ ...f, lastName: e.target.value }))} required style={inputStyle} placeholder="Pérez" /></div>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>Email *</label><input type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} required style={inputStyle} placeholder="juan@ejemplo.com" /></div>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>External ID</label><input type="text" value={createForm.externalId} onChange={e => setCreateForm(f => ({ ...f, externalId: e.target.value }))} style={inputStyle} placeholder="UUID de Haltere (opcional)" /></div>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>Fecha Nacimiento</label><input type="date" value={createForm.dateOfBirth} onChange={e => setCreateForm(f => ({ ...f, dateOfBirth: e.target.value }))} style={inputStyle} /></div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>Género</label>
                <select value={createForm.gender} onChange={e => setCreateForm(f => ({ ...f, gender: e.target.value as '' | 'M' | 'F' }))} style={inputStyle}>
                  <option value="">No especificado</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#0a0a0a', borderRadius: '10px', border: '1px solid #1a1a1a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <input 
                  type="checkbox" 
                  id="includeMembership"
                  checked={createForm.membershipStartOn !== '' && createForm.membershipExpiresOn !== ''}
                  onChange={e => {
                    if (!e.target.checked) {
                      setCreateForm(f => ({ ...f, membershipStartOn: '', membershipExpiresOn: '' }));
                    } else {
                      setCreateForm(f => ({ 
                        ...f, 
                        membershipStartOn: new Date().toISOString().split('T')[0],
                        membershipExpiresOn: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      }));
                    }
                  }}
                  style={{ width: '18px', height: '18px', accentColor: '#00b4d8' }}
                />
                <label htmlFor="includeMembership" style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                  Incluir membresía (convertir en miembro)
                </label>
              </div>
              
              {(createForm.membershipStartOn || createForm.membershipExpiresOn) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                  <div><label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>Inicio Membresía</label><input type="date" value={createForm.membershipStartOn} onChange={e => setCreateForm(f => ({ ...f, membershipStartOn: e.target.value }))} style={inputStyle} /></div>
                  <div><label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>Expiración</label><input type="date" value={createForm.membershipExpiresOn} onChange={e => setCreateForm(f => ({ ...f, membershipExpiresOn: e.target.value }))} style={inputStyle} /></div>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={isCreating || !configStatus?.configured} style={{ padding: '12px 24px', backgroundColor: isCreating ? '#333' : '#00b4d8', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: isCreating ? 'not-allowed' : 'pointer' }}>
                {isCreating ? 'Creando...' : createForm.membershipStartOn ? '➕ Crear Miembro' : '➕ Crear Contacto'}
              </button>
            </div>
          </form>
          
          {createResult && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.3)' }}>
              <div style={{ color: '#22c55e', fontWeight: 600, marginBottom: '8px' }}>
                ✅ {createResult.result === 'Created' ? 'Contacto creado' : 'Contacto ya existía - vinculado'} en Mywellness
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                <div><span style={{ color: '#666' }}>User ID:</span> <code style={{ color: '#00b4d8' }}>{createResult.userId}</code></div>
                <div><span style={{ color: '#666' }}>Facility User ID:</span> <code style={{ color: '#00b4d8' }}>{createResult.facilityUserId}</code></div>
                <div style={{ marginTop: '8px', wordBreak: 'break-all' }}>
                  <span style={{ color: '#666' }}>Permanent Token:</span><br />
                  <code style={{ color: '#d4af37', fontSize: '10px' }}>{createResult.permanentToken}</code>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lookup' && (
        <div style={{ backgroundColor: '#111', borderRadius: '16px', padding: '24px', border: '1px solid #1a1a1a' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#fff' }}>Buscar Usuario</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select value={lookupType} onChange={e => setLookupType(e.target.value as typeof lookupType)} style={{ ...inputStyle, maxWidth: '200px' }}>
              <option value="externalId">External ID (Haltere)</option>
              <option value="userId">User ID (Technogym)</option>
              <option value="permanentToken">Permanent Token</option>
            </select>
            <input type="text" value={lookupId} onChange={e => setLookupId(e.target.value)} placeholder="Buscar..." style={{ ...inputStyle, flex: 1, minWidth: '200px' }} />
            <button onClick={handleLookup} disabled={isLooking || !lookupId.trim()} style={{ padding: '12px 24px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#fff', cursor: isLooking ? 'not-allowed' : 'pointer' }}>
              {isLooking ? '...' : 'Buscar'}
            </button>
          </div>
          {lookupResult && <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#0d0d0d', borderRadius: '10px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{lookupResult.firstName} {lookupResult.lastName}</div>
            <div style={{ color: '#888' }}>{lookupResult.email}</div>
            <div style={{ marginTop: '8px', fontSize: '12px' }}><code style={{ color: '#00b4d8' }}>{lookupResult.userId}</code></div>
          </div>}
        </div>
      )}

      {activeTab === 'import' && (
        <div style={{ backgroundColor: '#111', borderRadius: '16px', padding: '24px', border: '1px solid #1a1a1a' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#fff' }}>📥 Importar desde CSV</h2>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
            Exporta usuarios desde <a href="https://pro.mywellness.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00b4d8' }}>pro.mywellness.com</a> → Contactos → Exportar XLS/CSV.<br />
            Columnas requeridas: firstName/nombre, lastName/apellido, email
          </p>
          <input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx" onChange={handleFileUpload} style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current?.click()} style={{ padding: '12px 24px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}>
            📂 Seleccionar archivo CSV
          </button>
          {importData.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ color: '#888', marginBottom: '12px' }}>{importData.length} usuarios detectados</div>
              <div style={{ maxHeight: '200px', overflow: 'auto', backgroundColor: '#0d0d0d', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
                {importData.slice(0, 10).map((row, i) => <div key={i} style={{ color: '#fff', marginBottom: '4px' }}>{row.firstName} {row.lastName} - {row.email}</div>)}
                {importData.length > 10 && <div style={{ color: '#666' }}>...y {importData.length - 10} más</div>}
              </div>
              <button onClick={handleImport} disabled={isImporting} style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: isImporting ? '#333' : '#00b4d8', border: 'none', borderRadius: '10px', color: '#fff', cursor: isImporting ? 'not-allowed' : 'pointer' }}>
                {isImporting ? `Importando... ${importProgress}%` : `🚀 Importar ${importData.length} usuarios`}
              </button>
            </div>
          )}
          {importResults.length > 0 && (
            <div style={{ marginTop: '20px', maxHeight: '300px', overflow: 'auto' }}>
              {importResults.map((r, i) => (
                <div key={i} style={{ padding: '8px 12px', backgroundColor: r.status === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', borderRadius: '6px', marginBottom: '4px', fontSize: '12px', color: r.status === 'error' ? '#ef4444' : '#22c55e' }}>
                  {r.status === 'success' ? '✅' : r.status === 'matched' ? '🔗' : '❌'} {r.email} - {r.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sync' && (
        <div style={{ backgroundColor: '#111', borderRadius: '16px', padding: '24px', border: '1px solid #1a1a1a' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#fff' }}>🔄 Webhooks - Sincronización en Tiempo Real</h2>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
            Configura este webhook en el portal de Technogym para recibir notificaciones cuando se creen, actualicen o eliminen usuarios.
            Una vez configurado, la sincronización será automática.
          </p>
          <div style={{ padding: '16px', backgroundColor: '#0d0d0d', borderRadius: '10px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Webhook URL</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <code style={{ flex: 1, color: '#00b4d8', wordBreak: 'break-all', fontSize: '13px' }}>{webhookUrl}</code>
              <button onClick={copyUrl} style={{ padding: '8px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>📋 Copiar</button>
            </div>
          </div>
          <div style={{ color: '#888', fontSize: '13px' }}>
            <strong style={{ color: '#fff' }}>Eventos soportados:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
              <li><code>user.created</code> - Usuario creado en Mywellness</li>
              <li><code>user.updated</code> - Usuario actualizado</li>
              <li><code>user.deleted</code> - Usuario eliminado</li>
            </ul>
          </div>
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: '8px', fontSize: '13px', color: '#d4af37' }}>
            💡 <strong>Proceso recomendado:</strong><br />
            1. Hacer una importación inicial con CSV desde pro.mywellness.com<br />
            2. Configurar este webhook en Technogym<br />
            3. A partir de ahí, los cambios se sincronizan automáticamente
          </div>
        </div>
      )}
    </div>
  );
}