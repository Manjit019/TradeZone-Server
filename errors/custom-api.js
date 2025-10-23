

class CustomAPIError extends Error {
    constructor(message, statusCode) {
        super(message);
    }
}

export default CustomAPIError;
