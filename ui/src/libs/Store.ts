import JSONModel from 'sap/ui/model/json/JSONModel';
import Component from '../Component';
import SingeltonObject from './SingletonObject';

interface IStoreOption {
  component?: Component;
}

interface ISubsContext {
  payload: any;
}

let instance: Store;

export default class Store extends SingeltonObject {
  protected subscribeMap: {[name: string]: ((...args: any[]) => any)[]} = {};
  protected component?: Component;
  protected storeModel?: JSONModel;

  public constructor(options?: IStoreOption) {
    super(instance);
    instance = this;

    this.component = options?.component;
    this.storeModel = this.component?.getModel('store') as JSONModel;
  }

  public _getter(path: string): any {
    return this.storeModel?.getProperty(`/${path}`);
  }

  public _setter(path: string, value: any): void {
    this.storeModel?.setProperty(`/${path}`, value);
  }

  public dispatch(name: string, payload: any): void {
    this._setter(name, payload);
    this.component?.getEventBus().publish('storeChannel', name, {
      payload: this._getter(name),
    });
  }

  public subscribe(name: string, func: (cname: string, tname: string, context: ISubsContext) => any): void {
    this.subscribeMap[name] = (this.subscribeMap[name] || []).concat([func]);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.component?.getEventBus().subscribe('storeChannel', name, func as any);
  }

  public unsubscribe(name: string, func: (...args: any[]) => any): void {
    this.component?.getEventBus().unsubscribe('storeChannel', name, func);
  }

  public unsubscribeAll(name: string): void {
    if (this.subscribeMap[name]) {
      this.subscribeMap[name].forEach((func) => {
        this.unsubscribe(name, func);
      });
    }
  }
}
