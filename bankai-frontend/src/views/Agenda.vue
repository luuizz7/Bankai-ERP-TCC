<template>
  <div class="agenda-view">
    <header class="page-header">
      <div>
        <h2>Agenda</h2>
        <p class="text-secondary">Visualize e gerencie seus compromissos.</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" @click="openModal(new Date())">Novo Compromisso</button>
      </div>
    </header>

    <div class="card">
      <div class="calendar-controls">
        <button @click="prevMonth" class="nav-btn">&lt;</button>
        <h3 class="current-month">{{ currentMonthName }} {{ currentYear }}</h3>
        <button @click="nextMonth" class="nav-btn">&gt;</button>
      </div>

      <div class="calendar-header">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
      </div>
      <div class="calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.date.toISOString()"
          class="calendar-day"
          :class="{ 'not-current-month': !day.isCurrentMonth, 'is-today': day.isToday }"
          @click="openModal(day.date)"
        >
          <span class="day-number">{{ day.date.getDate() }}</span>
          <div class="events-container">
            <div v-for="event in day.events" :key="event.id" class="event-item">
              <div class="event-details">
                <span class="event-time">{{ formatEventTime(event.date) }}</span>
                <span class="event-description">{{ event.description }}</span>
              </div>
              <button class="delete-event-btn" @click.stop="deleteAppointment(event.id)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 000 1.5h.3l.815 8.15A1.5 1.5 0 005.357 15h5.285a1.5 1.5 0 001.493-1.35l.815-8.15h.3a.75.75 0 000-1.5H11v-.75A2.25 2.25 0 008.75 1h-1.5A2.25 2.25 0 005 3.25zm2.25-.75a.75.75 0 00-.75.75V4h3v-.75a.75.75 0 00-.75-.75h-1.5z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-backdrop" @click="closeModal">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h4>Compromisso</h4>
          <button @click="closeModal" class="close-btn">Fechar &times;</button>
        </header>
        <div class="modal-body">
          <div class="form-group">
            <label>Data</label>
            <input type="date" v-model="newAppointment.date" />
          </div>
          <div class="form-group-inline">
            <div class="form-group">
              <label>Hora</label>
              <select v-model="newAppointment.hour">
                <option v-for="h in 24" :key="h-1" :value="String(h-1).padStart(2, '0')">{{ String(h-1).padStart(2, '0') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Min</label>
              <select v-model="newAppointment.minute">
                <option v-for="m in minuteOptions" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea v-model="newAppointment.description" rows="4"></textarea>
          </div>
        </div>
        <footer class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Cancelar</button>
          <button @click="saveAppointment" class="btn btn-primary">Salvar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useAuth } from '../auth'; // Verifique o caminho

const auth = useAuth();
const isModalOpen = ref(false);
const currentDate = ref(new Date());
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const minuteOptions = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const appointments = ref([]); // Esta lista agora será preenchida pela API

const newAppointment = reactive({
  date: '',
  hour: '09',
  minute: '00',
  description: ''
});

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());
const currentMonthName = computed(() => currentDate.value.toLocaleString('pt-BR', { month: 'long' }));

// A LÓGICA DE GERAR O CALENDÁRIO FOI MANTIDA
const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();
  const days = [];
  
  for (let i = 0; i < startDayOfWeek; i++) {
    const prevMonthDay = new Date(year, month, i - startDayOfWeek + 1);
    days.push({ date: prevMonthDay, isCurrentMonth: false, events: [] });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const isToday = date.toDateString() === new Date().toDateString();
    const dayEvents = appointments.value.filter(
      app => new Date(app.date).toDateString() === date.toDateString()
    );
    days.push({ date, isCurrentMonth: true, isToday, events: dayEvents });
  }
  
  const gridCells = 42; // 6 semanas * 7 dias
  const remainingCells = gridCells - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDay = new Date(year, month + 1, i);
    days.push({ date: nextMonthDay, isCurrentMonth: false, events: [] });
  }

  return days;
});

// FUNÇÃO ADICIONADA PARA COMUNICAR COM A API
const apiFetch = async (url, options = {}) => {
  const defaultOptions = {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}` }
  };
  const response = await fetch(`http://localhost:5000/api${url}`, { ...defaultOptions, ...options });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Ocorreu um erro');
  }
  return response.status !== 204 ? response.json() : null;
};

// FUNÇÃO ADICIONADA PARA BUSCAR OS COMPROMISSOS
const fetchAppointments = async () => {
  try {
    // No futuro, podemos otimizar para buscar apenas o mês atual
    const data = await apiFetch('/agenda');
    appointments.value = data;
  } catch (err) {
    console.error('Erro ao buscar compromissos:', err);
  }
};

// onMounted AGORA CHAMA A API
onMounted(fetchAppointments);

// watch ADICIONADO PARA ATUALIZAR AO MUDAR DE MÊS
watch(currentDate, fetchAppointments);

const formatDate = (date) => { /* ... (sua função mantida) ... */ };
const formatEventTime = (isoDateString) => { /* ... (sua função mantida) ... */ };

const openModal = (date) => {
  newAppointment.date = formatDate(date);
  newAppointment.description = '';
  newAppointment.hour = '09';
  newAppointment.minute = '00';
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// FUNÇÃO saveAppointment ATUALIZADA
const saveAppointment = async () => {
  if (!newAppointment.description.trim()) {
    alert('A descrição é obrigatória.');
    return;
  }
  const fullDate = `${newAppointment.date}T${newAppointment.hour}:${newAppointment.minute}:00`;
  
  try {
    await apiFetch('/agenda', {
      method: 'POST',
      body: JSON.stringify({
        titulo: newAppointment.description,
        data_inicio: fullDate
      })
    });
    closeModal();
    await fetchAppointments(); // Atualiza a lista com o novo compromisso
  } catch(err) {
    alert(`Erro ao salvar: ${err.message}`);
  }
};

// FUNÇÃO deleteAppointment ATUALIZADA
const deleteAppointment = async (eventId) => {
  if (!confirm('Tem certeza que deseja excluir este compromisso?')) return;

  try {
    await apiFetch(`/agenda/${eventId}`, { method: 'DELETE' });
    await fetchAppointments(); // Atualiza a lista após deletar
  } catch (err) {
    alert(`Erro ao excluir: ${err.message}`);
  }
};

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
};
const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
};
</script>

<style scoped>
/* SEU CSS FOI MANTIDO EXATAMENTE COMO ESTAVA */
.agenda-view {
  padding: 1.5rem;
  font-family: sans-serif;
  color: var(--text-primary);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}
h2 {
  font-size: 1.75rem;
  font-weight: 600;
}
.text-secondary {
  color: var(--text-secondary);
  margin-top: 0.25rem;
}
.card {
  background-color: var(--background-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}
.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.current-month {
  font-size: 1.25rem;
  font-weight: 600;
  text-transform: capitalize;
}
.nav-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}
.nav-btn:hover {
  background-color: var(--background-dark);
  color: var(--text-primary);
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--border-color);
  border: 1px solid var(--border-color);
}
.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 0.5rem;
}
.weekday {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
}
.calendar-day {
  min-height: 120px;
  padding: 0.5rem;
  background-color: var(--background-light);
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.calendar-day:hover {
  background-color: var(--background-dark);
}
.day-number {
  font-weight: 500;
}
.not-current-month {
  opacity: 0.4;
}
.is-today .day-number {
  background-color: var(--accent-color);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-block;
  text-align: center;
  line-height: 24px;
}
.events-container {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.event-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
  padding: 0;
  border-radius: 4px;
  border-left: 3px solid var(--accent-color);
  padding-left: 0.5rem;
}
.event-item:hover .delete-event-btn {
  opacity: 1;
}
.event-details {
  display: flex;
  flex-direction: column;
}
.event-time {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}
.event-description {
  font-size: 0.8rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.delete-event-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 0.25rem;
  border-radius: 4px;
}
.delete-event-btn:hover {
  background-color: #EF4444;
  color: white;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background-color: var(--background-light);
  padding: 1.5rem;
  border-radius: 8px;
  width: 100%;
  max-width: 450px;
  border: 1px solid var(--border-color);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.modal-header h4 {
  font-size: 1.25rem;
  font-weight: 600;
}
.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--background-dark);
  color: var(--text-primary);
}
.form-group-inline {
  display: flex;
  gap: 1rem;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
.btn-primary {
  background-color: var(--accent-color);
  color: #fff;
}
.btn-secondary {
  background-color: var(--background-dark);
  border: 1px solid var(--border-color);
}
</style>