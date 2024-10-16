import BaseObject from "sap/ui/base/Object";

export default class SingeltonObject extends BaseObject {
  public constructor(instance: SingeltonObject) {
    if (instance) {
      return instance;
    } else {
      instance = super() as any as SingeltonObject;
      return instance;
    }
  }
}