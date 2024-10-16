import Component from '../Component';
import HttpClient from '../libs/HttpClient';
import SingletonObject from '../libs/SingletonObject';
import Store from '../libs/Store';

interface IAppServiceOpion {
  component?: Component;
}

interface IUser {
  name: string
  age: number
  isStudent: boolean
}

let instance: UserService;

export default class UserService extends SingletonObject {
  public component?: Component;
  public httpClient: HttpClient;

  public constructor(options: IAppServiceOpion) {
    super(instance);
    instance = this;

    this.component = options?.component;

    this.httpClient = new HttpClient({
      component: this.component,
    });
  }

  public loadUserInfo(): Promise<IUser[]> {
    return this.httpClient
      .get({
        url: `${this.httpClient.remoteHost}/user`,
      })
  }
}
