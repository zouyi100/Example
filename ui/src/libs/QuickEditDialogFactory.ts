/**
 * TODO
 */

import Dialog from 'sap/m/Dialog';
import { ButtonType, DialogType, InputType } from 'sap/m/library';
import View from 'sap/ui/core/mvc/View';
import JSONModel from 'sap/ui/model/json/JSONModel';
import Button from 'sap/m/Button';
import VBox from 'sap/m/VBox';
import FlexBox from 'sap/m/FlexBox';
import Input from 'sap/m/Input';
import Control from 'sap/ui/core/Control';
import DatePicker, { $DatePickerSettings } from 'sap/m/DatePicker';
import Label from 'sap/m/Label';
import HBox from 'sap/m/HBox';
import Switch, { $SwitchSettings } from 'sap/m/Switch';

export interface IFieldConfigOption {
  label?: string;
  group?: string;
  type?: 'Input' | 'Date' | 'Selection' | 'InputNumber' | 'Switch';
  editable?: boolean;
  visible?: boolean;
  options?: IAddtionalTypeOptions;
}

interface IAddtionalTypeOptions {
  switch?: $SwitchSettings;
  date?: $DatePickerSettings;
}

interface IQuickEditDialogFactoryOption {
  title?: string;
  type?: DialogType.Message | DialogType.Standard;
  modelName: string;
  view: View;
  dataPath: string;
  fieldConfig?: { [fieldName: string]: IFieldConfigOption };
  beginButtonText?: string;
  beginButtonEvent: (...args: any[]) => any;
  endButtonText?: string;
  endButtonEvent: (...args: any[]) => any;
}

export default class QuickEditDialogFactory {
  protected view: View;
  protected modelName: string;
  protected localModel: JSONModel;
  protected sourceDataPath: string;
  protected editDataPath: string;
  protected templateData: { [key: string]: any };
  protected editedData: any;
  protected fieldConfig: { [fieldName: string]: IFieldConfigOption };
  protected beginButtonEvent: (...args: any[]) => any;

  public generateDialog(options: IQuickEditDialogFactoryOption): Dialog {
    const {
      title,
      view,
      type,
      modelName,
      dataPath,
      fieldConfig,
      beginButtonText,
      beginButtonEvent,
      endButtonText,
      endButtonEvent,
    } = options;
    this.view = view;
    this.modelName = modelName;
    this.localModel = this.view.getModel(this.modelName) as JSONModel;
    this.sourceDataPath = dataPath;
    this.editDataPath = `quickEditDialogMeta/editedData/${dataPath}`;
    this.templateData = JSON.parse(
      JSON.stringify(this.localModel.getProperty(`/${this.sourceDataPath}`))
    );
    this.localModel.setProperty('/quickEditDialogMeta', {
      editedData: {
        [dataPath]: JSON.parse(
          JSON.stringify(this.localModel.getProperty(`/${this.sourceDataPath}`))
        ),
      },
    });
    this.fieldConfig = fieldConfig || {};
    this.beginButtonEvent = beginButtonEvent;

    const dialog = new Dialog({
      title: title || 'Edit Dialog',
      type: type || DialogType.Standard,
      contentWidth: '450px',
      content: this._generateContent(),
      beginButton: new Button({
        text: beginButtonText || 'Save',
        type: ButtonType.Emphasized,
        press: beginButtonEvent,
      }),
      endButton: new Button({
        text: endButtonText || 'Cancel',
        press: endButtonEvent,
      }),
      afterClose: () => {
        dialog.destroy();
      },
      busy: {
        path: `${this.modelName}>/quickEditDialogMeta/dialogBusy`,
      },
      busyIndicatorDelay: 0,
    }).addStyleClass('quick-edit-dialog');
    this.view.addDependent(dialog);
    return dialog;
  }

  public getLastEditedData() {
    const data: { [key: string]: unknown } = JSON.parse(
      JSON.stringify(this.localModel.getProperty(`/${this.editDataPath}`))
    );
    const fieldList = Object.keys(this.fieldConfig);
    fieldList.forEach((field) => {
      if (this.fieldConfig[field].type === 'Date') {
        data[field] = new Date(data[field] as string).toJSON();
      }
    });
    return data;
  }

  public setDialogBusy(isBusy: boolean) {
    this.localModel.setProperty('/quickEditDialogMeta/dialogBusy', isBusy);
  }

  protected _generateContent(): VBox {
    const fieldList = Object.keys(this.templateData);
    const groupList: { [groupName: string]: Control[] } = {};
    fieldList.forEach((field) => {
      this._completetFieldType(field);
      const groupName = this.fieldConfig[field].group as string;
      const component = this._generateComponent(field);
      if (component) {
        const groupItem = new FlexBox({
          alignItems: 'Center',
          justifyContent: 'SpaceBetween',
          items: [
            new Label({
              text: this.fieldConfig[field].label,
            }),
            component,
          ],
        }).addStyleClass('group-item');
        if (!groupList[groupName]) {
          groupList[groupName] = [groupItem];
        } else {
          groupList[groupName].push(groupItem);
        }
      }
    });
    return this._generateGroup(groupList);
  }

  protected _completetFieldType(field: string) {
    const data = this.templateData[field];
    const config = this.fieldConfig[field];
    let fieldType: 'Input' | 'Date' | 'Selection' | 'InputNumber' | 'Switch' =
      'Input';
    switch (typeof data) {
      case 'number': {
        fieldType = 'InputNumber';
        break;
      }
      case 'boolean': {
        fieldType = 'Switch';
        break;
      }
      case 'string': {
        fieldType = 'Input';
        break;
      }
      default: {
        fieldType = 'Input';
        break;
      }
    }
    const completeConfig = {
      label: config?.label || this._camelCaseToLabel(field),
      group: config?.group || 'DEFAULTGROUP',
      type: config?.type || fieldType,
      editable: config?.editable === undefined ? true : config?.editable,
      visible: config?.visible === undefined ? true : config?.visible,
      options: config?.options,
    };
    this.fieldConfig[field] = completeConfig;
  }

  protected _camelCaseToLabel(text: string) {
    const result = text.replace(/([A-Z])/g, ' $1');
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  }

  protected _generateComponent(field: string): Control | undefined {
    const config = this.fieldConfig[field];
    if (config.visible) {
      switch (config.type) {
        case 'Input': {
          return new Input({
            width: '200px',
            type: InputType.Text,
            value: {
              path: `${this.modelName}>/${this.editDataPath}/${field}`,
            },
            editable: this.fieldConfig[field].editable,
          });
        }
        case 'Date': {
          return new DatePicker({
            width: '200px',
            value: {
              path: `${this.modelName}>/${this.editDataPath}/${field}`,
            },
            editable: this.fieldConfig[field].editable,
            displayFormat: 'YYYY-MM-dd',
            valueFormat: 'YYYY-MM-dd',
            ...this.fieldConfig[field].options?.date,
          });
        }
        case 'Switch': {
          // TODO: for the data not equal true/false
          return new Switch({
            state: {
              path: `${this.modelName}>/${this.editDataPath}/${field}`,
            },
            enabled: this.fieldConfig[field].editable,
            ...this.fieldConfig[field].options?.switch,
          });
        }

        // TODO
        default: {
          return new Input({
            width: '200px',
            type: InputType.Text,
            value: {
              path: `${this.modelName}>/${this.editDataPath}/${field}`,
            },
            editable: this.fieldConfig[field].editable,
          });
        }
      }
    } else {
      return undefined;
    }
  }

  protected _generateGroup(groupList: { [groupName: string]: Control[] }) {
    const groupArr = Object.keys(groupList);
    const container = new VBox().addStyleClass('dialog-inner');
    if (groupArr.length === 1 && groupArr[0] === 'DEFAULTGROUP') {
      groupList['DEFAULTGROUP']?.forEach((control) => {
        container.addItem(control);
      });
    } else {
      groupList['DEFAULTGROUP']?.forEach((control) => {
        container.addItem(control);
      });
      groupArr.forEach((groupName) => {
        const controlList = groupList[groupName];
        const groupContainer = new VBox();
        if (groupName === 'DEFAULTGROUP') {
          return;
        }
        groupContainer.addItem(
          new HBox({
            alignItems: 'Center',
            items: [
              new Label({
                text: groupName,
              }),
            ],
          }).addStyleClass('group-title')
        );
        controlList.forEach((control) => {
          groupContainer.addItem(control);
        });
        container.addItem(groupContainer);
      });
    }
    return container;
  }
}
