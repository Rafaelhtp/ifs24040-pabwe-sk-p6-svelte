<script>
  import { ImagePlus, X, LoaderCircle, Upload } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show = false;
  export let linkTree = null;
  export let onClose = undefined;

  let loading = false;
  let file = null;
  let previewUrl = null;

  function handleClose() {
    previewUrl = null;
    file = null;
    if (onClose) onClose();
  }

  $: if ($linkTreesStore.isLinkTreeChangeCover) {
    const isSuccess = $linkTreesStore.isLinkTreeChangedCover;
    loading = false;
    linkTreesStore.setIsLinkTreeChangeCover(false);
    if (isSuccess) {
      linkTreesStore.setIsLinkTreeChangedCover(false);
      linkTreesStore.asyncSetLinkTree(linkTree.id);
      handleClose();
    }
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      showErrorDialog("Pilih file gambar (JPG/PNG)!");
      return;
    }

    if (selectedFile.size > 1024 * 1024) {
      showErrorDialog("Ukuran gambar maksimal 1MB!");
      return;
    }

    file = selectedFile;
    previewUrl = URL.createObjectURL(selectedFile);
  }

  function handleSave() {
    if (!file) {
      showErrorDialog("Silakan pilih cover baru!");
      return;
    }

    loading = true;
    linkTreesStore.asyncSetIsLinkTreeChangeCover(linkTree.id, file);
  }
</script>

{#if show && linkTree}
  <div
    data-testid="change-cover-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-cover-heading"
      class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-900 flex items-center justify-center">
            <ImagePlus size={18} strokeWidth={2.5} />
          </div>
          <h2 id="change-cover-heading" class="text-base font-bold text-slate-900">
            Ubah Sampul Link Tree
          </h2>
        </div>
        <button
          type="button"
          data-testid="close-cover-modal-btn"
          on:click={handleClose}
          aria-label="Tutup modal ubah sampul"
          class="p-2 rounded-xl text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <form on:submit|preventDefault={handleSave} class="p-6 space-y-4">
        <label
          for="cover-file-input"
          data-testid="cover-file-label"
          class="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-400 hover:border-indigo-600 rounded-2xl bg-slate-50 overflow-hidden"
        >
          {#if previewUrl}
            <img src={previewUrl} alt="Pratinjau sampul baru" class="w-full h-full object-cover" />
          {:else}
            <span class="flex flex-col items-center text-center px-4">
              <Upload size={20} class="text-indigo-700 mb-2" />
              <span class="text-sm font-semibold text-slate-800">Klik untuk memilih gambar sampul</span>
              <span class="text-xs text-slate-700 mt-1">PNG, JPG, JPEG (Maks. 1MB)</span>
            </span>
          {/if}
        </label>
        <input
          id="cover-file-input"
          type="file"
          data-testid="cover-file-input"
          accept=".jpg,.jpeg,.png"
          on:change={handleFileChange}
          class="sr-only"
        />

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            data-testid="cancel-cover-modal-btn"
            on:click={handleClose}
            disabled={loading}
            class="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-cover-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={18} class="animate-spin" />
              <span>Mengunggah...</span>
            {:else}
              <Upload size={18} strokeWidth={2.5} />
              <span>Unggah Sampul</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
