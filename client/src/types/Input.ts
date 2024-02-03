import { Size, Color } from "@/types/Default";

export type InputProps = {
  title?: string;
  desc?: string;
  size: Size;
  color: Color;
  inputType: string;
  subTitle?: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}