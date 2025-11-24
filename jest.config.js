// jest.config.js
module.exports = {
    // Pola file test
    testMatch: ['<rootDir>/src/test/**/*.test.js'],

    // Mengabaikan direktori tertentu
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],

    // Menggunakan transformasi Babel
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },

    // Mengatur environment
    testEnvironment: 'node',

    // Opsi verbose
    verbose: true,


    // Mengatur waktu timeout
    testTimeout: 10000, // 10 detik

    // Coverage configuration
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    collectCoverageFrom: ['src/**/*.js'],

    // Mencetak laporan coverage
    coverageReporters: ['json', 'lcov', 'text'],
};
