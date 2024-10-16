import Component from '../Component';
import SingletonObject from '../libs/SingletonObject';
import MessageDialog from '../libs/MessageDialog';

interface INotificationServiceOpion {
  component?: Component;
}

let instance: NotificationService;

export default class NotificationService extends SingletonObject {
  public component?: Component;

  public constructor(options: INotificationServiceOpion) {
    super(instance);
    instance = this;

    this.component = options?.component;
  }

  public errorHandle(res: any) {
    const code = res.code || res.status;
    const msg = res.msg || res.statusText;

    // customize handle
    switch (`${code as number | string}`) {
      case '401': {
        const hasLogin = this.component
          ?.getModel('store')
          ?.getProperty('/hasLogin');
        if (hasLogin) {
          MessageDialog.sessionExpired(
            () => {
              window.location.reload();
            },
            () => {
              // console.log('retry');
            }
          );
        } else {
          MessageDialog.httpErr({
            code: 401,
            msg: `You don't have the permission for visiting application. Please contact admin.`,
          });
        }
        break;
      }
      case '403': {
        MessageDialog.httpErr({
          code: 403,
          msg: `You don't have enough privilege. Please contact admin.`,
        });
        break;
      }
      case '404': {
        MessageDialog.httpErr({
          code: 404,
          msg: `Backend not available now.`,
        });
        break;
      }
      default: {
        MessageDialog.httpErr({
          code,
          msg,
        });
      }
    }
  }
}
