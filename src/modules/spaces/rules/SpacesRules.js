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


const updateSpaceSchema = zod.object({
    name: zod.string().min(1).max(100).optional(),
    description: zod.string().max(500).optional(),
    status: zod.enum(['ACTIVE', 'ARCHIVED']).optional(),
    metadata: metadataSchema.optional(), 
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



const validateUpdateSpace = (req, res, next) => {
    const paramsSchema = zod.object({
        spaceId: zod.string().uuid(),
    });

    try {
        const validatedBody = updateSpaceSchema.parse(req.body);
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
                details: error.errors.map(e => ({
                    path: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
        next(error);
    }
};


const validateArchiveSpace = (req, res, next) => {
    const paramsSchema = zod.object({
        spaceId: zod.string().uuid(),
    });

    try {
        const validatedParams = paramsSchema.parse(req.params);
        req.validatedData = {
            spaceId: validatedParams.spaceId,
        };
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
    validateUpdateSpace,
    validateArchiveSpace,
};


