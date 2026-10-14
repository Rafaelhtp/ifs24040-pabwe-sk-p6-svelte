<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import AddModal from "../modals/AddModal.svelte";
  import { linkTreesStore, linkTreeTypes } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import { Plus, Link, Trash2, Search, LoaderCircle, Eye } from "lucide-svelte";

  let loading = false;
  let isMe = false;
  let searchQuery = "";
  let showAddModal = false;

  $: profile = $usersStore.profile;
  $: linkTrees = $linkTreesStore.linkTrees || [];

  $: filteredLinkTrees = linkTrees.filter((linkTree) => {
    const keyword = searchQuery.trim().toLowerCase();
    return [linkTree.title, linkTree.description].join(" ").toLowerCase().includes(keyword);
  });

  $: totalCount = linkTrees.length;
  $: publicCount = linkTrees.filter((linkTree) => linkTree.type === "public").length;
  $: unlistedCount = linkTrees.filter((linkTree) => linkTree.type === "unlisted").length;
  $: privateCount = linkTrees.filter((linkTree) => linkTree.type === "private").length;

  async function loadLinkTrees() {
    loading = true;
    await linkTreesStore.asyncSetLinkTrees(isMe);
    loading = false;
  }

  onMount(() => {
    loadLinkTrees();
  });

  function handleFilterChange(event) {
    isMe = event.currentTarget.checked;
    loadLinkTrees();
  }

  $: if ($linkTreesStore.isLinkTreeDelete) {
    const isSuccess = $linkTreesStore.isLinkTreeDeleted;
    linkTreesStore.setIsLinkTreeDelete(false);
    linkTreesStore.setIsLinkTreeDeleted(false);
    if (isSuccess) loadLinkTrees();
  }

  $: if ($linkTreesStore.isLinkTreeDeleteAll) {
    const isSuccess = $linkTreesStore.isLinkTreeDeletedAll;
    linkTreesStore.setIsLinkTreeDeleteAll(false);
    linkTreesStore.setIsLinkTreeDeletedAll(false);
    if (isSuccess) loadLinkTrees();
  }

  async function handleDelete(linkTreeId) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus link tree ini?");
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeDelete(linkTreeId);
    }
  }

  async function handleDeleteAll() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus SEMUA link tree?");
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeDeleteAll();
    }
  }
</script>

{#if profile}
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Semua Link Tree
        </h1>
        <p class="text-sm text-slate-700 mt-1">
          Kelola dan bagikan kumpulan tautan Anda dalam satu halaman.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="delete-all-btn"
          on:click={handleDeleteAll}
          disabled={linkTrees.length === 0}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-red-800 bg-red-50 border border-red-300 hover:bg-red-100 transition-colors disabled:opacity-60"
        >
          <Trash2 size={18} />
          <span>Hapus Semua</span>
        </button>
        <button
          type="button"
          data-testid="add-link-tree-btn"
          on:click={() => (showAddModal = true)}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-colors"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Link Tree</span>
        </button>
      </div>
    </div>

    <section aria-label="Statistik link tree" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        data-testid="stat-card"
        class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs"
      >
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-700">Total Link Tree</p>
        <p class="text-3xl font-black mt-1 text-slate-900">{totalCount}</p>
      </div>
      <div
        data-testid="stat-card"
        class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs"
      >
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-700">Publik</p>
        <p class="text-3xl font-black mt-1 text-indigo-700">{publicCount}</p>
      </div>
      <div
        data-testid="stat-card"
        class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs"
      >
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-700">Tidak Terdaftar</p>
        <p class="text-3xl font-black mt-1 text-indigo-700">{unlistedCount}</p>
      </div>
      <div
        data-testid="stat-card"
        class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs"
      >
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-700">Privat</p>
        <p class="text-3xl font-black mt-1 text-indigo-700">{privateCount}</p>
      </div>
    </section>

    <section class="bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div class="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <Search size={18} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <label for="search-link-tree-input" class="sr-only">Cari link tree</label>
          <input
            id="search-link-tree-input"
            type="search"
            data-testid="search-link-tree-input"
            bind:value={searchQuery}
            placeholder="Cari judul atau deskripsi..."
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            id="filter-is-me-checkbox"
            type="checkbox"
            data-testid="filter-is-me-checkbox"
            checked={isMe}
            on:change={handleFilterChange}
            class="w-4 h-4 accent-indigo-600"
          />
          <label for="filter-is-me-checkbox" class="text-sm font-medium text-slate-800">
            Hanya milik saya
          </label>
        </div>
      </div>

      <div class="p-4 sm:p-5">
        {#if loading && filteredLinkTrees.length === 0}
          <div class="py-12 text-center text-slate-700" role="status">
            <LoaderCircle size={36} class="mx-auto text-indigo-700 animate-spin mb-2" />
            <p class="font-medium">Memuat daftar link tree...</p>
          </div>
        {:else if filteredLinkTrees.length === 0}
          <div class="py-12 text-center text-slate-700">
            <Link size={40} class="mx-auto text-slate-600 mb-2" />
            <p class="font-medium">Belum ada link tree yang cocok.</p>
          </div>
        {:else}
          <ul class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {#each filteredLinkTrees as linkTree (linkTree.id)}
              <li
                data-testid={`link-tree-card-${linkTree.id}`}
                class="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <h2 class="font-bold text-slate-900 leading-snug">{linkTree.title}</h2>
                  <span
                    class="shrink-0 inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border {linkTreeTypes[linkTree.type]?.badgeClass}"
                  >
                    {linkTreeTypes[linkTree.type]?.label}
                  </span>
                </div>
                <p class="text-sm text-slate-700 line-clamp-2">{linkTree.description}</p>
                <p class="text-xs text-slate-700">
                  {linkTree.total_links} tautan · Dibuat {formatDate(linkTree.created_at)}
                </p>
                <div class="flex items-center justify-end gap-2 mt-auto">
                  <button
                    type="button"
                    data-testid={`view-link-tree-${linkTree.id}`}
                    on:click={() => navigate(`/link-trees/${linkTree.id}`)}
                    aria-label={`Lihat detail ${linkTree.title}`}
                    title="Lihat Detail"
                    class="p-2 text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    type="button"
                    data-testid={`delete-link-tree-${linkTree.id}`}
                    on:click={() => handleDelete(linkTree.id)}
                    aria-label={`Hapus ${linkTree.title}`}
                    title="Hapus Link Tree"
                    class="p-2 text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </section>

    <AddModal
      show={showAddModal}
      onClose={() => (showAddModal = false)}
      onSaved={loadLinkTrees}
    />
  </div>
{/if}
