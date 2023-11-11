import { useParams } from "react-router-dom";
import { GatewayUrl } from "./constants";

export function PromptCreated() {
  const { promptId } = useParams();
  const checkoutLink = `${GatewayUrl}/subscribe/${promptId}`;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <p className="title1Font">
        Create a checkout link!
      </p>
      <div className="promptFormContainer">
        <p>
          Congrats! The checkout code is{" "}
          <strong>{promptId}</strong>.
        </p>
        <p>
          Payment link:{" "}
          <a
            href={checkoutLink}
            target="_blank"
            rel="noreferrer"
          >
            {checkoutLink}
          </a>
          .
        </p>
        <p>
          You can parametrize that link with
          specific <strong>subscriptionId</strong>
          , <strong>userId</strong> and/or{" "}
          <strong>onSuccessUrl</strong> for every
          particular user and track the payments
          precisely!
        </p>
      </div>
    </div>
  );
}
