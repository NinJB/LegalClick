/*******************************************************************************************************************/
/*Javascript for navigation bar*/
/*******************************************************************************************************************/

const app = Vue.createApp({
    template: `
        <div class="navbar__container">
            <!--Navigation bar-->
            <nav class="navbar" aria-label="Main navigation">

                <!--Search button-->
                <div class="navbar__item">
                    <button class="navbar__button" aria-label="Search Page">
                        <a href="/html/superadmin/lawyers.html" class="navbar__link">Lawyers</a>
                    </button>
                </div>

                <!--Search button-->
                <div class="navbar__item">
                    <button class="navbar__button" aria-label="Search Page">
                        <a href="/html/superadmin/clients.html" class="navbar__link">Clients</a>
                    </button>
                </div>

                <!--Consultation button-->
                <div class="navbar__item">
                    <button class="navbar__button" aria-label="Admins">
                        <a href="/html/superadmin/admin.html" class="navbar__link">Admins</a>
                    </button>
                </div>
                
                <!--Calendar button-->
                <div class="navbar__item">
                    <button class="navbar__button" aria-label="Calendar Page">
                        <a href="/html/superadmin/reports.html" class="navbar__link">Reports</a>
                    </button>
                </div>

                <!--Messages button-->
                <div class="navbar__item">
                    <button class="navbar__button" aria-label="Messages Page">
                        <a href="/html/admins/login.html" class="navbar__link">Log Out</a>
                    </button>
                </div>
            </nav>
        </div>
    `
});

/*Insert to client dashboard navigation*/
app.mount('.navigation');
/*******************************************************************************************************************/