import JSONModel from 'sap/ui/model/json/JSONModel';
import Controller from 'sap/ui/core/mvc/Controller';
import Store from '../libs/Store';
import Component from '../Component';
import Router from 'sap/m/routing/Router';

export default class Empty extends Controller {
  private store: Store;
  private router: Router;
  private callbackRoute: string;
  private localModel: JSONModel;
  private hasRun = false;

  public data() {
    return {
      showNoAccess: false,
    };
  }

  public onInit() {
    this.store = new Store({
      component: this.getOwnerComponent() as Component,
    });
    this.router = (this.getOwnerComponent() as Component)?.getRouter() as Router;
    this.callbackRoute = new URL(window.location.href).hash.substring(2);

    this.getView()?.setModel(new JSONModel(this.data()), 'NotFoundModel');
    this.localModel = this.getView()?.getModel('NotFoundModel') as JSONModel;
  }

  public onAfterRendering() {
    if (this.hasRun) {
      this.localModel.setProperty('/showNoAccess', true);
      return;
    }
    this.store._setter('callbackRoute', this.callbackRoute);
    this.router.navTo('welcome');
    this.hasRun = true;
  }
}
