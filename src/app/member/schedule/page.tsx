'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserSession {
  bonus_balance: number;
  member_status: string;
}

export default function MemberSchedulePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  useEffect(() => {
    const session = sessionStorage.getItem('haltere_user_session');
    if (session) setUser(JSON.parse(session));
  }, []);

  const services = [
    { id: 1, name: 'Personal Training', duration: 60, bonos: 15, icon: '💪', category: 'fitness' },
    { id: 2, name: 'Clase de Yoga', duration: 60, bonos: 8, icon: '🧘', category: 'wellness' },
    { id: 3, name: 'Pilates Mat', duration: 45, bonos: 10, icon: '🤸', category: 'wellness' },
    { id: 4, name: 'Masaje Deportivo', duration: 60, bonos: 20, icon: '💆', category: 'recovery' },
    { id: 5, name: 'Nutrición', duration: 30, bonos: 12, icon: '🥗', category: 'health' },
    { id: 6, name: 'Evaluación Física', duration: 45, bonos: 10, icon: '📊', category: 'assessment' },
  ];

  const locations = [
    { id: 'vitacura', name: 'Haltere Vitacura', address: 'Av. Vitacura 3520' },
    { id: 'las-condes', name: 'Haltere Las Condes', address: 'Av. Las Condes 8920' },
  ];

  const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  const getNextDays = () => {
    const days = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('es-CL', { weekday: 'short' }),
        number: date.getDate(),
        month: date.toLocaleDateString('es-CL', { month: 'short' })
      });
    }
    return days;
  };

  const handleConfirm = () => {
    const service = services.find(s => s.id === selectedService);
    alert(`¡Cita confirmada!\n\nServicio: ${service?.name}\nFecha: ${selectedDate}\nHora: ${selectedTime}\nSede: ${selectedLocation}\n\nSe descontarán ${service?.bonos} bonos de tu cuenta.`);
    router.push('/member/bookings');
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  if (!user) return null;

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Agendar Cita</h1>
        <p style={{ color: '#888888', fontSize: '15px' }}>Selecciona un servicio, fecha y hora para tu próxima sesión</p>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: step >= s ? '#d4af37' : '#1a1a1a',
              color: step >= s ? '#0a0a0a' : '#666666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}>
              {s}
            </div>
            {s < 4 && <div style={{ width: '60px', height: '2px', backgroundColor: step > s ? '#d4af37' : '#1a1a1a', marginLeft: '8px' }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div>
          <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>1. Selecciona un servicio</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                style={{
                  backgroundColor: '#111111',
                  borderRadius: '16px',
                  padding: '20px',
                  border: selectedService === service.id ? '2px solid #d4af37' : '1px solid #1a1a1a',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: selectedService === service.id ? 'rgba(212, 175, 55, 0.2)' : '#0a0a0a',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {service.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: 500 }}>{service.name}</div>
                  <div style={{ color: '#666666', fontSize: '12px', marginTop: '4px' }}>{service.duration} min</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#d4af37', fontSize: '18px', fontWeight: 700 }}>{service.bonos}</div>
                  <div style={{ color: '#666666', fontSize: '10px' }}>bonos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Location */}
      {step === 2 && (
        <div>
          <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>2. Selecciona una sede</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {locations.map((location) => (
              <div
                key={location.id}
                onClick={() => setSelectedLocation(location.id)}
                style={{
                  backgroundColor: '#111111',
                  borderRadius: '16px',
                  padding: '24px',
                  border: selectedLocation === location.id ? '2px solid #d4af37' : '1px solid #1a1a1a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: selectedLocation === location.id ? 'rgba(212, 175, 55, 0.2)' : '#0a0a0a',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>
                  🏢
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>{location.name}</div>
                  <div style={{ color: '#666666', fontSize: '13px', marginTop: '4px' }}>{location.address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Select Date */}
      {step === 3 && (
        <div>
          <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>3. Selecciona fecha y hora</h3>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#888888', fontSize: '13px', marginBottom: '12px' }}>Fecha</div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
              {getNextDays().map((day) => (
                <div
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  style={{
                    minWidth: '72px',
                    padding: '14px 12px',
                    backgroundColor: selectedDate === day.date ? '#d4af37' : '#111111',
                    border: selectedDate === day.date ? 'none' : '1px solid #1a1a1a',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ color: selectedDate === day.date ? '#0a0a0a' : '#888888', fontSize: '11px', textTransform: 'uppercase' }}>{day.day}</div>
                  <div style={{ color: selectedDate === day.date ? '#0a0a0a' : '#ffffff', fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>{day.number}</div>
                  <div style={{ color: selectedDate === day.date ? '#0a0a0a' : '#666666', fontSize: '11px', marginTop: '2px' }}>{day.month}</div>
                </div>
              ))}
            </div>
          </div>
          {selectedDate && (
            <div>
              <div style={{ color: '#888888', fontSize: '13px', marginBottom: '12px' }}>Hora disponible</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {times.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: selectedTime === time ? '#d4af37' : '#111111',
                      border: selectedTime === time ? 'none' : '1px solid #1a1a1a',
                      borderRadius: '10px',
                      color: selectedTime === time ? '#0a0a0a' : '#ffffff',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && selectedServiceData && (
        <div>
          <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>4. Confirmar reserva</h3>
          <div style={{
            backgroundColor: '#111111',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                {selectedServiceData.icon}
              </div>
              <div>
                <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600 }}>{selectedServiceData.name}</div>
                <div style={{ color: '#888888', fontSize: '14px', marginTop: '4px' }}>{selectedServiceData.duration} minutos</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#0a0a0a', borderRadius: '12px', padding: '16px' }}>
                <div style={{ color: '#888888', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Fecha</div>
                <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>
                  {new Date(selectedDate).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', borderRadius: '12px', padding: '16px' }}>
                <div style={{ color: '#888888', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Hora</div>
                <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>{selectedTime}</div>
              </div>
              <div style={{ backgroundColor: '#0a0a0a', borderRadius: '12px', padding: '16px', gridColumn: 'span 2' }}>
                <div style={{ color: '#888888', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Sede</div>
                <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>
                  {locations.find(l => l.id === selectedLocation)?.name}
                </div>
              </div>
            </div>
            <div style={{
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ color: '#888888', fontSize: '12px' }}>Costo</div>
                <div style={{ color: '#d4af37', fontSize: '24px', fontWeight: 700 }}>{selectedServiceData.bonos} bonos</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#888888', fontSize: '12px' }}>Tu balance</div>
                <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600 }}>{user.bonus_balance} bonos</div>
                <div style={{ color: '#22c55e', fontSize: '11px', marginTop: '2px' }}>
                  Restante: {user.bonus_balance - selectedServiceData.bonos} bonos
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '16px' }}>
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              padding: '14px 28px',
              backgroundColor: '#111111',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            ← Atrás
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={(step === 1 && !selectedService) || (step === 2 && !selectedLocation) || (step === 3 && (!selectedDate || !selectedTime))}
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #d4af37 0%, #b8963a 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#0a0a0a',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: ((step === 1 && !selectedService) || (step === 2 && !selectedLocation) || (step === 3 && (!selectedDate || !selectedTime))) ? 0.5 : 1
            }}
          >
            Continuar →
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ✓ Confirmar Reserva
          </button>
        )}
      </div>
    </div>
  );
}