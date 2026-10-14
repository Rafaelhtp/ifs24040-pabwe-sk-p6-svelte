<script>
  import { Plus, X, LoaderCircle } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show = false;
  export let onClose = undefined;
  export let onSaved = undefined;

  let loading = false;
  let title = "";
  let type = "public";
  let description = "";

  function handleClose() {
    if (onClose) onClose();
  }

  $: if ($linkTreesStore.isLinkTreeAdd) {
    const isSuccess = $linkTreesStore.isLinkTreeAdded;
    loading = false;
    linkTreesStore.setIsLinkTreeAdd(false);
    if (isSuccess) {
      linkTreesStore.setIsLinkTreeAdded(false);
      title = "";
      type = "public";
      description = "";
      if (onSaved) onSaved();
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
    linkTreesStore.asyncSetIsLinkTreeAdd(title.trim(), type, description.trim());
  }
</script>

{#if show}
  <div
    data-testid="add-link-tree-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-link-tree-heading"
      class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div>
          <h2 id="add-link-tree-heading" class="text-base font-bold text-slate-900">
            Tambah Link Tree Baru
          </h2>
          <p class="text-xs text-slate-700">Buat halaman kumpulan tautan baru.</p>
        </div>
        <button
          type="button"
          data-testid="close-add-modal-btn"
          on:click={handleClose}
          aria-label="Tutup modal tambah link tree"
          class="p-2 rounded-xl text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form on:submit|preventDefault={handleSave} class="p-6 space-y-4">
        <div>
          <label for="add-link-tree-title-input" class="block text-sm font-semibold text-slate-800 mb-1.5">
            Judul
          </label>
          <input
            id="add-link-tree-title-input"
            type="text"
            data-testid="add-link-tree-title-input"
            bind:value={title}
            placeholder="Contoh: Kursus Favorit Saya"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 text-sm"
            required
          />
        </div>

        <div>
          <label for="add-link-tree-type-select" class="block text-sm font-semibold text-slate-800 mb-1.5">
            Tipe
          </label>
          <select
            id="add-link-tree-type-select"
            data-testid="add-link-tree-type-select"
            bind:value={type}
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 text-sm"
          >
            <option value="public">Publik</option>
            <option value="unlisted">Tidak Terdaftar</option>
            <option value="private">Privat</option>
          </select>
        </div>

        <div>
          <label for="add-link-tree-description-input" class="block text-sm font-semibold text-slate-800 mb-1.5">
            Deskripsi
          </label>
          <textarea
            id="add-link-tree-description-input"
            data-testid="add-link-tree-description-input"
            bind:value={description}
            rows="4"
            placeholder="Jelaskan isi kumpulan tautan ini"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 text-sm"
            required
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            data-testid="cancel-add-modal-btn"
            on:click={handleClose}
            disabled={loading}
            class="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-add-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={18} class="animate-spin" />
              <span>Menyimpan...</span>
            {:else}
              <Plus size={18} strokeWidth={2.5} />
              <span>Tambah Link Tree</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
