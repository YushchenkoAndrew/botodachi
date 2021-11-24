export interface Ping {
  status: "OK" | "ERR";
  message: string;
}

export interface DefaultRes {
  status: "OK" | "ERR";
  message: string;
  result?: any;
}
