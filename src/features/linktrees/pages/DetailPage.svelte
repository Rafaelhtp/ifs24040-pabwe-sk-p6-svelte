<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";
  import { linkTreesStore, linkTreeTypes } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import { ArrowLeft, ImagePlus, PenLine, Plus, Trash2, Calendar, ExternalLink } from "lucide-svelte";

  export let linkTreeId;

  let showCoverModal = false;
  let showChangeModal = false;
  let showItemModal = false;
  let selectedItem = null;

  $: profile = $usersStore.profile;
  $: linkTree = $linkTreesStore.linkTree;
  $: items = linkTree?.items || [];
  $: coverAlt = linkTree?.title ? `Sampul ${linkTree.title}` : "Sampul";

  onMount(() => {
    if (linkTreeId) {
      linkTreesStore.asyncSetLinkTree(linkTreeId);
    }
  });

  let prevId = linkTreeId;
  $: if (linkTreeId !== prevId) {
    prevId = linkTreeId;
    linkTreesStore.asyncSetLinkTree(linkTreeId);
  }

  $: if ($linkTreesStore.isLinkTree) {
    linkTreesStore.setIsLinkTree(false);
    if (!linkTree) {
      navigate("/");
    }
  }

  $: if ($linkTreesStore.isLinkTreeItemDelete) {
    const isSuccess = $linkTreesStore.isLinkTreeItemDeleted;
    linkTreesStore.setIsLinkTreeItemDelete(false);
    linkTreesStore.setIsLinkTreeItemDeleted(false);
    if (isSuccess) {
      linkTreesStore.asyncSetLinkTree(linkTreeId);
    }
  }

  function openItemModal(item) {
    selectedItem = item;
    showItemModal = true;
  }

  async function handleDeleteItem(item) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus tautan ini?");
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeItemDelete(linkTreeId, item.id);
    }
  }
</script>

{#if !profile || !linkTree}
  <div class="flex flex-col items-center justify-center py-20" role="status">
    <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    <p class="sr-only">Memuat detail link tree...</p>
  </div>
{:else}
  <div class="space-y-6 max-w-4xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <a
        href="/"
        data-testid="back-to-link-trees-link"
        on:click|preventDefault={() => navigate("/")}
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-indigo-700 transition-colors"
      >
        <ArrowLeft size={18} />
        Kembali ke Semua Link Tree
      </a>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="edit-cover-btn"
          on:click={() => (showCoverModal = true)}
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-300 transition-colors"
        >
          <ImagePlus size={16} />
          Ubah Sampul
        </button>
        <button
          type="button"
          data-testid="edit-detail-btn"
          on:click={() => (showChangeModal = true)}
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors"
        >
          <PenLine size={16} />
          Ubah Data
        </button>
      </div>
    </div>

    <article class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {#if linkTree.cover}
        <img
          src={linkTree.cover}
          alt={coverAlt}
          class="w-full h-64 sm:h-80 object-cover bg-slate-900"
        />
      {/if}

      <div class="p-6 sm:p-8 space-y-4">
        <span
          class="inline-flex px-3 py-1 rounded-full text-xs font-bold border {linkTreeTypes[linkTree.type]?.badgeClass}"
        >
          {linkTreeTypes[linkTree.type]?.label}
        </span>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {linkTree.title}
        </h1>

        <p data-testid="link-tree-description" class="text-slate-700 leading-relaxed">
          {linkTree.description}
        </p>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700">
          <div class="flex items-center gap-1.5">
            <Calendar size={14} class="shrink-0" />
            <span>Dibuat: <strong>{formatDate(linkTree.created_at)}</strong></span>
          </div>
          <div class="flex items-center gap-1.5">
            <Calendar size={14} class="shrink-0" />
            <span>Diperbarui: <strong>{formatDate(linkTree.updated_at)}</strong></span>
          </div>
        </div>
      </div>
    </article>

    <section class="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-lg font-bold text-slate-900">Daftar Tautan</h2>
        <button
          type="button"
          data-testid="add-item-btn"
          on:click={() => openItemModal(null)}
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Tambah Tautan
        </button>
      </div>

      <div class="divide-y divide-slate-200">
        {#each items as item (item.id)}
          <div data-testid={`item-row-${item.id}`} class="py-3 flex items-center justify-between gap-3">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 font-semibold text-indigo-800 underline hover:text-indigo-950 break-all"
            >
              <span>{item.title}</span>
              <ExternalLink size={14} class="shrink-0" />
            </a>
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                data-testid={`edit-item-${item.id}`}
                on:click={() => openItemModal(item)}
                aria-label={`Ubah tautan ${item.title}`}
                title="Ubah Tautan"
                class="p-2 text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <PenLine size={18} />
              </button>
              <button
                type="button"
                data-testid={`delete-item-${item.id}`}
                on:click={() => handleDeleteItem(item)}
                aria-label={`Hapus tautan ${item.title}`}
                title="Hapus Tautan"
                class="p-2 text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        {:else}
          <p data-testid="empty-items" class="text-sm text-slate-700 py-2">
            Belum ada tautan pada link tree ini.
          </p>
        {/each}
      </div>
    </section>

    <ChangeCoverModal
      show={showCoverModal}
      {linkTree}
      onClose={() => (showCoverModal = false)}
    />
    <ChangeModal
      show={showChangeModal}
      {linkTree}
      onClose={() => (showChangeModal = false)}
    />
    <ItemModal
      show={showItemModal}
      {linkTreeId}
      item={selectedItem}
      onClose={() => (showItemModal = false)}
    />
  </div>
{/if}
