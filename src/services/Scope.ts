import { ScopeID } from "@bonbons/di";
import { Injectable } from "../decorators/injectable";

// tslint:disable-next-line: no-namespace
export namespace Scope {
  // tslint:disable-next-line: interface-name
  export interface Contract {
    readonly id: ScopeID;
    duration(): number;
  }
}

@Injectable()
export class Scope implements Scope.Contract {
  // tslint:disable-next-line: variable-name
  private _init = false;
  private scopeId!: ScopeID;
  private start!: Date;
  private stop!: Date;

  public get id() {
    return this.scopeId;
  }

  public duration() {
    if (this.start && this.stop) {
      return this.stop.getTime() - this.start.getTime();
    }
    return 0;
  }

  protected init(id: ScopeID) {
    if (this._init) return this;
    this._init = true;
    this.scopeId = id;
    return this;
  }

  protected begin() {
    if (!this.start) {
      this.start = new Date();
    }
  }

  protected end() {
    if (!this.stop) {
      this.stop = new Date();
    }
  }
}
