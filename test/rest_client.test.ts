import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { get, post } from "../src/rest_client";
import { AxiosError } from "axios";

const mockAxios = new MockAdapter(axios);

const BASE_URL = "https://example.com/api";

describe("REST Client", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("should handle request errors with response", async () => {
    const error = {
      response: {
        status: 404,
        data: { error: "Not Found" },
      },
    } as AxiosError;

    mockAxios.onGet(`${BASE_URL}/error`).reply(404, { error: "Not Found" });

    try {
      await get("error");
      fail("Expected an error to be thrown");
    } catch (error) {
      expect((error as AxiosError).response?.status).toBe(404);
      expect((error as AxiosError).response?.data).toEqual({
        error: "Not Found",
      });
    }
  });

  it("should handle request errors without response", async () => {
    const error = {
      request: "No response received",
    } as AxiosError;

    mockAxios.onGet(`${BASE_URL}/error`).networkError();

    try {
      await get("error");
      fail("Expected an error to be thrown");
    } catch (error) {
      console.log(error);
      expect((error as AxiosError).name).toBe("Error");
    }
  });

  it("should handle request errors with message", async () => {
    const error = {
      message: "Request failed with status code 500",
    } as AxiosError;

    mockAxios
      .onGet(`${BASE_URL}/error`)
      .reply(500, { error: "Internal Server Error" });

    try {
      await get("error");
      fail("Expected an error to be thrown");
    } catch (error) {
      expect((error as AxiosError).message).toBe(
        "Request failed with status code 500",
      );
    }
  });
});
