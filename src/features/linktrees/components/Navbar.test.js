import { describe, it, expect, vi, beforeEach } from "vitest";
import Navbar from "./Navbar.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";

describe("Navbar", () => {
  const profileWithPhoto = {
    name: "Abdullah",
    email: "abdullah@delcom.org",
    photo: "https://example.com/photo.jpg",
  };
  const profileWithoutPhoto = { name: "Ubaid", email: "ubaid@delcom.org", photo: null };
  const profileEmpty = { name: "", email: "", photo: null };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render brand and profile photo with a descriptive alt", () => {
    const { wrapper } = renderWithProviders(Navbar, {
      props: { profile: profileWithPhoto, isSidebarOpen: false },
    });

    expect(wrapper.text()).toContain("Delcom Link Tree");
    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).toContain("abdullah@delcom.org");
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe("https://example.com/photo.jpg");
    expect(img.attributes("alt")).toBe("Foto profil Abdullah");
  });

  it("should render avatar initial when photo is missing", () => {
    const { wrapper } = renderWithProviders(Navbar, {
      props: { profile: profileWithoutPhoto, isSidebarOpen: true },
    });

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toContain("U");
  });

  it("should render fallbacks when profile is null", () => {
    const { wrapper } = renderWithProviders(Navbar, { props: {} });
    expect(wrapper.text()).toContain("Pengguna");
  });

  it("should render fallback label when name and email are empty", () => {
    const { wrapper } = renderWithProviders(Navbar, {
      props: { profile: profileEmpty },
    });
    expect(wrapper.text()).toContain("Pengguna");
  });

  it("should navigate to / when logo is clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(Navbar, { props: { profile: profileWithPhoto } });

    await wrapper.find('[data-testid="navbar-logo-link"]').trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should call onToggleSidebar when the menu button is clicked", async () => {
    const toggleSpy = vi.fn();
    const { wrapper } = renderWithProviders(Navbar, {
      props: { profile: profileWithPhoto, onToggleSidebar: toggleSpy },
    });

    await wrapper.find('[data-testid="toggle-sidebar-btn"]').trigger("click");

    expect(toggleSpy).toHaveBeenCalled();
  });

  it("should open dropdown, navigate to profile and trigger logout", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const logoutSpy = vi.fn();
    const { wrapper } = renderWithProviders(Navbar, {
      props: { profile: profileWithPhoto, onLogout: logoutSpy },
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    await wrapper.find('[data-testid="dropdown-profile-link"]').trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/profile");

    await dropdownBtn.trigger("click");
    await wrapper.find('[data-testid="dropdown-logout-button"]').trigger("click");
    expect(logoutSpy).toHaveBeenCalled();
  });

  it("should close dropdown only when clicking outside", async () => {
    const { wrapper } = renderWithProviders(Navbar, { props: { profile: profileWithPhoto } });

    await wrapper.find('[data-testid="profile-dropdown-button"]').trigger("click");
    const menu = wrapper.find('[data-testid="profile-dropdown-menu"]');

    menu.element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(false);
  });

  it("should work when callback props are omitted", async () => {
    const { wrapper } = renderWithProviders(Navbar, {
      props: { profile: profileWithPhoto, isSidebarOpen: true },
    });

    await wrapper.find('[data-testid="toggle-sidebar-btn"]').trigger("click");
    await wrapper.find('[data-testid="profile-dropdown-button"]').trigger("click");
    await wrapper.find('[data-testid="dropdown-logout-button"]').trigger("click");

    expect(wrapper.exists()).toBe(true);
  });
});
