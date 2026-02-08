'use client';

export default function MemberTechnogymPage() {
  const stats = {
    totalWorkouts: 48,
    totalMinutes: 2340,
    caloriesBurned: 28500,
    currentStreak: 5,
    longestStreak: 12,
    favoriteEquipment: 'Treadmill'
  };

  const recentWorkouts = [
    { id: 1, date: '2026-02-07', type: 'Cardio', duration: 45, calories: 520, equipment: 'Treadmill' },
    { id: 2, date: '2026-02-06', type: 'Strength', duration: 55, calories: 380, equipment: 'Skill Line' },
    { id: 3, date: '2026-02-05', type: 'Cardio', duration: 30, calories: 340, equipment: 'Bike' },
    { id: 4, date: '2026-02-04', type: 'Mixed', duration: 60, calories: 580, equipment: 'Cross Trainer' },
    { id: 5, date: '2026-02-03', type: 'Strength', duration: 50, calories: 320, equipment: 'Skill Line' },
  ];

  const weeklyProgress = [
    { day: 'Lun', minutes: 45, target: 60 },
    { day: 'Mar', minutes: 55, target: 60 },
    { day: 'Mié', minutes: 30, target: 60 },
    { day: 'Jue', minutes: 60, target: 60 },
    { day: 'Vie', minutes: 50, target: 60 },
    { day: 'Sáb', minutes: 0, target: 45 },
    { day: 'Dom', minutes: 0, target: 45 },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
          Mis Resultados Technogym
        </h1>
        <p style={{ color: '#888888', fontSize: '15px' }}>
          Monitorea tu progreso y estadísticas de entrenamiento
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { label: 'Entrenamientos', value: stats.totalWorkouts, icon: '🏋️', color: '#3b82f6' },
          { label: 'Minutos Totales', value: stats.totalMinutes.toLocaleString(), icon: '⏱️', color: '#22c55e' },
          { label: 'Calorías Quemadas', value: stats.caloriesBurned.toLocaleString(), icon: '🔥', color: '#ef4444' },
          { label: 'Racha Actual', value: `${stats.currentStreak} días`, icon: '⚡', color: '#d4af37' },
          { label: 'Racha Máxima', value: `${stats.longestStreak} días`, icon: '🏆', color: '#8b5cf6' },
          { label: 'Favorito', value: stats.favoriteEquipment, icon: '❤️', color: '#ec4899' },
        ].map((stat, i) => (
          <div key={i} style={{
            backgroundColor: '#111111',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: `${stat.color}15`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ color: '#888888', fontSize: '11px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Weekly Progress */}
        <div style={{
          backgroundColor: '#111111',
          borderRadius: '20px',
          border: '1px solid #1a1a1a',
          padding: '24px'
        }}>
          <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>
            📊 Progreso Semanal
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px', gap: '8px' }}>
            {weeklyProgress.map((day, i) => {
              const percentage = Math.min((day.minutes / day.target) * 100, 100);
              const isToday = i === new Date().getDay() - 1;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    flex: 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '100%',
                      maxWidth: '40px',
                      height: `${percentage}%`,
                      minHeight: day.minutes > 0 ? '8px' : '0',
                      backgroundColor: percentage >= 100 ? '#22c55e' : isToday ? '#d4af37' : '#3b82f6',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease'
                    }} />
                  </div>
                  <div style={{
                    marginTop: '12px',
                    padding: '6px 0',
                    borderTop: isToday ? '2px solid #d4af37' : '2px solid transparent',
                    width: '100%',
                    textAlign: 'center'
                  }}>
                    <span style={{ color: isToday ? '#d4af37' : '#888888', fontSize: '12px', fontWeight: isToday ? 600 : 400 }}>
                      {day.day}
                    </span>
                    <div style={{ color: '#666666', fontSize: '10px', marginTop: '2px' }}>
                      {day.minutes}min
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '3px' }} />
              <span style={{ color: '#888888', fontSize: '11px' }}>Meta cumplida</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '3px' }} />
              <span style={{ color: '#888888', fontSize: '11px' }}>En progreso</span>
            </div>
          </div>
        </div>

        {/* Recent Workouts */}
        <div style={{
          backgroundColor: '#111111',
          borderRadius: '20px',
          border: '1px solid #1a1a1a',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a' }}>
            <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>
              ⏱️ Últimos Entrenamientos
            </h3>
          </div>
          <div>
            {recentWorkouts.map((workout, i) => (
              <div key={workout.id} style={{
                padding: '16px 24px',
                borderBottom: i < recentWorkouts.length - 1 ? '1px solid #1a1a1a' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: workout.type === 'Cardio' ? 'rgba(239, 68, 68, 0.15)' : 
                                   workout.type === 'Strength' ? 'rgba(59, 130, 246, 0.15)' : 
                                   'rgba(212, 175, 55, 0.15)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {workout.type === 'Cardio' ? '🏃' : workout.type === 'Strength' ? '💪' : '🔄'}
                  </div>
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>{workout.equipment}</div>
                    <div style={{ color: '#666666', fontSize: '12px', marginTop: '2px' }}>
                      {new Date(workout.date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>{workout.duration} min</div>
                    <div style={{ color: '#666666', fontSize: '11px' }}>duración</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: 600 }}>{workout.calories}</div>
                    <div style={{ color: '#666666', fontSize: '11px' }}>kcal</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technogym Branding */}
      <div style={{
        marginTop: '32px',
        padding: '24px',
        backgroundColor: '#111111',
        borderRadius: '16px',
        border: '1px solid #1a1a1a',
        textAlign: 'center'
      }}>
        <p style={{ color: '#666666', fontSize: '13px', marginBottom: '8px' }}>
          Datos sincronizados con
        </p>
        <div style={{ color: '#888888', fontSize: '18px', fontWeight: 600, letterSpacing: '2px' }}>
          TECHNOGYM MYWELLNESS
        </div>
        <p style={{ color: '#555555', fontSize: '11px', marginTop: '8px' }}>
          Última sincronización: hace 2 horas
        </p>
      </div>
    </div>
  );
}