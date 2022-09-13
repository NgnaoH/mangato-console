import { Chapter, ImageSource } from "@/types";
import { Media } from "@/types/anilist";
import React from "react";

interface ContextProps {
  manga: Media;
  chapters: Chapter[];
  currentChapter: Chapter;
  currentChapterIndex: number;
  setChapter: (chapter: Chapter) => void;
  sourceId: string;
  images: ImageSource[];
  imagesId: any;
  isTranslate: boolean;
  setLang: any;
  lang: string;
  getTranslate: any;
  imagesTranslated: any;
  isTranlating: boolean;
}

interface ReactContextProviderProps {
  value: ContextProps;
}

const ReadContext = React.createContext<ContextProps>(null);

export const ReadContextProvider: React.FC<ReactContextProviderProps> = ({
  children,
  value,
}) => {
  return <ReadContext.Provider value={value}>{children}</ReadContext.Provider>;
};

export const useReadInfo = () => {
  return React.useContext(ReadContext);
};
