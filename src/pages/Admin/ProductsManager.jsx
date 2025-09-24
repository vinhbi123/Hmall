import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner, Row, Col } from "react-bootstrap";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../api/product";
import PaginationSection from "../../components/Admin/PaginationSection";

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});

  // pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const totalItems = products.length;

  // Gọi API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts({ pageNumber: 1, pageSize: 1000 });
      setProducts(res?.data?.items || []);
    } catch (err) {
      setError("Không thể tải sản phẩm");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Mở modal
  const handleShowModal = (product = null) => {
    setEditingProduct(product);
    setFormData(
      product || {
        name: "",
        description: "",
        costPrice: 0,
        price: 0,
        stock: 0,
        material: "",
        commonImage: "",
        category: "",
        moreImage: [{ url: "" }],
      }
    );
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  // Lưu (create hoặc update)
  const handleSave = async () => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData, localStorage.getItem("token"));
      } else {
        await createProduct(formData, localStorage.getItem("token"));
      }
      fetchProducts();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setError("Lưu sản phẩm thất bại!");
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(id, localStorage.getItem("token"));
        fetchProducts();
      } catch (err) {
        console.error(err);
        setError("Xóa sản phẩm thất bại!");
      }
    }
  };

  // Cắt sản phẩm theo trang
  const paginatedProducts = products.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="mb-4">Quản lý sản phẩm</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="mb-3">
        <Button onClick={() => handleShowModal()} style={{ background: "#84b4c8", border: "none" }}>
          + Thêm sản phẩm
        </Button>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Giá</th>
                <th>Danh mục</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.price?.toLocaleString("vi-VN")}đ</td>
                  <td>{p.category}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() => handleShowModal(p)}
                    >
                      Sửa
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Phân trang */}
          <PaginationSection
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={(newPage) => setPageNumber(newPage)}
          />
        </>
      )}

      {/* Modal thêm/sửa */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên sản phẩm</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá gốc</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá bán</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng tồn kho</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Chất liệu</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Ảnh chính</Form.Label>
              <Form.Control
                type="text"
                value={formData.commonImage}
                onChange={(e) => setFormData({ ...formData, commonImage: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Control
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ảnh phụ</Form.Label>
              <Form.Control
                type="text"
                value={formData.moreImage?.[0]?.url || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    moreImage: [{ url: e.target.value }],
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editingProduct ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductsManager;
