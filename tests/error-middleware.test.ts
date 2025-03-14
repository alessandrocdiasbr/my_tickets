import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import errorHandlerMiddleware, { ERRORS } from '../src/middlewares/error-middleware';

describe('Error Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should handle unauthorized error', () => {
    const error = { type: 'unauthorized', message: 'Não autorizado' };
    errorHandlerMiddleware(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(ERRORS.unauthorized);
    expect(res.send).toHaveBeenCalledWith(error.message);
  });

  it('should handle conflict error', () => {
    const error = { type: 'conflict', message: 'Conflito detectado' };
    errorHandlerMiddleware(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(ERRORS.conflict);
    expect(res.send).toHaveBeenCalledWith(error.message);
  });

  it('should handle not found error', () => {
    const error = { type: 'not_found', message: 'Recurso não encontrado' };
    errorHandlerMiddleware(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(ERRORS.not_found);
    expect(res.send).toHaveBeenCalledWith(error.message);
  });

  it('should handle bad request error', () => {
    const error = { type: 'bad_request', message: 'Requisição inválida' };
    errorHandlerMiddleware(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(ERRORS.bad_request);
    expect(res.send).toHaveBeenCalledWith(error.message);
  });

  it('should handle forbidden error', () => {
    const error = { type: 'forbidden', message: 'Acesso negado' };
    errorHandlerMiddleware(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(ERRORS.forbidden);
    expect(res.send).toHaveBeenCalledWith(error.message);
  });

  it('should handle internal server error when error type is not recognized', () => {
    const error = { type: 'unknown_error', message: 'Erro desconhecido' };
    errorHandlerMiddleware(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error.message);
  });

  it('should handle error without type', () => {
    const error = { message: 'Erro sem tipo' };
    errorHandlerMiddleware(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(error.message);
  });
});