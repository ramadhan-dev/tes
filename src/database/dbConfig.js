const dbConfig = {
    default: {
        log: ['query', 'info', 'warn', 'error'],
    },
    production: {
        log: ['error'],
    },
    testing: {
        log: ['info', 'warn', 'error']
    }
};

module.exports = dbConfig;
