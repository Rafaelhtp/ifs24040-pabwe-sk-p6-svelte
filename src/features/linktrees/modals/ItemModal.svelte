<script>
  import { Plus, PenLine, X, LoaderCircle } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show = false;
  export let linkTreeId = null;
  export let item = null;
  export let onClose = undefined;

  let loading = false;
  let title = "";
  let url = "";

  $: isEdit = Boolean(item);

  function handleClose() {
    if (onClose) onClose();
  }

  function populate(source) {
    title = source ? source.title : "";
    url = source ? source.url : "";
  }

  $: if (show) {
    populate(item);
  }

  function finish(isSuccess) {
    loading = false;
    if (isSuccess) {
      linkTreesStore.asyncSetLinkTree(linkTreeId);
      handleClose();
    }
  }

  $: if ($linkTreesStore.isLinkTreeItemAdd) {
    const isSuccess = $linkTreesStore.isLinkTreeItemAdded;
    linkTreesStore.setIsLinkTreeItemAdd(false);
    linkTreesStore.setIsLinkTreeItemAdded(false);
    finish(isSuccess);
  }

  $: if ($linkTreesStore.isLinkTreeItemChange) {
    const isSuccess = $linkTreesStore.isLinkTreeItemChanged;
    linkTreesStore.setIsLinkTreeItemChange(false);
    linkTreesStore.setIsLinkTreeItemChanged(false);
    finish(isSuccess);
  }

  function handleSave() {
    if (!title.trim()) {
      showErrorDialog("Judul tautan tidak boleh kosong");
      return;
    }

    if (!url.trim()) {
      showErrorDialog("URL tautan tidak boleh kosong");
      return;
    }

    loading = true;
    if (isEdit) {
      linkTreesStore.asyncSetIsLinkTreeItemChange(linkTreeId, item.id, title.trim(), url.trim());
    } else {
      linkTreesStore.asyncSetIsLinkTreeItemAdd(linkTreeId, title.trim(), url.trim());
    }
  }
</script>

{#if show}
  <div
    data-testid="item-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-modal-heading"
      class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 id="item-modal-heading" class="text-base font-bold text-slate-900">
          {isEdit ? "Ubah Tautan" : "Tambah Tautan"}
        </h2>
        <button
          type="button"
          data-testid="close-item-modal-btn"
          on:click={handleClose}
          aria-label="Tutup modal tautan"
          class="p-2 rounded-xl text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form on:submit|preventDefault={handleSave} class="p-6 space-y-4">
        <div>
          <label for="item-title-input" class="block text-sm font-semibold text-slate-800 mb-1.5">
            Judul Tautan
          </label>
          <input
            id="item-title-input"
            type="text"
            data-testid="item-title-input"
            bind:value={title}
            placeholder="Contoh: Website Delcom"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 text-sm"
            required
          />
        </div>

        <div>
          <label for="item-url-input" class="block text-sm font-semibold text-slate-800 mb-1.5">
            URL
          </label>
          <input
            id="item-url-input"
            type="url"
            data-testid="item-url-input"
            bind:value={url}
            placeholder="https://delcom.org"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 text-sm"
            required
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            data-testid="cancel-item-modal-btn"
            on:click={handleClose}
            disabled={loading}
            class="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-item-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={18} class="animate-spin" />
              <span>Menyimpan...</span>
            {:else if isEdit}
              <PenLine size={18} strokeWidth={2.5} />
              <span>Simpan Tautan</span>
            {:else}
              <Plus size={18} strokeWidth={2.5} />
              <span>Tambah Tautan</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
