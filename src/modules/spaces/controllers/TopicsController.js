

class TopicsController {
    constructor(spacesService, topicsService, formatResponse) {
        this.spacesService = spacesService;
        this.topicsService = topicsService;
        this.formatResponse = formatResponse;
    }

    async createTopic(req, res) {
        try {
            const { spaceId, title, description } = req.validatedData;
            const requesterId = req.body.user_id;

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            const allowedRoles = ['OWNER', 'ADMIN', 'CONTRIBUTOR'];
            if (!allowedRoles.includes(space.requesterRole)) {
                return res.status(403).json(this.formatResponse('', 'Only OWNER, ADMIN, or CONTRIBUTOR can create topics', 403));
            }

            const topic = await this.topicsService.createTopic(spaceId, requesterId, { title, description });

            return res.status(201).json(this.formatResponse(topic, 'Topic created successfully'));

        } catch (error) {
            console.error('Create topic error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }



    async getTopics(req, res) {
        try {
            const { spaceId } = req.validatedData;
            const requesterId = req.body.user_id;

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            const topics = await this.topicsService.getTopicsBySpaceId(spaceId);

            return res.status(200).json(this.formatResponse({
                space_id: spaceId,
                topic_count: topics.length,
                topics,
            }, 'Topics retrieved successfully'));

        } catch (error) {
            console.error('Get topics error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }



    async getTopicById(req, res) {
        try {
            const { spaceId, topicId } = req.validatedData;
            const requesterId = req.body.user_id; 

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            const topic = await this.topicsService.getTopicById(topicId, spaceId);
            if (!topic) {
                return res.status(404).json(this.formatResponse('', 'Topic not found in this space', 404));
            }

            return res.status(200).json(this.formatResponse(topic, 'Topic retrieved successfully'));

        } catch (error) {
            console.error('Get topic by ID error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }


    async updateTopic(req, res) {
        try {
            const { spaceId, topicId, title, description, status } = req.validatedData;
            const requesterId = req.body.user_id; 

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            if (space.status !== 'ACTIVE') {
                return res.status(400).json(this.formatResponse('', 'Cannot update topics in a non-active space', 400));
            }

            const topic = await this.topicsService.getTopicWithAuthor(topicId, spaceId);
            if (!topic) {
                return res.status(404).json(this.formatResponse('', 'Topic not found in this space', 404));
            }

            const isOwnerOrAdmin = ['OWNER', 'ADMIN'].includes(space.requesterRole);
            const isAuthor = topic.author_id === requesterId;

            if (!isOwnerOrAdmin && !isAuthor) {
                return res.status(403).json(this.formatResponse('', 'Only the topic author, SPACE OWNER, or ADMIN can update this topic', 403));
            }

            const updatedTopic = await this.topicsService.updateTopic(topicId, { title, description, status });

            return res.status(200).json(this.formatResponse(updatedTopic, 'Topic updated successfully'));

        } catch (error) {
            console.error('Update topic error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }


    async deleteTopic(req, res) {
        try {
            const { spaceId, topicId } = req.validatedData;
            const requesterId = req.body.user_id; 

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            if (space.status !== 'ACTIVE') {
                return res.status(400).json(this.formatResponse('', 'Cannot delete topics in a non-active space', 400));
            }

            const topic = await this.topicsService.getTopicWithAuthor(topicId, spaceId);
            if (!topic) {
                return res.status(404).json(this.formatResponse('', 'Topic not found in this space', 404));
            }

            const isOwnerOrAdmin = ['OWNER', 'ADMIN'].includes(space.requesterRole);
            const isAuthor = topic.author_id === requesterId;

            if (!isOwnerOrAdmin && !isAuthor) {
                return res.status(403).json(this.formatResponse('', 'Only the topic author, SPACE OWNER, or ADMIN can delete this topic', 403));
            }

            await this.topicsService.deleteTopic(topicId);

            return res.status(200).json(this.formatResponse(null, 'Topic deleted successfully'));

        } catch (error) {
            console.error('Delete topic error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }


    async createReply(req, res) {
        try {
            const { spaceId, topicId, content, is_voice } = req.validatedData;
            const requesterId = req.body.user_id; 

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            const allowedRoles = ['OWNER', 'ADMIN', 'CONTRIBUTOR'];
            if (!allowedRoles.includes(space.requesterRole)) {
                return res.status(403).json(this.formatResponse('', 'Only OWNER, ADMIN, or CONTRIBUTOR can reply to topics', 403));
            }

            const topicExists = await this.topicsService.topicExistsInSpace(topicId, spaceId);
            if (!topicExists) {
                return res.status(404).json(this.formatResponse('', 'Topic not found in this space', 404));
            }

            const reply = await this.topicsService.createReply(topicId, requesterId, { content, is_voice });

            return res.status(201).json(this.formatResponse(reply, 'Reply created successfully'));

        } catch (error) {
            console.error('Create reply error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }



    async getReplies(req, res) {
        try {
            const { spaceId, topicId } = req.validatedData;
            const requesterId = req.body.user_id; 

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            const topicExists = await this.topicsService.topicExistsInSpace(topicId, spaceId);
            if (!topicExists) {
                return res.status(404).json(this.formatResponse('', 'Topic not found in this space', 404));
            }

            const replies = await this.topicsService.getRepliesByTopicId(topicId);

            return res.status(200).json(this.formatResponse({
                topic_id: topicId,
                reply_count: replies.length,
                replies,
            }, 'Replies retrieved successfully'));

        } catch (error) {
            console.error('Get replies error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }


    async getReplyById(req, res) {
        try {
            const { spaceId, topicId, replyId } = req.validatedData;
            const requesterId = req.body.user_id; 

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            const reply = await this.topicsService.getReplyById(replyId, topicId, spaceId);
            if (!reply) {
                return res.status(404).json(this.formatResponse('', 'Reply not found in this topic or space', 404));
            }

            return res.status(200).json(this.formatResponse(reply, 'Reply retrieved successfully'));

        } catch (error) {
            console.error('Get reply by ID error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }


    async updateReply(req, res) {
        try {
            const { spaceId, topicId, replyId, content } = req.validatedData;
            const requesterId = req.body.user_id; 

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            if (space.status !== 'ACTIVE') {
                return res.status(400).json(this.formatResponse('', 'Cannot update replies in a non-active space', 400));
            }

            const reply = await this.topicsService.getReplyWithAuthor(replyId, topicId, spaceId);
            if (!reply) {
                return res.status(404).json(this.formatResponse('', 'Reply not found in this topic or space', 404));
            }

            if (reply.is_voice) {
                return res.status(400).json(this.formatResponse('', 'Voice replies cannot be edited. Please delete and re-record if needed.', 400));
            }

            const isOwnerOrAdmin = ['OWNER', 'ADMIN'].includes(space.requesterRole);
            const isAuthor = reply.author_id === requesterId;

            if (!isOwnerOrAdmin && !isAuthor) {
                return res.status(403).json(this.formatResponse('', 'Only the reply author, SPACE OWNER, or ADMIN can update this reply', 403));
            }

            const updatedReply = await this.topicsService.updateReply(replyId, { content });

            return res.status(200).json(this.formatResponse(updatedReply, 'Reply updated successfully'));

        } catch (error) {
            console.error('Update reply error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }



    async deleteReply(req, res) {
        try {
            const { spaceId, topicId, replyId } = req.validatedData;
            const requesterId = req.body.user_id; 

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            if (space.status !== 'ACTIVE') {
                return res.status(400).json(this.formatResponse('', 'Cannot delete replies in a non-active space', 400));
            }

            const reply = await this.topicsService.getReplyWithAuthor(replyId, topicId, spaceId);
            if (!reply) {
                return res.status(404).json(this.formatResponse('', 'Reply not found in this topic or space', 404));
            }

            const isOwnerOrAdmin = ['OWNER', 'ADMIN'].includes(space.requesterRole);
            const isAuthor = reply.author_id === requesterId;

            if (!isOwnerOrAdmin && !isAuthor) {
                return res.status(403).json(this.formatResponse('', 'Only the reply author, SPACE OWNER, or ADMIN can delete this reply', 403));
            }

            await this.topicsService.deleteReply(replyId);

            return res.status(200).json(this.formatResponse(null, 'Reply deleted successfully'));

        } catch (error) {
            console.error('Delete reply error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }
    

}

module.exports = TopicsController;
