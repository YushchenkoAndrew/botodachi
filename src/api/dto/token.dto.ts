export class TokenDto {
  status: "OK" | "ERR";
  access_token: string;
  refresh_token: string;
}
