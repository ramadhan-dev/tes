const express = require('express');
const PrismaClientFactory = require(process.cwd() + '/src/database/prismaClientFactory');
const SpacesService = require('../services/SpacesService');
const TopicsService = require('../services/TopicsService');
const SpacesController = require('../controllers/SpacesController');
const TopicsController = require('../controllers/TopicsController');
const formatResponse = require(process.cwd() + '/src/utility/responseFormatter');
const { validateCreateSpace, validateUpdateSpace, validateArchiveSpace } = require('../rules/SpacesRules');
const { validateAddMembers, validateRemoveMembers, validateGetMembers, validateUpdateMemberRole } = require('../rules/MembersRules');
const { validateCreateTopic, validateGetTopics, validateGetTopicById, validateUpdateTopic, validateDeleteTopic } = require('../rules/TopicsRules');
const { validateCreateReply, validateGetReplies, validateGetReplyById, validateUpdateReply, validateDeleteReply } = require('../rules/TopicsReplyRules');



const router = express.Router();

const prismaDB = PrismaClientFactory.createInstanceDB();

const spacesService = new SpacesService(prismaDB);
const spacesController = new SpacesController(spacesService, formatResponse);

const topicsService = new TopicsService(prismaDB);
const topicsController = new TopicsController(spacesService, topicsService, formatResponse);

// SPACES
router.post('/create', validateCreateSpace, spacesController.create.bind(spacesController));
router.get('/getAll', spacesController.getAll.bind(spacesController) );
router.get('/:spaceId', spacesController.getSpaceById.bind(spacesController) );
router.patch('/:spaceId', validateUpdateSpace, spacesController.updateSpace.bind(spacesController) );
router.post('/:spaceId/archive', validateArchiveSpace, spacesController.archiveSpace.bind(spacesController) );

// MEMBERS
router.post('/:spaceId/members', validateAddMembers, spacesController.addMembers.bind(spacesController) );
router.delete('/:spaceId/members', validateRemoveMembers, spacesController.removeMembers.bind(spacesController) );
router.get('/:spaceId/members', validateGetMembers, spacesController.getMembers.bind(spacesController) );
router.patch('/:spaceId/members/:memberId/role', validateUpdateMemberRole, spacesController.updateMemberRole.bind(spacesController) );

// TOPICS
router.post('/:spaceId/topics', validateCreateTopic, topicsController.createTopic.bind(topicsController));
router.get('/:spaceId/topics', validateGetTopics, topicsController.getTopics.bind(topicsController));
router.get('/:spaceId/topics/:topicId', validateGetTopicById, topicsController.getTopicById.bind(topicsController));
router.patch('/:spaceId/topics/:topicId', validateUpdateTopic, topicsController.updateTopic.bind(topicsController));
router.delete('/:spaceId/topics/:topicId', validateDeleteTopic, topicsController.deleteTopic.bind(topicsController));


router.post('/:spaceId/topics/:topicId/replies', validateCreateReply, topicsController.createReply.bind(topicsController) );
router.get('/:spaceId/topics/:topicId/replies', validateGetReplies, topicsController.getReplies.bind(topicsController) );
router.get('/:spaceId/topics/:topicId/replies/:replyId', validateGetReplyById, topicsController.getReplyById.bind(topicsController) );
router.patch('/:spaceId/topics/:topicId/replies/:replyId',validateUpdateReply, topicsController.updateReply.bind(topicsController));
router.delete('/:spaceId/topics/:topicId/replies/:replyId',validateDeleteReply,topicsController.deleteReply.bind(topicsController));

module.exports = router;

