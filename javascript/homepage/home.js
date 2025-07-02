/*******************************************************************************************************************/
/*Javascript for homepage*/
/*******************************************************************************************************************/

const home = Vue.createApp({
    template: `
        <div class="homepage__container">
            <div class="homepage__welcome">
                <div class="homepage__first">
                    <h6 class="homepage__title">An AI-Powered Lawyer Matching and Online Consultation Platform</h6>
                    <h1 class="homepage__intro">Click into Justice with LegalClick</h1>
                    <h5 class="homepage__description">Every legal challenge is unique. Get personalized legal support that fits your case.</h5>
                </div>

                <div class="homepage__second">
                </div>
            </div>

            <div class="homepage__partnership">
                <div class="homepage__partner--container">
                    <h1 class="homepage__text">IN PARTNERSHIP WITH</h1>
                    <div class="homepage__partners">
                        <div class="homepage__partners--container">
                            <img src="/images/OLBA-logo.jpg" class="homepage__partners--img">
                            <p>OCCIDENTAL LEYTE BAR ASSOCIATION</p>
                        </div>

                        <div class="homepage__partners--container">
                            <img src="/images/PAO-logo.png" class="homepage__partners--img">
                            <p>PUBLIC ATTORNEY'S OFFICE - Ormoc Chapter</p>
                        </div>

                        <div class="homepage__partners--container">
                            <img src="/images/IBP-logo.png" class="homepage__partners--img">
                            <p>INTEGRATED BAR OF THE PHILIPPINES</p>
                        </div>
                    </div>
                    <h1 class="homepage__text">TO DELIVER PROFESSIONAL & TRUSTWORTHY LEGAL SERVICES</h1>
                </div>
            </div>
        </div>

        <footer>
            <div class="homepage__contact-us">
                <h2>Contact Us</h2>
                <p>If you have any questions or need legal assistance, feel free to reach out.</p>
                <ul class="contact-info">
                <li><strong>Email:</strong> support@legalclick.com</li>
                <li><strong>Phone:</strong> (+63) 938 677 5983</li>
                <li><strong>Address:</strong> Ormoc City, Leyte, Philippines 6541</li>
                </ul>
                <div class="footer-bottom">
                &copy; 2025 LegalClick. All rights reserved.
                </div>
            </div>
        </footer>
    `
});

/*Insert to "nav-head" of html files except products.html since I already integrated it in store.js*/
home.mount('.home');
/*******************************************************************************************************************/