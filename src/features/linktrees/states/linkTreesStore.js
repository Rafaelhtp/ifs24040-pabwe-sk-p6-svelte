import { writable } from "svelte/store";
import linkTreeApi from "../api/linkTreeApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export const linkTreeTypes = {
  public: {
    label: "Publik",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  unlisted: {
    label: "Tidak Terdaftar",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200",
  },
  private: {
    label: "Privat",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
  },
};

const initialState = {
  linkTrees: [],
  linkTree: null,
  isLinkTree: false,
  isLinkTreeAdd: false,
  isLinkTreeAdded: false,
  isLinkTreeChange: false,
  isLinkTreeChanged: false,
  isLinkTreeChangeCover: false,
  isLinkTreeChangedCover: false,
  isLinkTreeDelete: false,
  isLinkTreeDeleted: false,
  isLinkTreeDeleteAll: false,
  isLinkTreeDeletedAll: false,
  isLinkTreeItemAdd: false,
  isLinkTreeItemAdded: false,
  isLinkTreeItemChange: false,
  isLinkTreeItemChanged: false,
  isLinkTreeItemDelete: false,
  isLinkTreeItemDeleted: false,
};

function createLinkTreesStore() {
  let currentState = { ...initialState };
  const innerStore = writable(currentState);
  innerStore.subscribe((value) => {
    currentState = value;
  });

  function setValue(key, value) {
    innerStore.update((state) => ({ ...state, [key]: value }));
  }

  async function mutate(doneKey, successKey, action, fallbackMessage) {
    try {
      const message = await action();
      showSuccessDialog(message || fallbackMessage);
      setValue(successKey, true);
    } catch (error) {
      showErrorDialog(error.message);
      setValue(successKey, false);
    } finally {
      setValue(doneKey, true);
    }
  }

  const store = {
    subscribe: innerStore.subscribe,
    reset(state = initialState) {
      innerStore.set({ ...initialState, ...state });
    },
    async asyncSetLinkTrees(isMe = false) {
      try {
        setValue("linkTrees", await linkTreeApi.getLinkTrees(isMe));
      } catch {
        setValue("linkTrees", []);
      }
    },
    async asyncSetLinkTree(linkTreeId) {
      try {
        setValue("linkTree", await linkTreeApi.getLinkTreeById(linkTreeId));
      } catch {
        setValue("linkTree", null);
      } finally {
        setValue("isLinkTree", true);
      }
    },
    asyncSetIsLinkTreeAdd(title, type, description) {
      return mutate(
        "isLinkTreeAdd",
        "isLinkTreeAdded",
        () => linkTreeApi.postLinkTree(title, type, description),
        "Link tree berhasil ditambahkan!"
      );
    },
    asyncSetIsLinkTreeChange(linkTreeId, title, type, description) {
      return mutate(
        "isLinkTreeChange",
        "isLinkTreeChanged",
        () => linkTreeApi.putLinkTree(linkTreeId, title, type, description),
        "Link tree berhasil diperbarui!"
      );
    },
    asyncSetIsLinkTreeChangeCover(linkTreeId, cover) {
      return mutate(
        "isLinkTreeChangeCover",
        "isLinkTreeChangedCover",
        () => linkTreeApi.postLinkTreeCover(linkTreeId, cover),
        "Cover berhasil diperbarui!"
      );
    },
    asyncSetIsLinkTreeDelete(linkTreeId) {
      return mutate(
        "isLinkTreeDelete",
        "isLinkTreeDeleted",
        () => linkTreeApi.deleteLinkTree(linkTreeId),
        "Link tree berhasil dihapus!"
      );
    },
    asyncSetIsLinkTreeDeleteAll() {
      return mutate(
        "isLinkTreeDeleteAll",
        "isLinkTreeDeletedAll",
        () => linkTreeApi.deleteAllLinkTrees(),
        "Semua link tree berhasil dihapus!"
      );
    },
    asyncSetIsLinkTreeItemAdd(linkTreeId, title, url) {
      return mutate(
        "isLinkTreeItemAdd",
        "isLinkTreeItemAdded",
        () => linkTreeApi.postLinkTreeItem(linkTreeId, title, url),
        "Tautan berhasil ditambahkan!"
      );
    },
    asyncSetIsLinkTreeItemChange(linkTreeId, itemId, title, url) {
      return mutate(
        "isLinkTreeItemChange",
        "isLinkTreeItemChanged",
        () => linkTreeApi.putLinkTreeItem(linkTreeId, itemId, title, url),
        "Tautan berhasil diperbarui!"
      );
    },
    asyncSetIsLinkTreeItemDelete(linkTreeId, itemId) {
      return mutate(
        "isLinkTreeItemDelete",
        "isLinkTreeItemDeleted",
        () => linkTreeApi.deleteLinkTreeItem(linkTreeId, itemId),
        "Tautan berhasil dihapus!"
      );
    },
  };

  Object.keys(initialState).forEach((key) => {
    store[`set${key.charAt(0).toUpperCase()}${key.slice(1)}`] = (value) => setValue(key, value);
    Object.defineProperty(store, key, {
      get: () => currentState[key],
      enumerable: true,
    });
  });

  Object.defineProperty(store, "$state", {
    get: () => currentState,
  });

  return store;
}

export const linkTreesStore = createLinkTreesStore();
export const useLinkTreesStore = () => linkTreesStore;
export default linkTreesStore;
