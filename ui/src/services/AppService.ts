import Component from '../Component';
import HttpClient from '../libs/HttpClient';
import SingletonObject from '../libs/SingletonObject';
import Store from '../libs/Store';

interface IAppServiceOpion {
  component?: Component;
}

let instance: AppService;

export default class AppService extends SingletonObject {
  public component?: Component;
  public httpClient: HttpClient;
  public store: Store;

  public constructor(options: IAppServiceOpion) {
    super(instance);
    instance = this;

    this.component = options?.component;

    this.httpClient = new HttpClient({
      component: this.component,
    });
    this.store = new Store({
      component: this.component,
    });
  }

  public checkUserHasLogin(): Promise<any> {
    return this.httpClient.get({
      url: `/user-api/currentUser`,
      skipErrorHandle: true
    });
  }

  public loadUserInfo(): Promise<any> {
    return this.httpClient
      .get({
        url: `${this.httpClient.remoteHost}/api/v1/authorizations`,
      })
      .then((res: any) => {
        this.store._setter('hasLogin', true)
        this.store._setter('userName', res.userName)
      });
  }
}
