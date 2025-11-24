

class SpacesService {
    constructor(prismaClient) {
        this.prisma = prismaClient;
    }


    isInternalEmail(email) {
        return email.endsWith('@company.com');
    }


    async findUserById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }


    async findUsersByEmails(emails) {
        if (emails.length === 0) return [];
        return this.prisma.user.findMany({
            where: {
                email: { in: emails },
            },
            select: { id: true, email: true, is_internal: true },
        });
    }


    async createSpace(name, description, type, finalMembers, ownerId, metadata = {}) {
        return this.prisma.$transaction(async (tx) => {
            const space = await tx.space.create({
                data: {
                    name,
                    description,
                    type,
                    status: 'ACTIVE',
                    owner: { connect: { id: ownerId } },
                    deadline: metadata.deadline ? new Date(metadata.deadline) : null,
                    tags: metadata.tags || [],
                    integration_id: metadata.integration_id || null
                }
            });

            for (const { email, role } of finalMembers) {
                let user = await tx.user.findUnique({ where: { email } });
                if (!user) {
                    user = await tx.user.create({
                        data: {
                            email,
                            name: email.split('@')[0],
                            is_internal: false,
                        }
                    })
                }

                await tx.spaceMember.create({
                    data: {
                        space: { connect: { id: space.id } },
                        user: { connect: { id: user.id } },
                        role,
                    },
                });
            }

            return {
                id: space.id,
                name: space.name,
                type: space.type,
                status: space.status,
                member_count: finalMembers.length,
                created_at: space.created_at,
            };

        })
    }

    async getAllSpaces(userId) {
        const spaceMemberships = await this.prisma.spaceMember.findMany({
            where: {
                user_id: userId,
            },
            include: {
                space: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        type: true,
                        status: true,
                        created_at: true,
                        _count: {
                            select: { members: true },
                        },
                        owner: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                space: {
                    created_at: 'desc',
                },
            },
        });

        return spaceMemberships.map(sm => ({
            id: sm.space.id,
            name: sm.space.name,
            description: sm.space.description,
            type: sm.space.type,
            status: sm.space.status,
            member_count: sm.space._count.members,
            created_at: sm.space.created_at,
            owner: sm.space.owner,
            current_user_role: sm.role,
            archived_at: sm.space.archived_at,
        }));
    }


    async getSpaceWithRequesterRole(spaceId, userId) {
        const space = await this.prisma.space.findUnique({
            where: { id: spaceId },
            include: {
                members: {
                    where: { user_id: userId },
                    select: { role: true },
                },
            },
        });
        if (!space) return null;
        return {
            ...space,
            requesterRole: space.members[0]?.role || null,
        };
    }


    async isMemberOfSpace(spaceId, email) {
        const member = await this.prisma.spaceMember.findFirst({
            where: { space_id: spaceId, user: { email } },
        });
        return !!member;
    }


    async addMembersToSpaceRaw(spaceId, members) {
        console.log("🚀 ~ SpacesService ~ addMembersToSpaceRaw ~ members:", members)
        console.log("🚀 ~ SpacesService ~ addMembersToSpaceRaw ~ spaceId:", spaceId)
        return this.prisma.$transaction(async (tx) => {
            for (const { email, role } of members) {
                const user = await tx.user.findUnique({ where: { email } });
                await tx.spaceMember.create({
                    data: {
                        space_id: spaceId,
                        user_id: user.id,
                        role,
                    },
                });
            }
        });
    }


    async getSpaceMembersByIds(spaceId, memberIds) {
        return this.prisma.spaceMember.findMany({
            where: {
                space_id: spaceId,
                user_id: { in: memberIds },
            },
            include: {
                user: { select: { email: true } },
            },
        });
    }


    async removeMembersFromSpaceRaw(spaceId, memberIds) {
        return this.prisma.spaceMember.deleteMany({
            where: {
                space_id: spaceId,
                user_id: { in: memberIds },
            },
        });
    }


    async getSpaceWithMembership(spaceId, userId) {
        const space = await this.prisma.space.findUnique({
            where: { id: spaceId },
            include: {
                owner: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: { members: true },
                },
                members: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });

        if (!space) return null;

        const requesterMembership = space.members.find(m => m.user_id === userId);
        if (!requesterMembership) return null;

        return {
            space,
            requesterRole: requesterMembership.role,
        };
    }


}

module.exports = SpacesService;
