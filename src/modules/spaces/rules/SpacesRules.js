const zod = require('zod')

const memberRoleEnum = zod.enum(['OWNER', 'ADMIN', 'CONTRIBUTOR', 'LISTENER']);
const spaceTypeEnum = zod.enum(['INTERNAL', 'EXTERNAL']);

const memberSchema = zod.object({
    email: zod.string().email(),
    role: memberRoleEnum,
});

const metadataSchema = zod.object({
    deadline: zod.string().datetime().optional(),
    tags: zod.array(zod.string()).optional(),
    integration_id: zod.string().optional(),
}).optional();


const createSpaceSchema = zod.object({
    name: zod.string().min(1).max(100),
    description: zod.string().optional(),
    type: spaceTypeEnum,
    members: zod.array(memberSchema).min(0),
    metadata: metadataSchema,
});

const addMembersSchema = zod.object({
    members: zod.array(
        zod.object({
            email: zod.string().email(),
            role: zod.enum(['ADMIN', 'CONTRIBUTOR', 'LISTENER']), 
        })
    ).min(1),
});


const validateCreateSpace = (req, res, next) => {
    try {
        const validated = createSpaceSchema.parse(req.body);
        req.validatedData = validated; // attach ke req
        next();
    } catch (error) {
        if (error instanceof zod.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(e => ({
                    path: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
        next(error);
    }
};

const validateAddMembers = (req, res, next) => {
    try {
        const validated = addMembersSchema.parse(req.body);
        req.validatedData = validated;
        next();
    } catch (error) {
        if (error instanceof zod.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(e => ({
                    path: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
        next(error);
    }
};


const validateRemoveMembers = (req, res, next) => {
    const schema = zod.object({
        member_ids: zod.array(zod.string().uuid()).min(1),
    });

    const paramsSchema = zod.object({
        spaceId: zod.string().uuid(),
    });

    try {
        const validatedBody = schema.parse(req.body);
        const validatedParams = paramsSchema.parse(req.params);

        req.validatedData = {
            ...validatedBody,
            spaceId: validatedParams.spaceId,
        };

        next();
    } catch (error) {
        if (error instanceof zod.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
            });
        }
        next(error);
    }
};


const validateUpdateMemberRole = (req, res, next) => {
    const schema = zod.object({
        role: zod.enum(['ADMIN', 'CONTRIBUTOR', 'LISTENER']),
    });

    const paramsSchema = zod.object({
        spaceId: zod.string().uuid(),
        memberId: zod.string().uuid(),
    });

    try {
        const validatedBody = schema.parse(req.body);

        const validatedParams = paramsSchema.parse(req.params);

        req.validatedData = {
            ...validatedBody,
            spaceId: validatedParams.spaceId,
            targetMemberId: validatedParams.memberId,
        };

        if (validatedBody.role === 'OWNER') {
            return res.status(400).json({
                error: 'Cannot assign OWNER role via this endpoint',
            });
        }

        next();
    } catch (error) {
        if (error instanceof zod.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(e => ({
                    path: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
        next(error);
    }
};




module.exports = {
    createSpaceSchema,
    validateCreateSpace,
    memberRoleEnum,
    spaceTypeEnum,
    validateUpdateMemberRole,
    validateAddMembers,
    validateRemoveMembers
};


