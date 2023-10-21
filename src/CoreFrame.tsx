import { useNavigate } from "react-router-dom";
import { GoBackIcon } from "./icons";

export function CoreFrame(props: {
  title: string;
  children?: any;
  paddingHorizontal?: number;
  backPath?: string | number;
}) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          width: "400px",
          height: "60vh",
          marginTop: "10vh",
          boxShadow: `0px 0px 4px 0px grey`,
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft:
            props.paddingHorizontal ?? 16,
          paddingRight:
            props.paddingHorizontal ?? 16,
          overflowY: "scroll",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
          }}
        >
          {props.backPath ? (
            <div
              onClick={() =>
                navigate(props.backPath as any)
              }
            >
              <GoBackIcon active={true} />
            </div>
          ) : (
            <GoBackIcon active={false} /> // just to fill the space
          )}
          <p
            style={{
              fontSize: 24,
              marginBottom: 16,
            }}
          >
            {props.title}
          </p>
          <div />
        </div>
        {props.children}
      </div>
    </div>
  );
}
