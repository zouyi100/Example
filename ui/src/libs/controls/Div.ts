import Control, { $ControlSettings } from "sap/ui/core/Control";
import DivRenderer from "./renderers/DivRenderer";

/**
 * @extends Control
 *
 * @constructor
 * @public
 * @name com.bosch.sbs.control.Div
 */
export default class Div extends Control {
  constructor(id?: string | $ControlSettings);
  constructor(id?: string, settings?: $ControlSettings);
  constructor(id?: string, settings?: $ControlSettings) {
    super(id, settings);
  }

  public static readonly metadata: any = {
    interfaces: ['sap.ui.core.Control'],
      properties: {},
      aggregations: {
        content: {
          type: 'sap.ui.core.Control',
          multiple: true,
          bindable: true,
        },
      },
      defaultAggregation: 'content',
  };

  public static renderer = DivRenderer;
}
