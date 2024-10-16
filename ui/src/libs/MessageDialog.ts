import Button from 'sap/m/Button';
import Dialog from 'sap/m/Dialog';
import IllustratedMessage from 'sap/m/IllustratedMessage';
import { ButtonType, DialogType } from 'sap/m/library';
import MessageBox from 'sap/m/MessageBox';
import Text from 'sap/m/Text';

export default {
  __DEFAULTMSG: {
    '000': `Please try again later`,
  } as {[code: string]: string},

  httpErr(e: any) {
    // change to string or '000' if no err code
    const code = e.code as number || '000';
    const msg = e.msg as string || this.__DEFAULTMSG[code];
    MessageBox.error(msg, {
      title: `Error Code ${code}`,
    });
  },

  msg(msg: string) {
    const dialog = new Dialog('msgDialog', {
      title: `Message`,
      type: DialogType.Message,
      content: new Text({
        text: msg,
      }),
      endButton: new Button({
        text: 'Close',
        press: () => {
          dialog.close();
        },
      }),
      afterClose: function () {
        dialog.destroy();
      },
    });
    dialog.open();
  },

  sessionExpired(signInFunc: any, retryFunc: any) {
    const dialog = new Dialog('msgDialog', {
      title: 'Session Expired',
      verticalScrolling: false,
      contentWidth: '20rem',
      buttons: [
        new Button('loginBtn', {
          text: 'Sign In',
          press: signInFunc,
          type: ButtonType.Emphasized,
        }),
        new Button('retry', {
          text: 'Sign In With Retry',
          press: retryFunc,
          type: ButtonType.Emphasized,
        }),
        new Button('closeBtn', {
          text: 'Close',
          press: () => {
            dialog.close();
          },
        }),
      ],
      content: new IllustratedMessage('expireMsg', {
        title: 'Your session has expired',
        description: 'Sign in to pick up where you left off.',
        illustrationType: 'tnt-SessionExpired',
      }),
      afterClose: function () {
        dialog.destroy();
      },
    });
    dialog.open();
  },
};
