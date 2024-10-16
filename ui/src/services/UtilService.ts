import FilterItem from 'sap/ui/comp/filterbar/FilterItem';
import FilterBar from 'sap/ui/comp/filterbar/FilterBar';
import Component from '../Component';
import HttpClient from '../libs/HttpClient';
import SingletonObject from '../libs/SingletonObject';
import Control from 'sap/ui/core/Control';
import MultiComboBox from 'sap/m/MultiComboBox';
import Input from 'sap/m/Input';
import DateRangeSelection from 'sap/m/DateRangeSelection';
import MultiInput from 'sap/m/MultiInput';
import Table from 'sap/ui/table/Table';

interface IUtilServiceOpion {
  component?: Component;
}

interface IConditionFilter {
  field: string;
  condition: string;
  value: any;
}

let instance: UtilService;

export default class UtilService extends SingletonObject {
  public component?: Component;
  public httpClient: HttpClient;

  public constructor(options: IUtilServiceOpion) {
    super(instance);
    instance = this;

    this.component = options?.component;
  }

  /**
   * filterbar -> pass in a component by this.byId('xxx');
   * 
   * Need to add CustomData to filter item like e.g.
   *  <MultiComboBox id="Filter_name" items="{ExceptionTableEDLModel>/searchCriteriaSet/nameSet}" showSelectAll="true" busyIndicatorDelay="0">
        <core:Item key="{ExceptionTableEDLModel>}" text="{ExceptionTableEDLModel>}" />
        <customData>
          <core:CustomData key="type" value="MultiComboBox"></core:CustomData>     --> value is the same with control type
        </customData> 
      </MultiComboBox>

  *  This function will return all the filters content that are not empty and visible in the filter bar as a key-value object.
  */
  public getFilters(filterbar: FilterBar) {
    const visibleFilterItems: FilterItem[] = filterbar.getAllFilterItems(true);
    const filters: { [key: string]: any } = {};
    const conditionFilters: Array<IConditionFilter> = [];
    let isCondition = false;
    visibleFilterItems.forEach((item) => {
      const controler = item.getControl() as Control;
      const key = controler.getId().split('Filter_')[1];
      const filterType = this.getFormattedCustomData(controler).type;
      const condition = this.getFormattedCustomData(controler).condition;
      isCondition = isCondition || !!condition;

      switch (filterType) {
        case 'MultiComboBox': {
          const selectedKey = (controler as MultiComboBox).getSelectedKeys();
          if (selectedKey.length === 0) {
            break;
          }
          if (condition) {
            conditionFilters.push({
              field: key,
              condition,
              value: selectedKey,
            });
          } else {
            filters[key] = selectedKey;
          }
          break;
        }
        case 'Input': {
          const value = (controler as Input).getValue();
          if (!value || value === '') {
            break;
          }
          if (condition) {
            conditionFilters.push({
              field: key,
              condition,
              value,
            });
          } else {
            filters[key] = value;
          }
          break;
        }
        case 'MultiInput':
        case 'FreeMultiInput': {
          const selectedValue = (controler as MultiInput).getTokens().map((token) => token.getProperty('key'));
          if (selectedValue.length === 0) {
            break;
          }
          if (condition) {
            conditionFilters.push({
              field: key,
              condition,
              value: selectedValue,
            });
          } else {
            filters[key] = selectedValue;
          }
          break;
        }
        case 'DateRangeSelection': {
          if ((controler as DateRangeSelection).getValue() === '') {
            break;
          }
          const dateRangeStrArr: string[] = (controler as DateRangeSelection).getValue().split('-');
          const start = new Date(dateRangeStrArr[0]);
          const end = new Date(dateRangeStrArr[1]);
          if (condition) {
            conditionFilters.push({
              field: key,
              condition,
              value: [start, end],
            });
          } else {
            filters[`${key as string}Start`] = start.toJSON();
            filters[`${key as string}End`] = end.toJSON();
          }
          break;
        }
        // TODO
      }
    });

    return isCondition ? conditionFilters : filters;
  }

  public clearFilters(filterbar: FilterBar) {
    const groupItems: FilterItem[] = filterbar.getAllFilterItems(false);
    groupItems.forEach((item) => {
      const control = item.getControl() as Control;
      const type = this.getFormattedCustomData(control).type;
      switch (type) {
        case 'MultiComboBox': {
          (control as MultiComboBox).setSelectedKeys([]);
          break;
        }
        case 'Input':
        case 'DateRangeSelection': {
          (control as Input | DateRangeSelection).setValue('');
          break;
        }
        case 'MultiInput':
        case 'FreeMultiInput': {
          (control as MultiInput).removeAllTokens();
          break;
        }
      }
    });
  }

  public getFormattedCustomData(component: Control) {
    const customDataList = component.getCustomData();
    const formattedData: { [key: string]: string } = {};
    customDataList.forEach((dataItem) => {
      const key = dataItem.getProperty('key');
      const value = dataItem.getProperty('value');
      formattedData[key] = value;
    });
    return formattedData;
  }

  public getSelectedItemsFromTable(table: Table) {
    return table.getSelectedIndices().map((index) => {
      return table.getContextByIndex(index)?.getObject();
    });
  }
}
