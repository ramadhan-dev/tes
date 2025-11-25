

class TopicsService {
    constructor(prismaClient) {
        this.prisma = prismaClient;
    }

    async createTopic(spaceId, authorId, { title, description }) {

        const space = await this.prisma.space.findUnique({
            where: { id: spaceId },
            select: { status: true },
        });

        if (!space) {
            throw new Error('Space not found');
        }

        if (space.status !== 'ACTIVE') {
            throw new Error('Cannot create topics in a non-active space');
        }

        return this.prisma.topic.create({
            data: {
                space_id: spaceId,
                author_id: authorId,
                title,
                description,
                status: 'OPEN',
            },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                created_at: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }



    async getTopicsBySpaceId(spaceId) {
        const topics = await this.prisma.topic.findMany({
            where: { space_id: spaceId },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                created_at: true,
                updated_at: true,
                closed_at: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        is_internal: true,
                    },
                },
                _count: {
                    select: { replies: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });

        return topics.map(topic => ({
            ...topic,
            reply_count: topic._count.replies,
        }));
    }


    async getTopicById(topicId, spaceId) {
        const topic = await this.prisma.topic.findFirst({
            where: {
                id: topicId,
                space_id: spaceId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                created_at: true,
                updated_at: true,
                closed_at: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        is_internal: true,
                    },
                },
                _count: {
                    select: { replies: true },
                },
            },
        });

        if (!topic) return null;

        return {
            ...topic,
            reply_count: topic._count.replies,
        };
    }


    async getTopicWithAuthor(topicId, spaceId) {
        return this.prisma.topic.findFirst({
            where: { id: topicId, space_id: spaceId },
            select: {
                id: true,
                author_id: true,
                space_id: true,
            },
        });
    }



    async updateTopic(topicId, updateData) {
        const { title, description, status } = updateData;

        const payload = {};
        if (title !== undefined) payload.title = title;
        if (description !== undefined) payload.description = description;
        if (status !== undefined) {
            payload.status = status;
            if (status === 'CLOSED' || status === 'RESOLVED') {
                payload.closed_at = new Date();
            } else {
                payload.closed_at = null;
            }
        }

        return this.prisma.topic.update({
            where: { id: topicId },
            data: payload,
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                created_at: true,
                updated_at: true,
                closed_at: true,
                author: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }



    async deleteTopic(topicId) {
        const deleted = await this.prisma.topic.delete({
            where: { id: topicId },
            select: { id: true },
        });
        return deleted;
    }


    async topicExistsInSpace(topicId, spaceId) {
        const count = await this.prisma.topic.count({
            where: { id: topicId, space_id: spaceId },
        });
        return count > 0;
    }

    async createReply(topicId, authorId, { content, is_voice }) {
        return this.prisma.topicReply.create({
            data: {
                topic_id: topicId,
                author_id: authorId,
                content,
                is_voice,
            },
            select: {
                id: true,
                content: true,
                is_voice: true,
                created_at: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        is_internal: true,
                    },
                },
            },
        });
    }


    async getRepliesByTopicId(topicId) {
        const replies = await this.prisma.topicReply.findMany({
            where: { topic_id: topicId },
            select: {
                id: true,
                content: true,
                is_voice: true,
                created_at: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        is_internal: true,
                    },
                },
            },
            orderBy: { created_at: 'asc' },
        });

        return replies;
    }



    async getReplyById(replyId, topicId, spaceId) {
        const reply = await this.prisma.topicReply.findFirst({
            where: {
                id: replyId,
                topic: {
                    id: topicId,
                    space_id: spaceId,
                },
            },
            select: {
                id: true,
                content: true,
                is_voice: true,
                created_at: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        is_internal: true,
                    },
                },
            },
        });

        return reply; // null jika tidak ditemukan
    }


    async getReplyWithAuthor(replyId, topicId, spaceId) {
        return this.prisma.topicReply.findFirst({
            where: {
                id: replyId,
                topic: { id: topicId, space_id: spaceId },
            },
            select: {
                id: true,
                is_voice: true,
                author_id: true,
            },
        });
    }


    async updateReply(replyId, { content }) {
        return this.prisma.topicReply.update({
            where: { id: replyId },
            data: { content }, 
            select: {
                id: true,
                content: true,
                is_voice: true,
                created_at: true,
                author: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }


    async deleteReply(replyId) {
        await this.prisma.topicReply.delete({
            where: { id: replyId },
        });
    }

    
}

module.exports = TopicsService;
