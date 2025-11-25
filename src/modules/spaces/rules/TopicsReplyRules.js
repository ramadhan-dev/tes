const zod = require('zod');

const createReplySchema = zod.object({
    content: zod.string().min(1).max(2000), 
    is_voice: zod.boolean().default(false),
});

const validateCreateReply = (req, res, next) => {
    const bodySchema = createReplySchema;
    const paramsSchema = zod.object({
        spaceId: zod.string().uuid(),
        topicId: zod.string().uuid(),
    });

    try {
        const validatedBody = bodySchema.parse(req.body);
        const validatedParams = paramsSchema.parse(req.params);

        req.validatedData = {
            spaceId: validatedParams.spaceId,
            topicId: validatedParams.topicId,
            content: validatedBody.content,
            is_voice: validatedBody.is_voice,
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


const validateGetReplies = (req, res, next) => {
    const paramsSchema = zod.object({
        spaceId: zod.string().uuid(),
        topicId: zod.string().uuid(),
    });

    try {
        const validated = paramsSchema.parse(req.params);
        req.validatedData = {
            spaceId: validated.spaceId,
            topicId: validated.topicId,
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

const validateGetReplyById = (req, res, next) => {
    const paramsSchema = zod.object({
        spaceId: zod.string().uuid(),
        topicId: zod.string().uuid(),
        replyId: zod.string().uuid(),
    });

    try {
        const validated = paramsSchema.parse(req.params);
        req.validatedData = {
            spaceId: validated.spaceId,
            topicId: validated.topicId,
            replyId: validated.replyId,
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


const updateReplySchema = zod.object({
    content: zod.string().min(1).max(2000),
});

const validateUpdateReply = (req, res, next) => {
    const bodySchema = updateReplySchema;
    const paramsSchema = zod.object({
        spaceId: zod.string().uuid(),
        topicId: zod.string().uuid(),
        replyId: zod.string().uuid(),
    });

    try {
        const validatedBody = bodySchema.parse(req.body);
        const validatedParams = paramsSchema.parse(req.params);

        req.validatedData = {
            spaceId: validatedParams.spaceId,
            topicId: validatedParams.topicId,
            replyId: validatedParams.replyId,
            content: validatedBody.content,
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


const validateDeleteReply = (req, res, next) => {
    const paramsSchema = zod.object({
        spaceId: zod.string().uuid(),
        topicId: zod.string().uuid(),
        replyId: zod.string().uuid(),
    });

    try {
        const validated = paramsSchema.parse(req.params);
        req.validatedData = {
            spaceId: validated.spaceId,
            topicId: validated.topicId,
            replyId: validated.replyId,
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

module.exports = {
    validateCreateReply,
    validateGetReplies,
    validateGetReplyById,
    validateUpdateReply,
    validateDeleteReply
};
