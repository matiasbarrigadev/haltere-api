'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserSession {
  bonus_balance: number;
}

export default function MemberWalletPage() {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem('haltere_user_session');
    if (session) setUser(JSON.parse(session));
  }, []);

  const transactions = [
    { id: 1, type: 'purchase', description: 'Compra de 50 bonos', amount: 50, date: '2026-02-03', balance_after: 150 },
    { id: 2, type: 'spend', description: 'Personal Training con Carlos', amount: -15, date: '2026-02-01', balance_after: 100 },
    { id: 3, type: 'spend', description: 'Clase de Yoga', amount: -8, date: '2026-01-28', balance_after: 115 },
    { id: 4, type: 'refund', description: 'Reembolso - Clase cancelada', amount: 10, date: '2026-01-25', balance_after: 123 },
    { id: 5, type: 'purchase', description: 'Compra de 100 bonos', amount: 100, date: '2026-01-20', balance_after: 113 },
    { id: 6, type: 'spend', description: 'Masaje Deportivo', amount: -20, date: '2026-01-18', balance_after: 13 },
    { id: 7, type: 'purchase', description: 'Bono bienvenida', amount: 33, date: '2026-01-15', balance_after: 33 },
  ];

  const stats = {
    totalPurchased: 183,
    totalSpent: 43,
    totalRefunded: 10,
    currentBalance: user?.bonus_balance || 150
  };

  const getTypeStyle = (type: string) => {
    const styles: Record<string, { bg: string; color: string; icon: string }> = {
      purchase: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', icon: '💰' },
      spend: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: '💸' },
      refund: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', icon: '↩️' },
    };
    return styles[type] || styles.purchase;
  };

  if (!user) return null;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Mi Wallet</h1>
        <p style={{ color: '#888888', fontSize: '15px' }}>Historial de transacciones y balance de bonos</p>
      </div>

      {/* Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1510 0%, #111111 100%)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px'
      }}>
        <div>
          <div style={{ color: '#888888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Balance Actual
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ color: '#d4af37', fontSize: '48px', fontWeight: 700 }}>{stats.currentBalance}</span>
            <span style={{ color: '#888888', fontSize: '18px' }}>bonos</span>
          </div>
          <Link href="/member/bonos" style={{
            display: 'inline-block',
            marginTop: '16px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #d4af37 0%, #b8963a 100%)',
            color: '#0a0a0a',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600
          }}>
            Comprar Más Bonos
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div style={{ backgroundColor: '#0a0a0a', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
            <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: 700 }}>+{stats.totalPurchased}</div>
            <div style={{ color: '#666666', fontSize: '11px', marginTop: '4px' }}>Comprados</div>
          </div>
          <div style={{ backgroundColor: '#0a0a0a', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
            <div style={{ color: '#ef4444', fontSize: '24px', fontWeight: 700 }}>-{stats.totalSpent}</div>
            <div style={{ color: '#666666', fontSize: '11px', marginTop: '4px' }}>Gastados</div>
          </div>
          <div style={{ backgroundColor: '#0a0a0a', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
            <div style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 700 }}>+{stats.totalRefunded}</div>
            <div style={{ color: '#666666', fontSize: '11px', marginTop: '4px' }}>Reembolsados</div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div style={{
        backgroundColor: '#111111',
        borderRadius: '20px',
        border: '1px solid #1a1a1a',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '20px' }}>📜</span>
          <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>Historial de Transacciones</span>
        </div>
        <div>
          {transactions.map((tx, i) => {
            const style = getTypeStyle(tx.type);
            return (
              <div key={tx.id} style={{
                padding: '20px 24px',
                borderBottom: i < transactions.length - 1 ? '1px solid #1a1a1a' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: style.bg,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {style.icon}
                  </div>
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>{tx.description}</div>
                    <div style={{ color: '#666666', fontSize: '12px', marginTop: '4px' }}>
                      {new Date(tx.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    color: tx.amount > 0 ? '#22c55e' : '#ef4444',
                    fontSize: '18px',
                    fontWeight: 600
                  }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                  <div style={{ color: '#666666', fontSize: '11px', marginTop: '2px' }}>
                    Balance: {tx.balance_after}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}