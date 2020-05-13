import React, { useEffect, useState, useReducer } from "react";
import "scss/styles.scss";
import { Switch, Route } from "react-router-dom";
import { IDisplayEntry, ICentralStore, ICardSize } from "types";
import { Context } from "../util/contexts";
import useWindowSize from "../util/useWindowSize";
import { isMobile } from "react-device-detect";
import { rootReducer } from "util/homemadeRedux/reducers";
import RandomMain from "./Random";
import { getCardSizeByWindowSize } from "util/cardSizeBreakpoints";
import { schedule } from "./studentsData";
import Cover from "./Cover";

interface IAppProps {
  students: IDisplayEntry[] | undefined;
}

const navigatorPlatform = {
  label: window.navigator.platform,
  isMac: window.navigator.platform.toUpperCase().indexOf("MAC") >= 0,
  isIOS: /(iPhone|iPod|iPad)/i.test(window.navigator.platform),
  isMobile: isMobile,
};

const initialCentralStore: ICentralStore = {
  messages: [],
};

const App = ({ students }: IAppProps) => {
  const windowSize = useWindowSize();
  const [cardSize, setCardSize] = useState<ICardSize>(
    getCardSizeByWindowSize(windowSize)
  );
  const [centralStore, dispatch] = useReducer(rootReducer, initialCentralStore);

  useEffect(() => {
    setCardSize(getCardSizeByWindowSize(windowSize));
  }, [windowSize]);

  return (
    <>
      <Context.Provider
        value={{
          windowSize,
          navigatorPlatform,
          centralStore,
          cardSize,
          dispatch,
        }}
      >
        <Switch>
          <Route path="/random/:studentIdOrSlug?">
            <RandomMain students={students} />
          </Route>
          <Route path="/" exact>
            <Cover />
          </Route>
        </Switch>
      </Context.Provider>
    </>
  );
};

const AppContainer = () => {
  const [students] = useState<IDisplayEntry[]>(schedule);

  return <App students={students} />;
};

export default AppContainer;
