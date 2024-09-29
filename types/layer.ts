import { LsonObject } from "@liveblocks/client";
import { Color } from "./color";

export enum LayerVariant {
  Rectangle,
  Ellipse,
  Text,
  Note,
  Path,
}

export type RectangleLayer = {
  type: LayerVariant.Rectangle;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
};

export type EllipseLayer = {
  type: LayerVariant.Ellipse;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type PathLayer = {
  type: LayerVariant.Path;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  points: number[][];
  value?: string;
};

export type TextLayer = {
  type: LayerVariant.Text;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type NoteLayer = {
  type: LayerVariant.Text;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type Layer = {
  type: LayerVariant;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
  points?: number[][];
};
