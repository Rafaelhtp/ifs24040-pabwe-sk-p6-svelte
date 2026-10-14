import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import { linkTreesStore, useLinkTreesStore, linkTreeTypes } from "./linkTreesStore";
import linkTreeApi from "../api/linkTreeApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("linkTreesStore", () => {
  let successSpy;
  let errorSpy;

  beforeEach(() => {
    linkTreesStore.reset();
    vi.restoreAllMocks();
    successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
    errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
  });

  it("should expose link tree type metadata", () => {
    expect(Object.keys(linkTreeTypes)).toEqual(["public", "unlisted", "private"]);
  });

  it("should have correct default state and hook accessor", () => {
    const store = useLinkTreesStore();
    expect(store).toBe(linkTreesStore);
    expect(store.linkTrees).toEqual([]);
    expect(store.linkTree).toBeNull();
    expect(store.isLinkTree).toBe(false);
    expect(store.isLinkTreeAdd).toBe(false);
    expect(store.isLinkTreeDeletedAll).toBe(false);
    expect(store.$state.isLinkTreeItemDeleted).toBe(false);
    expect(get(store).linkTrees).toEqual([]);
  });

  it("should update state with generated setters", () => {
    const store = useLinkTreesStore();
    store.setLinkTrees([{ id: 1 }]);
    store.setLinkTree({ id: 1 });
    store.setIsLinkTree(true);
    store.setIsLinkTreeAdd(true);
    store.setIsLinkTreeAdded(true);
    store.setIsLinkTreeChange(true);
    store.setIsLinkTreeChanged(true);
    store.setIsLinkTreeChangeCover(true);
    store.setIsLinkTreeChangedCover(true);
    store.setIsLinkTreeDelete(true);
    store.setIsLinkTreeDeleted(true);
    store.setIsLinkTreeDeleteAll(true);
    store.setIsLinkTreeDeletedAll(true);
    store.setIsLinkTreeItemAdd(true);
    store.setIsLinkTreeItemAdded(true);
    store.setIsLinkTreeItemChange(true);
    store.setIsLinkTreeItemChanged(true);
    store.setIsLinkTreeItemDelete(true);
    store.setIsLinkTreeItemDeleted(true);

    expect(store.linkTrees).toEqual([{ id: 1 }]);
    expect(store.linkTree).toEqual({ id: 1 });
    expect(Object.values(store.$state).filter((value) => value === true)).toHaveLength(17);
  });

  it("reset should merge a partial state over the defaults", () => {
    linkTreesStore.reset({ linkTrees: [{ id: 3 }] });
    expect(linkTreesStore.linkTrees).toEqual([{ id: 3 }]);
    expect(linkTreesStore.isLinkTree).toBe(false);
  });

  describe("asyncSetLinkTrees", () => {
    it("should load link trees using the is_me flag", async () => {
      const spy = vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue([{ id: 1 }]);
      await linkTreesStore.asyncSetLinkTrees(true);
      expect(spy).toHaveBeenCalledWith(true);
      expect(linkTreesStore.linkTrees).toEqual([{ id: 1 }]);
    });

    it("should default to false and fall back to empty array on error", async () => {
      const spy = vi.spyOn(linkTreeApi, "getLinkTrees").mockRejectedValue(new Error("x"));
      linkTreesStore.setLinkTrees([{ id: 1 }]);
      await linkTreesStore.asyncSetLinkTrees();
      expect(spy).toHaveBeenCalledWith(false);
      expect(linkTreesStore.linkTrees).toEqual([]);
    });
  });

  describe("asyncSetLinkTree", () => {
    it("should store detail and flag isLinkTree", async () => {
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({ id: 1 });
      await linkTreesStore.asyncSetLinkTree(1);
      expect(linkTreesStore.linkTree).toEqual({ id: 1 });
      expect(linkTreesStore.isLinkTree).toBe(true);
    });

    it("should set null on error and still flag isLinkTree", async () => {
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockRejectedValue(new Error("x"));
      await linkTreesStore.asyncSetLinkTree(9);
      expect(linkTreesStore.linkTree).toBeNull();
      expect(linkTreesStore.isLinkTree).toBe(true);
    });
  });

  const mutations = [
    {
      name: "asyncSetIsLinkTreeAdd",
      args: ["T", "public", "D"],
      api: "postLinkTree",
      done: "isLinkTreeAdd",
      ok: "isLinkTreeAdded",
      fallback: "Link tree berhasil ditambahkan!",
    },
    {
      name: "asyncSetIsLinkTreeChange",
      args: [1, "T", "public", "D"],
      api: "putLinkTree",
      done: "isLinkTreeChange",
      ok: "isLinkTreeChanged",
      fallback: "Link tree berhasil diperbarui!",
    },
    {
      name: "asyncSetIsLinkTreeChangeCover",
      args: [1, new File(["x"], "c.jpg")],
      api: "postLinkTreeCover",
      done: "isLinkTreeChangeCover",
      ok: "isLinkTreeChangedCover",
      fallback: "Cover berhasil diperbarui!",
    },
    {
      name: "asyncSetIsLinkTreeDelete",
      args: [1],
      api: "deleteLinkTree",
      done: "isLinkTreeDelete",
      ok: "isLinkTreeDeleted",
      fallback: "Link tree berhasil dihapus!",
    },
    {
      name: "asyncSetIsLinkTreeDeleteAll",
      args: [],
      api: "deleteAllLinkTrees",
      done: "isLinkTreeDeleteAll",
      ok: "isLinkTreeDeletedAll",
      fallback: "Semua link tree berhasil dihapus!",
    },
    {
      name: "asyncSetIsLinkTreeItemAdd",
      args: [1, "T", "https://a.org"],
      api: "postLinkTreeItem",
      done: "isLinkTreeItemAdd",
      ok: "isLinkTreeItemAdded",
      fallback: "Tautan berhasil ditambahkan!",
    },
    {
      name: "asyncSetIsLinkTreeItemChange",
      args: [1, 2, "T", "https://a.org"],
      api: "putLinkTreeItem",
      done: "isLinkTreeItemChange",
      ok: "isLinkTreeItemChanged",
      fallback: "Tautan berhasil diperbarui!",
    },
    {
      name: "asyncSetIsLinkTreeItemDelete",
      args: [1, 2],
      api: "deleteLinkTreeItem",
      done: "isLinkTreeItemDelete",
      ok: "isLinkTreeItemDeleted",
      fallback: "Tautan berhasil dihapus!",
    },
  ];

  describe.each(mutations)("$name", ({ name, args, api, done, ok, fallback }) => {
    it("should call the api with the given arguments, show the server message and set flags", async () => {
      const spy = vi.spyOn(linkTreeApi, api).mockResolvedValue("Pesan server");

      await linkTreesStore[name](...args);

      expect(spy).toHaveBeenCalledWith(...args);
      expect(successSpy).toHaveBeenCalledWith("Pesan server");
      expect(linkTreesStore[ok]).toBe(true);
      expect(linkTreesStore[done]).toBe(true);
    });

    it("should use fallback message when the server message is empty", async () => {
      vi.spyOn(linkTreeApi, api).mockResolvedValue("");
      await linkTreesStore[name](...args);
      expect(successSpy).toHaveBeenCalledWith(fallback);
    });

    it("should show an error dialog and keep the success flag false on failure", async () => {
      vi.spyOn(linkTreeApi, api).mockRejectedValue(new Error("Gagal"));

      await linkTreesStore[name](...args);

      expect(errorSpy).toHaveBeenCalledWith("Gagal");
      expect(linkTreesStore[ok]).toBe(false);
      expect(linkTreesStore[done]).toBe(true);
    });
  });
});
