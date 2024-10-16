import Control from 'sap/ui/core/Control';
import RenderManager from 'sap/ui/core/RenderManager';

const DivRenderer = {
  apiVersion: 2,

  render: function (rm: RenderManager, control: Control) {
    const child = control.getAggregation('content') as Control[];
    const process = rm.openStart('div').class('sbs-div').attr('id', control.getId()).openEnd();
    if (child && child.length > 0) {
      child.forEach((element) => {
        process.renderControl(element);
      });
      process.close('div');
    } else {
      process.close('div');
    }
  },
};
export default DivRenderer;
