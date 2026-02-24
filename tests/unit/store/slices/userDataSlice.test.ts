import userDataReducer, {
  setProfile,
  setPreferences,
  clearUserData,
  selectProfile,
  selectPreferences,
  selectLastLoadedAt,
} from "@/store/slices/data/userDataSlice";
import type { User } from "@/store/types/auth";

const mockUser: User = {
  id: "u1",
  email: "u@test.com",
  fullName: "Test User",
  role: "doctor",
  language: "de",
};

describe("userDataSlice", () => {
  const initialState = {
    profile: null,
    preferences: {},
    lastLoadedAt: null,
  };

  it("should return initial state", () => {
    expect(userDataReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("setProfile sets profile and lastLoadedAt", () => {
    const state = userDataReducer(initialState, setProfile(mockUser));
    expect(state.profile).toEqual(mockUser);
    expect(state.lastLoadedAt).toBeGreaterThan(0);
  });

  it("setProfile null clears lastLoadedAt", () => {
    const state = userDataReducer(
      { ...initialState, profile: mockUser, lastLoadedAt: 123 },
      setProfile(null)
    );
    expect(state.profile).toBeNull();
    expect(state.lastLoadedAt).toBeNull();
  });

  it("setPreferences merges with existing", () => {
    const state = userDataReducer(
      { ...initialState, preferences: { language: "de" } },
      setPreferences({ theme: "dark" })
    );
    expect(state.preferences).toEqual({ language: "de", theme: "dark" });
  });

  it("clearUserData resets all", () => {
    const state = userDataReducer(
      {
        profile: mockUser,
        preferences: { theme: "dark" },
        lastLoadedAt: 999,
      },
      clearUserData()
    );
    expect(state).toEqual(initialState);
  });

  describe("selectors", () => {
    it("selectProfile returns profile", () => {
      expect(
        selectProfile({ userData: { ...initialState, profile: mockUser } })
      ).toEqual(mockUser);
    });
    it("selectPreferences returns preferences", () => {
      expect(
        selectPreferences({
          userData: { ...initialState, preferences: { theme: "dark" } },
        })
      ).toEqual({ theme: "dark" });
    });
    it("selectLastLoadedAt returns lastLoadedAt", () => {
      expect(
        selectLastLoadedAt({
          userData: { ...initialState, lastLoadedAt: 12345 },
        })
      ).toBe(12345);
    });
  });
});
