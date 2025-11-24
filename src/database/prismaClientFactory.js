require(process.cwd() + '/src/database/prismaClientFactory');
const { PrismaClient: PrismaClientDb } = require('../../prisma/generated/database');
const dbConfig = require('./dbConfig');


class PrismaClientFactory {



    static createInstanceDB(env = 'default') {
        const config = dbConfig[env] || dbConfig.default;
        const connection = new PrismaClientDb(config);
        return connection
    }



    


    
}

module.exports = PrismaClientFactory;
