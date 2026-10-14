import { describe, it, expect, vi, beforeEach } from "vitest";
import LinkTreeLayout from "./LinkTreeLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import { usersStore } from "../../users/states/usersStore";
import apiHelper from "../../../helpers/apiHelper";
import * as routerModule from "../../../router";

describe("LinkTreeLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(usersStore, "asyncSetProfile").mockImplementation(() => Promise.resolve());
  });

  it("should redirect to login if access token does not exist", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: null },
    });

    expect(navSpy).toHaveBeenCalledWith("/auth/login");
    expect(wrapper.text()).toContain("Memuat sesi pengguna...");
  });

  it("should fetch profile when token exists", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const spy = vi.spyOn(usersStore, "asyncSetProfile").mockImplementation(() => Promise.resolve());

    renderWithProviders(LinkTreeLayout, { preloadedState: { profile: null } });

    expect(spy).toHaveBeenCalled();
  });

  it("should render navbar and sidebar, toggle sidebar and logout", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper, authStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: {
        profile: { id: 1, name: "Test User", email: "test@delcom.org" },
      },
    });

    expect(wrapper.text()).toContain("Delcom Link Tree");
    expect(wrapper.text()).toContain("Test User");
    expect(wrapper.text()).toContain("Semua Link Tree");

    await wrapper.find('[data-testid="toggle-sidebar-btn"]').trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(true);

    await wrapper.find('[data-testid="sidebar-backdrop"]').trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);

    const logoutSpy = vi.spyOn(authStore, "asyncSetIsAuthLogout").mockImplementation(() => {});
    await wrapper.find('[data-testid="profile-dropdown-button"]').trigger("click");
    await wrapper.find('[data-testid="dropdown-logout-button"]').trigger("click");

    expect(logoutSpy).toHaveBeenCalled();
  });

  it("should stay on page when isProfile is triggered and profile exists", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper, usersStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: { id: 1, name: "Logged User" }, isProfile: false },
    });

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Logged User");
  });

  it("should redirect to login when isProfile is triggered and profile is null", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { usersStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: null, isProfile: false },
    });
    vi.spyOn(usersStore, "asyncSetProfile").mockImplementation(() => Promise.resolve());

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(putTokenSpy).toHaveBeenCalledWith("");
    expect(navSpy).toHaveBeenCalledWith("/auth/login");
  });

  it("should redirect to login when isAuthLogout is true", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { authStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: { id: 1, name: "Logged User" }, isAuthLogout: false },
    });

    authStore.setIsAuthLogout(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).toHaveBeenCalledWith("/auth/login");
  });
});
