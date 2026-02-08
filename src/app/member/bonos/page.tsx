'use client';

import { useState } from 'react';

export default function MemberBonosPage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  const packages = [
    { id: 1, name: 'Starter', bonos: 30, price: 29990, discount: null, popular: false },
    { id: 2, name: 'Plus', bonos: 60, price: 54990, discount: 8, popular: true },
    { id: 3, name: 'Premium', bonos: 100, price: 84990, discount: 15, popular: false },
    { id: 4, name: 'Elite', bonos: 200, price: 159990, discount: 20, popular: false },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price);
  };

  const handlePurchase = (packageId: number) => {
    // En producción, esto iría a Stripe checkout
    alert(`Redirigiendo a pago... Paquete ID: ${packageId}`);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: 600, marginBottom: '12px' }}>Comprar Bonos</h1>
        <p style={{ color: '#888888', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
          Adquiere bonos para canjear por servicios. Mientras más bonos compres, mayor descuento obtienes.
        </p>
      </div>

      {/* Packages Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            style={{
              backgroundColor: '#111111',
              borderRadius: '20px',
              padding: '28px',
              border: selectedPackage === pkg.id 
                ? '2px solid #d4af37' 
                : pkg.popular 
                  ? '1px solid rgba(212, 175, 55, 0.3)' 
                  : '1px solid #1a1a1a',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              transform: selectedPackage === pkg.id ? 'scale(1.02)' : 'scale(1)'
            }}
          >
            {pkg.popular && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#d4af37',
                color: '#0a0a0a',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 16px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Más Popular
              </div>
            )}
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ color: '#888888', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                {pkg.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                <span style={{ color: '#d4af37', fontSize: '48px', fontWeight: 700 }}>{pkg.bonos}</span>
                <span style={{ color: '#888888', fontSize: '16px' }}>bonos</span>
              </div>
            </div>

            <div style={{
              backgroundColor: '#0a0a0a',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>
                {formatPrice(pkg.price)}
              </div>
              {pkg.discount && (
                <div style={{ color: '#22c55e', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>
                  {pkg.discount}% descuento incluido
                </div>
              )}
              <div style={{ color: '#666666', fontSize: '12px', marginTop: '4px' }}>
                {formatPrice(Math.round(pkg.price / pkg.bonos))} / bono
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePurchase(pkg.id);
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: selectedPackage === pkg.id 
                  ? 'linear-gradient(135deg, #d4af37 0%, #b8963a 100%)'
                  : 'rgba(212, 175, 55, 0.1)',
                border: selectedPackage === pkg.id ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '12px',
                color: selectedPackage === pkg.id ? '#0a0a0a' : '#d4af37',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {selectedPackage === pkg.id ? 'Comprar Ahora' : 'Seleccionar'}
            </button>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div style={{
        backgroundColor: '#111111',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid #1a1a1a'
      }}>
        <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, marginBottom: '24px', textAlign: 'center' }}>
          ¿Por qué comprar bonos?
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          {[
            { icon: '💰', title: 'Ahorra más', description: 'Hasta 20% de descuento en paquetes grandes' },
            { icon: '🔄', title: 'Flexibilidad', description: 'Usa tus bonos en cualquier servicio disponible' },
            { icon: '📅', title: 'Sin caducidad', description: 'Tus bonos no expiran mientras seas miembro' },
            { icon: '⚡', title: 'Reserva al instante', description: 'Confirma tus citas sin procesar pagos' },
          ].map((benefit, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 16px'
              }}>
                {benefit.icon}
              </div>
              <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>
                {benefit.title}
              </div>
              <div style={{ color: '#888888', fontSize: '13px' }}>
                {benefit.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ color: '#666666', fontSize: '12px', marginBottom: '12px' }}>Pago seguro con</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#888888', fontSize: '14px', fontWeight: 500 }}>💳 Tarjetas</span>
          <span style={{ color: '#666666' }}>•</span>
          <span style={{ color: '#888888', fontSize: '14px', fontWeight: 500 }}>🏦 Transferencia</span>
          <span style={{ color: '#666666' }}>•</span>
          <span style={{ color: '#888888', fontSize: '14px', fontWeight: 500 }}>📱 WebPay</span>
        </div>
      </div>
    </div>
  );
}