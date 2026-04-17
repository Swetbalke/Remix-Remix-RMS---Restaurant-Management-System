import { Response } from 'express';

export const asyncHandler = (fn: any) => (req: any, res: Response, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
