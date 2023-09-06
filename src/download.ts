import axios from "axios";
import progress from "./progress";
import { UrlsType } from "./types";

class Download {
  private loaded = 0;
  constructor(private urls: UrlsType) {
    progress(Object.keys(urls).length, 0);
  }
  getIcon = async (url: string): Promise<string> => {
    try {
      const { data } = await axios.get<string>(url);
      this.loaded++;
      progress(Object.keys(this.urls).length, this.loaded);
      return data;
    } catch (e) {
      return await this.getIcon(url);
    }
  };
}

export default Download;
