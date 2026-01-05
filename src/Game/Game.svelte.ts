import { InvokeableEvent } from "./Shared/Events";

enum GameloopState {
  RUNNING,
  PAUSED,
  STOPPED,
}

interface GameLoopOptions {
  step?: number;
  maxUpdates?: number;
}

interface GameLoopTiming {
  last: number | null;
  total: number;
  delta: number;
  lag: number;
}

export const Update: InvokeableEvent<[number, number]> = new InvokeableEvent<
  [number, number]
>();
export const Render: InvokeableEvent<number> = new InvokeableEvent<number>();
export const Panic: InvokeableEvent<null> = new InvokeableEvent();

export class GameLoop {
  public state: GameloopState;
  private options: Required<GameLoopOptions>;
  private timing!: GameLoopTiming;
  private frame!: number;
  private numberOfUpdates: number = 0;

  public onUpdate(step: number, total: number) {
    Update.invoke([step, total]);
  }
  public onRender(interpolation: number) {
    Render.invoke(interpolation);
  }
  public onPanic() {
    Panic.invoke(null);
  }

  constructor(options: GameLoopOptions = {}) {
    this.state = GameloopState.STOPPED;
    this.options = {
      step: 500 / (DevHacks.speedhack ? 100 : 10),
      maxUpdates: 300,
      ...options,
    };

    this.tick = this.tick.bind(this);
  }

  get isStopped(): boolean {
    return this.state === GameloopState.STOPPED;
  }

  get isPaused(): boolean {
    return this.state === GameloopState.PAUSED;
  }

  get isRunning(): boolean {
    return this.state === GameloopState.RUNNING;
  }

  start(): void {
    if (this.isStopped) {
      this.state = GameloopState.RUNNING;

      this.timing = {
        last: null,
        total: 0,
        delta: 0,
        lag: 0,
      };

      this.frame = requestAnimationFrame(this.tick);
    }
  }

  stop(): void {
    if (this.isRunning || this.isPaused) {
      this.state = GameloopState.STOPPED;
      cancelAnimationFrame(this.frame);
    }
  }

  pause(): void {
    if (this.isRunning) {
      this.state = GameloopState.PAUSED;
      cancelAnimationFrame(this.frame);
    }
  }

  reCounte(): void {
    if (this.isPaused) {
      this.state = GameloopState.RUNNING;
      this.frame = requestAnimationFrame(this.tick);
    }
  }

  private tick(time: number): void {
    if (this.timing.last === null) this.timing.last = time;
    this.timing.delta = time - this.timing.last;
    this.timing.total += this.timing.delta;
    this.timing.lag += this.timing.delta;
    this.timing.last = time;

    this.numberOfUpdates = 0;

    while (this.timing.lag >= this.options.step) {
      this.timing.lag -= this.options.step;
      this.onUpdate(this.options.step, this.timing.total);
      this.numberOfUpdates++;
      if (this.numberOfUpdates >= this.options.maxUpdates) {
        this.onPanic();
        break;
      }
    }

    this.onRender(this.timing.lag / this.options.step);

    this.frame = requestAnimationFrame(this.tick);
  }

  restart() {
    this.stop()
    this.options.step = 500 / (DevHacks.speedhack ? 100 : 10);
    this.start()
  }
}

export const DevHacks = $state({
  speedhack: false,
  skipUnlock: false,
});

export const MainLoop = new GameLoop();
