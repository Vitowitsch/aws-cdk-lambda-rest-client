import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { get, post } from "../src/rest_client";
import { rcv } from "../src/receiver";
import { logger } from "../src/receiver";

const mockAxios = new MockAdapter(axios);

const BASE_URL = "https://example.com/api";

describe("API Functions", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("should make a GET request and return data", async () => {
    const testData = { message: "Hello, world!" };
    mockAxios.onGet(`${BASE_URL}/resource`).reply(200, testData);

    const result = await get("resource");
    expect(result).toEqual(testData);
  });

  it("should make a POST request with data and return data", async () => {
    const testData = { key: "value" };
    const postData = { key: "value" };
    mockAxios.onPost(`${BASE_URL}/resource`, postData).reply(201, testData);
    const result = await post("resource", postData);
    expect(result).toEqual(testData);
  });

  it("should handle request errors", async () => {
    mockAxios
      .onGet(`${BASE_URL}/error`)
      .reply(500, { error: "Internal Server Error" });
    try {
      await get("error");
      fail("Expected an error to be thrown");
    } catch (error) {
      expect((error as Error).message).toBe(
        "Request failed with status code 500",
      );
    }
  });
});

describe("API Functions", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("should make a GET request and return data", async () => {
    const testData = { message: "Hello, world!" };
    mockAxios.onGet(`${BASE_URL}/resource`).reply(200, testData);

    const result = await get("resource");
    expect(result).toEqual(testData);
  });

  it("should make a POST request with data and return data", async () => {
    const testData = { key: "value" };
    const postData = { key: "value" };
    mockAxios.onPost(`${BASE_URL}/resource`, postData).reply(201, testData);
    const result = await post("resource", postData);
    expect(result).toEqual(testData);
  });

  it("should handle request errors", async () => {
    mockAxios
      .onGet(`${BASE_URL}/error`)
      .reply(500, { error: "Internal Server Error" });
    try {
      await get("error");
      fail("Expected an error to be thrown");
    } catch (error) {
      expect((error as Error).message).toBe(
        "Request failed with status code 500",
      );
    }
  });

  it("should call api_get and log the response", async () => {
    const testData = { message: "Hello, world!" };
    mockAxios.onGet(`${BASE_URL}/resource`).reply(200, testData);

    const loggerInfoSpy = jest.spyOn(logger, "info");
    const loggerDebugSpy = jest.spyOn(logger, "debug");

    await rcv({});

    expect(loggerInfoSpy).toHaveBeenCalledWith("call rest-api to retrieve...");
    expect(loggerDebugSpy).toHaveBeenCalledWith("GET response:", testData);
  });

  it("should handle errors from api_get and throw an error", async () => {
    const errorMessage = "Failed to import tables";
    const error = new Error(errorMessage);
    const apiGetError = new Error("Request failed with status code 500");

    mockAxios
      .onGet(`${BASE_URL}/resource`)
      .reply(500, { error: "Internal Server Error" });
    jest.spyOn(logger, "info");
    jest.spyOn(logger, "debug");
    jest.spyOn(logger, "error").mockImplementation();

    await expect(rcv({})).rejects.toThrowError(error);

    expect(logger.error).toHaveBeenCalledWith(
      "Error from rest-api call:",
      apiGetError,
    );
  });
});
