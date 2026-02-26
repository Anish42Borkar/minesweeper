import type { TITLE_STATUSES } from '../constant';

export type PositionT = {
  x: number;
  y: number;
};

export type TileStatusT = (typeof TITLE_STATUSES)[keyof typeof TITLE_STATUSES];

export type BoardT = {
  x: number;
  y: number;
  mine: boolean;
  status: TileStatusT;
  text: string;
};
