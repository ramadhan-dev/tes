const helmet = require('helmet');

const helmetConfig = helmet({
    contentSecurityPolicy: {

        /**
         * CSP membantu mencegah serangan seperti Cross- Site Scripting(XSS) dan data injection.
         * Anda dapat mengatur CSP untuk mengontrol sumber daya yang dapat dimuat oleh browser.
         */
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "trusted-scripts.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        }
    },

    /**
     * Header X-Frame-Options digunakan untuk melindungi aplikasi dari serangan clickjacking 
     * dengan mengontrol apakah halaman dapat di-embed dalam iframe.
     */
    frameguard: { action: 'sameorigin' },

    /**
     *  X-Content-Type-Options
     * Header ini membantu melindungi aplikasi dari serangan berbasis MIME-type 
     * dengan memaksa browser untuk mematuhi jenis konten yang ditentukan.
     */
    noSniff: true,

    /**
     * HSTS memaksa browser untuk selalu menggunakan HTTPS alih-alih HTTP, 
     * membantu melindungi dari serangan man-in-the-middle.
     */
    hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true
    },

    /**
     * Header Referrer-Policy mengontrol informasi referer apa yang dikirimkan ke situs lain ketika pengguna mengklik tautan.
     */
    referrerPolicy: { policy: 'no-referrer' },

    /**
     * Header ini digunakan untuk mengontrol kebijakan yang mengizinkan cross-domain content, khususnya untuk aplikasi Adobe Flash.
     */
    permittedCrossDomainPolicies: { permittedPolicies: 'by-content-type' },

    /**
     * Secara default, Express menambahkan header X-Powered-By yang menginformasikan bahwa server menggunakan Express. 
     * Ini bisa disembunyikan untuk mengurangi jejak informasi yang bisa dimanfaatkan oleh penyerang.
     */
    hidePoweredBy: true,

    /**
     * Header ini digunakan untuk mendeteksi dan mencegah kesalahan konfigurasi sertifikat.
     */
    expectCt: {
        enforce: true,
        maxAge: 30
    }
});

module.exports = helmetConfig;
