document.addEventListener("DOMContentLoaded", function () {
  // Event delegation for delete buttons
  document.addEventListener("click", async function (event) {
    if (event.target.classList.contains("delete-btn")) {
      try {
        const btn = event.target;
        const prodId = btn.getAttribute("data-product-id");
        const csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;
        const productElement = btn.closest("article");
        const result = await fetch(`/admin/product/${prodId}`, {
          method: "DELETE",
          headers: { "csrf-token": csrfToken },
        });
        console.log(await result.json());
        productElement.parentNode.removeChild(productElement);
      } catch (err) {
        console.log(err);
      }
    }
  });
});
