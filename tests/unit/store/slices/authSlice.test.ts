import authReducer, {
  setUser,
  setLoading,
  setLoggingIn,
  setRegistering,
  setLoginError,
  setRegisterError,
  logout,
  clearAuthErrors,
  selectUser,
  selectIsAuthenticated,
  selectLoginError,
} from "@/store/slices/auth/authSlice";
import type { User } from "@/store/types/auth";

const mockUser: User = {
  id: "user-1",
  email: "doctor@test.com",
  fullName: "Test Doctor",
  role: "doctor",
  language: "de",
};

describe("authSlice", () => {
  const initialState = {
    user: null,
    isLoading: true,
    isLoggingIn: false,
    isRegistering: false,
    loginError: null,
    registerError: null,
  };

  it("should return initial state", () => {
    expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("setUser sets user and clears errors", () => {
    const state = authReducer(
      { ...initialState, loginError: "Error" },
      setUser(mockUser)
    );
    expect(state.user).toEqual(mockUser);
    expect(state.loginError).toBeNull();
    expect(state.registerError).toBeNull();
  });

  it("setUser null clears user", () => {
    const state = authReducer(
      { ...initialState, user: mockUser },
      setUser(null)
    );
    expect(state.user).toBeNull();
  });

  it("setLoading updates isLoading", () => {
    expect(authReducer(initialState, setLoading(false)).isLoading).toBe(false);
    expect(authReducer(initialState, setLoading(true)).isLoading).toBe(true);
  });

  it("setLoggingIn sets flag and clears loginError when true", () => {
    const withError = { ...initialState, loginError: "Fail" };
    const state = authReducer(withError, setLoggingIn(true));
    expect(state.isLoggingIn).toBe(true);
    expect(state.loginError).toBeNull();
  });

  it("setLoginError sets error and sets isLoggingIn false", () => {
    const state = authReducer(
      { ...initialState, isLoggingIn: true },
      setLoginError("Invalid credentials")
    );
    expect(state.loginError).toBe("Invalid credentials");
    expect(state.isLoggingIn).toBe(false);
  });

  it("setRegisterError sets error and sets isRegistering false", () => {
    const state = authReducer(
      { ...initialState, isRegistering: true },
      setRegisterError("Email taken")
    );
    expect(state.registerError).toBe("Email taken");
    expect(state.isRegistering).toBe(false);
  });

  it("logout clears user and all auth errors/flags", () => {
    const state = authReducer(
      {
        ...initialState,
        user: mockUser,
        loginError: "x",
        registerError: "y",
        isLoggingIn: true,
        isRegistering: true,
      },
      logout()
    );
    expect(state.user).toBeNull();
    expect(state.loginError).toBeNull();
    expect(state.registerError).toBeNull();
    expect(state.isLoggingIn).toBe(false);
    expect(state.isRegistering).toBe(false);
  });

  it("clearAuthErrors only clears errors", () => {
    const state = authReducer(
      {
        ...initialState,
        user: mockUser,
        loginError: "a",
        registerError: "b",
      },
      clearAuthErrors()
    );
    expect(state.user).toEqual(mockUser);
    expect(state.loginError).toBeNull();
    expect(state.registerError).toBeNull();
  });

  describe("selectors", () => {
    it("selectUser returns user", () => {
      expect(selectUser({ auth: { ...initialState, user: mockUser } })).toEqual(
        mockUser
      );
      expect(selectUser({ auth: initialState })).toBeNull();
    });

    it("selectIsAuthenticated returns true when user exists", () => {
      expect(
        selectIsAuthenticated({ auth: { ...initialState, user: mockUser } })
      ).toBe(true);
      expect(selectIsAuthenticated({ auth: initialState })).toBe(false);
    });

    it("selectLoginError returns loginError", () => {
      expect(
        selectLoginError({
          auth: { ...initialState, loginError: "Wrong password" },
        })
      ).toBe("Wrong password");
    });
  });
});
