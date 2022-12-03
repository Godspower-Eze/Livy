import * as dotenv from "dotenv";
import axios, { AxiosInstance } from "axios";

dotenv.config();

class Livepeer {
  apiKey = process.env.NEXT_PUBLIC_LIVEPEER_STUDIO_KEY;
  baseUrl = "https://livepeer.studio/api/";

  axiosObject() {
    const axiosObject = axios.create({
      baseURL: this.baseUrl,
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "Accept-Encoding": "application/json",
      },
    });
    return axiosObject;
  }

  async startStream(_name: string, _axiosInstance: AxiosInstance) {
    try {
      const res = await _axiosInstance.post("stream", {
        name: _name,
      });
      return res.data;
    } catch (err) {
      console.error(err);
    }
  }

  async getStream(_id: string, _axiosInstance: AxiosInstance) {
    try {
      const res = await _axiosInstance.get(`stream/${_id}`);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  }

  async getStreams(_axiosInstance: AxiosInstance) {
    try {
      const res = await _axiosInstance.get("stream");
      return res.data;
    } catch (err) {
      console.error(err);
    }
  }
}

export default Livepeer;
