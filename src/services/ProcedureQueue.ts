import { Constructor, InjectScope } from "@bonbons/di";
import { Injectable } from "../decorators/injectable";

export interface IBasicProcedure {
  run(): void | Promise<void>;
}

// tslint:disable-next-line: no-namespace
export namespace ProcedureQueue {
  // tslint:disable-next-line: interface-name
  export interface Contract {
    readonly procedures: Constructor<IBasicProcedure>[];
    push(...p: Constructor<IBasicProcedure>[]): void;
    unshift(...p: Constructor<IBasicProcedure>[]): void;
  }
}

@Injectable(InjectScope.Singleton)
export class ProcedureQueue implements ProcedureQueue.Contract {
  private queues: Constructor<IBasicProcedure>[] = [];
  public get procedures() {
    return [...this.queues];
  }

  public push(...p: Constructor<IBasicProcedure>[]) {
    this.queues.push(...p);
  }

  public unshift(...p: Constructor<IBasicProcedure>[]) {
    this.queues.unshift(...p);
  }
}
