import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const wait = (ms = 10) => new Promise((r) => setTimeout(r, ms));

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: false } });
    expect(wrapper.find('[data-testid="add-link-tree-modal"]').exists()).toBe(false);
  });

  it("should render labelled fields and the three types", () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });

    expect(wrapper.find('label[for="add-link-tree-title-input"]').exists()).toBe(true);
    expect(wrapper.find('label[for="add-link-tree-type-select"]').exists()).toBe(true);
    expect(wrapper.find('label[for="add-link-tree-description-input"]').exists()).toBe(true);
    const values = wrapper.findAll("option").map((o) => o.element.value);
    expect(values).toEqual(["public", "unlisted", "private"]);
  });

  it("should validate empty title and empty description", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });

    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    await wrapper.find('[data-testid="add-link-tree-title-input"]').setValue("Judul");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should submit trimmed values and close + notify on success", async () => {
    const closeSpy = vi.fn();
    const savedSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(AddModal, {
      props: { show: true, onClose: closeSpy, onSaved: savedSpy },
    });
    const addSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeAdd").mockResolvedValue();

    await wrapper.find('[data-testid="add-link-tree-title-input"]').setValue("  Judul  ");
    await wrapper.find('[data-testid="add-link-tree-type-select"]').setValue("private");
    await wrapper.find('[data-testid="add-link-tree-description-input"]').setValue(" Desk ");
    await wrapper.find("form").trigger("submit");
    await wait();

    expect(addSpy).toHaveBeenCalledWith("Judul", "private", "Desk");
    expect(wrapper.text()).toContain("Menyimpan...");

    linkTreesStore.setIsLinkTreeAdded(true);
    linkTreesStore.setIsLinkTreeAdd(true);
    await wait();

    expect(savedSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
    expect(wrapper.text()).not.toContain("Menyimpan...");
  });

  it("should succeed without callback props", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(AddModal, { props: { show: true } });

    linkTreesStore.setIsLinkTreeAdded(true);
    linkTreesStore.setIsLinkTreeAdd(true);
    await wait();

    expect(wrapper.find('[data-testid="add-link-tree-modal"]').exists()).toBe(true);
  });

  it("should stay open when the add request failed", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(AddModal, {
      props: { show: true, onClose: closeSpy },
    });

    linkTreesStore.setIsLinkTreeAdded(false);
    linkTreesStore.setIsLinkTreeAdd(true);
    await wait();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(linkTreesStore.isLinkTreeAdd).toBe(false);
    expect(wrapper.find('[data-testid="add-link-tree-modal"]').exists()).toBe(true);
  });

  it("should close when close or cancel button clicked", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true, onClose: closeSpy },
    });

    await wrapper.find('[data-testid="close-add-modal-btn"]').trigger("click");
    await wrapper.find('[data-testid="cancel-add-modal-btn"]').trigger("click");

    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle close without onClose callback", async () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });

    await wrapper.find('[data-testid="close-add-modal-btn"]').trigger("click");

    expect(wrapper.exists()).toBe(true);
  });
});
