<script>
  import { PenLine, X, LoaderCircle } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show = false;
  export let linkTree = null;
  export let onClose = undefined;

  let loading = false;
  let title = "";
  let type = "public";
  let description = "";

  function handleClose() {
    if (onClose) onClose();
  }

  function populate(source) {
    title = source.title;
    type = source.type;
    description = source.description || "";
  }

  $: if (show && linkTree) {
    populate(linkTree);
  }

  $: if ($linkTreesStore.isLinkTreeChange) {
    const isSuccess = $linkTreesStore.isLinkTreeChanged;
    loading = false;
    linkTreesStore.setIsLinkTreeChange(false);
    if (isSuccess) {
      linkTreesStore.setIsLinkTreeChanged(false);
      linkTreesStore.asyncSetLinkTree(linkTree.id);
      handleClose();
    }
  }

  function handleSave() {
    if (!title.trim()) {
      showErrorDialog("Judul tidak boleh kosong");
      return;
    }

    if (!description.trim()) {
      showErrorDialog("Deskripsi tidak boleh kosong");
      return;
    }

    loading = true;
    linkTreesStore.asyncSetIsLinkTreeChange(
      linkTree.id,
      title.trim(),
      type,
      description.trim()
    );
  }
</script>

{#if show && linkTree}
  <div
    data-testid="change-link-tree-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-link-tree-heading"
      class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
            <PenLine size={18} strokeWidth={2.5} />
          </div>
          <h2 id="change-link-tree-heading" class="text-base font-bold text-slate-900">
            Ubah Data Link Tree
          </h2>
        </div>
        <button
          type="button"
          data-testid="close-change-modal-btn"
          on:click={handleClose}
          aria-label="Tutup modal ubah data"
          class="p-2 rounded-xl text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form on:submit|preventDefault={handleSave} class="p-6 space-y-4">
        <div>
          <label for="change-link-tree-title-input" class="block text-sm font-semibold text-slate-800 mb-1.5">
            Judul
          </label>
          <input
            id="change-link-tree-title-input"
            type="text"
            data-testid="change-link-tree-title-input"
            bind:value={title}
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 text-sm"
            required
          />
        </div>

        <div>
          <label for="change-link-tree-type-select" class="block text-sm font-semibold text-slate-800 mb-1.5">
            Tipe
          </label>
          <select
            id="change-link-tree-type-select"
            data-testid="change-link-tree-type-select"
            bind:value={type}
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 text-sm"
          >
            <option value="public">Publik</option>
            <option value="unlisted">Tidak Terdaftar</option>
            <option value="private">Privat</option>
          </select>
        </div>

        <div>
          <label for="change-link-tree-description-input" class="block text-sm font-semibold text-slate-800 mb-1.5">
            Deskripsi
          </label>
          <textarea
            id="change-link-tree-description-input"
            data-testid="change-link-tree-description-input"
            bind:value={description}
            rows="4"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 text-sm"
            required
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            data-testid="cancel-change-modal-btn"
            on:click={handleClose}
            disabled={loading}
            class="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-change-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={18} class="animate-spin" />
              <span>Menyimpan...</span>
            {:else}
              <PenLine size={18} strokeWidth={2.5} />
              <span>Simpan Perubahan</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
