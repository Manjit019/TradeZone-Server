import pkg from 'http-status-codes';
import CustomAPIError from './custom-api.js';

const { statusCodes } = pkg;

class BadRequestError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = statusCodes.BAD_REQUEST;
    }
}

export default BadRequestError;