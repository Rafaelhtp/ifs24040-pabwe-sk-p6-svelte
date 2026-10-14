import { describe, it, expect, vi, beforeEach } from "vitest";
import linkTreeApi from "./linkTreeApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => body,
  });
}

describe("linkTreeApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("postLinkTree should send JSON payload and return message", async () => {
    const spy = mockResponse({ status: "success", message: "Berhasil menambahkan data" });

    const msg = await linkTreeApi.postLinkTree("Judul", "public", "Deskripsi");

    expect(msg).toBe("Berhasil menambahkan data");
    const [url, options] = spy.mock.calls[0];
    expect(url.endsWith("/link-trees")).toBe(true);
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({
      title: "Judul",
      type: "public",
      description: "Deskripsi",
    });
  });

  it("should throw the server message when status is not success", async () => {
    mockResponse({ status: "fail", message: "Data tidak valid" });
    await expect(linkTreeApi.postLinkTree("", "public", "")).rejects.toThrow("Data tidak valid");
  });

  it("should throw fallback message when server message is missing", async () => {
    mockResponse({ status: "fail" });
    await expect(linkTreeApi.postLinkTree("", "public", "")).rejects.toThrow(
      "Gagal menambahkan link tree"
    );
  });

  it("postLinkTreeCover should upload FormData using file name", async () => {
    const spy = mockResponse({ status: "success", message: "Berhasil mengubah cover" });
    const file = new File(["dummy"], "photo.png", { type: "image/png" });

    const msg = await linkTreeApi.postLinkTreeCover(1, file);

    expect(msg).toBe("Berhasil mengubah cover");
    const [url, options] = spy.mock.calls[0];
    expect(url.endsWith("/link-trees/1/cover")).toBe(true);
    expect(options.body.get("cover").name).toBe("photo.png");
  });

  it("postLinkTreeCover should fall back to cover.jpg when blob has no name", async () => {
    const spy = mockResponse({ status: "success", message: "OK" });
    const blob = new Blob(["dummy"], { type: "image/jpeg" });

    await linkTreeApi.postLinkTreeCover(1, blob);

    expect(spy.mock.calls[0][1].body.get("cover").name).toBe("cover.jpg");
  });

  it("postLinkTreeCover should throw on failure", async () => {
    mockResponse({ status: "fail" });
    await expect(linkTreeApi.postLinkTreeCover(1, new File(["x"], "c.jpg"))).rejects.toThrow(
      "Gagal mengubah cover"
    );
  });

  it("putLinkTree should send PUT payload", async () => {
    const spy = mockResponse({ status: "success", message: "Berhasil mengubah data" });

    const msg = await linkTreeApi.putLinkTree(3, "Baru", "private", "Desk");

    expect(msg).toBe("Berhasil mengubah data");
    const [url, options] = spy.mock.calls[0];
    expect(url.endsWith("/link-trees/3")).toBe(true);
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body)).toEqual({ title: "Baru", type: "private", description: "Desk" });
  });

  it("putLinkTree should throw on failure", async () => {
    mockResponse({ status: "fail" });
    await expect(linkTreeApi.putLinkTree(3, "a", "public", "b")).rejects.toThrow(
      "Gagal mengubah link tree"
    );
  });

  it("getLinkTrees should read data.link_trees without filter", async () => {
    const spy = mockResponse({ status: "success", data: { link_trees: [{ id: 1 }] } });

    const list = await linkTreeApi.getLinkTrees();

    expect(list).toEqual([{ id: 1 }]);
    expect(spy.mock.calls[0][0].endsWith("/link-trees")).toBe(true);
  });

  it("getLinkTrees should send is_me=1 when filtering own data", async () => {
    const spy = mockResponse({ status: "success", data: { link_trees: [{ id: 2 }] } });

    const list = await linkTreeApi.getLinkTrees(true);

    expect(list).toEqual([{ id: 2 }]);
    expect(spy.mock.calls[0][0].endsWith("/link-trees?is_me=1")).toBe(true);
  });

  it("getLinkTrees should return empty array when data is missing", async () => {
    mockResponse({ status: "success" });
    expect(await linkTreeApi.getLinkTrees()).toEqual([]);
  });

  it("getLinkTrees should throw on failure", async () => {
    mockResponse({ status: "fail" });
    await expect(linkTreeApi.getLinkTrees()).rejects.toThrow("Gagal mengambil data link tree");
  });

  it("getLinkTreeById should read data.link_tree", async () => {
    const spy = mockResponse({
      status: "success",
      data: { link_tree: { id: 5, items: [] } },
    });

    const detail = await linkTreeApi.getLinkTreeById(5);

    expect(detail).toEqual({ id: 5, items: [] });
    expect(spy.mock.calls[0][0].endsWith("/link-trees/5")).toBe(true);
  });

  it("getLinkTreeById should return undefined when data is missing", async () => {
    mockResponse({ status: "success" });
    expect(await linkTreeApi.getLinkTreeById(5)).toBeUndefined();
  });

  it("getLinkTreeById should throw on failure", async () => {
    mockResponse({ status: "fail" });
    await expect(linkTreeApi.getLinkTreeById(5)).rejects.toThrow("Gagal mengambil detail link tree");
  });

  it("deleteLinkTree should send DELETE for one link tree", async () => {
    const spy = mockResponse({ status: "success", message: "Berhasil menghapus data" });

    const msg = await linkTreeApi.deleteLinkTree(7);

    expect(msg).toBe("Berhasil menghapus data");
    expect(spy.mock.calls[0][1].method).toBe("DELETE");
    expect(spy.mock.calls[0][0].endsWith("/link-trees/7")).toBe(true);
  });

  it("deleteLinkTree should throw on failure", async () => {
    mockResponse({ status: "fail" });
    await expect(linkTreeApi.deleteLinkTree(7)).rejects.toThrow("Gagal menghapus link tree");
  });

  it("deleteAllLinkTrees should send DELETE to the collection", async () => {
    const spy = mockResponse({ status: "success", message: "Semua terhapus" });

    const msg = await linkTreeApi.deleteAllLinkTrees();

    expect(msg).toBe("Semua terhapus");
    expect(spy.mock.calls[0][0].endsWith("/link-trees")).toBe(true);
    expect(spy.mock.calls[0][1].method).toBe("DELETE");
  });

  it("deleteAllLinkTrees should throw on failure", async () => {
    mockResponse({ status: "fail" });
    await expect(linkTreeApi.deleteAllLinkTrees()).rejects.toThrow(
      "Gagal menghapus semua link tree"
    );
  });

  it("postLinkTreeItem should post title and url", async () => {
    const spy = mockResponse({ status: "success", message: "Item ditambah" });

    const msg = await linkTreeApi.postLinkTreeItem(1, "Delcom", "https://delcom.org");

    expect(msg).toBe("Item ditambah");
    const [url, options] = spy.mock.calls[0];
    expect(url.endsWith("/link-trees/1/items")).toBe(true);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ title: "Delcom", url: "https://delcom.org" });
  });

  it("postLinkTreeItem should throw on failure", async () => {
    mockResponse({ status: "fail" });
    await expect(linkTreeApi.postLinkTreeItem(1, "a", "b")).rejects.toThrow(
      "Gagal menambahkan tautan"
    );
  });

  it("putLinkTreeItem should put title and url to the item path", async () => {
    const spy = mockResponse({ status: "success", message: "Item diubah" });

    const msg = await linkTreeApi.putLinkTreeItem(1, 9, "Baru", "https://a.org");

    expect(msg).toBe("Item diubah");
    const [url, options] = spy.mock.calls[0];
    expect(url.endsWith("/link-trees/1/items/9")).toBe(true);
    expect(options.method).toBe("PUT");
  });

  it("putLinkTreeItem should throw on failure", async () => {
    mockResponse({ status: "fail" });
    await expect(linkTreeApi.putLinkTreeItem(1, 9, "a", "b")).rejects.toThrow(
      "Gagal mengubah tautan"
    );
  });

  it("deleteLinkTreeItem should delete the item path", async () => {
    const spy = mockResponse({ status: "success", message: "Item dihapus" });

    const msg = await linkTreeApi.deleteLinkTreeItem(1, 9);

    expect(msg).toBe("Item dihapus");
    expect(spy.mock.calls[0][0].endsWith("/link-trees/1/items/9")).toBe(true);
    expect(spy.mock.calls[0][1].method).toBe("DELETE");
  });

  it("deleteLinkTreeItem should throw on failure", async () => {
    mockResponse({ status: "fail" });
    await expect(linkTreeApi.deleteLinkTreeItem(1, 9)).rejects.toThrow("Gagal menghapus tautan");
  });
});
