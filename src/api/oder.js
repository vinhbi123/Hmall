const BASE_URL = "https://hmstoresapi.eposh.io.vn";

// Tạo đơn hàng
export async function createOrder(data, token) {
    const res = await fetch(`${BASE_URL}/api/v1/orders/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    return await res.json();
}

// Lấy danh sách đơn hàng
export async function getOrders(token) {
    const res = await fetch(`${BASE_URL}/api/v1/orders`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return await res.json();
}

// Cập nhật trạng thái đơn hàng
export async function updateOrderStatus(orderId, status, token) {
    const res = await fetch(`${BASE_URL}/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
    });

    return await res.json();
}

// Xóa đơn hàng
export async function deleteOrder(orderId, token) {
    const res = await fetch(`${BASE_URL}/api/v1/orders/${orderId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return await res.json();
}