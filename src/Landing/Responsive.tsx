import {
  createContext,
  useEffect,
  useState,
} from "react";

const DefaultValue = false;

export const OnMobileContext =
  createContext(DefaultValue);

export default function ResponsiveSection({
  children,
}: any) {
  const [width, setWidth] = useState(
    window.innerWidth
  );

  useEffect(() => {
    const handleWindowResize = () => {
      console.log(
        "window.innerWidth",
        window.innerWidth
      );
      setWidth(window.innerWidth);
    };

    window.addEventListener(
      "resize",
      handleWindowResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleWindowResize
      );
  }, []);

  return (
    <OnMobileContext.Provider
      value={width <= 900}
    >
      {children}
    </OnMobileContext.Provider>
  );
}
