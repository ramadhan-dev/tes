const zod = require('zod')


const createTopicSchema = zod.object({
    title: zod.string().min(1).max(100),
    description: zod.string().max(500).optional(),
});

const validateCreateTopic = (req, res, next) => {
    const bodySchema = createTopicSchema;
    const paramsSchema = zod.object({
        spaceId: zod.string().uuid(),
    });

    try {
        const validatedBody = bodySchema.parse(req.body);
        const validatedParams = paramsSchema.parse(req.params);

        req.validatedData = {
            spaceId: validatedParams.spaceId,
            title: validatedBody.title,
            description: validatedBody.description,
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


const validateGetTopics = (req, res, next) => {
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



const validateGetTopicById = (req, res, next) => {
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



const updateTopicSchema = zod.object({
    title: zod.string().min(1).max(100).optional(),
    description: zod.string().max(500).optional(),
    status: zod.enum(['OPEN', 'RESOLVED', 'CLOSED']).optional(),
});

const validateUpdateTopic = (req, res, next) => {
    const bodySchema = updateTopicSchema;
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
            ...validatedBody,
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

const validateDeleteTopic = (req, res, next) => {
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



module.exports = {
    validateCreateTopic,
    validateGetTopics,
    validateGetTopicById,
    validateUpdateTopic,
    validateDeleteTopic
};

