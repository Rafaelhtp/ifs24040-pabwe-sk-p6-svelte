import { describe, it, expect, vi } from "vitest";
import Sidebar from "./Sidebar.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";

describe("Sidebar", () => {
  it("should render navigation links with the required labels", () => {
    const { wrapper } = renderWithProviders(Sidebar, { props: { isSidebarOpen: false } });

    const labels = wrapper.findAll("nav a").map((link) => link.text().trim());
    expect(labels).toEqual(["Semua Link Tree", "Pengguna", "Profil"]);
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
  });

  it("should mark the current route as active", () => {
    const { wrapper } = renderWithProviders(Sidebar, { route: "/users" });

    const links = wrapper.findAll("nav a");
    expect(links[0].attributes("aria-current")).toBeNull();
    expect(links[1].attributes("aria-current")).toBe("page");
  });

  it("should mark the home link active only on the exact root path", () => {
    const { wrapper } = renderWithProviders(Sidebar, { route: "/" });

    const links = wrapper.findAll("nav a");
    expect(links[0].attributes("aria-current")).toBe("page");
    expect(links[2].attributes("aria-current")).toBeNull();
  });

  it("should close the mobile menu when backdrop is clicked", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(Sidebar, {
      props: { isSidebarOpen: true, onCloseMobile: closeSpy },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    expect(backdrop.exists()).toBe(true);
    await backdrop.trigger("click");

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle backdrop click when onCloseMobile is undefined", async () => {
    const { wrapper } = renderWithProviders(Sidebar, { props: { isSidebarOpen: true } });

    await wrapper.find('[data-testid="sidebar-backdrop"]').trigger("click");

    expect(wrapper.exists()).toBe(true);
  });

  it("should navigate and close mobile menu when a link is clicked", async () => {
    const closeSpy = vi.fn();
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(Sidebar, {
      props: { isSidebarOpen: true, onCloseMobile: closeSpy },
    });

    const usersLink = wrapper.findAll("nav a").find((link) => link.text().includes("Pengguna"));
    await usersLink.trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/users");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should navigate when onCloseMobile prop is not provided", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(Sidebar, { props: { isSidebarOpen: true } });

    const profileLink = wrapper.findAll("nav a").find((link) => link.text().includes("Profil"));
    await profileLink.trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/profile");
  });
});
