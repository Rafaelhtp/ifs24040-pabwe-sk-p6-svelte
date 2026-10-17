async function loadSwal() {
  const { default: Swal } = await import("sweetalert2");
  return Swal;
}

async function showAlertDialog({ title, message, icon, confirmButtonColor }) {
  const Swal = await loadSwal();
  const result = await Swal.fire({
    title,
    text: message,
    icon,
    confirmButtonText: "Tutup",
    confirmButtonColor,
  });
  if (result.isConfirmed) {
    Swal.close();
  }
  return result;
}

export function showErrorDialog(message) {
  return showAlertDialog({
    title: "Terjadi Kesalahan",
    message,
    icon: "error",
    confirmButtonColor: "#ef4444",
  });
}

export function showWarningDialog(message) {
  return showAlertDialog({
    title: "Peringatan",
    message,
    icon: "warning",
    confirmButtonColor: "#f59e0b",
  });
}

export function showSuccessDialog(message) {
  return showAlertDialog({
    title: "Tindakan Berhasil",
    message,
    icon: "success",
    confirmButtonColor: "#10b981",
  });
}

export async function showConfirmDialog(message) {
  const Swal = await loadSwal();
  return Swal.fire({
    title: "Konfirmasi",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#94a3b8",
  });
}

export function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
