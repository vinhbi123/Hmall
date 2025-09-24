
import { useState, useMemo, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Badge, Pagination } from "react-bootstrap";
import { motion } from "framer-motion";
import { Star, Heart, Search, Filter } from "react-bootstrap-icons";
import "./Products.css";
import { Link } from "react-router-dom";
import { getProducts } from "../../api/product";

const Products = () => {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [showFilters, setShowFilters] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(9); // Ban đầu lấy 9 sản phẩm
    const [totalItems, setTotalItems] = useState(0); // Tổng số sản phẩm
    const [showLoadMore, setShowLoadMore] = useState(true); // Hiển thị nút "Xem Thêm" ban đầu

    // Lấy sản phẩm từ API
    // ...existing code...
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getProducts({
                    search: searchTerm,
                    filter: selectedCategory !== "all" ? selectedCategory : "",
                    pageNumber,
                    pageSize,
                });

                console.log("API response:", res);

                const data = res?.data?.items || [];
                setProducts(data);
                setTotalItems(res?.data?.totalRecord || data.length);

            } catch (error) {
                console.error(error);
                setError("Không thể tải sản phẩm. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [pageNumber, pageSize, selectedCategory, searchTerm]);
    // ...existing code...
    // Tạo danh sách danh mục từ sản phẩm
    const categories = useMemo(() => {
        const set = new Set(products.map((p) => p.category).filter(Boolean));
        return Array.from(set);
    }, [products]);

    // Sắp xếp sản phẩm (client-side)
    const filteredProducts = useMemo(() => {
        let filtered = [...products];
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "rating":
                    return (b.rating || 0) - (a.rating || 0);
                case "name":
                default:
                    return a.name.localeCompare(b.name);
            }
        });
        return filtered;
    }, [products, sortBy]);

    // Xử lý nút "Xem Thêm Sản Phẩm"
    const handleLoadMore = () => {
        setPageSize(12);
        setPageNumber(1);
        setShowLoadMore(false);
    };

    // Tính tổng số trang
    const totalPages = Math.ceil(totalItems / pageSize);

    // Xử lý thay đổi trang
    const handlePageChange = (newPage) => {
        setPageNumber(newPage);
        setPageSize(12); // Giữ pageSize là 12 khi dùng phân trang
        setShowLoadMore(false); // Ẩn nút "Xem Thêm" khi dùng phân trang
    };

    return (
        <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
            <Container>
                {/* Tiêu đề trang */}
                <section className="banner-section">
                    <div className="banner-overlay"></div>
                    <Container className="h-100">
                        <Row className="h-100 align-items-center justify-content-center text-center">
                            <Col>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <h1 className="display-4 fw-bold mb-3 text-white">Sản Phẩm Handmade</h1>
                                    <p className="lead text-light">
                                        Khám phá bộ sưu tập đầy đủ các sản phẩm thủ công độc đáo
                                    </p>
                                </motion.div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Thanh tìm kiếm và bộ lọc */}
                <Row className="mb-4">
                    <Col lg={8}>
                        <div className="position-relative">
                            <Search
                                className="position-absolute"
                                style={{
                                    left: "15px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#6c757d",
                                }}
                            />
                            <Form.Control
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    paddingLeft: "45px",
                                    borderRadius: "25px",
                                    border: "2px solid #e9ecef",
                                }}
                            />
                        </div>
                    </Col>
                    <Col lg={4} className="d-flex gap-2">
                        <Form.Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ borderRadius: "25px" }}
                        >
                            <option value="name">Sắp xếp theo tên</option>
                            <option value="price-low">Giá thấp đến cao</option>
                            <option value="price-high">Giá cao đến thấp</option>
                            <option value="rating">Đánh giá cao nhất</option>
                        </Form.Select>
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowFilters(!showFilters)}
                            style={{ borderRadius: "25px", minWidth: "120px" }}
                        >
                            <Filter className="me-2" />
                            Bộ lọc
                        </Button>
                    </Col>
                </Row>

                {/* Bộ lọc danh mục */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Row className="mb-4">
                            <Col>
                                <Card className="p-3" style={{ backgroundColor: "#f8f9fa", border: "none" }}>
                                    <h6 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>
                                        Danh mục sản phẩm:
                                    </h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        <Badge
                                            key="all"
                                            bg={selectedCategory === "all" ? "primary" : "light"}
                                            text={selectedCategory === "all" ? "white" : "dark"}
                                            style={{
                                                cursor: "pointer",
                                                padding: "8px 16px",
                                                fontSize: "0.9rem",
                                                backgroundColor: selectedCategory === "all" ? "#84B4C8" : "#e9ecef",
                                            }}
                                            onClick={() => setSelectedCategory("all")}
                                        >
                                            Tất cả
                                        </Badge>
                                        {categories.map((category) => (
                                            <Badge
                                                key={category}
                                                bg={selectedCategory === category ? "primary" : "light"}
                                                text={selectedCategory === category ? "white" : "dark"}
                                                style={{
                                                    cursor: "pointer",
                                                    padding: "8px 16px",
                                                    fontSize: "0.9rem",
                                                    backgroundColor: selectedCategory === category ? "#84B4C8" : "#e9ecef",
                                                }}
                                                onClick={() => setSelectedCategory(category)}
                                            >
                                                {category}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </motion.div>
                )}

                {/* Thông tin kết quả */}
                <Row className="mb-4">
                    <Col>
                        <p className="text-muted">
                            Hiển thị {filteredProducts.length} sản phẩm
                            {selectedCategory !== "all" && (
                                <span>
                                    {" "}
                                    trong danh mục "<strong>{selectedCategory}</strong>"
                                </span>
                            )}
                            {searchTerm && (
                                <span>
                                    {" "}
                                    cho từ khóa "<strong>{searchTerm}</strong>"
                                </span>
                            )}
                        </p>
                    </Col>
                </Row>

                {/* Hiển thị lỗi nếu có */}
                {error && (
                    <Row className="mb-4">
                        <Col className="text-center">
                            <h4 className="text-danger">{error}</h4>
                        </Col>
                    </Row>
                )}

                {/* Lưới sản phẩm */}
                <Row>
                    {loading ? (
                        <Col className="text-center py-5">
                            <h4>Đang tải sản phẩm...</h4>
                        </Col>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                            <Col lg={4} md={6} className="mb-4" key={product.id}>
                                <Link style={{ textDecoration: "none", color: "inherit" }} to={`/products/${product.id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <Card className="product-card h-100">
                                            <div className="position-relative">
                                                <Card.Img
                                                    variant="top"
                                                    src={product.commonImage || "public/images/gallery-1.jpg"}
                                                    className="product-image"
                                                    style={{ objectFit: "cover" }}
                                                />
                                                {product.status === "InStock" && (
                                                    <Badge bg="success" className="position-absolute" style={{ top: "10px", left: "10px" }}>
                                                        Còn hàng
                                                    </Badge>
                                                )}
                                                <Button
                                                    variant="light"
                                                    className="position-absolute"
                                                    style={{
                                                        top: "10px",
                                                        right: "10px",
                                                        borderRadius: "50%",
                                                        width: "40px",
                                                        height: "40px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Heart size={16} />
                                                </Button>
                                            </div>
                                            <Card.Body className="d-flex flex-column">
                                                <div className="mb-2">
                                                    <Badge bg="light" text="dark" style={{ fontSize: "0.75rem" }}>
                                                        {product.category}
                                                    </Badge>
                                                </div>
                                                <Card.Title className="fw-bold" style={{ color: "#2c3e50" }}>
                                                    {product.name}
                                                </Card.Title>
                                                <Card.Text className="text-muted flex-grow-1" style={{ fontSize: "0.9rem" }}>
                                                    {product.description}
                                                </Card.Text>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className="fw-bold" style={{ color: "#84B4C8", fontSize: "1.3rem" }}>
                                                        {product.price?.toLocaleString("vi-VN")}đ
                                                    </span>
                                                    <div className="d-flex align-items-center">
                                                        <Star fill="#ffc107" color="#ffc107" size={16} />
                                                        <span className="ms-1 text-muted fw-bold">{product.rating || 5}</span>
                                                    </div>
                                                </div>
                                                <div className="d-grid gap-2">
                                                    <Button variant="outline-secondary" style={{ borderRadius: "25px" }}>
                                                        Xem chi tiết
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                </Link>
                            </Col>
                        ))
                    ) : (
                        <Col className="text-center py-5">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                                <h4 className="text-muted mb-3">Không tìm thấy sản phẩm nào</h4>
                                <p className="text-muted">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem thêm sản phẩm.</p>
                                <Button
                                    className="btn-primary-custom"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedCategory("all");
                                    }}
                                >
                                    Xem Tất Cả Sản Phẩm
                                </Button>
                            </motion.div>
                        </Col>
                    )}
                </Row>

                {/* Nút Xem Thêm và Phân trang */}
                {filteredProducts.length > 0 && (
                    <Row className="mt-5">
                        <Col className="text-center">
                            {showLoadMore && (
                                <Button
                                    variant="outline-primary"
                                    size="lg"
                                    style={{ borderRadius: "25px", marginBottom: "20px" }}
                                    className="load-more-button"
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                >
                                    Xem Thêm Sản Phẩm
                                </Button>
                            )}
                            {!showLoadMore && totalPages >= 1 && (
                                <Pagination className="justify-content-center">
                                    <Pagination.First
                                        onClick={() => handlePageChange(1)}
                                        disabled={pageNumber === 1 || loading}
                                    />
                                    <Pagination.Prev
                                        onClick={() => handlePageChange(pageNumber - 1)}
                                        disabled={pageNumber === 1 || loading}
                                    />
                                    {[...Array(totalPages)].map((_, index) => (
                                        <Pagination.Item
                                            key={index + 1}
                                            active={pageNumber === index + 1}
                                            onClick={() => handlePageChange(index + 1)}
                                            disabled={loading}
                                        >
                                            {index + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next
                                        onClick={() => handlePageChange(pageNumber + 1)}
                                        disabled={pageNumber === totalPages || loading}
                                    />
                                    <Pagination.Last
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={pageNumber === totalPages || loading}
                                    />
                                </Pagination>
                            )}
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default Products;
