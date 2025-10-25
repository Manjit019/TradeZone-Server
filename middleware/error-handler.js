import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware = (err, req, res, next) => {

  console.log(err);
  
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Something went wrong, try again later';

  if (err.name === 'ValidationError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
  }

  if (err.code === 11000) {
    statusCode = StatusCodes.BAD_REQUEST;
    const field = Object.keys(err.keyValue).join(', ');
    message = `${field} field must be unique`;
  }

  if (err.name === 'CastError') {
    statusCode = StatusCodes.NOT_FOUND;
    message = `No item found with id: ${err.value}`;
  }

  return res.status(statusCode).json({ msg: message });
};

export default errorHandlerMiddleware;