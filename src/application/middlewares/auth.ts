import { NextFunction, Request, Response } from "express";

// TODO
export default function auth(_request: Request, _response: Response, next: NextFunction) {
  next();
}