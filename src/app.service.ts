import { Injectable } from "@nestjs/common";
import { PingEntity } from "./entity/ping.entity";

@Injectable()
export class AppService {
  pingPong(): PingEntity {
    return { stat: "OK", message: "pong" };
  }
}
