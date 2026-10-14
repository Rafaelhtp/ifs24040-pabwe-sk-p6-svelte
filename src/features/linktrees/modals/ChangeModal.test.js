import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const wait = (ms = 10) => new Promise((r) => setTimeout(r, ms));

describe("ChangeModal", () => {
  const mockLinkTree = {
    id: 1,
    title: "Judul Awal",
    type: "unlisted",
    description: "Deskripsi Awal",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false or link tree is missing", () => {
    const hidden = renderWithProviders(ChangeModal, {
      props: { show: false, linkTree: mockLinkTree },
    });
    expect(hidden.wrapper.find('[data-testid="change-link-tree-modal"]').exists()).toBe(false);

    const missing = renderWithProviders(ChangeModal, { props: { show: true } });
    expect(missing.wrapper.find('[data-testid="change-link-tree-modal"]').exists()).toBe(false);
  });

  it("should populate inputs from the link tree", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    expect(wrapper.find('[data-testid="change-link-tree-title-input"]').element.value).toBe(
      "Judul Awal"
    );
    expect(wrapper.find('[data-testid="change-link-tree-type-select"]').element.value).toBe(
      "unlisted"
    );
    expect(wrapper.find('[data-testid="change-link-tree-description-input"]').element.value).toBe(
      "Deskripsi Awal"
    );
    expect(wrapper.find('label[for="change-link-tree-title-input"]').exists()).toBe(true);
    expect(wrapper.find('label[for="change-link-tree-type-select"]').exists()).toBe(true);
    expect(wrapper.find('label[for="change-link-tree-description-input"]').exists()).toBe(true);
  });

  it("should fall back to empty description when it is null", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTree: { ...mockLinkTree, description: null } },
    });

    expect(wrapper.find('[data-testid="change-link-tree-description-input"]').element.value).toBe(
      ""
    );
  });

  it("should validate empty title and empty description", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    await wrapper.find('[data-testid="change-link-tree-title-input"]').setValue("   ");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    await wrapper.find('[data-testid="change-link-tree-title-input"]').setValue("Valid");
    await wrapper.find('[data-testid="change-link-tree-description-input"]').setValue("  ");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should submit changes, reload the detail and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTree: mockLinkTree, onClose: closeSpy },
    });
    const changeSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeChange").mockResolvedValue();
    const detailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    await wrapper.find('[data-testid="change-link-tree-type-select"]').setValue("private");
    await wrapper.find("form").trigger("submit");
    await wait();

    expect(changeSpy).toHaveBeenCalledWith(1, "Judul Awal", "private", "Deskripsi Awal");
    expect(wrapper.text()).toContain("Menyimpan...");

    linkTreesStore.setIsLinkTreeChanged(true);
    linkTreesStore.setIsLinkTreeChange(true);
    await wait();

    expect(detailSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should succeed without onClose callback", async () => {
    const { linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTree: mockLinkTree },
    });
    const detailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    linkTreesStore.setIsLinkTreeChanged(true);
    linkTreesStore.setIsLinkTreeChange(true);
    await wait();

    expect(detailSpy).toHaveBeenCalled();
  });

  it("should stay open when the change request failed", async () => {
    const closeSpy = vi.fn();
    const { linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTree: mockLinkTree, onClose: closeSpy },
    });

    linkTreesStore.setIsLinkTreeChanged(false);
    linkTreesStore.setIsLinkTreeChange(true);
    await wait();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(linkTreesStore.isLinkTreeChange).toBe(false);
  });

  it("should close when close or cancel button clicked", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTree: mockLinkTree, onClose: closeSpy },
    });

    await wrapper.find('[data-testid="close-change-modal-btn"]').trigger("click");
    await wrapper.find('[data-testid="cancel-change-modal-btn"]').trigger("click");

    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle close without onClose callback", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    await wrapper.find('[data-testid="close-change-modal-btn"]').trigger("click");

    expect(wrapper.exists()).toBe(true);
  });
});
