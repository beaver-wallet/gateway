export const GoBackIcon = (props: {
  active: boolean;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="32"
    viewBox="0 -960 960 960"
    width="32"
    fill={props.active ? "black" : "transparent"}
  >
    <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
  </svg>
);
