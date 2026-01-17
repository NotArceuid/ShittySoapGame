import { log } from "console";
import { Player } from "./Player.svelte";
import { SaveSystem } from "./Saves";
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

  constructor(options: GameLoopOptions = {}) {
    this.state = GameloopState.STOPPED;
    this.options = {
      step: 500 / 10,
      maxUpdates: 500,
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

  start(): void {
    if (this.isStopped) {
      this.state = GameloopState.RUNNING;

      this.timing = {
        last: null,
        total: 0,
        delta: 0,
        lag: 0,
      };

      this.frame = requestAnimationFrame(this.tick.bind(this));
    }
  }

  stop(): void {
    if (this.isRunning || this.isPaused) {
      this.state = GameloopState.STOPPED;
      cancelAnimationFrame(this.frame);
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
        break;
      }
    }

    this.onRender(this.timing.lag / this.options.step);
    this.frame = requestAnimationFrame(this.tick);

    if (OfflineProps.calculating) {
      OfflineProps.offlineTick -= 1;
      if (OfflineProps.offlineTick <= 0) {
        OfflineProps.calculating = false;
        MainLoop.restart();
      }
    }

  }

  restart() {
    this.stop()
    if (OfflineProps.calculating)
      this.options.step = 1;
    else
      this.options.step = 500 / (DevHacks.speedhack ? 50 : 15);

    this.start()
  }
}

export const OfflineProps = $state({
  initialTick: 0,
  offlineTick: 0,
  calculating: false,
  saveId: 0,
})

export function RunOfflineCalculations(tick: number) {
  OfflineProps.initialTick = tick;
  OfflineProps.offlineTick = tick;

  OfflineProps.calculating = true;
  MainLoop.restart();
}

export const DevHacks = $state({
  speedhack: false,
  skipUnlock: false,
});

export const MainLoop = new GameLoop();
export const AutomationTick: number = 5;

export function CalculateOfflineTick(tick: number) {
  return tick / 60;
}
