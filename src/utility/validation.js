const { fromError } = require('zod-validation-error');
const formatResponse = require('./responseFormatter')


const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        })
        return next()
    } catch (error) {
        const validationError = fromError(error);
        const formatError = await formatErrorMassage(validationError)
        return res.status(400).json(formatResponse(formatError, 'Bad Request', 400))
    }
}


const formatErrorMassage = async (validationError) => {
    let message = [];
    Object.entries(validationError).forEach(([key, value]) => {
        if (key == 'details') {
            value?.map((obj, index) => {
                const errorMessage = { 'key': obj?.path[1], values: obj?.message }
                message.push(errorMessage)
            })
        }
    });
    return message;
}

module.exports = validate