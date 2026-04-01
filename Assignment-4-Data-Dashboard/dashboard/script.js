const ORDER_KEY = "crunchCookiesOrders";

let orders = JSON.parse(localStorage.getItem(ORDER_KEY)) || [];

if (orders.length === 0) {
  orders = [
    { product: "Choco Chip", price: 100, quantity: 1, category: "Chocolate", date: "2026-04-01" },
    { product: "Red Velvet", price: 180, quantity: 2, category: "Cream", date: "2026-04-02" },
    { product: "Oat Walnut", price: 160, quantity: 1, category: "Nut", date: "2026-03-28" },
    { product: "Almond Crunch", price: 140, quantity: 3, category: "Nut", date: "2026-03-24" }
  ];
}

let salesChart;
let productChart;
let categoryChart;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function getTimeKey(date, filter) {
  if (filter === "yearly") {
    return String(date.getFullYear());
  }

  if (filter === "monthly") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  return date.toISOString().split("T")[0];
}

function getSortDate(key, filter) {
  if (filter === "yearly") return new Date(Number(key), 0, 1);
  if (filter === "monthly") {
    const [year, month] = key.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }
  return new Date(key);
}

function formatLabel(key, filter) {
  if (filter === "yearly") return key;

  if (filter === "monthly") {
    const [year, month] = key.split("-").map(Number);
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      year: "numeric"
    }).format(new Date(year, month - 1, 1));
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short"
  }).format(new Date(key));
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function getTopEntry(record) {
  const entries = Object.entries(record);
  if (!entries.length) return ["-", 0];
  return entries.sort((a, b) => b[1] - a[1])[0];
}

function buildInsights(topProducts, recentOrders, totalRevenue) {
  const insightsList = document.getElementById("insightsList");
  if (!insightsList) return;

  const highestProduct = topProducts[0];
  const latestOrder = recentOrders[0];
  const strongestOrder = recentOrders.reduce(
    (best, order) => {
      const total = (order.price || 0) * (order.quantity || 1);
      return total > best.total ? { label: order.product, total } : best;
    },
    { label: "-", total: 0 }
  );

  const cards = [
    {
      title: highestProduct ? highestProduct[0] : "-",
      description: "Best performing cookie",
      value: highestProduct ? `${highestProduct[1]} sold` : "0 sold"
    },
    {
      title: latestOrder ? latestOrder.product : "-",
      description: "Latest order added",
      value: latestOrder ? formatDate(latestOrder.date) : "No orders yet"
    },
    {
      title: strongestOrder.label,
      description: "Largest single order value",
      value: formatCurrency(strongestOrder.total)
    },
    {
      title: formatCurrency(totalRevenue),
      description: "Current stored revenue",
      value: "Across all saved orders"
    }
  ];

  insightsList.innerHTML = cards.map((item) => `
    <div class="insight-item">
      <div class="insight-copy">
        <strong>${item.title}</strong>
        <span>${item.description}</span>
      </div>
      <div class="insight-value">
        <strong>${item.value}</strong>
      </div>
    </div>
  `).join("");
}

function renderOrdersTable(sortedOrders) {
  const tableBody = document.getElementById("ordersTable");
  if (!tableBody) return;

  if (!sortedOrders.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6">No orders available yet.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = sortedOrders.map((order) => {
    const qty = order.quantity || 1;
    const total = (order.price || 0) * qty;

    return `
      <tr>
        <td class="product-cell">
          <strong>${order.product}</strong>
          <span>Freshly tracked item</span>
        </td>
        <td>${order.category || "General"}</td>
        <td><span class="qty-chip">${qty} pcs</span></td>
        <td>${formatCurrency(order.price || 0)}</td>
        <td>${formatCurrency(total)}</td>
        <td><span class="date-chip">${formatDate(order.date)}</span></td>
      </tr>
    `;
  }).join("");
}

function createCharts(labels, values, productEntries, categoryEntries) {
  if (salesChart) salesChart.destroy();
  if (productChart) productChart.destroy();
  if (categoryChart) categoryChart.destroy();

  salesChart = new Chart(document.getElementById("salesChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue",
        data: values,
        borderColor: "#9c5628",
        backgroundColor: "rgba(184, 104, 47, 0.16)",
        fill: true,
        borderWidth: 3,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#f6e3c6",
        pointBorderColor: "#9c5628",
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label(context) {
              return ` ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: "#86624c"
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#86624c",
            callback(value) {
              return formatCurrency(value);
            }
          },
          grid: {
            color: "rgba(125, 67, 31, 0.08)"
          }
        }
      }
    }
  });

  productChart = new Chart(document.getElementById("productChart"), {
    type: "bar",
    data: {
      labels: productEntries.map(([name]) => name),
      datasets: [{
        label: "Items sold",
        data: productEntries.map(([, count]) => count),
        borderRadius: 14,
        backgroundColor: ["#b8682f", "#d59559", "#8b4a24", "#e2b15f", "#6d391a", "#f0c98b"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: "#86624c"
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: "#86624c"
          },
          grid: {
            color: "rgba(125, 67, 31, 0.08)"
          }
        }
      }
    }
  });

  categoryChart = new Chart(document.getElementById("categoryChart"), {
    type: "doughnut",
    data: {
      labels: categoryEntries.map(([name]) => name),
      datasets: [{
        data: categoryEntries.map(([, count]) => count),
        backgroundColor: ["#b8682f", "#7d431f", "#e2b15f", "#f3d7a5", "#d38d53"],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#86624c",
            usePointStyle: true,
            padding: 18
          }
        }
      }
    }
  });
}

function updateDashboard() {
  const filter = document.getElementById("timeFilter").value;

  let revenue = 0;
  const productCount = {};
  const categoryCount = {};
  const timeData = {};

  orders.forEach((order) => {
    const date = new Date(order.date);
    const qty = Number(order.quantity) || 1;
    const price = Number(order.price) || 0;
    const amount = price * qty;
    const timeKey = getTimeKey(date, filter);

    revenue += amount;
    productCount[order.product] = (productCount[order.product] || 0) + qty;
    categoryCount[order.category] = (categoryCount[order.category] || 0) + qty;
    timeData[timeKey] = (timeData[timeKey] || 0) + amount;
  });

  const sortedKeys = Object.keys(timeData).sort(
    (a, b) => getSortDate(a, filter) - getSortDate(b, filter)
  );
  const sortedValues = sortedKeys.map((key) => timeData[key]);

  let growth = 0;
  if (sortedValues.length > 1) {
    const latest = sortedValues[sortedValues.length - 1];
    const previous = sortedValues[sortedValues.length - 2];
    growth = previous === 0 ? 100 : ((latest - previous) / previous) * 100;
  }

  const [topProduct, topProductCount] = getTopEntry(productCount);
  const [topCategory, topCategoryCount] = getTopEntry(categoryCount);
  const avgOrder = orders.length ? revenue / orders.length : 0;
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
  const topProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const categoryEntries = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);

  setText("revenue", formatCurrency(revenue));
  setText("orders", String(orders.length));
  setText("topProduct", topProduct);
  setText("growth", `${growth.toFixed(1)}%`);
  setText("avgOrder", formatCurrency(avgOrder));
  setText("topCategory", topCategory);
  setText("revenueNote", `${formatCurrency(avgOrder)} average basket value`);
  setText("ordersNote", `${sortedOrders.length ? formatDate(sortedOrders[0].date) : "No recent activity"} latest recorded order`);
  setText("topProductNote", `${topProductCount} units sold`);
  setText("growthNote", growth >= 0 ? "Momentum is moving upward" : "Review the recent dip");
  setText("avgOrderNote", `${topCategory} shoppers spend steadily`);
  setText("topCategoryNote", `${topCategoryCount} items in this category`);
  setText("heroTopProduct", topProduct);
  setText("focusTitle", `${topProduct} is leading this batch`);
  setText("focusText", `${topCategory} remains the strongest category with ${topCategoryCount} items sold.`);
  setText("rangeLabel", `${filter.charAt(0).toUpperCase() + filter.slice(1)} snapshot`);

  createCharts(
    sortedKeys.map((key) => formatLabel(key, filter)),
    sortedValues,
    topProducts,
    categoryEntries
  );
  buildInsights(topProducts, sortedOrders, revenue);
  renderOrdersTable(sortedOrders.slice(0, 8));
}

function goToShop() {
  window.location.href = "../index.html";
}

window.onload = updateDashboard;
