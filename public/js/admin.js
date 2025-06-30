const deleteProduct = async (btn) => {
  try {
    const prodId = btn.parentNode.querySelector("[name=productId]").value;
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
};
