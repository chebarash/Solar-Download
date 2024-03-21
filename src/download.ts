import axios from "axios";
import progress from "./progress";

class Download {
  private loaded = 0;
  constructor(private lenght: number) {
    progress(lenght, 0);
  }
  getIcon = async (url: string): Promise<string> => {
    try {
      const { data } = await axios.get<string>(url);
      this.loaded++;
      progress(this.lenght, this.loaded);
      return data;
    } catch (e) {
      return await this.getIcon(url);
    }
  };
}

export default Download;
