import RenderManager from 'sap/ui/core/RenderManager';
import Tooltip from '../Tooltip';
import Control from 'sap/ui/core/Control';

const TooltipRender = {
  apiVersion: 2, // usage of DOM Patcher

  render: function (rm: RenderManager, control: Tooltip) {
    const child = control.getAggregation('content') as Control;
    if (child && child.isA('sap.ui.core.Control')) {
      rm.openStart('div', control)
        .accessibilityState(control, { role: 'tooltip' })
        .style('max-width', '95vw')
        .style('width', (control as any).getWidth() as string)
        .openEnd()
        .renderControl(child)
        .close('div');
    } else {
      rm.openStart('span', control)
        .accessibilityState(control, { role: 'tooltip' })
        .style('max-width', '90vw')
        .style('width', (control as any).getWidth() as string)
        .style('padding', '0.5rem')
        .style('border-radius', '0.5rem')
        .class('sapThemeBaseBG-asBackgroundColor')
        .openEnd()
        .text(control.getText())
        .close('span');
    }
  },
};

export default TooltipRender;
