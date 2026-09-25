export async function copyToClipboard(text: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return fallbackCopy(text);
  }

  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch {
    return fallbackCopy(text);
  }
}

function fallbackCopy(text: string): { success: boolean; error?: string } {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (!ok) {
      return { success: false, error: "Clipboard copy was blocked by the browser." };
    }
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Unable to copy to clipboard. Try selecting the code manually.",
    };
  }
}
