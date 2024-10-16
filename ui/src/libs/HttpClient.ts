import Component from '../Component';
import HttpClientConf from '../conf/HttpClient.conf';
// @ts-ignore
import $ from 'jquery.sap.global';
import SingletonObject from './SingletonObject';
import NotificationService from "com/bosch/Test1016/ui/services/NotificationService";

interface IHttpClientOption {
  component?: Component;
}

interface IHttpReqOption {
  url: string;
  path?: string[];
  body?: any;
  params?: any;
  header?: any;
  customOptions?: any;
  skipErrorHandle?: boolean;
}

interface IPostFileDto {
  [key: string]: Blob | Array<Blob>;
}

interface IPostFileReqOption {
  url: string;
  header: any;
  fileobj: IPostFileDto;
  skipErrorHandle?: boolean;
}

let instance: HttpClient;

export default class HttpClient extends SingletonObject {
  private component?: Component;
  private notificationService: NotificationService;

  public devMode = HttpClientConf.devMode;
  public authToken = {
    Authorization: HttpClientConf.devToken,
  };
  public remoteHost = HttpClientConf.remoteHost;

  public constructor(options?: IHttpClientOption) {
    super(instance);
    instance = this;

    this.component = options?.component;
  }

  public setRemoteHost(host: string): void {
    this.remoteHost = host;
  }

  public get(options: IHttpReqOption): Promise<any> {
    const { url, path, params, header, customOptions, skipErrorHandle } =
      options;
    const newUrl = this._spliceURL(url, path, params);
    const newHeader = this._mergeHeader(header);
    return new Promise((resolve, reject) => {
      $.ajax({
        url: newUrl,
        type: 'GET',
        headers: newHeader,
        success: (res: any) => {
          const code = `${res.code as number}`;
          if (typeof res.code == 'undefined') {
            resolve(res);
          } else if (code[0] == '2') {
            resolve(res.data);
          } else {
            if (!skipErrorHandle) {
              this.notificationService?.errorHandle(res);
            }
            reject(res);
          }
        },
        error: (res: any) => {
          if (!skipErrorHandle) {
            this.notificationService?.errorHandle(res);
          }
          reject(res);
        },
        ...customOptions,
      });
    });
  }

  public post(options: IHttpReqOption): Promise<any> {
    const { url, path, params, body, header, customOptions, skipErrorHandle } =
      options;
    const newUrl = this._spliceURL(url, path, params);
    const newHeader = this._mergeHeader(header);
    return new Promise((resolve, reject) => {
      $.ajax({
        url: newUrl,
        type: 'POST',
        headers: newHeader,
        data: JSON.stringify(body),
        success: (res: any) => {
          const code = `${res.code as number}`;
          if (typeof res.code == 'undefined') {
            resolve(res);
          } else if (code[0] == '2') {
            resolve(res.data);
          } else {
            if (!skipErrorHandle) {
              this.notificationService?.errorHandle(res);
            }
            reject(res);
          }
        },
        error: (res: any) => {
          if (!skipErrorHandle) {
            this.notificationService?.errorHandle(res);
          }
          reject(res);
        },
        ...customOptions,
      });
    });
  }

  public postFile(options: IPostFileReqOption): Promise<any> {
    const { url, header, fileobj, skipErrorHandle } = options;
    const newHeader = this._mergeHeader(header, true);
    const fd = new FormData();
    for (const key in fileobj) {
      if (fileobj[key] instanceof Blob) {
        fd.append(key, fileobj[key] as Blob);
      } else {
        for (const file of fileobj[key] as Array<Blob>) {
          fd.append(key, file);
        }
      }
    }
    return new Promise((resolve, reject) => {
      $.ajax({
        method: 'POST',
        data: fd,
        url: url,
        headers: newHeader,
        processData: false,
        contentType: false,
        success: (res: any) => {
          const code = `${res.code as number}`;
          if (typeof res.code == 'undefined') {
            resolve(res);
          } else if (code[0] == '2') {
            resolve(res.data);
          } else {
            if (!skipErrorHandle) {
              this.notificationService?.errorHandle(res);
            }
            reject(res);
          }
        },
        error: (res: any) => {
          if (!skipErrorHandle) {
            this.notificationService?.errorHandle(res);
          }
          reject(res);
        },
      });
    });
  }

  public patch(options: IHttpReqOption): Promise<any> {
    const { url, path, params, body, header, customOptions, skipErrorHandle } =
      options;
    const newUrl = this._spliceURL(url, path, params);
    const newHeader = this._mergeHeader(header);
    return new Promise((resolve, reject) => {
      $.ajax({
        url: newUrl,
        type: 'PATCH',
        headers: newHeader,
        data: JSON.stringify(body),
        success: (res: any) => {
          const code = `${res.code as number}`;
          if (typeof res.code == 'undefined') {
            resolve(res);
          } else if (code[0] == '2') {
            resolve(res.data);
          } else {
            if (!skipErrorHandle) {
              this.notificationService?.errorHandle(res);
            }
            reject(res);
          }
        },
        error: (res: any) => {
          if (!skipErrorHandle) {
            this.notificationService?.errorHandle(res);
          }
          reject(res);
        },
        ...customOptions,
      });
    });
  }

  public put(options: IHttpReqOption): Promise<any> {
    const { url, path, params, body, header, customOptions, skipErrorHandle } =
      options;
    const newUrl = this._spliceURL(url, path, params);
    const newHeader = this._mergeHeader(header);
    return new Promise((resolve, reject) => {
      $.ajax({
        url: newUrl,
        type: 'PUT',
        headers: newHeader,
        data: JSON.stringify(body),
        success: (res: any) => {
          const code = `${res.code as number}`;
          if (typeof res.code == 'undefined') {
            resolve(res);
          } else if (code[0] == '2') {
            resolve(res.data);
          } else {
            if (!skipErrorHandle) {
              this.notificationService?.errorHandle(res);
            }
            reject(res);
          }
        },
        error: (res: any) => {
          if (!skipErrorHandle) {
            this.notificationService?.errorHandle(res);
          }
          reject(res);
        },
        ...customOptions,
      });
    });
  }

  public delete(options: IHttpReqOption): Promise<any> {
    const { url, path, params, body, header, customOptions, skipErrorHandle } =
      options;
    const newUrl = this._spliceURL(url, path, params);
    const newHeader = this._mergeHeader(header);
    return new Promise((resolve, reject) => {
      $.ajax({
        url: newUrl,
        type: 'DELETE',
        headers: newHeader,
        data: JSON.stringify(body),
        success: (res: any) => {
          const code = `${res.code as number}`;
          if (typeof res.code == 'undefined') {
            resolve(res);
          } else if (code[0] == '2') {
            resolve(res.data);
          } else {
            if (!skipErrorHandle) {
              this.notificationService?.errorHandle(res);
            }
            reject(res);
          }
        },
        error: (res: any) => {
          if (!skipErrorHandle) {
            this.notificationService?.errorHandle(res);
          }
          reject(res);
        },
        ...customOptions,
      });
    });
  }

  protected _spliceURL(
    url: string,
    path: string[] = [],
    params: any = {}
  ): string {
    path.forEach((p) => {
      url += '/' + encodeURIComponent(p);
    });

    url += '?';
    for (const e in params) {
      if (typeof params[e] === 'object') {
        const t = params[e];
        for (const p in t) {
          url += e + '=' + encodeURIComponent(t[p] as string) + '&';
        }
      } else {
        url += e + '=' + encodeURIComponent(params[e] as string) + '&';
      }
    }
    if (url.endsWith('?') || url.endsWith('&')) {
      url = url.slice(0, -1);
    }
    return url;
  }

  protected _mergeHeader(h?: any, withoutContentType = false): any {
    const header = h || {};
    if (this.devMode) {
      header['Authorization'] = this.authToken.Authorization;
    }
    if (
      !Object.prototype.hasOwnProperty.call(header, 'Content-Type') &&
      !withoutContentType
    ) {
      header['Content-Type'] = 'application/json';
    }
    return header;
  }
}
