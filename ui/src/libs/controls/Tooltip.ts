import TooltipBase, { $TooltipBaseSettings } from 'sap/ui/core/TooltipBase';
import TooltipRenderer from './renderers/TooltipRenderer';

/**
 * @extends TooltipBase
 *
 * @constructor
 * @public
 * @name com.bosch.sbs.control.Tooltip
 */
export default class Tooltip extends TooltipBase {
  constructor(id?: string | $TooltipBaseSettings);
  constructor(id?: string, settings?: $TooltipBaseSettings);
  constructor(id?: string, settings?: $TooltipBaseSettings) {
    super(id, settings);
  }

  public static readonly metadata: any = {
    interfaces: ['sap.ui.core.PopupInterface'],
    properties: {
      width: {
        type: 'sap.ui.core.CSSSize',
        defaultValue: 'auto',
      },
    },
    aggregations: {
      content: {
        type: 'sap.ui.core.Control',
        multiple: false,
        bindable: true,
      },
    },
    defaultAggregation: 'content',
  };

  public static renderer = TooltipRenderer;

  public onfocusin(): void {
    // eslint-disable-next-line prefer-rest-params
    // TooltipBase.prototype.onfocusin.apply(this, arguments);
  }
}
