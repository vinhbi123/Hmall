import { useEffect, useState } from "react";
import { getProductsByShop } from "../../api/product";
import { Table, Container, Button, Spinner, Alert, Pagination, Toast } from "react-bootstrap";
import AddProducts from "../../components/AddProducts";

const BASE_API_URL = "https://hmstoresapi.eposh.io.vn/";

const ShopProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const token = localStorage.getItem("token");
    const shopId = localStorage.getItem("shopId");

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            setError("");
            try {
                const res = await getProductsByShop({ pageNumber, pageSize, shopId }, token);
                if (res.statusCode === 200) {
                    setProducts(res.data.items || []);
                    setTotalPages(res.data.totalPages || 1);
                } else {
                    setError(res.message || "Lỗi khi tải sản phẩm");
                }
            } catch (err) {
                setError("Không thể tải sản phẩm");
            }
            setLoading(false);
        }
        fetchProducts();
    }, [pageNumber, pageSize, shopId, token]);

    const handleProductCreated = async () => {
        setPageNumber(1);
        setLoading(true);
        try {
            const res = await getProductsByShop({ pageNumber: 1, pageSize, shopId }, token);
            if (res.statusCode === 200) { // Changed from 201 to 200
                setProducts(res.data.items || []);
                setTotalPages(res.data.totalPages || 1);
            } else {
                setError(res.message || "Không thể tải lại danh sách sản phẩm");
            }
        } catch (err) {
            setError("Không thể tải lại danh sách sản phẩm");
        }
        setLoading(false);
        setShowAddModal(false); // Close modal
        setShowToast(true); // Show toast
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        let items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === pageNumber}
                    onClick={() => setPageNumber(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return (
            <Pagination className="justify-content-center mt-3">
                <Pagination.First onClick={() => setPageNumber(1)} disabled={pageNumber === 1} />
                <Pagination.Prev onClick={() => setPageNumber(pageNumber - 1)} disabled={pageNumber === 1} />
                {items}
                <Pagination.Next onClick={() => setPageNumber(pageNumber + 1)} disabled={pageNumber === totalPages} />
                <Pagination.Last onClick={() => setPageNumber(totalPages)} disabled={pageNumber === totalPages} />
            </Pagination>
        );
    };

    return (
        <Container style={{ padding: 40 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Danh sách sản phẩm của Shop</h2>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Thêm sản phẩm
                </Button>
            </div>

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>Giá</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted">
                                        Không có sản phẩm nào
                                    </td>
                                </tr>
                            ) : (
                                products.map((p, idx) => (
                                    <tr key={p.id}>
                                        <td>{(pageNumber - 1) * pageSize + idx + 1}</td>
                                        <td>
                                            <img
                                                src={
                                                    p.commonImage
                                                        ? p.commonImage.startsWith("http")
                                                            ? p.commonImage
                                                            : `${BASE_API_URL}${p.commonImage}`
                                                        : "https://via.placeholder.com/60"
                                                }
                                                alt={p.name}
                                                style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }}
                                            />
                                        </td>
                                        <td>{p.name}</td>
                                        <td>{p.price?.toLocaleString("vi-VN")} đ</td>
                                        <td>
                                            {p.status === "Available" || p.status === "InStock" ? (
                                                <span className="text-success">Còn hàng</span>
                                            ) : (
                                                <span className="text-danger">Hết hàng</span>
                                            )}
                                        </td>
                                        <td>{new Date(p.createdDate).toLocaleDateString("vi-VN")}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                    {renderPagination()}
                </>
            )}

            <AddProducts
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onCreated={handleProductCreated}
                token={token}
            />

            <Toast
                show={showToast}
                onClose={() => setShowToast(false)}
                delay={2000}
                autohide
                style={{
                    position: "fixed",
                    top: 20,
                    right: 20,
                    minWidth: 250,
                    zIndex: 9999,
                }}
                bg="success"
            >
                <Toast.Header>
                    <strong className="me-auto">Thành công</strong>
                </Toast.Header>
                <Toast.Body className="text-white">Tạo sản phẩm thành công!</Toast.Body>
            </Toast>
        </Container>
    );
};

export default ShopProducts;