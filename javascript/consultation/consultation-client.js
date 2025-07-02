const consultation = Vue.createApp({
  data() {
    return {
      selectedStatus: 'Pending',
      consultations: [],
      lawyersMap: {},
      selectedConsultation: null,
      clientId: null,
      loading: false,
      error: null,
      lawyerRecommendation: null,
      showRecommendationPopup: false
    };
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.clientId = urlParams.get('role_id');

    if (!this.clientId) {
      this.error = "Missing client ID (role_id) in URL.";
      return;
    }

    this.loading = true;
    try {
      const res = await fetch(`http://localhost:5500/api/consultations?client_id=${this.clientId}`);
      if (!res.ok) throw new Error('Failed to load consultations');
      const consultationsData = await res.json();
      this.consultations = consultationsData;

      const lawyerIds = [...new Set(this.consultations.map(c => c.lawyer_id))];
      const lawyerPromises = lawyerIds.map(id => fetch(`http://localhost:5500/api/lawyers/${id}`));
      const lawyerResponses = await Promise.all(lawyerPromises);

      const lawyers = [];
      for (const lr of lawyerResponses) {
        if (lr.ok) lawyers.push(await lr.json());
        else lawyers.push(null);
      }

      this.lawyersMap = {};
      for (let i = 0; i < lawyerIds.length; i++) {
        const id = lawyerIds[i];
        const lawyer = lawyers[i];
        if (lawyer) this.lawyersMap[id] = lawyer;
      }
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
    openPopup(consult) {
      this.selectedConsultation = consult;
    },
    closePopup() {
      this.selectedConsultation = null;
    },
    async fetchLawyerRecommendation(consultationId) {
      try {
        const res = await fetch(`http://localhost:5500/api/lawyer-notes-view/${consultationId}`);
        if (!res.ok) throw new Error('Failed to fetch recommendation');
        const data = await res.json();
        this.lawyerRecommendation = data.recommendation || 'No recommendation available.';
        this.showRecommendationPopup = true;
      } catch (error) {
        console.error('Error fetching lawyer recommendation:', error);
        this.lawyerRecommendation = 'Error fetching recommendation.';
        this.showRecommendationPopup = true;
      }
    },
    closeRecommendationPopup() {
      this.showRecommendationPopup = false;
      this.lawyerRecommendation = null;
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
      const d = new Date(dateStr);
      return d.toLocaleDateString();
    }
  },
  template: `
    <div class="consultation__container">
      <div class="consultation__status">
        <button class="consultation__button" :class="{ active: selectedStatus === 'Pending' }" @click="setStatus('Pending')">Pending</button>
        <button class="consultation__button" :class="{ active: selectedStatus === 'Unpaid' }" @click="setStatus('Unpaid')">Unpaid</button>
        <button class="consultation__button" :class="{ active: selectedStatus === 'Upcoming' }" @click="setStatus('Upcoming')">Upcoming</button>
        <button class="consultation__button" :class="{ active: selectedStatus === 'Rejected' }" @click="setStatus('Rejected')">Rejected</button>
        <button class="consultation__button" :class="{ active: selectedStatus === 'Completed' }" @click="setStatus('Completed')">Completed</button>
      </div>

      <div v-if="loading">Loading consultations...</div>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="!loading && filteredConsultations.length === 0" class="consultation-history">
        No consultation records yet.
      </div>

      <div v-for="consult in filteredConsultations" :key="consult.id" class="consultation-card" @click="openPopup(consult)" style="cursor:pointer; border:1px solid #ccc; margin-bottom:10px; padding:10px; border-radius:5px;">
        <div>
          <strong>
            Atty. {{ lawyersMap[consult.lawyer_id]?.first_name || '' }} {{ lawyersMap[consult.lawyer_id]?.last_name || '' }}
          </strong><br>
          Date Issued: {{ formatDate(consult.created_at || consult.consultation_date) }}<br>
          <p>Status: <span :class="statusColor(consult.consultation_status)" style="font-weight:bold;">
             {{ consult.consultation_status }}
          </span></p>
        </div>
      </div>

      <!-- Consultation Details Popup -->
      <div v-if="selectedConsultation" class="modal-overlay" @click.self="closePopup">
        <div class="modal-content">
          <button class="modal-close" @click="closePopup">&times;</button>
          <h3>Consultation Details</h3>
          <p><strong>Atty.</strong> {{ lawyersMap[selectedConsultation.lawyer_id]?.first_name || '' }} {{ lawyersMap[selectedConsultation.lawyer_id]?.last_name || '' }}</p>
          <p><strong>Consultation Category:</strong> {{ selectedConsultation.consultation_category }}</p>
          <p><strong>Description:</strong> {{ selectedConsultation.consultation_description }}</p>
          <p><strong>Consultation Date:</strong> {{ formatDate(selectedConsultation.consultation_date) }}</p>
          <p><strong>Consultation Time:</strong> {{ selectedConsultation.consultation_time }}</p>
          <p><strong>Duration (hours):</strong> {{ selectedConsultation.consultation_duration }}</p>
          <p><strong>Fee (₱):</strong> {{ selectedConsultation.consultation_fee }}</p>
          <p><strong>Mode:</strong> {{ selectedConsultation.consultation_mode }}</p>
          <p><strong>Payment Mode:</strong> {{ selectedConsultation.payment_mode }}</p>
          <p><strong>Consultation Status:</strong> {{ selectedConsultation.consultation_status }}</p>

          <button v-if="selectedConsultation.consultation_status === 'Completed'" @click="fetchLawyerRecommendation(selectedConsultation.consultation_id)" class="view-recommendation-button" style="margin-top:10px;">
            View Recommendation
          </button>
        </div>
      </div>

      <!-- Recommendation Popup -->
      <div v-if="showRecommendationPopup" class="modal-overlay" @click.self="closeRecommendationPopup">
        <div class="modal-content">
          <button class="modal-close" @click="closeRecommendationPopup">&times;</button>
          <h3>Lawyer Recommendation</h3>
          <p>{{ lawyerRecommendation }}</p>
        </div>
      </div>
    </div>
  `
});

consultation.mount('.consultation');
