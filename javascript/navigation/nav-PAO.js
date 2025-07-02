/*******************************************************************************************************************/
/*Javascript for navigation bar with role_id support for client dashboard*/
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
          <div class="notification-icon"><img src="/images/notif.png" class="nav-logo"></div>
          <div class="profile-wrapper" 
               @mouseenter="toggleProfileMenu(true)" 
               @mouseleave="toggleProfileMenu(false)">
            <div class="profile-icon"><img src="/images/profile-logo.png" class="nav-logo"></div>
            <div v-show="showProfileMenu" class="profile-menu">
              <a :href="'/html/admins/profile.html?role_id=' + roleId">Profile</a>
              <a href="/index.html">Logout</a>
            </div>
          </div>
        </div>
      </header>

      <!-- Side Navigation -->
      <aside class="side-nav">
        <nav>
          <a :href="'/html/PAO-admin/lawyers.html?role_id=' + roleId" class="chosen-dashboard" data-icon="search">
            <div class="icon-wrapper">
              <img src="/images/search-gray.png" class="icon-img" />
              <span class="icon-label">Search</span>
            </div>
          </a>

          <a :href="'/html/PAO-admin/maintenance.html?role_id=' + roleId" class="chosen-dashboard" data-icon="maintenance">
            <div class="icon-wrapper">
              <img src="/images/maintenance-gray.png" class="icon-img" />
              <span class="icon-label">Maintenance</span>
            </div>
          </a>
        </nav>
      </aside>
    </div>
  `
});

/*Insert to client dashboard navigation*/
app.mount('.navigation');

/*******************************************************************************************************************/
