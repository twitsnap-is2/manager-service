export class EchoService {
  async ping() {
    return "pong" as const;
  }

  async echo(body: string) {
    throw new Error("Not implemented");
    return body;
  }
}
