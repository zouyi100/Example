import Component from '../Component';
import HttpClient from '../libs/HttpClient';
import SingeltonObject from '../libs/SingletonObject';

interface IDefaultUserVariantServiceOpion {
  component?: Component;
}

export interface IVariant {
  default: boolean;
  function: string;
  needDelete?: boolean;
  variantConfig?: any;
  variantID?: number;
  variantName: string;
  description?: string;
}

let instance: DefaultUserVariantService;

export default class DefaultUserVariantService extends SingeltonObject {
  private component?: Component;
  private httpClient: HttpClient;

  public constructor(options?: IDefaultUserVariantServiceOpion) {
    super(instance);
    instance = this;

    this.component = options?.component;
    this.httpClient = new HttpClient({
      component: this.component,
    });
  }

  public loadAllVariant(functionName: string): Promise<IVariant[]> {
    return this.httpClient
      .get({
        url: `${this.httpClient.remoteHost}/variant/getallvariant/${functionName}`,
      })
      .then((res: IVariant[]) => {
        const standardVariant: IVariant = {
          description: 'Standard configure',
          default: false,
          variantName: 'Standard',
          variantID: -1,
          function: functionName,
        };
        if (res.length === 0 || res.filter((variant: IVariant) => variant.default).length === 0) {
          standardVariant.default = true;
        }
        res.unshift(standardVariant);
        return res;
      });
  }

  public updateVariantConf(variant: IVariant, conf: string): Promise<any> {
    return this.httpClient.post({
      url: `${this.httpClient.remoteHost}/variant/updatevariant`,
      body: {
        variantConfig: conf,
        variantID: variant.variantID,
      },
    });
  }

  public saveVariant(dto: IVariant): Promise<any> {
    return this.httpClient.post({
      url: `${this.httpClient.remoteHost}/variant/savevariant`,
      body: dto,
    });
  }

  public manageVariant(variantList: IVariant[]): Promise<any> {
    return this.httpClient.post({
      url: `${this.httpClient.remoteHost}/variant/managevariants`,
      body: variantList,
    });
  }
}
