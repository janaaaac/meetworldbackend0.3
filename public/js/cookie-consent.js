// Cookie Consent Management for AdSense Compliance
class CookieConsent {
    constructor() {
        this.consentKey = 'meetworld_cookie_consent';
        this.analyticsKey = 'meetworld_analytics_consent';
        this.adsKey = 'meetworld_ads_consent';
        this.init();
    }

    init() {
        // Check if consent has already been given
        if (!this.hasConsent()) {
            this.showConsentBanner();
        } else {
            this.loadConsentedServices();
        }
    }

    hasConsent() {
        return localStorage.getItem(this.consentKey) === 'true';
    }

    getAnalyticsConsent() {
        return localStorage.getItem(this.analyticsKey) === 'true';
    }

    getAdsConsent() {
        return localStorage.getItem(this.adsKey) === 'true';
    }

    showConsentBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-overlay">
                <div class="cookie-consent-modal">
                    <div class="cookie-consent-header">
                        <h3>🍪 Cookie Preferences</h3>
                        <button class="cookie-close" onclick="cookieConsent.hideConsentBanner()">&times;</button>
                    </div>
                    <div class="cookie-consent-content">
                        <p>We use cookies to enhance your experience and show relevant advertisements. Choose your preferences:</p>
                        
                        <div class="cookie-categories">
                            <div class="cookie-category">
                                <div class="cookie-category-header">
                                    <label class="cookie-toggle">
                                        <input type="checkbox" id="essential-cookies" checked disabled>
                                        <span class="cookie-slider"></span>
                                    </label>
                                    <h4>Essential Cookies</h4>
                                </div>
                                <p>Required for basic website functionality and security. Cannot be disabled.</p>
                            </div>
                            
                            <div class="cookie-category">
                                <div class="cookie-category-header">
                                    <label class="cookie-toggle">
                                        <input type="checkbox" id="analytics-cookies">
                                        <span class="cookie-slider"></span>
                                    </label>
                                    <h4>Analytics Cookies</h4>
                                </div>
                                <p>Help us understand how visitors interact with our website by collecting anonymous information.</p>
                            </div>
                            
                            <div class="cookie-category">
                                <div class="cookie-category-header">
                                    <label class="cookie-toggle">
                                        <input type="checkbox" id="advertising-cookies">
                                        <span class="cookie-slider"></span>
                                    </label>
                                    <h4>Advertising Cookies</h4>
                                </div>
                                <p>Used to show you relevant advertisements and measure ad effectiveness. Helps support our free service.</p>
                            </div>
                        </div>
                    </div>
                    <div class="cookie-consent-actions">
                        <button class="cookie-btn cookie-btn-secondary" onclick="cookieConsent.acceptEssential()">Essential Only</button>
                        <button class="cookie-btn cookie-btn-primary" onclick="cookieConsent.acceptAll()">Accept All</button>
                        <button class="cookie-btn cookie-btn-outline" onclick="cookieConsent.savePreferences()">Save Preferences</button>
                    </div>
                    <div class="cookie-consent-footer">
                        <p><a href="privacy_policy.html">Privacy Policy</a> | <a href="meetworld_terms.html">Terms of Service</a></p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(banner);
        this.addConsentStyles();
    }

    hideConsentBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.remove();
        }
    }

    acceptAll() {
        localStorage.setItem(this.consentKey, 'true');
        localStorage.setItem(this.analyticsKey, 'true');
        localStorage.setItem(this.adsKey, 'true');
        this.hideConsentBanner();
        this.loadConsentedServices();
        this.showConsentConfirmation('All cookies accepted. Thank you!');
    }

    acceptEssential() {
        localStorage.setItem(this.consentKey, 'true');
        localStorage.setItem(this.analyticsKey, 'false');
        localStorage.setItem(this.adsKey, 'false');
        this.hideConsentBanner();
        this.showConsentConfirmation('Essential cookies only. You can change this anytime.');
    }

    savePreferences() {
        const analytics = document.getElementById('analytics-cookies').checked;
        const advertising = document.getElementById('advertising-cookies').checked;

        localStorage.setItem(this.consentKey, 'true');
        localStorage.setItem(this.analyticsKey, analytics.toString());
        localStorage.setItem(this.adsKey, advertising.toString());
        
        this.hideConsentBanner();
        this.loadConsentedServices();
        this.showConsentConfirmation('Cookie preferences saved successfully!');
    }

    loadConsentedServices() {
        // Load Google AdSense if ads consent is given
        if (this.getAdsConsent()) {
            this.loadGoogleAds();
            console.log('🎯 AdSense: Ads consent granted - Loading Google AdSense');
        }

        // Load Analytics if analytics consent is given
        if (this.getAnalyticsConsent()) {
            this.loadAnalytics();
            console.log('📊 Analytics: Analytics consent granted');
        }
    }

    loadGoogleAds() {
        // This will be called when AdSense is approved
        if (window.adsbygoogle) {
            return; // Already loaded
        }

        // Add AdSense script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_ID';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);

        // Initialize AdSense
        window.adsbygoogle = window.adsbygoogle || [];
    }

    loadAnalytics() {
        // Placeholder for analytics - can add Google Analytics 4 later
        console.log('Analytics services would be loaded here');
    }

    showConsentConfirmation(message) {
        const notification = document.createElement('div');
        notification.className = 'cookie-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 10001;
            font-weight: 500;
            box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    addConsentStyles() {
        if (document.getElementById('cookie-consent-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'cookie-consent-styles';
        styles.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }

            .cookie-consent-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                animation: fadeIn 0.3s ease-out;
            }

            .cookie-consent-modal {
                background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%);
                border-radius: 20px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid rgba(0, 212, 255, 0.3);
                box-shadow: 0 20px 60px rgba(0, 212, 255, 0.2);
                animation: slideInUp 0.3s ease-out;
            }

            .cookie-consent-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 25px 30px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 20px;
            }

            .cookie-consent-header h3 {
                color: #00d4ff;
                font-size: 1.5rem;
                margin: 0;
                font-weight: 600;
            }

            .cookie-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                font-size: 2rem;
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .cookie-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #ff6b6b;
            }

            .cookie-consent-content {
                padding: 0 30px 20px;
                color: rgba(255, 255, 255, 0.9);
                line-height: 1.6;
            }

            .cookie-categories {
                margin-top: 25px;
            }

            .cookie-category {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s ease;
            }

            .cookie-category:hover {
                border-color: rgba(0, 212, 255, 0.3);
                background: rgba(255, 255, 255, 0.08);
            }

            .cookie-category-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 10px;
            }

            .cookie-category h4 {
                color: #00d4ff;
                margin: 0;
                font-weight: 600;
            }

            .cookie-category p {
                color: rgba(255, 255, 255, 0.7);
                margin: 0;
                font-size: 0.9rem;
            }

            .cookie-toggle {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }

            .cookie-toggle input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .cookie-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.2);
                transition: 0.3s;
                border-radius: 24px;
            }

            .cookie-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
            }

            input:checked + .cookie-slider {
                background-color: #00d4ff;
            }

            input:checked + .cookie-slider:before {
                transform: translateX(26px);
            }

            input:disabled + .cookie-slider {
                background-color: #4CAF50;
                cursor: not-allowed;
            }

            .cookie-consent-actions {
                display: flex;
                gap: 15px;
                padding: 20px 30px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                flex-wrap: wrap;
            }

            .cookie-btn {
                padding: 12px 20px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
                font-size: 0.9rem;
                min-width: 120px;
            }

            .cookie-btn-primary {
                background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                color: #000;
            }

            .cookie-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
            }

            .cookie-btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .cookie-btn-secondary:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .cookie-btn-outline {
                background: transparent;
                color: #00d4ff;
                border: 1px solid #00d4ff;
            }

            .cookie-btn-outline:hover {
                background: rgba(0, 212, 255, 0.1);
            }

            .cookie-consent-footer {
                padding: 15px 30px 25px;
                text-align: center;
                font-size: 0.8rem;
            }

            .cookie-consent-footer a {
                color: #00d4ff;
                text-decoration: none;
            }

            .cookie-consent-footer a:hover {
                text-decoration: underline;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideInUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            @media (max-width: 600px) {
                .cookie-consent-modal {
                    margin: 10px;
                    max-height: 95vh;
                }

                .cookie-consent-header,
                .cookie-consent-content,
                .cookie-consent-actions,
                .cookie-consent-footer {
                    padding-left: 20px;
                    padding-right: 20px;
                }

                .cookie-consent-actions {
                    flex-direction: column;
                }

                .cookie-btn {
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // Method to show cookie preferences again
    showPreferences() {
        this.showConsentBanner();
        // Pre-fill current preferences
        setTimeout(() => {
            const analyticsCheckbox = document.getElementById('analytics-cookies');
            const advertisingCheckbox = document.getElementById('advertising-cookies');
            
            if (analyticsCheckbox) analyticsCheckbox.checked = this.getAnalyticsConsent();
            if (advertisingCheckbox) advertisingCheckbox.checked = this.getAdsConsent();
        }, 100);
    }
}

// Initialize cookie consent when DOM is loaded
let cookieConsent;
document.addEventListener('DOMContentLoaded', () => {
    cookieConsent = new CookieConsent();
});

// Global function to show cookie preferences
function showCookiePreferences() {
    if (cookieConsent) {
        cookieConsent.showPreferences();
    }
}
