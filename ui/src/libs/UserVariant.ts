import Button from 'sap/m/Button';
import Column from 'sap/m/Column';
import ColumnListItem from 'sap/m/ColumnListItem';
import Dialog from 'sap/m/Dialog';
import FlexBox from 'sap/m/FlexBox';
import Input from 'sap/m/Input';
import Label from 'sap/m/Label';
import { ButtonType, FlexAlignItems, FlexJustifyContent, PlacementType, SwitchType } from 'sap/m/library';
import MessageBox from 'sap/m/MessageBox';
import OverflowToolbar from 'sap/m/OverflowToolbar';
import Page from 'sap/m/Page';
import ResponsivePopover from 'sap/m/ResponsivePopover';
import SearchField from 'sap/m/SearchField';
import SelectList from 'sap/m/SelectList';
import Switch from 'sap/m/Switch';
import Table from 'sap/m/Table';
import Text from 'sap/m/Text';
import ToolbarSpacer from 'sap/m/ToolbarSpacer';
import VBox from 'sap/m/VBox';
import Event from 'sap/ui/base/Event';
import Control from 'sap/ui/core/Control';
import Item from 'sap/ui/core/Item';
import View from 'sap/ui/core/mvc/View';
import Filter from 'sap/ui/model/Filter';
import FilterOperator from 'sap/ui/model/FilterOperator';
import JSONModel from 'sap/ui/model/json/JSONModel';
import Component from '../Component';
import DefaultUserVariantService, { IVariant } from '../services/DefaultUserVariantService';

interface IUserVariantOption {
  modelName: string;
  view: View;
  id: string;
  functionName: string;
  component: Component;
  generateConfig: (isDefault?: boolean) => string;
  applyConfig: (variant: IVariant) => any;
  defaultConfig: string;
}

export default class UserVariant {
  protected defaultUserVariantService: DefaultUserVariantService;
  protected ref: FlexBox;
  protected modelName: string;
  protected localModel: JSONModel;
  protected view: View;
  protected functionName: string;
  protected component: Component;
  protected defaultConfig: string;

  protected _variantListDialog?: ResponsivePopover;
  protected _variantSaveDialog?: Dialog;
  protected _variantManageDialog?: Dialog;
  protected _variantManageTable?: Table;

  protected generateConfig: (isDefault?: boolean) => string;
  protected applyConfig: (variant: IVariant) => any;

  public constructor(options: IUserVariantOption) {
    const { modelName, view, id, functionName, component, generateConfig, applyConfig, defaultConfig } = options;
    this.modelName = modelName;
    this.view = view;
    this.functionName = functionName;
    this.component = component;
    this.ref = view.byId(id) as FlexBox;
    this.localModel = view.getModel(modelName) as JSONModel;
    this.generateConfig = generateConfig;
    this.applyConfig = applyConfig;
    this.defaultConfig = defaultConfig;

    this.defaultUserVariantService = new DefaultUserVariantService({
      component: this.component,
    });
  }

  public init(): void {
    this._resetMetaData();
    const variantComponent = this._generateUserVariant();
    this.ref.addItem(variantComponent);
  }

  public updateUserVariantList(needApplyDefault: boolean): Promise<void> {
    return this.defaultUserVariantService.loadAllVariant(this.functionName).then((variantList) => {
      variantList[0].variantConfig = this.defaultConfig;
      this.localModel.setProperty('/variantMeta/variantList', variantList);
      if (needApplyDefault) {
        const defaultVariant = variantList.filter((variant) => variant.default)[0];
        this.localModel.setProperty('/variantMeta/selectedVariant', defaultVariant);
        this.applyConfig(defaultVariant);
      }
    });
  }

  public updateVariant(config?: string) {
    const variant = this.localModel.getProperty('/variantMeta/selectedVariant') as IVariant;
    if (variant.variantName === 'Standard') {
      MessageBox.information('Standard variant cannot be modified. Please save first.');
      if (this._variantListDialog) {
        this._variantListDialog.close();
      }
    } else {
      this.defaultUserVariantService
        .updateVariantConf(variant, config || this.generateConfig())
        .then(() => {
          this.updateUserVariantList(false);
        })
        .finally(() => {
          if (this._variantListDialog) {
            this._variantListDialog.close();
          }
        });
    }
  }

  protected _resetMetaData(): void {
    this.ref.removeAllItems();
    this.localModel.setProperty('/variantMeta', {
      variantList: [],
      updateVariantList: [],
      selectedVariant: {},
      variantTemplate: {},
    });
  }

  protected _generateUserVariant(): FlexBox {
    this.updateUserVariantList(true);
    const variantBlock = new FlexBox({
      alignItems: FlexAlignItems.Center,
      items: [
        new Text({
          text: {
            path: `${this.modelName}>/variantMeta/selectedVariant/variantName`,
          },
        }),
        new Button({
          icon: 'sap-icon://navigation-down-arrow',
          width: '30px',
          press: this._showVariantListDialog.bind(this),
        }).addStyleClass('sapUiTinyMarginBegin'),
      ],
    });
    return variantBlock;
  }

  protected _showVariantListDialog(e: Event) {
    const btn = e.getSource() as Button;
    if (!this._variantListDialog) {
      this._variantListDialog = this._generateVariantListDialog();
    }
    this._preSelectVariantList();
    this._variantListDialog.openBy(btn);
  }

  protected _generateVariantListDialog() {
    const parsedVariantList = this.localModel.getProperty('/variantMeta/variantList');
    const popOverListItemArr = parsedVariantList.map((variant: IVariant) => {
      return new Item({
        key: `${variant.variantID as number}`,
        text: variant.variantName,
      });
    });
    return new ResponsivePopover({
      showHeader: true,
      title: 'My Variants',
      contentHeight: '50%',
      contentWidth: '30%',
      placement: PlacementType.Bottom,
      content: new Page(undefined, {
        showHeader: false,
        content: new SelectList('idvariantList', {
          items: popOverListItemArr,
          itemPress: this._selectVariant.bind(this),
        }),
        footer: new OverflowToolbar({
          content: [
            new ToolbarSpacer({}),
            new Button({
              type: ButtonType.Emphasized,
              text: 'Update',
              press: this._onUpdateVariant.bind(this),
            }),
            new Button({
              type: ButtonType.Emphasized,
              text: 'Save As',
              press: this._onSaveBtnPress.bind(this),
            }),
            new Button({
              type: ButtonType.Emphasized,
              text: 'Manage',
              press: this._onManageBtnPress.bind(this),
            }),
          ],
        }),
      }),
      afterClose: () => {
        this._variantListDialog?.destroy();
        this._variantListDialog = undefined;
      },
    });
  }

  protected _selectVariant(e: Event) {
    const parsedVariantList = this.localModel.getProperty('/variantMeta/variantList') as IVariant[];
    const listControl = e.getSource() as SelectList;
    const variantId = e.getParameter('item').getKey() as string;
    listControl.setSelectedKey(variantId);
    const selectedVaraintIndex = parsedVariantList.findIndex((variant: IVariant) => `${variant.variantID as number}` === variantId);
    const selectedVariant = parsedVariantList[selectedVaraintIndex];
    this.localModel.setProperty('/variantMeta/selectedVariant', selectedVariant);
    this.applyConfig(selectedVariant);
    this._variantListDialog?.close();
  }

  protected _preSelectVariantList() {
    const variantListControl = sap.ui.getCore().byId('idvariantList') as SelectList;
    const selectedVaraint = this.localModel.getProperty('/variantMeta/selectedVariant') as IVariant;
    variantListControl.setSelectedKey(`${selectedVaraint.variantID as number}`);
  }

  protected _onSaveBtnPress() {
    this._variantListDialog?.close();
    if (!this._variantSaveDialog) {
      this._variantSaveDialog = this._createVariantSaveDialog();
      this.view.addDependent(this._variantSaveDialog);
    }
    this._variantSaveDialog.open();
  }

  protected _createVariantSaveDialog() {
    const variantTemplate = {
      variantName: 'Standard*',
      default: false,
    };
    this.localModel.setProperty('/variantMeta/variantTemplate', variantTemplate);
    return new Dialog({
      title: 'Variant Save',
      contentWidth: '400px',
      content: new VBox({
        justifyContent: FlexJustifyContent.Center,
        items: [
          new FlexBox({
            justifyContent: FlexJustifyContent.SpaceBetween,
            alignItems: FlexAlignItems.Center,
            items: [
              new Label({
                text: 'View',
              }),
              new Input({
                placeholder: 'Enter view Name',
                value: {
                  path: `${this.modelName}>/variantMeta/variantTemplate/variantName`,
                },
              }),
            ],
          }),
          new FlexBox({
            justifyContent: FlexJustifyContent.SpaceBetween,
            alignItems: FlexAlignItems.Center,
            items: [
              new Label({
                text: 'Set as Default',
              }),
              new Switch({
                type: SwitchType.AcceptReject,
                state: {
                  path: `${this.modelName}>/variantMeta/variantTemplate/default`,
                },
              }),
            ],
          }),
        ],
      }).addStyleClass('sapUiSmallMargin'),
      beginButton: new Button({
        type: ButtonType.Emphasized,
        text: 'Save',
        press: this._onSaveVariant.bind(this),
      }),
      endButton: new Button({
        text: 'Cancel',
        press: () => {
          this._variantSaveDialog?.close();
        },
      }),
      afterClose: () => {
        this._variantSaveDialog?.destroy();
        this._variantSaveDialog = undefined;
      },
    });
  }

  protected _onManageBtnPress() {
    this._variantListDialog?.close();
    if (!this._variantManageDialog) {
      this._variantManageDialog = this._createVariantManageDialog();
      this.view.addDependent(this._variantManageDialog);
    }
    const variantList = this.localModel.getProperty('/variantMeta/variantList');
    this.localModel.setProperty('/variantMeta/updateVariantList', JSON.parse(JSON.stringify(variantList)));
    this._variantManageDialog.open();
  }

  protected _createVariantManageDialog() {
    this._variantManageTable = new Table({
      inset: false,
      items: {
        path: `${this.modelName}>/variantMeta/updateVariantList`,
        template: new ColumnListItem({
          cells: [
            // @ts-ignore
            new Input({
              value: `{${this.modelName}>variantName}`,
              editable: '{= ${' + this.modelName + ">variantName} === 'Standard' ? false : true}",
            }),
            new Text({
              text: '{= ${' + this.modelName + ">variantName} === 'Standard' ? 'System' : ${store>/userName}}",
            }),
            // @ts-ignore
            new RadioButton({
              text: '',
              selected: {
                path: `${this.modelName}>default`,
              },
              groupName: 'defaultGroup',
            }),
            // @ts-ignore
            new Button({
              icon: 'sap-icon://delete',
              text: '',
              press: this._onDeleteVariant.bind(this),
              enabled: '{= ${' + this.modelName + ">variantName} === 'Standard' ? false : true}",
            }),
          ],
        }),
      },
      columns: [
        new Column({
          header: new Text({
            text: 'View',
          }),
        }),
        new Column({
          header: new Text({
            text: 'CreateBy',
            width: '12em',
          }),
        }),
        new Column({
          header: new Text({
            text: 'Default',
            width: '7em',
          }),
        }),
        new Column({
          header: new Text({
            text: 'Action',
            width: '7em',
          }),
        }),
      ],
    });
    return new Dialog({
      contentWidth: '60%',
      title: 'Manage Views',
      content: [
        new SearchField({
          placeholder: 'Search Variant Name',
          liveChange: this._onSearchVariant.bind(this),
        }),
        this._variantManageTable,
      ],
      beginButton: new Button({
        text: 'Confirm',
        type: ButtonType.Emphasized,
        press: this._onPressVariantManageConfirm.bind(this),
      }),
      endButton: new Button({
        text: 'Cancel',
        press: () => {
          this._variantManageDialog?.close();
        },
      }),
      afterClose: () => {
        this._variantManageDialog?.destroy();
        this._variantManageDialog = undefined;
        this._variantManageTable = undefined;
      },
    });
  }

  protected _onPressVariantManageConfirm() {
    const oldVariantList = JSON.parse(JSON.stringify(this.localModel.getProperty('/variantMeta/variantList'))) as IVariant[];
    const newVariantList = this.localModel.getProperty('/variantMeta/updateVariantList') as IVariant[];
    oldVariantList.forEach((variant: IVariant) => {
      const updatedVariant = newVariantList.find((newVariant: IVariant) => newVariant.variantID === variant.variantID);
      if (updatedVariant) {
        variant.default = updatedVariant.default;
        variant.variantName = updatedVariant.variantName;
      } else {
        variant.needDelete = true;
      }
    });
    this.defaultUserVariantService
      .manageVariant(oldVariantList.splice(1)) // exclude default variant
      .then(() => {
        this.updateUserVariantList(true);
      })
      .finally(() => {
        this._variantManageDialog?.close();
      });
  }

  protected _onSaveVariant() {
    const saveVariant = this.localModel.getProperty('/variantMeta/variantTemplate');
    this.defaultUserVariantService
      .saveVariant({
        default: saveVariant.default,
        function: this.functionName,
        variantConfig: this.generateConfig(),
        variantName: saveVariant.variantName,
      })
      .then(() => {
        this.updateUserVariantList(true);
      })
      .finally(() => {
        this._variantSaveDialog?.close();
      });
  }

  protected _onUpdateVariant() {
    this.updateVariant();
  }

  protected _onSearchVariant(e: Event) {
    const searchVariantValue = e.getParameter('newValue');
    const variantFilters = [new Filter('variantName', FilterOperator.Contains, searchVariantValue)];
    (this._variantManageTable?.getBinding('items') as unknown as any).filter(variantFilters);
  }

  protected _onDeleteVariant(e: Event) {
    const deleteItem = (e.getSource() as Control)?.getParent()?.getBindingContext(this.modelName)?.getObject() as IVariant;
    const variantList = this.localModel.getProperty('/variantMeta/updateVariantList') as IVariant[];
    if (deleteItem?.default) {
      variantList[0].default = true;
    }
    const newVariantList = variantList.filter((item) => item.variantID !== deleteItem.variantID);
    this.localModel.setProperty('/variantMeta/updateVariantList', newVariantList);
  }
}
