import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { lastValueFrom } from "rxjs";

@Injectable()
export class VoidService {
  constructor(private readonly httpService: HttpService) {}

  ping(): Promise<string> {
    return new Promise((resolve) => {
      lastValueFrom(this.httpService.head(process.env.VOID_URL))
        .then((res: AxiosResponse) => {
          resolve(res.status === 200 ? "pong" : "Unable to reach");
        })
        .catch(() => resolve("Unable to reach"));
    });
  }
}
