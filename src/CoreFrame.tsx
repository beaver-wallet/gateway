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
    <div className="rootContainer">
      <p
        className="title1Font"
        onClick={() =>
          (window.location.href = "/")
        }
      >
        PayBeaver
      </p>
      <div className="centralizingContainer">
        <div className="cardContainer scrollingCard">
          <div className="cardHeader">
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
            <p className="title2Font">
              {props.title}
            </p>
            <div />
          </div>
          {props.children}
        </div>
      </div>
      <p className="minor2Font footer centralText">
        Made by Alexey Nebolsin{" "}
        <a
          href="https://twitter.com/nebolax"
          className="minor2Font"
        >
          @nebolax
        </a>
        .
      </p>
    </div>
  );
}
