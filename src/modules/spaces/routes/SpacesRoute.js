const express = require('express');
const PrismaClientFactory = require(process.cwd() + '/src/database/prismaClientFactory');
const SpacesService = require('../services/SpacesService');
const SpacesController = require('../controllers/SpacesController');
const formatResponse = require(process.cwd() + '/src/utility/responseFormatter');
const { validateCreateSpace, validateAddMembers, validateRemoveMembers } = require('../rules/SpacesRules');



const router = express.Router();

const prismaDB = PrismaClientFactory.createInstanceDB();

const spacesService = new SpacesService(prismaDB);
const spacesController = new SpacesController(spacesService, formatResponse);

router.post(
    '/create', 
    validateCreateSpace, 
    spacesController.create.bind(spacesController)
);

router.get(
    '/getAll', 
    spacesController.getAll.bind(spacesController)
);

router.get(
    '/:spaceId', 
    spacesController.getSpaceById.bind(spacesController)
);

router.post(
    '/:spaceId/members',
    validateAddMembers,
    spacesController.addMembers.bind(spacesController)
);

router.delete(
    '/:spaceId/members',
    validateRemoveMembers,
    spacesController.removeMembers.bind(spacesController)
);


router.patch(
    '/:spaceId',
    spacesController.getSpaceById.bind(spacesController)
);


module.exports = router;

