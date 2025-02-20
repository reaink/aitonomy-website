const api_url = process.env.NEXT_PUBLIC_MEILISEARCH_URL;

import { MeiliSearch, SearchParams } from "meilisearch";
import { parseId } from "../thread";

const client = new MeiliSearch({
  host: api_url!,
});

export async function meiliSearchFetcher(
  index: string,
  search?: string,
  args?: SearchParams
) {
  const res = await client.index(index).searchGet(search, args);

  /**
   * parse response format
   */
  res.hits = res.hits.map((hit) => {
    return {
      ...hit,
      ...(["thread", 'comment'].includes(index) 
        ? {
            formatedId: parseId(hit.id),
          }
        : {}),
    };
  });

  return res;
}
