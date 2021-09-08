import { Injectable } from "@nestjs/common";
import { Ping } from "./interfaces/ping.interface";

@Injectable()
export class AppService {
  pingPong(): Ping {
    return { message: "pong" };
  }
}
