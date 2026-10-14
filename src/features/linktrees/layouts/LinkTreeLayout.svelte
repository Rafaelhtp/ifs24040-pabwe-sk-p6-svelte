<script>
  import { onMount } from "svelte";
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";
  import { usersStore } from "../../users/states/usersStore";
  import { authStore } from "../../auth/states/authStore";
  import apiHelper from "../../../helpers/apiHelper";
  import { navigate } from "../../../router.js";

  let isSidebarOpen = false;

  $: profile = $usersStore.profile;

  onMount(() => {
    const authToken = apiHelper.getAccessToken();
    if (authToken) {
      usersStore.asyncSetProfile();
    } else {
      navigate("/auth/login");
    }
  });

  $: if ($usersStore.isProfile) {
    usersStore.setIsProfile(false);
    if (!profile) {
      apiHelper.putAccessToken("");
      navigate("/auth/login");
    }
  }

  $: if ($authStore.isAuthLogout) {
    authStore.setIsAuthLogout(false);
    navigate("/auth/login");
  }

  function handleLogout() {
    authStore.asyncSetIsAuthLogout();
  }

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  function handleCloseSidebar() {
    isSidebarOpen = false;
  }
</script>

{#if !profile}
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="flex flex-col items-center gap-3" role="status">
      <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm font-medium text-slate-700">Memuat sesi pengguna...</p>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <Navbar
      {profile}
      {isSidebarOpen}
      onLogout={handleLogout}
      onToggleSidebar={toggleSidebar}
    />

    <Sidebar {isSidebarOpen} onCloseMobile={handleCloseSidebar} />

    <main class="pt-16 md:pl-64 transition-all">
      <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
{/if}
