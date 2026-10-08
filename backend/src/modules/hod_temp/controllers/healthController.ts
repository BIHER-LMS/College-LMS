import { Request, Response } from 'express';

export function getHealth(_req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    message: 'HOD backend is running',
  });
}
