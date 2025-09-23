import React, { useState, useEffect } from "react";
import "./Cart.css";
import { getCartItems, deleteCartItem, editCartItemQuantity } from "../../api/cart";
import LoadingSpinner from "../../components/LoadingSpinner"; // Thêm dòng này


const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [totalAmounts, setTotalAmounts] = useState(0);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    // Lấy giỏ hàng từ API
    useEffect(() => {
        async function fetchCart() {
            setLoading(true);
            const res = await getCartItems({}, token);
            const apiCart = res?.data?.items?.[0];
            setCartItems(apiCart?.cartItems || []);
            setTotalAmounts(apiCart?.totalAmounts || 0);
            setLoading(false);
        }
        fetchCart();
    }, [token]);

    // Xử lý tăng/giảm số lượng
    const handleQuantityChange = async (cartItemID, newQuantity) => {
        if (newQuantity < 1) return;
        await editCartItemQuantity({ cartItemID, quantity: newQuantity }, token);
        // Reload cart
        const res = await getCartItems({}, token);
        const apiCart = res?.data?.items?.[0];
        setCartItems(apiCart?.cartItems || []);
        setTotalAmounts(apiCart?.totalAmounts || 0);
    };

    // Xóa sản phẩm khỏi giỏ
    const handleRemove = async (cartItemID) => {
        await deleteCartItem(cartItemID, token);
        // Reload cart
        const res = await getCartItems({}, token);
        const apiCart = res?.data?.items?.[0];
        setCartItems(apiCart?.cartItems || []);
        setTotalAmounts(apiCart?.totalAmounts || 0);
    };

    return (
        <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
            <div className="cart-container-ui">
                <h2>Giỏ hàng của bạn</h2>
                {loading ? (
                    <LoadingSpinner />
                ) : cartItems.length === 0 ? (
                    <div>Giỏ hàng trống.</div>
                ) : (
                    cartItems.map(item => (
                        <div className="cart-item-ui" key={item.cartItemID}>
                            <img src={item.productImage} alt={item.productName} className="cart-item-img-ui" />
                            <div className="cart-item-info-ui">
                                <div className="cart-item-name-ui">{item.productName}</div>
                                <div className="cart-item-price-ui">{item.unitPrice.toLocaleString()}đ</div>
                                <div className="cart-qty-ui">
                                    <button onClick={() => handleQuantityChange(item.cartItemID, item.quantity - 1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleQuantityChange(item.cartItemID, item.quantity + 1)}>+</button>
                                </div>
                                <div className="cart-item-total-ui">
                                    Thành tiền: {item.totalAmounts.toLocaleString()}đ
                                </div>
                            </div>
                            <button className="cart-remove-btn-ui" onClick={() => handleRemove(item.cartItemID)} title="Xóa sản phẩm">
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                    <path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="#cc0fb9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 11v6M14 11v6" stroke="#cc0fb9" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}

                <div className="cart-summary-ui">
                    <div>
                        <span>Tạm tính:</span>
                        <span>{totalAmounts.toLocaleString()}đ</span>
                    </div>
                    <div>
                        <span>Giảm giá:</span>
                        <span>0đ</span>
                    </div>
                    <div className="cart-total-ui">
                        <span>Tổng cộng:</span>
                        <span>{totalAmounts.toLocaleString()}đ</span>
                    </div>
                </div>
                <button className="cart-checkout-btn-ui" disabled={cartItems.length === 0}>THANH TOÁN</button>
            </div>
        </div>
    );
};

export default Cart;