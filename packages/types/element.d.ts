// select 下拉选项
declare type ListItem<T = any> = {
  label: string;
  value: string | number | boolean;
  [key: string]: T | string | number | boolean;
};
