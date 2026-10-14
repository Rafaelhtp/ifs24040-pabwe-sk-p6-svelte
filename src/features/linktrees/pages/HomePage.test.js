import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";
import { linkTreesStore } from "../states/linkTreesStore";

const wait = (ms = 20) => new Promise((r) => setTimeout(r, ms));

describe("HomePage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockLinkTrees = [
    {
      id: 1,
      title: "Kursus Ku",
      description: "Kumpulan kursus",
      type: "public",
      total_links: 3,
      created_at: "2024-02-26T02:34:26.000000Z",
    },
    {
      id: 2,
      title: "Rahasia",
      description: "Hanya saya",
      type: "private",
      total_links: 0,
      created_at: "2024-02-26T02:34:26.000000Z",
    },
    {
      id: 3,
      title: "Tersembunyi",
      description: "Tidak terdaftar",
      type: "unlisted",
      total_links: 1,
      created_at: "2024-02-26T02:34:26.000000Z",
    },
  ];

  let loadSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    loadSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockResolvedValue();
  });

  it("should render nothing when profile is not present", () => {
    const { wrapper } = renderWithProviders(HomePage, { preloadedState: { profile: null } });
    expect(wrapper.find('[data-testid="add-link-tree-btn"]').exists()).toBe(false);
  });

  it("should render heading, stats and link tree cards", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await wait();

    expect(loadSpy).toHaveBeenCalledWith(false);
    expect(wrapper.find("h1").text()).toBe("Semua Link Tree");
    const stats = wrapper.findAll('[data-testid="stat-card"]').map((card) => card.text());
    expect(stats).toHaveLength(4);
    expect(stats[0]).toContain("3");
    expect(stats[1]).toContain("Publik");
    expect(wrapper.text()).toContain("Kursus Ku");
    expect(wrapper.text()).toContain("3 tautan");
  });

  it("should render empty state", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: [] },
    });
    await wait();

    expect(wrapper.text()).toContain("Belum ada link tree yang cocok.");
    expect(wrapper.find('[data-testid="delete-all-btn"]').element.disabled).toBe(true);
  });

  it("should handle null link trees and unknown types gracefully", async () => {
    const nullState = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: null },
    });
    await wait();
    expect(nullState.wrapper.text()).toContain("Belum ada link tree yang cocok.");

    const unknownType = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [{ id: 9, title: "Aneh", description: null, type: "weird" }],
      },
    });
    await wait();
    expect(unknownType.wrapper.text()).toContain("Aneh");
  });

  it("should show loading indicator while loading", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: [] },
    });
    await wait();

    loadSpy.mockReturnValue(new Promise(() => {}));
    await wrapper.find('[data-testid="filter-is-me-checkbox"]').trigger("click");
    await wait();

    expect(wrapper.text()).toContain("Memuat daftar link tree...");
  });

  it("should filter by search query on title and description", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await wait();

    const search = wrapper.find('[data-testid="search-link-tree-input"]');
    await search.setValue("kursus");
    expect(wrapper.text()).toContain("Kursus Ku");
    expect(wrapper.text()).not.toContain("Rahasia");

    await search.setValue("hanya saya");
    expect(wrapper.text()).toContain("Rahasia");
    expect(wrapper.text()).not.toContain("Kursus Ku");

    await search.setValue("tidak ada");
    expect(wrapper.text()).toContain("Belum ada link tree yang cocok.");
  });

  it("should reload using is_me when the checkbox is toggled", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await wait();

    const checkbox = wrapper.find('[data-testid="filter-is-me-checkbox"]');
    await checkbox.trigger("click");
    await wait();
    expect(loadSpy).toHaveBeenLastCalledWith(true);

    await checkbox.trigger("click");
    await wait();
    expect(loadSpy).toHaveBeenLastCalledWith(false);
  });

  it("should open and close the add modal", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await wait();

    await wrapper.find('[data-testid="add-link-tree-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="add-link-tree-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-add-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="add-link-tree-modal"]').exists()).toBe(false);
  });

  it("should reload the list after a link tree is added", async () => {
    const { wrapper, linkTreesStore: store } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await wait();

    await wrapper.find('[data-testid="add-link-tree-btn"]').trigger("click");
    loadSpy.mockClear();
    store.setIsLinkTreeAdded(true);
    store.setIsLinkTreeAdd(true);
    await wait();

    expect(loadSpy).toHaveBeenCalled();
    expect(wrapper.find('[data-testid="add-link-tree-modal"]').exists()).toBe(false);
  });

  it("should navigate to detail page when view button clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await wait();

    await wrapper.find('[data-testid="view-link-tree-1"]').trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/link-trees/1");
  });

  it("should delete a link tree only when confirmed", async () => {
    const { wrapper, linkTreesStore: store } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await wait();
    const deleteSpy = vi.spyOn(store, "asyncSetIsLinkTreeDelete").mockResolvedValue();
    const confirmSpy = vi.spyOn(toolsHelper, "showConfirmDialog");

    confirmSpy.mockResolvedValue({ isConfirmed: false });
    await wrapper.find('[data-testid="delete-link-tree-1"]').trigger("click");
    await wait(10);
    expect(deleteSpy).not.toHaveBeenCalled();

    confirmSpy.mockResolvedValue({ isConfirmed: true });
    await wrapper.find('[data-testid="delete-link-tree-1"]').trigger("click");
    await wait(10);
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should delete all link trees only when confirmed", async () => {
    const { wrapper, linkTreesStore: store } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await wait();
    const deleteAllSpy = vi.spyOn(store, "asyncSetIsLinkTreeDeleteAll").mockResolvedValue();
    const confirmSpy = vi.spyOn(toolsHelper, "showConfirmDialog");

    confirmSpy.mockResolvedValue({ isConfirmed: false });
    await wrapper.find('[data-testid="delete-all-btn"]').trigger("click");
    await wait(10);
    expect(deleteAllSpy).not.toHaveBeenCalled();

    confirmSpy.mockResolvedValue({ isConfirmed: true });
    await wrapper.find('[data-testid="delete-all-btn"]').trigger("click");
    await wait(10);
    expect(deleteAllSpy).toHaveBeenCalled();
  });

  it("should reload only when deletion succeeded", async () => {
    const { linkTreesStore: store } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await wait();
    loadSpy.mockClear();

    store.setIsLinkTreeDeleted(false);
    store.setIsLinkTreeDelete(true);
    await wait();
    expect(loadSpy).not.toHaveBeenCalled();

    store.setIsLinkTreeDeleted(true);
    store.setIsLinkTreeDelete(true);
    await wait();
    expect(loadSpy).toHaveBeenCalledTimes(1);
  });

  it("should reload only when delete all succeeded", async () => {
    const { linkTreesStore: store } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await wait();
    loadSpy.mockClear();

    store.setIsLinkTreeDeletedAll(false);
    store.setIsLinkTreeDeleteAll(true);
    await wait();
    expect(loadSpy).not.toHaveBeenCalled();

    store.setIsLinkTreeDeletedAll(true);
    store.setIsLinkTreeDeleteAll(true);
    await wait();
    expect(loadSpy).toHaveBeenCalledTimes(1);
  });
});
