interface WFProps {
  label: string;
  value: boolean;
}
/**
 * WF 是否
 */
export const WF: WFProps[] = [
  {
    label: "是",
    value: true,
  },
  {
    label: "否",
    value: false,
  },
];

interface TFProps {
  label: string;
  value: boolean | string | number;
}
/**
 * WF 是否
 */
export const TF: TFProps[] = [
  {
    label: "是",
    value: true,
  },
  {
    label: "否",
    value: false,
  },
];
