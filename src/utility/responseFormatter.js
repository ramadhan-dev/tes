// src/utils/responseFormatter.js

function formatResponse(data = null, message = 'Success', status = 200) {
    return {
        status,
        message,
        data
    };
}

module.exports = formatResponse;
