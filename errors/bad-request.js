import pkg from 'http-status-codes';
import CustomAPIError from './custom-api.js';

const { StatusCodes } = pkg;

class BadRequestError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.BAD_REQUEST;
    }
}

export default BadRequestError;