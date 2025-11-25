

class SpacesController {
    constructor(spacesService, formatResponse) {
        this.spacesService = spacesService;
        this.formatResponse = formatResponse;
    }


    async create(req, res) {

        try {

            // Get the owner ID from the verified token
            // Usually the token is sent in the Authorization header 
            // and decoded in the authentication middleware
            const ownerId = req.body.user_id;
            const owner = await this.spacesService.findUserById(ownerId);
            if (!owner || !owner.is_internal) {
                return res.status(400).json(this.formatResponse('', 'User Not Found', 400))
            }

            const { name, description, type, members, metadata } = req.validatedData;
            const ownerEmail = owner.email;
            const ownerInMembers = members.find(m => m.email === ownerEmail);


            let finalMembers = [...members];
            if (ownerInMembers) {
                if (ownerInMembers.role !== 'OWNER') {
                    return res.status(400).json(this.formatResponse('', 'Owner must have role OWNER', 400))
                }
            } else {
                finalMembers.push({ email: ownerEmail, role: 'OWNER' });
            }

            if (!['INTERNAL', 'EXTERNAL'].includes(type)) {
                return res.status(400).json(this.formatResponse('', 'Invalid space type', 400))
            }


            const ownerCount = finalMembers.filter(m => m.role === 'OWNER').length;
            if (ownerCount !== 1) {
                return res.status(400).json(this.formatResponse('', 'Exactly one OWNER is required', 400))
            }


            const allMemberEmails = finalMembers.map(m => m.email);
            const existingUsers = await this.spacesService.findUsersByEmails(allMemberEmails);
            const existingEmailSet = new Set(existingUsers.map(u => u.email));

            if (type === 'INTERNAL') {

                /*
                    ! TODO: 
                    The validation can be based on the 'is_internal' field in the database OR email patterns (e.g., @companyName) ,
                */

                const externalUser = existingUsers.find(u => !u.is_internal);
                if (externalUser) {
                    return res.status(400).json(this.formatResponse('', `User ${externalUser.email} is external and cannot be added to an internal space.`, 400))
                }
            } else {
                const existingUsersMap = new Map(existingUsers.map(u => [u.email, u]));
                let hasInternalMember = false;
                
                for (const { email } of finalMembers) {
                    if (existingUsersMap.has(email)) {
                        const user = existingUsersMap.get(email);
                        if (user.is_internal) {
                            hasInternalMember = true;
                            break;
                        }
                    }
                }

                if (!hasInternalMember) {
                    return res.status(400).json(this.formatResponse('', `External Spaces must include at least one internal company member.`, 400))
                }
            }


            const result = await this.spacesService.createSpace(
                name,
                description,
                type,
                finalMembers,
                ownerId,
                metadata
            );

            return res.status(200).json(this.formatResponse(result))


        } catch (error) {
            return res.status(500).json(this.formatResponse('', 'Unexpected error', 500))
        }
    }


    async getAll(req, res) {
        try {
            const userId = req.body.user_id;
            const spaces = await this.spacesService.getAllSpaces(userId);
            return res.status(200).json(this.formatResponse(spaces))
        } catch (error) {
            return res.status(500).json(this.formatResponse('', 'Unexpected error', 500))
        }
    }



    async addMembers(req, res) {
        try {
            const { spaceId } = req.params;
            const { members } = req.validatedData;
            const requesterId = req.body.user_id;

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', `Space not found or you are not a member.`, 404))
            }

            if (space.status !== 'ACTIVE') {
                return res.status(400).json(this.formatResponse('', `Cannot add members to a non-active space.`, 400))
            }

            const allowedRoles = ['OWNER', 'ADMIN'];
            if (!allowedRoles.includes(space.requesterRole)) {
                return res.status(403).json(this.formatResponse('', `Only OWNER or ADMIN can add members.`, 403))
            }

            const emails = members.map(m => m.email);
            const existingUsers = await this.spacesService.findUsersByEmails(emails);
            const existingUserMap = new Map(existingUsers.map(u => [u.email, u]));

        
            for (const { email, role } of members) {

                if (role === 'OWNER') {
                    return res.status(400).json(this.formatResponse('', `Cannot assign OWNER role when adding members.`, 400))
                }

                const isAlreadyMember = await this.spacesService.isMemberOfSpace(spaceId, email);
                if (isAlreadyMember) {
                    continue; 
                }

                const user = existingUserMap.get(email);

                if (!user) {
                    if (space.type === 'INTERNAL') {
                        return res.status(400).json(this.formatResponse('', `User ${email} not found. Cannot add to internal space.`, 400))
                    }
                } else {
                    if (space.type === 'INTERNAL' && !user.is_internal) {
                        return res.status(400).json(this.formatResponse('', `External user ${email} cannot join internal space.`, 400))
                    }
                }
            }

            await this.spacesService.addMembersToSpaceRaw(spaceId, members);

            return res.status(201).json(this.formatResponse({ added_count: members.length }, 'Members added successfully'));
        } catch (error) {
            return res.status(500).json(this.formatResponse('', error.message, 500))
        }
    }


    async removeMembers(req, res) {
        try {
            const { spaceId, member_ids } = req.validatedData;
            const requesterId = req.body.user_id;

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', `Space not found or you are not a member.`, 404))
            }

            if (space.status !== 'ACTIVE') {
                return res.status(400).json(this.formatResponse('', `Cannot remove members from a non-active space.`, 400))
            }

            const requesterRole = space.requesterRole;
            if (!requesterRole || !['OWNER', 'ADMIN'].includes(requesterRole)) {
                return res.status(403).json(this.formatResponse('', `Cannot remove members from a non-active space.`, 403))
            }

            const targetMembers = await this.spacesService.getSpaceMembersByIds(spaceId, member_ids);

            if (targetMembers.length !== member_ids.length) {
                return res.status(400).json(this.formatResponse('', 'One or more members are not part of this space', 400));
            }


            for (const member of targetMembers) {
                if (member.role === 'OWNER') {
                    return res.status(400).json(this.formatResponse('', `Cannot remove OWNER (${member.user.email}) from the space`, 400));
                }

                if (member.user_id === requesterId) {
                    return res.status(400).json(this.formatResponse('', `Cannot remove yourself from the space`, 400));
                }
            }


            await this.spacesService.removeMembersFromSpaceRaw(spaceId, member_ids);
            return res.status(201).json(this.formatResponse({ removed_count: member_ids.length, space_id: spaceId }, 'Members removed successfully'));


        } catch (error) {
            return res.status(500).json(this.formatResponse('', error.message, 500))
        }
    }


    async getSpaceById(req, res) {
        try {
            const { spaceId } = req.params;
            const userId = req.body.user_id;

            const spaceData = await this.spacesService.getSpaceWithMembership(spaceId, userId);
            if (!spaceData) {
                return res.status(404).json(this.formatResponse('', `Space not found or you are not a member.`, 404))
            }

            const { space, requesterRole } = spaceData;

            const members = space.members.map(m => ({
                id: m.user.id,
                name: m.user.name,
                email: m.user.email,
                role: m.role,
            }));
            

            const response = {
                id: space.id,
                name: space.name,
                description: space.description,
                type: space.type, 
                status: space.status, 
                created_at: space.created_at,
                archived_at: space.archived_at,
                owner: {
                    id: space.owner.id,
                    name: space.owner.name,
                },
                current_user_role: requesterRole.role, 
                member_count: space._count.members,
                members
            };

            return res.json(this.formatResponse(response, 'Space retrieved successfully'));

        } catch (error) {
            return res.status(500).json(this.formatResponse('', error.message, 500))
        }
    }



    async updateSpace(req, res){
        try{
            const { spaceId } = req.params;
            const requesterId = req.body.user_id; 
            const { name, description, status, metadata } = req.body;

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', `Space not found or you are not a member.`, 404))
            }

            const allowedRoles = ['OWNER', 'ADMIN'];
            if (!allowedRoles.includes(space.requesterRole)) {
                return res.status(403).json(this.formatResponse('', 'Only OWNER or ADMIN can update this space', 403));
            }

            const updateData = { name, description, status, metadata };
            const updatedSpace = await this.spacesService.updateSpace(spaceId, updateData);

            return res.status(200).json(this.formatResponse(updatedSpace, 'Space updated successfully'));
        } catch(error) {
            return res.status(500).json(this.formatResponse('', error.message, 500))
            
        }
    }



    async archiveSpace(req, res) {
        try {
            const { spaceId } = req.validatedData;
            const requesterId = req.body.user_id; 

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            if (!['OWNER', 'ADMIN'].includes(space.requesterRole)) {
                return res.status(403).json(this.formatResponse('', 'Only OWNER or ADMIN can archive this space', 403));
            }

            if (space.status === 'ARCHIVED') {
                return res.status(400).json(this.formatResponse('', 'Space is already archived', 400));
            }

            const archivedSpace = await this.spacesService.updateSpace(spaceId, { status: 'ARCHIVED' });

            return res.status(200).json(this.formatResponse(
                { id: archivedSpace.id, status: archivedSpace.status, archived_at: archivedSpace.archived_at },
                'Space archived successfully'
            ));

        } catch (error) {
            console.error('Archive space error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }



    async getMembers(req, res) {
        try {
            const { spaceId } = req.validatedData;
            const userId = req.body.user_id; 

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, userId);
            if (!space) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            const members = await this.spacesService.getSpaceMembers(spaceId);

            return res.status(200).json(this.formatResponse({
                space_id: spaceId,
                member_count: members.length,
                members,
            }, 'Members retrieved successfully'));
        } catch (error) {
            console.error('Get members error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }



    async updateMemberRole(req, res) {
        try {
            const { spaceId, targetMemberId, role } = req.validatedData;
            const requesterId = req.body.user_id; 

            const space = await this.spacesService.getSpaceWithRequesterRole(spaceId, requesterId);
            if (!space || !space.requesterRole) {
                return res.status(404).json(this.formatResponse('', 'Space not found or you are not a member', 404));
            }

            if (space.requesterRole !== 'OWNER') {
                return res.status(403).json(this.formatResponse('', 'Only OWNER can change member roles', 403));
            }

            if (targetMemberId === requesterId) {
                return res.status(400).json(this.formatResponse('', 'You cannot change your own role', 400));
            }
           
            const updatedMember = await this.spacesService.updateMemberRole(spaceId, targetMemberId, role);

            return res.status(200).json(this.formatResponse({
                member_id: updatedMember.user_id,
                role: updatedMember.role,
            }, 'Member role updated successfully'));

        } catch (error) {
            console.error('Update member role error:', error);
            return res.status(500).json(this.formatResponse('', error.message || 'Unexpected error', 500));
        }
    }


}

module.exports = SpacesController;
