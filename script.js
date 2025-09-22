/* ---------- HELPER FUNCTIONS ---------- */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function clearCart() {
  localStorage.removeItem("cart");
}
function getProducts() {
    return JSON.parse(localStorage.getItem("sellerProducts")) || [
      { name: "Tomatoes", price: 40, stock: 100, location: "Coimbatore" },
      { name: "Onions", price: 30, stock: 150, location: "Salem" },
      { name: "Potatoes", price: 25, stock: 200, location: "Erode" }
    ];
}
function saveProducts(products) {
    localStorage.setItem("sellerProducts", JSON.stringify(products));
}

/* ---------- LOGIN PAGE LOGIC ---------- */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const role = document.querySelector("input[name='role']:checked").value;
    if (role === "seller") {
      window.location.href = "seller.html";
    } else {
      window.location.href = "buyer.html";
    }
  });
}

/* ---------- SELLER PAGE LOGIC ---------- */
const sellerForm = document.getElementById("sellerForm");
const sellerProductsDiv = document.getElementById("sellerProducts");

if (sellerForm) {
  function renderSellerProducts() {
    sellerProductsDiv.innerHTML = "";
    const products = getProducts();
    products.forEach((p, index) => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <h4>${p.name}</h4>
        <p>Price: ₹${p.price} per kg</p>
        <p><strong>Stock:</strong> ${p.stock} kg</p>
        <p class="muted"><strong>Location:</strong> ${p.location}</p>
        <button class="remove-btn" data-index="${index}">Delete</button>
      `;
      sellerProductsDiv.appendChild(div);
    });

    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        let products = getProducts();
        products.splice(btn.dataset.index, 1);
        saveProducts(products);
        renderSellerProducts();
      });
    });
  }

  sellerForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("productName").value;
    const price = parseInt(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value);
    const location = document.getElementById("productLocation").value;

    let products = getProducts();
    products.push({ name, price, stock, location });
    saveProducts(products);
    sellerForm.reset();
    renderSellerProducts();
  });

  renderSellerProducts();
}

/* ---------- BUYER PAGE LOGIC ---------- */
const buyerProductsDiv = document.getElementById("buyerProducts");
const cartItemsDiv = document.getElementById("cartItems");
const checkoutBtn = document.getElementById("checkoutBtn");

if (buyerProductsDiv) {
  function renderBuyerProducts() {
    buyerProductsDiv.innerHTML = "";
    const products = getProducts();
    products.forEach((p, idx) => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <h4>${p.name}</h4>
        <p>Price: ₹${p.price} per kg</p>
        <p class="muted">Location: ${p.location}</p>
        <input type="number" id="qty-${idx}" value="1" min="1" max="${p.stock}" style="width: 60px; margin-right: 10px;" />
        <button class="btn add-to-cart"
          data-id="${idx}" data-name="${p.name}" data-price="${p.price}" data-location="${p.location}">
          Add to Cart
        </button>
      `;
      buyerProductsDiv.appendChild(div);
    });

    document.querySelectorAll(".add-to-cart").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price);
        const location = btn.dataset.location;
        const qtyInput = document.getElementById(`qty-${id}`);
        const qty = parseInt(qtyInput.value);

        let cart = getCart();
        const existing = cart.find(item => item.id == id);
        if (existing) {
          existing.quantity += qty;
        } else {
          cart.push({ id, name, price, location, quantity: qty });
        }
        saveCart(cart);
        renderCart();
      });
    });
  }

  function renderCart() {
    if (!cartItemsDiv) return;
    const cart = getCart();
    if (!cart.length) {
      cartItemsDiv.innerHTML = '<p class="muted">Cart is empty.</p>';
      checkoutBtn.disabled = true;
      return;
    }

    cartItemsDiv.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <span>${item.name} - ${item.quantity}kg × ₹${item.price} = ₹${itemTotal}</span>
        <button class="remove-btn" data-id="${item.id}">Remove</button>
      `;
      cartItemsDiv.appendChild(div);
    });

    const totalDiv = document.createElement("p");
    totalDiv.innerHTML = `<strong>Total: ₹${total}</strong>`;
    cartItemsDiv.appendChild(totalDiv);

    checkoutBtn.disabled = false;

    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        let cart = getCart().filter(i => i.id != btn.dataset.id);
        saveCart(cart);
        renderCart();
      });
    });
  }

  renderBuyerProducts();
  renderCart();

  checkoutBtn.addEventListener("click", () => {
    const cart = getCart();
    if (!cart.length) {
      alert("Your cart is empty!");
      return;
    }
    localStorage.setItem("checkoutCart", JSON.stringify(cart));
    window.location.href = "payment.html";
  });
}

/* ---------- PAYMENT PAGE LOGIC ---------- */
const payBtn = document.getElementById("payBtn");
if (payBtn) {
  const billDetailsDiv = document.getElementById("billDetails");
  const creditCardFormDiv = document.getElementById("creditCardForm");
  const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const cart = JSON.parse(localStorage.getItem("checkoutCart")) || [];

  // 1. Render the detailed bill
  if (cart.length > 0) {
    let billHTML = '<table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>';
    let grandTotal = 0;
    
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      grandTotal += itemTotal;
      billHTML += `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
          <td>₹${itemTotal}</td>
        </tr>
      `;
    });

    billHTML += `
      <tr>
        <td colspan="3" class="grand-total">Grand Total</td>
        <td class="grand-total">₹${grandTotal}</td>
      </tr>
    `;
    billHTML += '</table>';
    billDetailsDiv.innerHTML = billHTML;

  } else {
    billDetailsDiv.innerHTML = "<p>Your cart is empty.</p>";
    payBtn.disabled = true;
  }

  // 2. Handle payment method selection
  paymentMethodRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
      if (event.target.value === 'card') {
        creditCardFormDiv.style.display = 'block';
      } else {
        creditCardFormDiv.style.display = 'none';
      }
    });
  });
  // Initially hide the form if card is not selected
  if(document.querySelector('input[name="paymentMethod"]:checked').value !== 'card') {
      creditCardFormDiv.style.display = 'none';
  }


  // 3. Handle the "Pay Now" button click
  payBtn.addEventListener("click", () => {
    if (!cart.length) {
      alert("No items to pay for!");
      return;
    }

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    const newOrder = {
      id: Date.now(),
      items: cart,
      date: new Date().toLocaleString(),
      status: "Completed",
      review: "",
      rating: 0
    };

    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("lastOrderId", newOrder.id);
    localStorage.removeItem("checkoutCart");
    clearCart();

    alert("Payment successful! Please leave a review.");
    window.location.href = "review.html";
  });
}
/* ---------- REVIEW PAGE LOGIC ---------- */
const reviewText = document.getElementById("reviewText");
const submitReview = document.getElementById("submitReview");
const orderDetails = document.getElementById("orderDetails");
const starRating = document.getElementById("starRating");

if (reviewText) {
  const lastOrderId = localStorage.getItem("lastOrderId");
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  const order = orders.find(o => o.id == lastOrderId);
  let selectedRating = 0;

  if (order) {
    orderDetails.innerHTML = '<h4>Order Summary:</h4>' + order.items
      .map(i => `<p>${i.name} - ${i.quantity}kg (₹${i.price * i.quantity})</p>`)
      .join("");
  }

  const stars = starRating.querySelectorAll("span");
  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = star.dataset.value;
      stars.forEach((s, i) => {
        i < selectedRating ? s.classList.add("active") : s.classList.remove("active");
      });
    });
  });

  submitReview.addEventListener("click", () => {
    const review = reviewText.value.trim();
    if (!selectedRating) {
      alert("Please select a star rating!");
      return;
    }
    
    const orderIndex = orders.findIndex(o => o.id == lastOrderId);
    if(orderIndex !== -1) {
        orders[orderIndex].review = review;
        orders[orderIndex].rating = selectedRating;
        localStorage.setItem("orders", JSON.stringify(orders));
    }

    alert("Thank you for your feedback!");
    window.location.href = "order_history.html";
  });
}

/* ---------- ORDER HISTORY PAGE LOGIC ---------- */
const orderList = document.getElementById("orderList");
if (orderList) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  if (!orders.length) {
    orderList.innerHTML = '<p class="muted">No past orders found.</p>';
  } else {
    orderList.innerHTML = "";
    orders.forEach(order => {
      const div = document.createElement("div");
      div.className = "card";

      const stars = order.rating
        ? "★".repeat(order.rating) + "☆".repeat(5 - order.rating)
        : "No rating";

      div.innerHTML = `
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Date:</strong> ${order.date}</p>
        <ul>
          ${order.items.map(i => `<li>${i.name} - ${i.quantity}kg</li>`).join("")}
        </ul>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Rating:</strong> ${stars}</p>
        <p><strong>Review:</strong> ${order.review || "<em>No review given.</em>"}</p>
      `;
      orderList.appendChild(div);
    });
  }
}