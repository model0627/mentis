export const fileStorage = {
  async upload(file: File, replaceUrl?: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    if (replaceUrl) {
      formData.append("replaceTargetUrl", replaceUrl);
    }

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    return res.json();
  },

  async delete(url: string): Promise<void> {
    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      throw new Error("Delete failed");
    }
  },
};
