const imageInput = document.querySelector('input[name="image"]');
const previewImage = document.querySelector("#image-preview");
const previewText = document.querySelector("#image-preview-text");

if (imageInput && previewImage && previewText) {
  imageInput.addEventListener("change", (event) => {
    const [file] = event.target.files || [];

    if (!file) {
      previewImage.src = "/images/fallback-marketplace.svg";
      previewText.textContent = "Your selected image will preview here before publishing.";
      return;
    }

    previewImage.src = URL.createObjectURL(file);
    previewText.textContent = `Selected: ${file.name}`;
  });
}
