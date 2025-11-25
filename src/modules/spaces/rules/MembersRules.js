const zod = require('zod')

const addMembersSchema = zod.object({
    members: zod.array(
        zod.object({
            email: zod.string().email(),
            role: zod.enum(['ADMIN', 'CONTRIBUTOR', 'LISTENER']), 
        })
    ).min(1),
});


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

const validateGetMembers = (req, res, next) => {
    const paramsSchema = zod.object({
        spaceId: zod.string().uuid(),
    });

    try {
        const validated = paramsSchema.parse(req.params);
        req.validatedData = { spaceId: validated.spaceId };
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


module.exports = {
    validateUpdateMemberRole,
    validateAddMembers,
    validateRemoveMembers,
    validateGetMembers
};
