import React, { useEffect } from "react";
import { useSpring, animated as a, config as springConfig } from "react-spring";
import Rolling20, { IRolling20Props } from "./Rolling20";

export const getHeaderHeight = (windowWidth: number): number => {
    switch (true) {
        case windowWidth > 600:
            return 100;
        default:
            return 100;
    }
};

export const HEADER_HEIGHT_IN_VH = getHeaderHeight(window.innerWidth);
const BG_SCROLL_SPEED = 0.066;
const BG_ROWS = 2;

const pxToVh = (px: number, windowHeight: number): number =>
    (100 * px) / windowHeight;

interface IHeaderSpringProps {
    collapse: boolean;
}

const HeaderSpring = ({
    collapse
}: IHeaderSpringProps) => {
    const windowHeight = window.innerHeight;
    const [spring, setSpring] = useSpring(() => ({
        from: {
            height: 0,
            titleAnimation: 0,
        },
        to: async (next: any) => {
            next({ height: HEADER_HEIGHT_IN_VH, config: springConfig.default });
            next({
                titleAnimation: 1,
                config: { mass: 1, tension: 200, friction: 60 },
            });
        },
    }));

    useEffect(() => {
        //@ts-ignore
        setSpring({
            height: collapse
                ? 0
                : HEADER_HEIGHT_IN_VH - pxToVh(document.body.scrollTop, windowHeight),
            titleAnimation: 1,
        });
    }, [windowHeight, setSpring, collapse]);

    const Rolling20Props: IRolling20Props = {
        heightInVh: spring!.height,
        rows: BG_ROWS,
        speed: BG_SCROLL_SPEED,
        targetVH: HEADER_HEIGHT_IN_VH,
    };

    return (
        <a.div
            id="header2020-container"
            style={{
                height: spring.height.to((height) => `${height}vh`),
            }}
        >
            <h1 className="position-absolute">
                ITP
                <br />
                THESIS
                <br />
                2020
            </h1>
            <Rolling20 {...Rolling20Props} />
        </a.div>
    );
};

export default HeaderSpring;