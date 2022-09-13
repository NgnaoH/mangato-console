import { useReadSettings } from "@/contexts/ReadSettingsContext";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { ImageSource } from "@/types";
import { createProxyUrl } from "@/utils";
import classNames from "classnames";
import { motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BsFillImageFill } from "react-icons/bs";
import { useReadInfo } from "@/contexts/ReadContext";
import { isEmpty } from "lodash";
import { useQuery } from "react-query";
import { multilangStatusCons } from "@/constants";

interface ReadImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  onVisible?: () => void;
  image: ImageSource;
  loadingClassName?: string;
  containerClassName?: string;
  boxes: any;
}

const ReadImage: React.FC<ReadImageProps> = ({
  image,
  className,
  loadingClassName,
  onLoad,
  onVisible,
  containerClassName,
  boxes,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const { isTranslate, currentChapter } = useReadInfo();
  const { fitMode } = useReadSettings();
  const ref = useRef<HTMLImageElement>(null);

  const entry = useIntersectionObserver(ref, {
    rootMargin: "0px 0px 10px 0px",
  });

  // useEffect(() => {
  //   setLoaded(false);
  // }, [image]);

  useEffect(() => {
    if (!entry?.isIntersecting) return;
    if (!ref.current) return;
    if (!ref.current.complete) return;

    onVisible?.();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.isIntersecting]);

  const src = useMemo(
    () =>
      image.useProxy ? createProxyUrl(image.image, image.proxy) : image.image,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [image.image]
  );

  const splitPositionFromBox = (box) => {
    return {
      left: box[0][0],
      top: box[0][1],
      width: box[1][0] - box[0][0],
      height: box[2][1] - box[1][1],
    };
  };

  const boxesTrans = useMemo(() => {
    if (ref.current === null && !isTranslate) return;
    return image?.boxes?.map((e, index) => {
      const { left, top, width, height } = splitPositionFromBox(e.box);
      return {
        ...e,
        text: isEmpty(boxes) ? e.text : boxes[index]?.text || "",
        positon: {
          left:
            (left * ref.current?.clientWidth) / image.width +
            ref.current?.offsetLeft,
          top: (top * ref.current?.clientHeight) / image.height,
          width: (width * ref.current?.clientWidth) / image.width,
          height: (height * ref.current?.clientHeight) / image.height,
        },
      };
    });
  }, [image, isTranslate, boxes]);

  const removeEscapeSequences = (text = "") => {
    return text
      .split("-\n")
      .join("")
      .split("\n")
      .join(" ")
      .split("\f")
      .join("")
      .trim();
  };
  // I have to use img instead of Next/Image because I want to image calculate the height itself
  return (
    <React.Fragment>
      {!loaded && (
        <div
          className={classNames(
            "flex flex-col gap-2 items-center justify-center w-full h-60 text-gray-500",
            loadingClassName
          )}
        >
          <BsFillImageFill className="w-8 h-8 animate-pulse" />

          <p>Vui lòng chờ...</p>
        </div>
      )}

      <motion.div
        animate={loaded ? "animate" : "initial"}
        initial="initial"
        exit="exit"
        variants={{
          animate: { opacity: 1, display: "block" },
          initial: { opacity: 0, display: "none" },
        }}
        className={`${containerClassName} relative`}
      >
        {/* eslint-disable-next-line */}
        <img
          ref={ref}
          className={classNames(
            fitMode === "auto" && "w-auto h-auto",
            fitMode === "width" && "w-full h-auto",
            fitMode === "height" && "w-auto h-screen",
            className
          )}
          alt="Đọc truyện tại Kaguya"
          src={src}
          onLoad={(e) => {
            setLoaded(true);

            onLoad?.(e);
          }}
          onError={() => {
            setLoaded(true);
          }}
          {...props}
        />

        {isTranslate &&
          currentChapter.multilang === multilangStatusCons.ready &&
          boxesTrans?.map((e, index) => {
            const text = removeEscapeSequences(e.text);
            return (
              <div
                key={index}
                className={classNames(
                  text.length ? "bg-white" : "bg-transparent",
                  "absolute"
                )}
                style={e.positon}
              >
                <p className="text-xs text-black">{e.text}</p>
              </div>
            );
          })}
      </motion.div>
    </React.Fragment>
  );
};

export default React.memo(ReadImage);
