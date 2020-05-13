import { IDisplayEntry, ISearch } from "types";
import * as JsSearch from "js-search";

interface ISearchableStudent extends IDisplayEntry {
  index: number;
}

export const buildSearch = (students: IDisplayEntry[]): ISearch => {
  const search = new JsSearch.Search("student_name");
  search.addIndex("student_name");
  search.addIndex("title");

  search.addDocuments(students);

  return (searchString: string) => {
    return search.search(searchString) as IDisplayEntry[];
  };
};
