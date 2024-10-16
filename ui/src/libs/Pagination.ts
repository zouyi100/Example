import View from 'sap/ui/core/mvc/View';
import TableSettingFactory from './TableSettingFactory';
import FlexBox from 'sap/m/FlexBox';
import JSONModel from 'sap/ui/model/json/JSONModel';
import Fragment from 'sap/ui/core/Fragment';
import HBox from 'sap/m/HBox';
import { ButtonType, FlexAlignItems, FlexJustifyContent } from 'sap/m/library';
import Button from 'sap/m/Button';
import ComboBox from 'sap/m/ComboBox';
import Item from 'sap/ui/core/Item';
import MessageToast from 'sap/m/MessageToast';
import ObjectStatus from 'sap/m/ObjectStatus';

interface IPaginationOption {
  modelName: string;
  id: string;
  view: View;
  loadDataFunc: (...args: any[]) => Promise<{ totalCount: number }>;
  afterLoadData?: (...args: any[]) => any;
  tableSettingFactory?: TableSettingFactory;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  isFragment?: boolean;
  fragmentId?: string;
}

interface IPaginationMeta {
  pageSize: number[];
  selectedPageId: number;
  selectedPageSize: number;
  totalPageCount: number;
  pagesSelection: number[];
}

export default class Pagination {
  protected ref: FlexBox;
  protected modelName: string;
  protected localModel: JSONModel;
  protected view: View;
  protected defaultPageSize = 15;
  protected tableSettingFactory?: TableSettingFactory;
  protected pageSizeOptions: number[];

  protected loadDataFunc: (...args: any[]) => Promise<{ totalCount: number }>;
  protected afterLoadData?: (...args: any[]) => any;

  public constructor(options: IPaginationOption) {
    const { modelName, id, view, loadDataFunc, afterLoadData, tableSettingFactory, pageSizeOptions, defaultPageSize, isFragment, fragmentId } = options;
    this.modelName = modelName;
    this.view = view;
    this.localModel = view.getModel(modelName) as JSONModel;
    this.defaultPageSize = defaultPageSize || this.defaultPageSize;
    if (isFragment && fragmentId) {
      this.ref = Fragment.byId(fragmentId, id) as FlexBox;
    } else {
      this.ref = view.byId(id) as FlexBox;
    }
    this.pageSizeOptions = pageSizeOptions || [5, 15, 50];
    this.localModel.setProperty('/paginationMeta', {
      pageSize: this.pageSizeOptions,
      selectedPageId: 1,
      selectedPageSize: this.defaultPageSize,
      totalPageCount: 0,
      pagesSelection: [],
    } as IPaginationMeta);
    this.loadDataFunc = loadDataFunc;
    this.afterLoadData = afterLoadData;
    this.tableSettingFactory = tableSettingFactory;
  }

  public init(): void {
    this._resetMetaData();
    const paginationComponent = this._generatePagination();
    this.ref.addItem(paginationComponent);
  }

  public loadData(): Promise<any> {
    return this.loadDataFunc().then((data) => {
      this._updateTotalMeta(data);

      // hooks
      if (this.afterLoadData) {
        this.afterLoadData(data);
      }

      // hook for table resizing
      if (this.tableSettingFactory) {
        this.tableSettingFactory.autoResize();
      }
    });
  }

  public getMeta(): IPaginationMeta {
    return this.localModel.getProperty('/paginationMeta') as IPaginationMeta;
  }

  public resetPageNum(): void {
    this.localModel.setProperty('/paginationMeta/selectedPageId', 1);
  }

  protected _generatePagination(): HBox {
    return new HBox({
      justifyContent: FlexJustifyContent.Center,
      width: '100%',
      items: [this._generatePageControl(), this._generatepageSizeControl(), this._generateTotalPagesControl()],
    });
  }

  protected _resetMetaData(): void {
    this.ref.removeAllItems();
    this.localModel.setProperty('/paginationMeta', {
      pageSize: this.pageSizeOptions || [5, 15, 50],
      selectedPageId: 1,
      selectedPageSize: this.defaultPageSize,
      totalPageCount: 0,
      pagesSelection: [],
    } as IPaginationMeta);
  }

  protected _updateTotalMeta(metaChange: { totalPage?: number; totalCount: number }): void {
    const pageSize = this.localModel.getProperty('/paginationMeta/selectedPageSize');
    let totalPage = metaChange.totalPage;
    const totalCount = metaChange.totalCount;
    if (totalCount && !totalPage) {
      totalPage = Math.ceil(totalCount / pageSize);
    }
    this.localModel.setProperty('/paginationMeta/totalPageCount', totalPage);
    this.localModel.setProperty(
      '/paginationMeta/pagesSelection',
      Array.from({ length: totalPage } as ArrayLike<any>, (e, index) => index + 1)
    );
  }

  protected _generatePageControl(): HBox {
    return new HBox({
      alignItems: FlexAlignItems.Center,
      justifyContent: FlexJustifyContent.Center,
      items: [
        new Button({
          type: ButtonType.Transparent,
          icon: 'sap-icon://close-command-field',
          tooltip: 'First Page',
          press: this._clickFirst.bind(this),
        }),
        new Button({
          type: ButtonType.Transparent,
          icon: 'sap-icon://navigation-left-arrow',
          tooltip: 'Previous Page',
          press: this._clickPrevious.bind(this),
        }),
        new ComboBox({
          width: '100px',
          value: `{${this.modelName}>/paginationMeta/selectedPageId}`,
          items: {
            path: `${this.modelName}>/paginationMeta/pagesSelection`,
            template: new Item({
              key: `{${this.modelName}>}`,
              text: `{${this.modelName}>}`,
            }),
            length: 5000,
          },
          change: this._changePageNum.bind(this),
        }).addStyleClass('sapUiTinyMarginBegin sapUiTinyMarginEnd'),
        new Button({
          type: ButtonType.Transparent,
          icon: 'sap-icon://navigation-right-arrow',
          tooltip: 'Next Page',
          press: this._clickNext.bind(this),
        }),
        new Button({
          type: ButtonType.Transparent,
          icon: 'sap-icon://open-command-field',
          tooltip: 'Last Page',
          press: this._clickLast.bind(this),
        }),
      ],
    });
  }

  protected _clickFirst(): void {
    this.localModel.setProperty('/paginationMeta/selectedPageId', 1);
    this.loadData();
  }

  protected _clickPrevious(): void {
    const selectedPageId = this.localModel.getProperty('/paginationMeta/selectedPageId') as number;
    if (selectedPageId === 1) {
      MessageToast.show('This is the first page.');
    } else {
      this.localModel.setProperty('/paginationMeta/selectedPageId', selectedPageId - 1);
      this.loadData();
    }
  }

  protected _clickNext(): void {
    const selectedPageId = this.localModel.getProperty('/paginationMeta/selectedPageId') as number;
    const totalPageCount = this.localModel.getProperty('/paginationMeta/totalPageCount') as number;
    if (selectedPageId === totalPageCount) {
      MessageToast.show('This is the last page.');
    } else {
      this.localModel.setProperty('/paginationMeta/selectedPageId', selectedPageId + 1);
      this.loadData();
    }
  }

  protected _clickLast(): void {
    this.localModel.setProperty('/paginationMeta/selectedPageId', this.localModel.getProperty('/paginationMeta/totalPageCount') as number);
    this.loadData();
  }

  protected _changePageNum(): void {
    setTimeout(() => {
      if (
        !this._checkPageNumberIsValid(
          this.localModel.getProperty('/paginationMeta/selectedPageId') as string,
          this.localModel.getProperty('/paginationMeta/pagesSelection') as number[]
        )
      ) {
        MessageToast.show('Invaild page number.');
        this.localModel.setProperty('/paginationMeta/selectedPageId', 1);
      } else {
        this.localModel.setProperty('/paginationMeta/selectedPageId', Number.parseInt(this.localModel.getProperty('/paginationMeta/selectedPageId') as string));
      }
      this.loadData();
    }, 0);
  }

  protected _checkPageNumberIsValid(value: string, list: number[]): boolean {
    return list.includes(Number.parseInt(value));
  }

  protected _generatepageSizeControl(): HBox {
    return new HBox({
      alignItems: FlexAlignItems.Center,
      items: [
        new ObjectStatus({
          title: 'Page Size',
        }).addStyleClass('sapUiTinyMarginEnd'),
        new ComboBox({
          width: '100px',
          value: `{${this.modelName}>/paginationMeta/selectedPageSize}`,
          items: {
            path: `${this.modelName}>/paginationMeta/pageSize`,
            template: new Item({
              key: `{${this.modelName}>}`,
              text: `{${this.modelName}>}`,
            }),
          },
          change: this._changePageSize.bind(this),
        }),
      ],
    }).addStyleClass('sapUiMediumMarginBegin');
  }

  protected _changePageSize(): void {
    setTimeout(() => {
      if (!this._checkPageSizeIsValid(this.localModel.getProperty('/paginationMeta/selectedPageSize') as string)) {
        MessageToast.show('Invaild page size.');
        this.localModel.setProperty('/paginationMeta/selectedPageSize', this.defaultPageSize);
      } else {
        this.localModel.setProperty('/selectedPageSize', Number.parseInt(this.localModel.getProperty('/paginationMeta/selectedPageSize') as string));
        this.localModel.setProperty('/paginationMeta/selectedPageId', 1);
        this.loadData();
      }
    }, 0);
  }

  protected _checkPageSizeIsValid(value: string): boolean {
    return !Number.isNaN(Number.parseInt(value));
  }

  protected _generateTotalPagesControl(): HBox {
    return new HBox({
      alignItems: FlexAlignItems.Center,
      items: [
        new ObjectStatus({
          title: 'Total Pages',
          text: `{${this.modelName}>/paginationMeta/totalPageCount}`,
        }),
      ],
    }).addStyleClass('sapUiMediumMarginBegin');
  }
}
