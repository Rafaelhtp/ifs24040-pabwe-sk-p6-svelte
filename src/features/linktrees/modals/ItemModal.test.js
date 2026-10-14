import { describe, it, expect, vi, beforeEach } from "vitest";
import ItemModal from "./ItemModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const wait = (ms = 10) => new Promise((r) => setTimeout(r, ms));

describe("ItemModal", () => {
  const mockItem = { id: 5, title: "Delcom", url: "https://delcom.org" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ItemModal, { props: { show: false, linkTreeId: 1 } });
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
  });

  it("should render empty labelled fields in add mode", () => {
    const { wrapper } = renderWithProviders(ItemModal, { props: { show: true, linkTreeId: 1 } });

    expect(wrapper.text()).toContain("Tambah Tautan");
    expect(wrapper.find('label[for="item-title-input"]').exists()).toBe(true);
    expect(wrapper.find('label[for="item-url-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe("");
  });

  it("should prefill fields in edit mode", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem },
    });

    expect(wrapper.text()).toContain("Ubah Tautan");
    expect(wrapper.text()).toContain("Simpan Tautan");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("Delcom");
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe(
      "https://delcom.org"
    );
  });

  it("should validate empty title and empty url", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ItemModal, { props: { show: true, linkTreeId: 1 } });

    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tautan tidak boleh kosong");

    await wrapper.find('[data-testid="item-title-input"]').setValue("Judul");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("URL tautan tidak boleh kosong");
  });

  it("should add an item and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });
    const addSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeItemAdd").mockResolvedValue();
    const detailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    await wrapper.find('[data-testid="item-title-input"]').setValue(" Judul ");
    await wrapper.find('[data-testid="item-url-input"]').setValue(" https://a.org ");
    await wrapper.find("form").trigger("submit");
    await wait();

    expect(addSpy).toHaveBeenCalledWith(1, "Judul", "https://a.org");
    expect(wrapper.text()).toContain("Menyimpan...");

    linkTreesStore.setIsLinkTreeItemAdded(true);
    linkTreesStore.setIsLinkTreeItemAdd(true);
    await wait();

    expect(detailSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should change an item and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem, onClose: closeSpy },
    });
    const changeSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeItemChange").mockResolvedValue();
    const detailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    await wrapper.find("form").trigger("submit");
    expect(changeSpy).toHaveBeenCalledWith(1, 5, "Delcom", "https://delcom.org");

    linkTreesStore.setIsLinkTreeItemChanged(true);
    linkTreesStore.setIsLinkTreeItemChange(true);
    await wait();

    expect(detailSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should succeed without onClose callback", async () => {
    const { linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });
    const detailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    linkTreesStore.setIsLinkTreeItemAdded(true);
    linkTreesStore.setIsLinkTreeItemAdd(true);
    await wait();

    expect(detailSpy).toHaveBeenCalled();
  });

  it("should stay open when add or change request failed", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    linkTreesStore.setIsLinkTreeItemAdded(false);
    linkTreesStore.setIsLinkTreeItemAdd(true);
    await wait();
    linkTreesStore.setIsLinkTreeItemChanged(false);
    linkTreesStore.setIsLinkTreeItemChange(true);
    await wait();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should close when close or cancel button clicked", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    await wrapper.find('[data-testid="close-item-modal-btn"]').trigger("click");
    await wrapper.find('[data-testid="cancel-item-modal-btn"]').trigger("click");

    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle close without onClose callback", async () => {
    const { wrapper } = renderWithProviders(ItemModal, { props: { show: true, linkTreeId: 1 } });

    await wrapper.find('[data-testid="close-item-modal-btn"]').trigger("click");

    expect(wrapper.exists()).toBe(true);
  });
});
