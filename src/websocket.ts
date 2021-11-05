export class WS {
  ws: WebSocket;
  handlers: ((msg: string) => boolean)[] = [];
  otherId: number = 0;
  id: number = 0
  shakeLatch: boolean = false;

  constructor() {
    this.ws = new WebSocket('wss://wss.alesharik.com/');
    this.ws.onmessage = ev => {
      if (ev.data === '!pong') return;
      this.handlers = this.handlers.filter(value => value(ev.data));
    }
    this.handlers.push(msg => {
      if (this.otherId > 0 && msg === "hi") {
        this.broadcast("hello/" + this.id);
      }
      return true;
    });
    this.handlers.push(msg => {
      if (msg === "shake") {
        this.shakeLatch = true;
      }
      return true;
    });
    setInterval(() => this.ws.send('!ping'), 1000);
  }

  waitForResponse(): Promise<number> {
    let h1 = new Promise<number>(resolve => {
      this.handlers.push(msg => {
        if (msg.startsWith('hello/')) {
          const party = msg.substring(6);
          resolve(parseInt(party));
          return false;
        }
        return true;
      })
    });
    const h2 = new Promise<number>(resolve => setTimeout(() => resolve(0), 500));
    return Promise.race([h1, h2])
  }

  onShake() {
    this.broadcast('shake');
  }

  waitForShake(): Promise<void> {
    if (this.shakeLatch) {
      return Promise.resolve();
    }
    return new Promise<void>(resolve => {
      this.handlers.push(msg => {
        if (msg === 'shake') {
          resolve();
          return false;
        }
        return true;
      })
    })
  }

  waitForReady(): Promise<void> {
    return new Promise<void>(resolve => {
      this.handlers.push(msg => {
        if (msg === 'rdy') {
          resolve();
          return false;
        }
        return true;
      })
    })
  }

  joinAsUser(id: number) {
    this.id = id;
    this.ws.send('join:u_' + id);
    this.broadcast('hi');
  }

  joinIntoParty(id: number) {
    this.ws.send('join:u_' + id);
  }

  ready() {
    this.broadcast('rdy');
  }

  setOtherId(id: number) {
    this.otherId = id;
    this.broadcast('hello/' + id);
  }

  broadcast(message: string) {
    this.ws.send('bcast:' + message);
  }
}
