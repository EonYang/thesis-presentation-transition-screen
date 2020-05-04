import React, { useState, FC, useCallback, useEffect } from "react";
import { IStudentSummary } from "types";
import { useSpring, animated as a, SpringValue, config } from "react-spring";
import { useHistory } from "react-router-dom";
import Rolling20, { IRolling20Props } from "./Rolling20";
import useEventListener from '@use-it/event-listener';

interface IRandomSpringProps {
  student: IStudentSummary;
  students: IStudentSummary[];
  reRoll: (goback: boolean) => void;
}

const RandomSpring: FC<IRandomSpringProps> = ({
  student,
  students,
  reRoll,
}) => {
  const [redirect, setRedirect] = useState(false);
  const { student_id, student_name, title } = student;
  const history = useHistory();

  const initialSpring = {
    from: {
      curtainDown: "0vh",
      animatedName: 1,
      titleOpacity: 0,
      finished: 0,
      detailsOpacity: 1,
    },
    to: async (next: any) => {
      next({ detailsOpacity: 0, config: config.gentle });
      next({
        animatedName: 1,
        config: { mass: 1, tension: 200, friction: 60 },
      });
      await next({ curtainDown: "0vh" });
      await next(
        (() => {
          history.replace(`/random/${student_id}`);
          return { titleOpacity: 1, config: config.slow };
        })()
      );
    },
    onRest: () => {
      setRedirect(true);
    },
    config: { mass: 1, tension: 210, friction: 60 },
  };

  const [spring, setSpring] = useSpring(() => initialSpring);

  const handler = ({ key }: any) => {
    if (String(key) === "ArrowRight") {
      console.log(key);
      reRoll(false)
    }
    else if (String(key) === "ArrowLeft") reRoll(true);
  }

  useEventListener('keydown', handler);

  useEffect(() => {
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    if (redirect) {
      //@ts-ignore
      setSpring({ ...initialSpring.from, immediate: true });
    }
    setTimeout(() => {
      //@ts-ignore
      setSpring(initialSpring);
    }, 100);
    // eslint-disable-next-line
  }, [student.student_id]);

  return (
    <>
      <RandomAnimation {...{ ...spring, student_name, title }} />
    </>
  );
};


interface IRandomAnimationProps {
  curtainDown: SpringValue<string>;
  animatedName: SpringValue<number>;
  titleOpacity: SpringValue<number>;
  finished: SpringValue<number>;
  student_name: string;
  title: string;
}

const Rolling20Props: IRolling20Props = {
  heightInVh: 100,
  rows: 3,
  speed: 0.1,
};

const RandomAnimation: FC<IRandomAnimationProps> = ({
  titleOpacity,
  title,
  finished,
  curtainDown,
  animatedName,
  student_name,
}) => (
    <>
      <a.div
        className="random-container"
        style={{
          top: curtainDown,
        }}
      >
        <AnimateTitle {...{ animatedName, title }} />
        <a.h3 style={{ opacity: titleOpacity }}>{student_name}</a.h3>
        <div className="position-absolute">
          <Rolling20 {...Rolling20Props} />
        </div>
      </a.div>
    </>
  );

const ANIMATE_RANGE = 70;
const clampNameCode = (n: number): number => {
  if (n < 65) return n;
  return 65 + ((n - 65) % 26);
};
const mapCharcdoeAndSpring = (spring: number, charCode: number): number => {
  const change = (26 + Math.ceil(spring * ANIMATE_RANGE) - ANIMATE_RANGE) % 26;
  return clampNameCode(charCode + change);
};

const mapNumberToChar = (x: any, name: string): any => {
  let r: string = "";
  for (let i = 0; i < name.length; i++) {
    const newChar: string = String.fromCharCode(
      mapCharcdoeAndSpring(x, name.charCodeAt(i))
    );
    r = r.concat(newChar);
  }
  return r;
};

interface IAnimateTitleProps {
  animatedName: SpringValue<number>;
  title: string;
}
const AnimateTitle: FC<IAnimateTitleProps> = ({ title, animatedName }) => {
  return (
    <a.h2>
      {animatedName.to((x) => mapNumberToChar(x, title.toUpperCase()))}
    </a.h2>
  );
};

interface IRandomMainProps {
  students: IStudentSummary[];
}

const RandomMain: FC<IRandomMainProps> = ({ students }) => {
  const [count, set] = useState(0);
  const l = students.length;
  const reRoll = useCallback((goback: boolean = false) => {
    set(a => goback ? --a : ++a);
  }, [set]);
  return <RandomSpring {...{ student: students[(count % l + l) % l], students, reRoll }} />;
};

const nullGuard = ({
  students,
}: {
  students: IStudentSummary[] | undefined;
}) => {
  if (!students) return <h1>Loading...</h1>;
  return <RandomMain {...{ students }} />;
};

export default nullGuard;
