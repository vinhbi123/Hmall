import { useEffect, useState } from "react";
import { getProductsByShop, deleteProduct, updateProduct } from "../../api/product";
import { Table, Container, Button, Spinner, Alert, Pagination, Toast, Modal, Form, Row, Col } from "react-bootstrap";
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
    const [showEditModal, setShowEditModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);

    const token = localStorage.getItem("token");
    const shopId = localStorage.getItem("shopId");

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            setError("");
            try {
                const res = await getProductsByShop({ pageNumber, pageSize, shopId }, token);
                if (res.statusCode === 200) {
                    // Chỉ lấy sản phẩm isActive
                    const activeProducts = (res.data.items || []);
                    setProducts(activeProducts);
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
            if (res.statusCode === 200) {
                const activeProducts = (res.data.items || []).filter(p => p.isActive);
                setProducts(activeProducts);
                setTotalPages(res.data.totalPages || 1);
            } else {
                setError(res.message || "Không thể tải lại danh sách sản phẩm");
            }
        } catch (err) {
            setError("Không thể tải lại danh sách sản phẩm");
        }
        setLoading(false);
        setShowAddModal(false);
        setToastMsg("Tạo sản phẩm thành công!");
        setShowToast(true);
    };

    // Xử lý xóa sản phẩm
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
        setDeleteLoadingId(productId);
        try {
            const res = await deleteProduct(productId, token);
            if (res.statusCode === 200) {
                setProducts(products.filter((p) => p.id !== productId));
                setToastMsg("Xóa sản phẩm thành công!");
                setShowToast(true);
            } else {
                setToastMsg(res.message || "Xóa sản phẩm thất bại!");
                setShowToast(true);
            }
        } catch {
            setToastMsg("Xóa sản phẩm thất bại!");
            setShowToast(true);
        }
        setDeleteLoadingId(null);
    };

    // Xử lý mở modal sửa
    const handleShowEditModal = (product) => {
        setSelectedProduct(product);
        setEditForm({
            name: product.name || "",
            description: product.description || "",
            costPrice: product.costPrice || "",
            price: product.price || "",
            stock: product.stock || "",
            material: product.material || "",
            category: product.category || "",
            commonImage: product.commonImage || "",
        });
        setShowEditModal(true);
    };

    // Xử lý upload ảnh khi sửa
    const handleEditImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditLoading(true);
        try {
            const { uploadMultipleFiles } = await import("../../api/upload");
            const res = await uploadMultipleFiles({ files: [file], customeFolder: "products" }, token);
            const relativePath = res?.files?.[0];
            if (relativePath) {
                const imgUrl = `${BASE_API_URL}${relativePath}`;
                setEditForm((prev) => ({ ...prev, commonImage: imgUrl }));
            }
        } catch {
            setToastMsg("Tải ảnh thất bại!");
            setShowToast(true);
        }
        setEditLoading(false);
    };

    // Xử lý thay đổi form sửa
    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    // Xử lý lưu sửa sản phẩm
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            const res = await updateProduct(selectedProduct.id, editForm, token);
            if (res.statusCode === 200 || res.statusCode === 201) {
                setShowEditModal(false);
                setToastMsg("Cập nhật sản phẩm thành công!");
                setShowToast(true);
                // reload lại danh sách
                const reload = await getProductsByShop({ pageNumber, pageSize, shopId }, token);
                const activeProducts = (reload.data.items || []).filter(p => p.isActive);
                setProducts(activeProducts);
            } else {
                setToastMsg(res.message || "Cập nhật sản phẩm thất bại!");
                setShowToast(true);
            }
        } catch {
            setToastMsg("Cập nhật sản phẩm thất bại!");
            setShowToast(true);
        }
        setEditLoading(false);
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
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted">
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
                                        <td>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleShowEditModal(p)}
                                            >
                                                Sửa
                                            </Button>
                                            {p.isActive && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteProduct(p.id)}
                                                    disabled={deleteLoadingId === p.id}
                                                >
                                                    {deleteLoadingId === p.id ? <Spinner size="sm" /> : "Xóa"}
                                                </Button>
                                            )}
                                        </td>
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

            {/* Modal sửa sản phẩm */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Sửa sản phẩm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tên sản phẩm</Form.Label>
                                    <Form.Control
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleEditChange}
                                        required
                                        size="sm"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mô tả</Form.Label>
                                    <Form.Control
                                        name="description"
                                        value={editForm.description}
                                        onChange={handleEditChange}
                                        as="textarea"
                                        rows={3}
                                        size="sm"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Danh mục</Form.Label>
                                    <Form.Control
                                        name="category"
                                        value={editForm.category}
                                        onChange={handleEditChange}
                                        size="sm"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giá vốn</Form.Label>
                                    <Form.Control
                                        name="costPrice"
                                        value={editForm.costPrice}
                                        onChange={handleEditChange}
                                        type="number"
                                        required
                                        size="sm"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giá bán</Form.Label>
                                    <Form.Control
                                        name="price"
                                        value={editForm.price}
                                        onChange={handleEditChange}
                                        type="number"
                                        required
                                        size="sm"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số lượng</Form.Label>
                                    <Form.Control
                                        name="stock"
                                        value={editForm.stock}
                                        onChange={handleEditChange}
                                        type="number"
                                        required
                                        size="sm"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Chất liệu</Form.Label>
                                    <Form.Control
                                        name="material"
                                        value={editForm.material}
                                        onChange={handleEditChange}
                                        size="sm"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh chính</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleEditImageChange}
                                disabled={editLoading}
                                size="sm"
                            />
                            {editForm.commonImage && (
                                <div className="mt-2">
                                    <img
                                        src={editForm.commonImage}
                                        alt="Common"
                                        style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 6 }}
                                    />
                                </div>
                            )}
                        </Form.Group>
                        <div className="mt-4 text-end">
                            <Button
                                variant="secondary"
                                onClick={() => setShowEditModal(false)}
                                className="me-2"
                                disabled={editLoading}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={editLoading}
                            >
                                {editLoading ? <Spinner size="sm" className="me-2" /> : null}
                                Lưu thay đổi
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

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
                    <strong className="me-auto">Thông báo</strong>
                </Toast.Header>
                <Toast.Body className="text-white">{toastMsg}</Toast.Body>
            </Toast>
        </Container>
    );
};

export default ShopProducts;