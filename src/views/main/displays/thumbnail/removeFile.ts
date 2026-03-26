/**
 * removeFile — Declenche le dialogue de confirmation de suppression
 * au lieu de supprimer directement avec un timer.
 */

export default function removeFile(file: any): void {
  const fileName = file?.name;
  if (!fileName) return;

  document.getElementById("root")?.dispatchEvent(
    new CustomEvent("_confirm_delete", {
      detail: { fileNames: [fileName] },
    })
  );
}
