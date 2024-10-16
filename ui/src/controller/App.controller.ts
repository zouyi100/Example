import Controller from 'sap/ui/core/mvc/Controller';
import Router from 'sap/m/routing/Router';
import JSONModel from 'sap/ui/model/json/JSONModel';
import Dialog from 'sap/m/Dialog';
import Component from '../Component';
import AppService from '../services/AppService';
import Store from '../libs/Store';
import HttpClient from '../libs/HttpClient';
import ActionSheet from 'sap/m/ActionSheet';
import Event from 'sap/ui/base/Event';
import Control from "sap/ui/core/Control";

interface INavigationItem {
  enabled: boolean;
  title: string;
  key: string;
  icon: string;
}

interface AppModelData {
  navigationList?: INavigationItem[];
  navListIsExpend?: boolean;
  showFooter?: boolean;
}

export default class App extends Controller {
  private localModel?: JSONModel;
  private appService: AppService;
  private router?: Router;
  private store: Store;
  private httpClient: HttpClient;
  private userProfileDialog: Dialog;
  private userMenu: ActionSheet;

  public data(): AppModelData {
    return {
      navigationList: [
        {
          enabled: true,
          title: 'Home',
          key: 'home',
          icon: 'sap-icon://it-host',
        },
      ],
      navListIsExpend: true,
      showFooter: true,
    };
  }

  public onInit(): void {
    this.appService = new AppService({
      component: this.getOwnerComponent() as Component,
    });
    this.store = new Store({
      component: this.getOwnerComponent() as Component,
    });
    this.httpClient = new HttpClient({
      component: this.getOwnerComponent() as Component,
    });

    this.getView()?.setModel(new JSONModel(this.data()), 'AppModel');
    this.localModel = this.getView()?.getModel('AppModel') as JSONModel;
    this.router = (
      this.getOwnerComponent() as Component
    )?.getRouter() as Router;

    this.userProfileDialog = this.byId('userProfile') as Dialog;
    this.userMenu = this.byId('usermenu') as ActionSheet;
  }

  public onToggleNavigationPress(): void {
    this.localModel?.setProperty(
      '/navListIsExpend',
      !this.localModel.getProperty('/navListIsExpend')
    );
  }

  public onToggleFooterbar(): void {
    this.localModel?.setProperty(
      '/showFooter',
      !this.localModel.getProperty('/showFooter')
    );
  }

  public onItemSelect(e: any) {
    const selectedKey = e.getSource().getProperty('selectedKey') as string;
    this.router?.navTo(selectedKey);
  }

  public showUserMenu(e: Event) {
    this.userMenu.openBy(e.getSource() as unknown as Control);
  }

  public showUserProfile() {
    this.userProfileDialog.open();
  }

  public onUserProfileDialogClose() {
    this.userProfileDialog.close();
  }

  public doLogout() {
    window.location.href = '/do/logout';
  }
}
