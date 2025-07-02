/*******************************************************************************************************************/
/*Javascript for navigation bar*/
/*******************************************************************************************************************/

const app = Vue.createApp({
  data() {
    return {
      showProfileMenu: false,
      roleId: new URLSearchParams(window.location.search).get('role_id')
    };
  },
  methods: {
    toggleProfileMenu(state) {
      this.showProfileMenu = state;
    }
  },
  template: `
    <div class="layout">
      <!-- Top Navigation -->
      <header class="top-nav">
        <div class="top-nav__right">
          <div class="notification-icon">
            <img src="/images/notif.png" class="nav-logo">
          </div>
          <div class="profile-wrapper" 
               @mouseenter="toggleProfileMenu(true)" 
               @mouseleave="toggleProfileMenu(false)">
            <div class="profile-icon">
              <img src="/images/profile-logo.png" class="nav-logo">
            </div>
            <div v-show="showProfileMenu" class="profile-menu">
              <a :href="'/html/client/profile.html?role_id=' + roleId">Profile</a>
              <a href="/index.html">Logout</a>
            </div>
          </div>
        </div>
      </header>

      <!-- Side Navigation -->
      <aside class="side-nav">
        <nav>
          <a :href="'/html/client/search.html?role_id=' + roleId" class="chosen-dashboard" data-icon="search">
            <div class="icon-wrapper">
              <img src="/images/search-gray.png" class="icon-img" />
              <span class="icon-label">Search</span>
            </div>
          </a>
          <a :href="'/html/client/messages.html?role_id=' + roleId" class="chosen-dashboard" data-icon="message">
            <div class="icon-wrapper">
              <img src="/images/message-gray.png" class="icon-img" />
              <span class="icon-label">Messages</span>
            </div>
          </a>
          <a :href="'/html/client/consultation.html?role_id=' + roleId" class="chosen-dashboard" data-icon="consultation">
            <div class="icon-wrapper">
              <img src="/images/consultation-gray.png" class="icon-img" />
              <span class="icon-label">Consultations</span>
            </div>
          </a>
          <a :href="'/html/client/calendar.html?role_id=' + roleId" class="chosen-dashboard" data-icon="calendar">
            <div class="icon-wrapper">
              <img src="/images/calendar-gray.png" class="icon-img" />
              <span class="icon-label">Calendar</span>
            </div>
          </a>
        </nav>
      </aside>
    </div>
  `
});

app.mount('.navigation');
/*******************************************************************************************************************/
