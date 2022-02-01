import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { PassValidate } from "lib/auth";
import md5 from "lib/md5";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (
      !PassValidate(
        md5(req.header("x-custom-header") + process.env.BOT_KEY),
        (req.query.key as string) ?? "",
      )
    ) {
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }
    next();
  }
}
