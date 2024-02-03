import { ReactNode } from "react";
import { Color, Size } from '@/types/Default'

export type BaseButtonProps = {
  title: string;
  size: Size;
  color: Color;
  onClick: () => void;
}

export type IconButtonProps = {
  children: ReactNode;
  onClick: () => void;
}