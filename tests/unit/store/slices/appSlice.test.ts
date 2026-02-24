import appReducer, {
  logRequest,
  logRequestFulfilled,
  logRequestRejected,
  clearApiLog,
} from "@/store/slices/ui/appSlice";

describe("appSlice", () => {
  const initialState = { apiLog: [], maxLogEntries: 50 };

  it("should return initial state", () => {
    expect(appReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("logRequest adds entry with pending status", () => {
    const state = appReducer(
      initialState,
      logRequest({ method: "POST", url: "/api/ai/transcribe" })
    );
    expect(state.apiLog).toHaveLength(1);
    expect(state.apiLog[0].method).toBe("POST");
    expect(state.apiLog[0].url).toBe("/api/ai/transcribe");
    expect(state.apiLog[0].status).toBe("pending");
    expect(state.apiLog[0].id).toBeDefined();
  });

  it("logRequestFulfilled updates entry to fulfilled", () => {
    const withRequest = appReducer(
      initialState,
      logRequest({ method: "GET", url: "/api/x", id: "req-1" })
    );
    const state = appReducer(withRequest, logRequestFulfilled({ id: "req-1" }));
    expect(state.apiLog[0].status).toBe("fulfilled");
  });

  it("logRequestRejected updates entry to rejected with error", () => {
    const withRequest = appReducer(
      initialState,
      logRequest({ method: "POST", url: "/api/y", id: "req-2" })
    );
    const state = appReducer(
      withRequest,
      logRequestRejected({ id: "req-2", error: "Network error" })
    );
    expect(state.apiLog[0].status).toBe("rejected");
    expect(state.apiLog[0].error).toBe("Network error");
  });

  it("clearApiLog empties apiLog", () => {
    const withLog = appReducer(
      initialState,
      logRequest({ method: "POST", url: "/api/z" })
    );
    const state = appReducer(withLog, clearApiLog());
    expect(state.apiLog).toHaveLength(0);
  });
});
