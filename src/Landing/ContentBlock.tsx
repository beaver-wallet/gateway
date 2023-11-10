import { ReactNode, useContext } from "react";
import { OnMobileContext } from "./Responsive";

export function ContentBlock(props: {
  imageName: string;
  text: ReactNode;
  imagePosition: "left" | "right";
}) {
  const onMobile = useContext(OnMobileContext);

  const imgBlock = (
    <img
      alt="Block"
      src={`/${props.imageName}.png`}
      width={onMobile ? 100 : 200}
      style={{
        display: "inline",
      }}
    />
  );

  const textBlock = <div>{props.text}</div>;

  const mobileLayout = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {imgBlock}
      {textBlock}
    </div>
  );

  const desktopLayout = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      {props.imagePosition === "left"
        ? [imgBlock, textBlock]
        : [textBlock, imgBlock]}
    </div>
  );

  return onMobile ? mobileLayout : desktopLayout;
}
