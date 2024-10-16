import MultiComboBox from 'sap/m/MultiComboBox';

const CustomMultiComboBox = MultiComboBox.extend('com.bosch.sbs.control.CustomMultiComboBox', {
  renderer: 'sap.m.MultiComboBoxRenderer',
});
CustomMultiComboBox.prototype.init = function () {
  MultiComboBox.prototype.init.apply(this, arguments as unknown as []);
  this.setFilterFunction((term: any, item: any) => {
    const itemText = item.getText().toLowerCase();
    const searchTerm = term.toLowerCase();
    return itemText.indexOf(searchTerm) > -1;
  });
};
export default CustomMultiComboBox;
