const consultation = Vue.createApp({
  data() {
    return {
      selectedStatus: 'Pending',
      consultations: [],
      clientsMap: {},
      selectedConsultation: null,
      lawyerId: null,
      loading: false,
      error: null,
      showNotePopup: false,
      noteText: '',
      recommendationText: '',
      lawyerNote: null,
      showNotesPopup: false
    };
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.lawyerId = urlParams.get('role_id');

    if (!this.lawyerId) {
      this.error = "Missing lawyer ID (role_id) in URL.";
      return;
    }

    this.loading = true;
    try {
      const res = await fetch(`http://localhost:5500/consultations?lawyer_id=${this.lawyerId}`);
      if (!res.ok) throw new Error('Failed to load consultations');
      const consultationsData = await res.json();

      this.consultations = consultationsData.map(c => ({
        ...c,
        id: c.id || c.consultation_id
      }));

      const clientIds = [...new Set(this.consultations.map(c => c.client_id))];
      const clientPromises = clientIds.map(id =>
        fetch(`http://localhost:5500/api/clients/${id}`).then(r => r.ok ? r.json() : null)
      );
      const clients = await Promise.all(clientPromises);

      this.clientsMap = {};
      clientIds.forEach((id, i) => {
        if (clients[i]) this.clientsMap[id] = clients[i];
      });
    } catch (err) {
      console.error(err);
      this.error = 'Failed to load consultation data.';
    } finally {
      this.loading = false;
    }
  },
  computed: {
    filteredConsultations() {
      return this.consultations.filter(c => c.consultation_status === this.selectedStatus);
    }
  },
  methods: {
    setStatus(status) {
      this.selectedStatus = status;
      this.selectedConsultation = null;
    },
    closePopup() {
      this.selectedConsultation = null;
    },
    async updateStatus(consultationId, newStatus) {
      const consultation = this.consultations.find(c => c.id === consultationId);
      if (!consultation) return;

      try {
        const res = await fetch(`http://localhost:5500/api/consultations-update/${consultationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consultation_status: newStatus })
        });
        if (!res.ok) throw new Error('Failed to update status');

        consultation.consultation_status = newStatus;
        if (this.selectedConsultation && this.selectedConsultation.id === consultationId) {
          this.selectedConsultation.consultation_status = newStatus;
        }

        if (['Rejected', 'Upcoming', 'Unpaid'].includes(newStatus)) {
          this.closePopup();
        }
      } catch (error) {
        alert('Error updating status: ' + error.message);
      }
    },
    statusColor(status) {
      switch (status) {
        case 'Pending': return 'color-blue';
        case 'Upcoming': return 'color-green';
        case 'Rejected': return 'color-red';
        case 'Unpaid': return 'color-yelloworange';
        case 'Completed': return 'color-purple';
        default: return '';
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    },
    acceptConsultation(consult) {
      const paymentMode = consult.payment_mode?.toLowerCase();
      const newStatus = paymentMode === 'gcash' ? 'Unpaid' : 'Upcoming';
      this.updateStatus(consult.id, newStatus);
    },
    rejectConsultation(consult) {
      this.updateStatus(consult.id, 'Rejected');
    },
    closeNotePopup() {
      this.showNotePopup = false;
    },
    async completeConsultation() {
      const consultationId = this.selectedConsultation.id;
      try {
        const updateRes = await fetch(`http://localhost:5500/api/consultations-update/${consultationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consultation_status: 'Completed' })
        });
        if (!updateRes.ok) throw new Error('Failed to update consultation');

        const noteRes = await fetch('http://localhost:5500/api/lawyer-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consultation_id: consultationId,
            note: this.noteText,
            recommendation: this.recommendationText
          })
        });
        if (!noteRes.ok) throw new Error('Failed to save lawyer note');

        const consultation = this.consultations.find(c => c.id === consultationId);
        if (consultation) consultation.consultation_status = 'Completed';

        this.closeNotePopup();
        this.closePopup();
      } catch (error) {
        alert('Error completing consultation: ' + error.message);
      }
    },
    async fetchLawyerNote(consultationId) {
      try {
        const res = await fetch(`http://localhost:5500/api/lawyer-notes-view/${consultationId}`);
        if (!res.ok) throw new Error('Failed to fetch note');
        const data = await res.json();
        this.lawyerNote = data;
      } catch (error) {
        console.error('Error fetching lawyer note:', error);
        this.lawyerNote = null;
      }
    },
    async openPopup(consult) {
      this.selectedConsultation = consult;
      if (consult.consultation_status === 'Completed') {
        await this.fetchLawyerNote(consult.id);
      } else {
        this.lawyerNote = null;
      }
    },
    openNotePopup(consultation) {
      this.selectedConsultation = consultation;
      this.showNotePopup = true;
      this.noteText = '';
      this.recommendationText = '';
    },
    async openNotesPopup(consultation) {
      this.selectedConsultation = consultation;
      try {
        const res = await fetch(`http://localhost:5500/api/lawyer-notes-view/${consultation.id}`);
        if (!res.ok) throw new Error('Failed to fetch notes');
        this.lawyerNote = await res.json();
      } catch (err) {
        this.lawyerNote = null;
        console.error(err);
      }
      this.showNotesPopup = true;
    },
    closeNotesPopup() {
      this.showNotesPopup = false;
      this.selectedConsultation = null;
    }
  },
  template: `
  <div class="consultation__container">
    <!-- Status Filter -->
    <nav class="consultation__status">
      <button
        v-for="status in ['Pending', 'Unpaid', 'Upcoming', 'Rejected', 'Completed']"
        :key="status"
        class="consultation__button"
        :class="{ active: selectedStatus === status }"
        @click="setStatus(status)"
      >
        {{ status }}
      </button>
    </nav>

    <!-- Loading / Error / Empty -->
    <div v-if="loading" class="loading">Loading consultations...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div
      v-else-if="filteredConsultations.length === 0"
      class="consultation__empty"
    >
      No consultation records yet.
    </div>

    <!-- Consultation Cards -->
    <section
      v-for="consult in filteredConsultations"
      :key="consult.id"
      class="consultation__card"
      @click="openPopup(consult)"
    >
      <div class="consultation-card">
        <strong>
          Client:
          {{ clientsMap[consult.client_id]?.first_name || '' }}
          {{ clientsMap[consult.client_id]?.last_name || '' }}
        </strong>
        <br />
        Date Issued:
        {{ formatDate(consult.created_at || consult.consultation_date) }}
        <br />
        <p>
          Status:
          <span
            :class="['consultation__status-label', statusColor(consult.consultation_status)]"
          >
            {{ consult.consultation_status }}
          </span>
        </p>
      </div>
    </section>

    <!-- Popup Modal -->
    <div v-if="selectedConsultation" class="modal-overlay" @click.self="closePopup">
      <div class="modal-content">
        <button class="modal-close" @click="closePopup">&times;</button>
        <h3>Consultation Details</h3>

        <!-- Client Details -->
        <section>
          <p><strong>Client:</strong>
            {{ clientsMap[selectedConsultation.client_id]?.first_name || 'N/A' }}
            {{ clientsMap[selectedConsultation.client_id]?.last_name || '' }}
          </p>
          <p><strong>Age:</strong> {{ clientsMap[selectedConsultation.client_id]?.age || 'N/A' }}</p>
          <p><strong>Gender:</strong> {{ clientsMap[selectedConsultation.client_id]?.gender || 'N/A' }}</p>
          <p><strong>Address:</strong> {{ clientsMap[selectedConsultation.client_id]?.address || 'N/A' }}</p>
          <p><strong>Marital Status:</strong> {{ clientsMap[selectedConsultation.client_id]?.marital_status || 'N/A' }}</p>
        </section>

        <hr />

        <!-- Consultation Info -->
        <section>
          <p><strong>Category:</strong> {{ selectedConsultation.consultation_category }}</p>
          <p><strong>Description:</strong> {{ selectedConsultation.consultation_description }}</p>
          <p><strong>Date:</strong> {{ formatDate(selectedConsultation.consultation_date) }}</p>
          <p><strong>Time:</strong> {{ selectedConsultation.consultation_time }}</p>
          <p><strong>Duration (hrs):</strong> {{ selectedConsultation.consultation_duration }}</p>
          <p><strong>Fee (₱):</strong> {{ selectedConsultation.consultation_fee }}</p>
          <p><strong>Mode:</strong> {{ selectedConsultation.consultation_mode }}</p>
          <p><strong>Payment Mode:</strong> {{ selectedConsultation.payment_mode }}</p>
          <p><strong>Status:</strong> {{ selectedConsultation.consultation_status }}</p>
        </section>

        <!-- Action Buttons -->
        <div class="consultation__actions" v-if="selectedConsultation.consultation_status === 'Pending'">
          <button class="accept-btn" @click="acceptConsultation(selectedConsultation)">Accept</button>
          <button class="reject-btn" @click="rejectConsultation(selectedConsultation)">Reject</button>
        </div>

        <div class="consultation__actions" v-else-if="selectedConsultation.consultation_status === 'Upcoming'">
          <button class="add-note-btn" @click="openNotePopup(selectedConsultation)">
            Add Notes & Recommendation
          </button>
        </div>

        <div v-else-if="selectedConsultation.consultation_status === 'Completed'">
          <button @click="openNotesPopup(selectedConsultation)">View Notes</button>
        </div>

        <!-- Note & Recommendation Popup -->
        <!-- Add Notes & Recommendations Popup -->
        <div v-if="showNotePopup" class="popup-overlay">
          <div class="modal-content">
            <h3>Add Notes and Recommendations</h3>
            <label>
              Notes:
              <textarea v-model="noteText" placeholder="Enter notes..."></textarea>
            </label>
            <label>
              Recommendations:
              <textarea v-model="recommendationText" placeholder="Enter recommendations..."></textarea>
            </label>
            <div class="popup-buttons">
              <button @click="completeConsultation">Save</button>
              <button @click="closeNotePopup">Cancel</button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- View Notes Popup -->
    <div v-if="showNotesPopup" class="modal-overlay" @click.self="closeNotesPopup">
      <div class="modal-content">
        <button class="modal-close" @click="closeNotesPopup">&times;</button>
        <h3>Consultation Notes & Recommendation</h3>

        <div v-if="lawyerNote">
          <p><strong>Note:</strong></p>
          <p>{{ lawyerNote.note || 'No notes available.' }}</p>

          <p><strong>Recommendation:</strong></p>
          <p>{{ lawyerNote.recommendation || 'No recommendations available.' }}</p>
        </div>
        <div v-else>
          <p>No notes found for this consultation.</p>
        </div>
      </div>
    </div>

  </div>
`
});

consultation.mount('.consultation');
