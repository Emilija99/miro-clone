import { Box } from "./box";
import { LayerVariant } from "./layer";
import { Point } from "./point";
import { Side } from "./side";

export type CanvasState =
  | { mode: CanvasMode.None }
  | { mode: CanvasMode.SelectionNet; origin: Point; current?: Point }
  | { mode: CanvasMode.Translating; current: Point }
  | {
      mode: CanvasMode.Inserting;
      layerType:
        | LayerVariant.Ellipse
        | LayerVariant.Rectangle
        | LayerVariant.Text
        | LayerVariant.Note;
    }
  | { mode: CanvasMode.Pencil }
  | { mode: CanvasMode.Pressing; origin: Point }
  | { mode: CanvasMode.Resizing; initialBounds: Box; corner: Side };

export enum CanvasMode {
  None,
  Pressing,
  SelectionNet,
  Translating,
  Inserting,
  Resizing,
  Pencil,
}
