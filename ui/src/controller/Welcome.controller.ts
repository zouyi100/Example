import Controller from 'sap/ui/core/mvc/Controller';
import AppService from '../services/AppService';
import Component from '../Component';
import HttpClient from '../libs/HttpClient';
import Store from '../libs/Store';
import Router from 'sap/m/routing/Router';
import Route from 'sap/ui/core/routing/Route';
import RouterConf from '../conf/Router.conf';

export default class Welcome extends Controller {
  private appService: AppService;
  private httpClient: HttpClient;
  private store: Store;
  private router: Router;
  private callbackRoute: string;

  public onInit() {
    this.appService = new AppService({
      component: this.getOwnerComponent() as Component,
    });
    this.httpClient = new HttpClient({
      component: this.getOwnerComponent() as Component,
    });
    this.store = new Store({
      component: this.getOwnerComponent() as Component,
    });

    this.router = (
      this.getOwnerComponent() as Component
    )?.getRouter() as Router;
  }

  public onAfterRendering() {
    this.callbackRoute = this.store._getter('callbackRoute');

    // this.appService.loadUserInfo().finally(() => {
    //   this.store._setter('hasLogin', true);
    //   this.store._setter('userName', 'Test');
    //   this._afterLoadingAuth();
    // });

    setTimeout(() => {
      this._afterLoadingAuth();
    }, 200);
  }

  private _afterLoadingAuth() {
    this._generateRoute();
    setTimeout(() => {
      if (this.callbackRoute) {
        this.router.getHashChanger().setHash(this.callbackRoute);
      } else {
        this.router.navTo('home');
      }
    }, 500);
  }

  private _generateRoute() {
    const routes = RouterConf.routes;

    routes.forEach((route) => {
      this.router.addRoute(route, undefined as unknown as Route);
    });
  }
}
