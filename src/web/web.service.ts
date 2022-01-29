import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AxiosResponse } from "axios";
import md5 from "lib/md5";
import { lastValueFrom } from "rxjs";
import { DefaultResDto } from "./dto/default-res.dto";
import { PingWebDto } from "./dto/ping.dto";

@Injectable()
export class WebService {
  constructor(private readonly httpService: HttpService) {}

  ping(): Promise<string> {
    return new Promise((resolve) => {
      lastValueFrom(this.httpService.get(`${process.env.WEB_URL}/api/ping`))
        .then((res: AxiosResponse<PingWebDto>) => {
          resolve(res.data.message);
        })
        .catch(() => resolve("Unable to reach"));
    });
  }

  cacheUpload(): Promise<string> {
    return new Promise<string>((resolve) => {
      const salt = md5((Math.random() * 10000 + 500).toString());
      lastValueFrom(
        this.httpService.post(
          `${process.env.WEB_URL}/api/cache/upload?key=${md5(
            salt + process.env.WEB_PEPPER + process.env.WEB_KEY,
          )}`,
          "",
          { headers: { ["X-Custom-Header"]: salt } },
        ),
      )
        .then((res: AxiosResponse<DefaultResDto>) =>
          resolve(JSON.stringify(res.data, null, 2)),
        )
        .catch((err) => {
          resolve(
            JSON.stringify(
              err?.response?.data || "{'message':'Error'}",
              null,
              2,
            ),
          );
        });
    });
  }

  cacheClear(): Promise<string> {
    return new Promise<string>((resolve) => {
      const salt = md5((Math.random() * 10000 + 500).toString());
      lastValueFrom(
        this.httpService.post(
          `${process.env.WEB_URL}/api/cache/clear?key=${md5(
            salt + process.env.WEB_PEPPER + process.env.WEB_KEY,
          )}`,
          "",
          { headers: { ["X-Custom-Header"]: salt } },
        ),
      )
        .then((res: AxiosResponse) => resolve("Cleared!!!"))
        .catch((err) => {
          resolve(
            JSON.stringify(
              err?.response?.data || "{'message':'Error'}",
              null,
              2,
            ),
          );
        });
    });
  }

  cacheRun(command: string): Promise<string> {
    return new Promise<string>((resolve) => {
      const salt = md5((Math.random() * 10000 + 500).toString());
      lastValueFrom(
        this.httpService.post(
          `${process.env.WEB_URL}/api/bot/redis?key=${md5(
            salt + process.env.WEB_PEPPER + process.env.WEB_KEY,
          )}`,
          { command },
          { headers: { ["X-Custom-Header"]: salt } },
        ),
      )
        .then((res: AxiosResponse<DefaultResDto>) => {
          resolve(JSON.stringify(res.data, null, 2));
        })
        .catch((err) => {
          resolve(
            JSON.stringify(
              err?.response?.data || "{'message':'Error'}",
              null,
              2,
            ),
          );
        });
    });
  }
}
