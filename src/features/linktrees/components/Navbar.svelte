<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { navigate } from "../../../router.js";
  import { Link, User, LogOut, ChevronDown, Menu, X } from "lucide-svelte";

  export let profile = null;
  export let isSidebarOpen = false;
  export let onToggleSidebar = undefined;
  export let onLogout = undefined;

  const dispatch = createEventDispatcher();

  let dropdownOpen = false;
  let dropdownRef;

  function handleClickOutside(event) {
    if (dropdownRef && !dropdownRef.contains(event.target)) {
      dropdownOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });

  function handleToggleSidebar() {
    dispatch("toggle-sidebar");
    if (onToggleSidebar) onToggleSidebar();
  }

  function handleProfileClick() {
    dropdownOpen = false;
    navigate("/profile");
  }

  function handleLogoutClick() {
    dropdownOpen = false;
    dispatch("logout");
    if (onLogout) onLogout();
  }
</script>

<header
  class="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-xs"
>
  <div class="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
    <div class="flex items-center gap-3">
      <button
        type="button"
        data-testid="toggle-sidebar-btn"
        on:click={handleToggleSidebar}
        class="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        aria-label="Buka atau tutup navigasi"
        aria-expanded={isSidebarOpen}
      >
        {#if isSidebarOpen}
          <X size={20} />
        {:else}
          <Menu size={20} />
        {/if}
      </button>

      <a
        href="/"
        data-testid="navbar-logo-link"
        on:click|preventDefault={() => navigate("/")}
        class="flex items-center gap-3 group"
      >
        <div
          class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform"
        >
          <Link size={22} strokeWidth={2.5} />
        </div>
        <span class="text-lg font-bold text-slate-900">Delcom Link Tree</span>
      </a>
    </div>

    <div class="relative" bind:this={dropdownRef}>
      <button
        type="button"
        data-testid="profile-dropdown-button"
        on:click={() => (dropdownOpen = !dropdownOpen)}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
        class="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      >
        {#if profile?.photo}
          <img
            src={profile.photo}
            alt="Foto profil {profile.name}"
            class="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
        {:else}
          <div
            class="w-8 h-8 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-xs"
          >
            {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
          </div>
        {/if}

        <div class="hidden sm:flex flex-col text-left">
          <span class="text-sm font-semibold text-slate-900 leading-tight">
            {profile?.name || "Pengguna"}
          </span>
          <span class="text-xs text-slate-700 leading-tight">
            {profile?.email || ""}
          </span>
        </div>
        <ChevronDown
          size={16}
          class="text-slate-600 transition-transform duration-200 {dropdownOpen ? 'rotate-180' : ''}"
        />
      </button>

      {#if dropdownOpen}
        <div
          data-testid="profile-dropdown-menu"
          class="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-900/5 divide-y divide-slate-100 z-50"
        >
          <div class="px-3 py-2 sm:hidden">
            <p class="text-sm font-semibold text-slate-900">{profile?.name}</p>
            <p class="text-xs text-slate-700 truncate">{profile?.email}</p>
          </div>

          <div class="py-1">
            <button
              type="button"
              data-testid="dropdown-profile-link"
              on:click={handleProfileClick}
              class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <User size={18} class="text-slate-600" />
              Profil Saya
            </button>
          </div>

          <div class="pt-1">
            <button
              type="button"
              data-testid="dropdown-logout-button"
              on:click={handleLogoutClick}
              class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-700 rounded-xl hover:bg-red-50 transition-colors text-left"
            >
              <LogOut size={18} class="text-red-700" />
              Keluar
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</header>
