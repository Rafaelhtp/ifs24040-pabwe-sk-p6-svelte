import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as router from "../../../router";
import { linkTreesStore } from "../states/linkTreesStore";

const wait = (ms = 10) => new Promise((r) => setTimeout(r, ms));

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockLinkTree = {
    id: 1,
    title: "Kursus Ku",
    type: "public",
    description: "Kumpulan kursus",
    cover: "https://example.com/cover.jpg",
    created_at: "2024-02-26T02:34:26.000000Z",
    updated_at: "2024-02-26T02:44:47.000000Z",
    items: [
      { id: 7, link_tree_id: 1, title: "Dasar Java", url: "https://youtu.be/abc" },
      { id: 8, link_tree_id: 1, title: "Dasar Svelte", url: "https://svelte.dev" },
    ],
  };

  let detailSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    detailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();
  });

  it("should render loading state if profile or link tree is missing", () => {
    const noProfile = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: null, linkTree: null },
    });
    expect(noProfile.wrapper.text()).toContain("Memuat detail link tree...");

    const noLinkTree = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: null },
    });
    expect(noLinkTree.wrapper.find("h1").exists()).toBe(false);
  });

  it("should not fetch on mount when linkTreeId is not provided", () => {
    renderWithProviders(DetailPage, {
      props: { linkTreeId: null },
      preloadedState: { profile: mockProfile, linkTree: null },
    });

    expect(detailSpy).not.toHaveBeenCalled();
  });

  it("should fetch detail on mount", () => {
    renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    expect(detailSpy).toHaveBeenCalledWith(1);
  });

  it("should render detail, cover and items with accessible names", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    expect(wrapper.find("h1").text()).toBe("Kursus Ku");
    expect(wrapper.find("h2").text()).toBe("Daftar Tautan");
    expect(wrapper.text()).toContain("Publik");
    expect(wrapper.find("img").attributes("alt")).toBe("Sampul Kursus Ku");
    expect(wrapper.find('[data-testid="link-tree-description"]').text()).toContain(
      "Kumpulan kursus"
    );
    expect(wrapper.find('[data-testid="item-row-7"] a').attributes("href")).toBe(
      "https://youtu.be/abc"
    );
    expect(wrapper.find('[data-testid="edit-item-7"]').attributes("aria-label")).toBe(
      "Ubah tautan Dasar Java"
    );
    expect(wrapper.find('[data-testid="delete-item-7"]').attributes("aria-label")).toBe(
      "Hapus tautan Dasar Java"
    );
  });

  it("should render without cover, with empty items and unknown type", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: { ...mockLinkTree, cover: null, items: undefined, type: "weird" },
      },
    });

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find('[data-testid="empty-items"]').exists()).toBe(true);
  });

  it("should navigate back to home when the back link is clicked", async () => {
    const navSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    await wrapper.find('[data-testid="back-to-link-trees-link"]').trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should open and close the cover modal", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    await wrapper.find('[data-testid="edit-cover-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-cover-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);
  });

  it("should open and close the change modal", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    await wrapper.find('[data-testid="edit-detail-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="change-link-tree-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-change-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="change-link-tree-modal"]').exists()).toBe(false);
  });

  it("should open the item modal in add and edit mode and close it", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    await wrapper.find('[data-testid="add-item-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("");

    await wrapper.find('[data-testid="close-item-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);

    await wrapper.find('[data-testid="edit-item-8"]').trigger("click");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("Dasar Svelte");
  });

  it("should delete an item only when confirmed", async () => {
    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeItemDelete")
      .mockResolvedValue();
    const confirmSpy = vi.spyOn(toolsHelper, "showConfirmDialog");
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    confirmSpy.mockResolvedValue({ isConfirmed: false });
    await wrapper.find('[data-testid="delete-item-7"]').trigger("click");
    await wait();
    expect(deleteSpy).not.toHaveBeenCalled();

    confirmSpy.mockResolvedValue({ isConfirmed: true });
    await wrapper.find('[data-testid="delete-item-7"]').trigger("click");
    await wait();
    expect(deleteSpy).toHaveBeenCalledWith(1, 7);
  });

  it("should reload detail only when item deletion succeeded", async () => {
    const { linkTreesStore: store } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });
    detailSpy.mockClear();

    store.setIsLinkTreeItemDeleted(false);
    store.setIsLinkTreeItemDelete(true);
    await wait();
    expect(detailSpy).not.toHaveBeenCalled();

    store.setIsLinkTreeItemDeleted(true);
    store.setIsLinkTreeItemDelete(true);
    await wait();
    expect(detailSpy).toHaveBeenCalledWith(1);
  });

  it("should navigate home if isLinkTree is flagged and link tree is null", async () => {
    const navSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { linkTreesStore: store } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: null, isLinkTree: false },
    });

    store.setIsLinkTree(true);
    await wait();

    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should stay when isLinkTree is flagged and link tree exists", async () => {
    const navSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { wrapper, linkTreesStore: store } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree, isLinkTree: false },
    });

    navSpy.mockClear();
    store.setIsLinkTree(true);
    await wait();

    expect(wrapper.text()).toContain("Kursus Ku");
    expect(navSpy).not.toHaveBeenCalled();
  });

  it("should fetch again when linkTreeId changes", async () => {
    const { rerender } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
    });

    await rerender({ linkTreeId: 2 });
    await wait();

    expect(detailSpy).toHaveBeenCalledWith(2);
  });
});
