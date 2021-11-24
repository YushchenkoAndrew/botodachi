export interface Ping {
  Status: "OK" | "ERR";
  Message: string;
}

export type ApiTokens = {
  status: "OK" | "ERR";
  access_token: string;
  refresh_token: string;
};
