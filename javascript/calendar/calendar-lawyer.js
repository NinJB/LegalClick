const calendarApp = Vue.createApp({
    data() {
        const today = new Date();
        return {
            selectedDate: null,
            selectedYear: today.getFullYear(),
            selectedMonth: today.getMonth(),
            appointments: {
                '2025-05-03': [{ time: '10:00 AM', title: 'Client Meeting' }],
                '2025-05-05': [{ time: '1:00 PM', title: 'Consultation with Atty. Cruz' }]
            }
        };
    },
    computed: {
        formattedDate() {
            return this.selectedDate ? new Date(this.selectedDate).toDateString() : 'Select a date';
        },
        dailyAppointments() {
            return this.appointments[this.selectedDate] || [];
        },
        months() {
            return [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
        },
        years() {
            const currentYear = new Date().getFullYear();
            return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
        },
        daysOfWeek() {
            return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        },
        daysInMonthGrid() {
            const year = this.selectedYear;
            const month = this.selectedMonth;

            const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
            const totalDays = new Date(year, month + 1, 0).getDate(); // last day of month

            const grid = [];

            // Add empty cells before 1st of the month
            for (let i = 0; i < firstDay; i++) {
                grid.push(null);
            }

            for (let day = 1; day <= totalDays; day++) {
                const paddedDay = String(day).padStart(2, '0');
                const paddedMonth = String(month + 1).padStart(2, '0');
                const fullDate = `${year}-${paddedMonth}-${paddedDay}`;
                grid.push(fullDate);
            }

            return grid;
        }
    },
    methods: {
        selectDate(date) {
            if (date) this.selectedDate = date;
        }
    },
    template: `
      <div class="calendar__container fadeInUp">
        <div class="calendar__panel">
          <div class="calendar__controls">
            <select v-model="selectedMonth" @change="updateCalendar">
              <option v-for="(month, i) in months" :value="i">{{ month }}</option>
            </select>
            <select v-model="selectedYear" @change="updateCalendar">
              <option v-for="year in years" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="calendar__weekdays">
            <span v-for="day in daysOfWeek" class="weekday">{{ day }}</span>
          </div>
          <div class="calendar__grid">
            <button 
              v-for="day in daysInMonthGrid" 
              :key="day || Math.random()" 
              class="calendar__day"
              :class="{ active: day === selectedDate && day }"
              @click="selectDate(day)"
              :disabled="!day"
            >
              {{ day ? new Date(day).getDate() : '' }}
            </button>
          </div>
        </div>
        <div class="calendar__card">
          <h4>{{ formattedDate }}</h4>
          <ul v-if="dailyAppointments.length">
            <li v-for="appt in dailyAppointments" :key="appt.time">
              <strong>{{ appt.time }}</strong>: {{ appt.title }}
            </li>
          </ul>
          <p v-else>No appointments.</p>
        </div>
      </div>
    `
});

calendarApp.mount('.calendar');
