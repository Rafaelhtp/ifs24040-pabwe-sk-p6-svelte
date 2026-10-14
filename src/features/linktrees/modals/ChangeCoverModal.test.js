import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const wait = (ms = 10) => new Promise((r) => setTimeout(r, ms));

function setFiles(input, files) {
  Object.defineProperty(input.element, "files", { value: files, configurable: true });
}

describe("ChangeCoverModal", () => {
  const mockLinkTree = { id: 1, title: "Link Tree Test" };

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
  });

  it("should not render when show is false or link tree is missing", () => {
    const hidden = renderWithProviders(ChangeCoverModal, {
      props: { show: false, linkTree: mockLinkTree },
    });
    expect(hidden.wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    const missing = renderWithProviders(ChangeCoverModal, { props: { show: true } });
    expect(missing.wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);
  });

  it("should link the file label to the file input", () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    expect(wrapper.find('label[for="cover-file-input"]').exists()).toBe(true);
    expect(wrapper.find("#cover-file-input").exists()).toBe(true);
  });

  it("should validate file presence, file type and file size", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Silakan pilih cover baru!");

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    setFiles(fileInput, undefined);
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledTimes(1);

    setFiles(fileInput, [new File(["dummy"], "doc.pdf", { type: "application/pdf" })]);
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledWith("Pilih file gambar (JPG/PNG)!");

    setFiles(fileInput, [
      new File([new Uint8Array(2 * 1024 * 1024)], "large.png", { type: "image/png" }),
    ]);
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledWith("Ukuran gambar maksimal 1MB!");
  });

  it("should preview the image, upload it and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree, onClose: closeSpy },
    });
    const coverSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeChangeCover").mockResolvedValue();
    const detailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    const validFile = new File(["dummy"], "photo.jpg", { type: "image/jpeg" });
    setFiles(fileInput, [validFile]);
    await fileInput.trigger("change");

    expect(wrapper.find('img[alt="Pratinjau sampul baru"]').exists()).toBe(true);

    await wrapper.find("form").trigger("submit");
    expect(coverSpy).toHaveBeenCalledWith(1, validFile);
    await wait();
    expect(wrapper.text()).toContain("Mengunggah...");

    linkTreesStore.setIsLinkTreeChangedCover(true);
    linkTreesStore.setIsLinkTreeChangeCover(true);
    await wait();

    expect(detailSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should succeed without onClose callback", async () => {
    const { linkTreesStore } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
    });
    const detailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    linkTreesStore.setIsLinkTreeChangedCover(true);
    linkTreesStore.setIsLinkTreeChangeCover(true);
    await wait();

    expect(detailSpy).toHaveBeenCalled();
  });

  it("should stay open when the upload failed", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree, onClose: closeSpy },
    });

    linkTreesStore.setIsLinkTreeChangedCover(false);
    linkTreesStore.setIsLinkTreeChangeCover(true);
    await wait();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);
  });

  it("should trigger onClose when close or cancel button clicked", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree, onClose: closeSpy },
    });

    await wrapper.find('[data-testid="close-cover-modal-btn"]').trigger("click");
    await wrapper.find('[data-testid="cancel-cover-modal-btn"]').trigger("click");

    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle close without onClose callback", async () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    await wrapper.find('[data-testid="close-cover-modal-btn"]').trigger("click");

    expect(wrapper.exists()).toBe(true);
  });
});
