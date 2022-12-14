import { getPageMedia } from "@/services/anilist";
import {
  MediaFormat,
  MediaSort,
  MediaStatus,
  MediaType,
} from "@/types/anilist";
import { supabase } from "@/utils/supabase";
import { useInfiniteQuery } from "react-query";

export interface UseBrowseOptions {
  keyword?: string;
  genres?: string[];
  format?: MediaFormat;
  limit?: number;
  tags?: string[];
  sort?: MediaSort;
  country?: string;
  status?: MediaStatus;
  isAdult?: boolean;
}

const useBrowse = (options: UseBrowseOptions) => {
  const {
    format,
    genres,
    keyword,
    sort,
    limit = 30,
    tags,
    country,
    status,
    isAdult,
  } = options;

  return useInfiniteQuery(
    ["browse-manga", options],
    async ({ pageParam = 1 }) => {
      let translationMediaIds = [];

      // Search media from translations
      if (keyword) {
        const { data: mediaTranslations } = await supabase
          .from("kaguya_translations")
          .select("mediaId")
          .eq("mediaType", MediaType.Manga)
          .textSearch("title", keyword, {
            type: "plain",
          });

        if (mediaTranslations?.length) {
          translationMediaIds = mediaTranslations.map(
            (translation) => translation.mediaId
          );
        }
      }

      const data = await getPageMedia({
        type: MediaType.Manga,
        format,
        perPage: limit,
        countryOfOrigin: country,
        sort: [sort],
        status,
        page: pageParam,
        // If media ids are found, search the media using id_in.
        ...(translationMediaIds?.length && { id_in: translationMediaIds }),
        ...(tags?.length && { tag_in: tags }),
        ...(genres?.length && { genre_in: genres }),
        ...(keyword && !translationMediaIds?.length && { search: keyword }),
        isAdult:
          isAdult || genres.includes("Hentai") || genres.includes("Ecchi"),
      });

      return data;
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.pageInfo.hasNextPage
          ? lastPage.pageInfo.currentPage + 1
          : null,
    }
  );
};

export default useBrowse;
