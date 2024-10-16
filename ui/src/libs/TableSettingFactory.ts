import View from 'sap/ui/core/mvc/View';
import Dialog from 'sap/m/Dialog';
import JSONModel from 'sap/ui/model/json/JSONModel';
import Table from 'sap/ui/table/Table';
import Input from 'sap/m/Input';
import SegmentedButton from 'sap/m/SegmentedButton';
import FlexBox from 'sap/m/FlexBox';
import Button from 'sap/m/Button';
import { ButtonType, FlexJustifyContent, FlexWrap } from 'sap/m/library';
import VBox from 'sap/m/VBox';
import SimpleForm from 'sap/ui/layout/form/SimpleForm';
import { form } from 'sap/ui/layout/library';
import SegmentedButtonItem from 'sap/m/SegmentedButtonItem';
import CheckBox from 'sap/m/CheckBox';
import Label from 'sap/m/Label';
import Event from 'sap/ui/base/Event';
import MessageDialog from './MessageDialog';

interface ITableSettingFactoryOption {
  view: View;
  title: string;
  modelName: string;
  tableId: string;
  freezeCount: number;
  columnResizeMode?: 'auto' | 'manual' | 'fixed';
}

export default class TableSettingFactory {
  protected view: View;
  protected settingDialog: Dialog;
  protected modelName: string;
  protected localModel: JSONModel;
  protected tableId: string;
  protected controledTable: Table;
  protected title: string;
  protected columnResizeMode?: 'auto' | 'manual' | 'fixed';

  protected _freezeInput: Input;
  protected _columnResizeBox: SegmentedButton;
  protected _checkBoxContainer: FlexBox;

  public constructor(options: ITableSettingFactoryOption) {
    const { view, title, modelName, tableId, freezeCount, columnResizeMode } = options;
    this.view = view;
    this.title = title;
    this.modelName = modelName;
    this.tableId = tableId;
    this.columnResizeMode = columnResizeMode;
    this.localModel = view.getModel(modelName) as JSONModel;
    this.localModel.setProperty('/tableSettingMeta', {
      freezeCount: freezeCount,
      columnResizeMode: this.columnResizeMode || 'manual', // default setting is manual
      lastColumnResizeMode: this.columnResizeMode || 'manual',
      savedColumnSize: {
        manual: [],
        fixed: [],
      },
    });
    this.controledTable = view.byId(this.tableId) as Table;
  }

  public generateSettingDialog(): Dialog {
    const settingDialog = new Dialog({
      content: this._generateContent(),
      title: this.title,
      contentHeight: '800px',
      contentWidth: '950px',
      buttons: [
        new Button({
          text: {
            path: 'i18n>BTN_CONFIRM',
          },
          type: ButtonType.Accept,
          icon: 'sap-icon://accept',
          press: this._clickConfirm.bind(this),
        }),
        new Button({
          text: {
            path: 'i18n>BTN_CANCEL',
          },
          type: ButtonType.Reject,
          icon: 'sap-icon://sys-cancel',
          press: this._clickCancel.bind(this),
        }),
      ],
    });
    this.settingDialog = settingDialog;
    this.view.addDependent(settingDialog);
    this._saveColumnSize('init');
    return settingDialog;
  }

  public autoResize(): void {
    setTimeout(() => {
      this._applyColumnResize();
    }, 0);
  }

  protected _generateContent(): VBox {
    return new VBox({
      items: [
        new SimpleForm({
          editable: false,
          layout: form.SimpleFormLayout.ResponsiveGridLayout,
          title: 'Freeze Columns',
          singleContainerFullSize: false,
          content: [this._generateFreezeInput()],
        }),
        new SimpleForm({
          editable: false,
          layout: form.SimpleFormLayout.ResponsiveGridLayout,
          title: 'Column Resize',
          singleContainerFullSize: false,
          content: [this._generateColumnResizeBox()],
        }),
        new SimpleForm({
          editable: false,
          layout: form.SimpleFormLayout.ResponsiveGridLayout,
          title: 'Filter Columns',
          singleContainerFullSize: false,
          columnsM: 1,
          content: [this._generateFilterColumns()],
        }),
      ],
    }).addStyleClass('sapUiSmallMargin');
  }

  protected _generateFreezeInput(): Input {
    this._freezeInput = new Input({
      width: '30%',
      placeholder: 'Fix column count',
    });
    return this._freezeInput;
  }

  protected _generateColumnResizeBox(): SegmentedButton {
    this._columnResizeBox = new SegmentedButton({
      selectedKey: {
        path: `${this.modelName}>/tableSettingMeta/columnResizeMode`,
      },
      items: [
        new SegmentedButtonItem({
          text: 'Auto',
          key: 'auto',
        }),
        new SegmentedButtonItem({
          text: 'Manual',
          key: 'manual',
        }),
        new SegmentedButtonItem({
          text: 'Fixed',
          key: 'fixed',
        }),
      ],
    }).addStyleClass('column-resize-mode-btn');
    return this._columnResizeBox;
  }

  protected _generateFilterColumns(): FlexBox {
    const columns = this.controledTable.getColumns();
    this._checkBoxContainer = new FlexBox({
      wrap: FlexWrap.Wrap,
      justifyContent: FlexJustifyContent.Start,
    });

    // select all
    this._checkBoxContainer.addItem(
      new CheckBox({
        text: 'Select All',
        selected: true,
        select: this._selectAll.bind(this),
        width: '250px',
      })
    );

    columns.forEach((column) => {
      const visiblePath = (column.getBindingInfo('visible') as unknown as any).binding.sPath as string;

      // prefer i18n, if without i18n, use filed title
      if ((column?.getAggregation('label') as Label)?.getBindingInfo('text')) {
        const label = ((column.getAggregation('label') as Label).getBindingInfo('text') as any).binding.sPath as string;
        this._checkBoxContainer.addItem(
          new CheckBox({
            text: {
              path: `i18n>${label}`,
            },
            selected: {
              path: `${this.modelName}>${visiblePath}`,
            },
            width: '250px',
          })
        );
      } else {
        const label = (column.getAggregation('label') as Label).getProperty('text');
        this._checkBoxContainer.addItem(
          new CheckBox({
            text: label,
            selected: {
              path: `${this.modelName}>${visiblePath}`,
            },
            width: '250px',
          })
        );
      }
    });

    return this._checkBoxContainer;
  }

  protected _selectAll(e: Event): void {
    const isSelected = e.getParameter('selected');
    const items = this._checkBoxContainer.getItems();
    items.forEach((item: any) => {
      if (item.getEditable()) {
        item.setSelected(isSelected);
      }
    });
  }

  protected _freezeColumns(): void {
    let freezeflag = false;
    let freezeerr = '';
    const columnCount = parseInt((this._freezeInput.getValue()) || '0');
    const tableColumnCount = this.controledTable.getColumns().length;

    if (columnCount > tableColumnCount) {
      freezeerr = 'Freeze columns cannot be larger than total columns!';
      freezeflag = false;
    } else {
      freezeflag = true;
    }

    if (freezeflag) {
      this.localModel.setProperty('/tableSettingMeta/freezeCount', columnCount);
    } else {
      MessageDialog.msg(freezeerr);
    }
  }

  protected _applyColumnResize(): void {
    const columns = this.controledTable.getColumns();
    const oldMode = this.localModel.getProperty('/tableSettingMeta/oldColumnResizeMode') as 'auto' | 'manual' | 'fixed';
    if (oldMode === 'manual') {
      this._saveColumnSize(oldMode);
    }
    const newMode = this.localModel.getProperty('/tableSettingMeta/columnResizeMode');
    const savedColumnSize = this.localModel.getProperty('/tableSettingMeta/savedColumnSize');
    switch (newMode) {
      case 'auto': {
        columns.forEach((column) => {
          // @ts-ignore
          const index = column.getIndex() as number;
          column.setResizable(true).setAutoResizable(true);
          this.controledTable.autoResizeColumn(index);
        });
        break;
      }
      case 'manual': {
        columns.forEach((column, index) => {
          column.setResizable(true).setAutoResizable(true);
          if (savedColumnSize) {
            column.setWidth(savedColumnSize.manual[index] as string);
          }
        });
        break;
      }
      case 'fixed': {
        columns.forEach((column, index) => {
          column.setResizable(false).setAutoResizable(false);
          if (savedColumnSize) {
            column.setWidth(savedColumnSize.fixed[index] as string);
          }
        });
        break;
      }
    }
    this.localModel.setProperty('/tableSettingMeta/oldColumnResizeMode', newMode);
  }

  protected _saveColumnSize(modeName: 'auto' | 'manual' | 'fixed' | 'init'): void {
    const sizeArr = this.controledTable.getColumns().map((column) => column.getWidth() || 'auto');
    if (modeName === 'init') {
      this.localModel.setProperty('/tableSettingMeta/savedColumnSize', {
        manual: sizeArr,
        fixed: sizeArr,
      });
    } else if (modeName === 'manual') {
      this.localModel.setProperty('/tableSettingMeta/savedColumnSize/manual', sizeArr);
    }
  }

  protected _clickConfirm(): void {
    this._freezeColumns();
    this._applyColumnResize();
    this.settingDialog.close();
  }

  protected _clickCancel(): void {
    this.settingDialog.close();
  }
}
