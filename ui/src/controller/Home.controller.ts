import JSONModel from 'sap/ui/model/json/JSONModel';
import Controller from 'sap/ui/core/mvc/Controller';
import Component from '../Component';
import Router from 'sap/m/routing/Router';
import UserService from "com/bosch/Test1016/ui/services/UserService";

export default class Home extends Controller {
  private router: Router;
  private localModel: JSONModel;
  private userService: UserService;

  public data() {
    return {
      firstUser: undefined
    };
  }

  public onInit() {
    this.getView()?.setModel(new JSONModel(this.data()), 'HomeModel');
    this.localModel = this.getView()?.getModel('HomeModel') as JSONModel;
    this.router = (
      this.getOwnerComponent() as Component
    )?.getRouter() as Router;

    this.userService = new UserService({
      component: this.getOwnerComponent() as Component,
    });
  }

  public onAfterRendering() {
    this.userService.loadUserInfo().then((res) => {
      this.localModel.setProperty('/firstUser', res[0]);
    });
  }
}
