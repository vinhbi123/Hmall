import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Nav, Image, Spinner } from "react-bootstrap";
import { getUser, editProfile } from "../../api/auth";
import { uploadMultipleFilesUser } from "../../api/upload";
import LoadingSpinner from "../../components/LoadingSpinner";

const BASE_API_URL = "https://hmstoresapi.eposh.io.vn/";

const Profile = () => {
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [tab, setTab] = useState("info");
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwError, setPwError] = useState("");
    const fileInputRef = useRef();

    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            try {
                const res = await getUser(token);
                setUser(res.data);
                setForm(res.data);
            } catch {
                setUser(null);
            }
            setLoading(false);
        }
        fetchUser();
    }, [token]);

    // Xử lý upload avatar
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
            const res = await uploadMultipleFilesUser(
                { files: [file], customeFolder: "avatars" }, // Adjusted to match API param (customeFolder instead of folder/ImageUser)
                token
            );
            const relativePath = res?.files?.[0];
            if (relativePath) {
                const imgUrl = `${BASE_API_URL}${relativePath}`;
                const updateRes = await editProfile({ ...form, avatar: imgUrl }, token);
                if (updateRes.statusCode === 200) {
                    setForm((prev) => ({ ...prev, avatar: imgUrl }));
                    setUser((prev) => ({ ...prev, avatar: imgUrl }));
                }
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) { /* empty */ }
        setAvatarUploading(false);
    };

    // Xử lý thay đổi form thông tin cá nhân
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Lưu thông tin cá nhân
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await editProfile(form, token);
            if (res.statusCode === 200) {
                setUser(form);
                setEditMode(false);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
            }
        } catch { /* empty */ }
    };

    // Xử lý đổi mật khẩu
    const handlePwChange = (e) => {
        setPwForm({ ...pwForm, [e.target.name]: e.target.value });
    };

    const handlePwSubmit = (e) => {
        e.preventDefault();
        setPwError("");
        if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
            setPwError("Vui lòng nhập đầy đủ thông tin.");
            return;
        }
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwError("Mật khẩu mới không khớp.");
            return;
        }
        // Gọi API đổi mật khẩu ở đây nếu có
        setPwSuccess(true);
        setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setPwSuccess(false), 2000);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Container style={{ paddingTop: 120, minHeight: "100vh" }}>
            <Row className="justify-content-center">
                <Col md={3} className="mb-4">
                    <Card className="shadow-sm">
                        <Card.Body className="text-center">
                            <div style={{ position: "relative", display: "inline-block" }}>
                                <Image
                                    src={
                                        form.avatar && form.avatar !== "Chưa cập nhật"
                                            ? form.avatar
                                            : "https://ui-avatars.com/api/?name=" + encodeURIComponent(form.fullName || form.userName || "User")
                                    }
                                    roundedCircle
                                    width={120}
                                    height={120}
                                    style={{ objectFit: "cover", border: "2px solid #eee" }}
                                    alt="avatar"
                                />
                                <Button
                                    variant="light"
                                    size="sm"
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        right: 0,
                                        borderRadius: "50%",
                                        border: "1px solid #ccc",
                                    }}
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={avatarUploading}
                                >
                                    {avatarUploading ? <Spinner size="sm" /> : "🖊"}
                                </Button>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                    onChange={handleAvatarChange}
                                    disabled={avatarUploading}
                                />
                            </div>
                            <div className="mt-2 fw-bold">{form.fullName || form.userName}</div>
                        </Card.Body>
                    </Card>
                    <Card className="shadow-sm mt-3">
                        <Card.Body>
                            <Nav variant="pills" className="flex-column">
                                <Nav.Item>
                                    <Nav.Link active={tab === "info"} onClick={() => setTab("info")}>
                                        Thông tin cá nhân
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link active={tab === "password"} onClick={() => setTab("password")}>
                                        Đổi mật khẩu
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={9}>
                    <Card className="shadow">
                        <Card.Body>
                            {tab === "info" && (
                                <>
                                    <h3 className="mb-4 text-center">Thông tin cá nhân</h3>
                                    {success && <Alert variant="success">Cập nhật thành công!</Alert>}
                                    <Form onSubmit={handleSave}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tên đăng nhập</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={form.userName || ""}
                                                name="userName"
                                                disabled
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Họ tên</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={form.fullName || ""}
                                                name="fullName"
                                                onChange={handleChange}
                                                disabled={!editMode}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                value={form.email || ""}
                                                name="email"
                                                onChange={handleChange}
                                                disabled={!editMode}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Số điện thoại</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={form.phoneNumber || ""}
                                                name="phoneNumber"
                                                onChange={handleChange}
                                                disabled={!editMode}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Địa chỉ</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={form.address || ""}
                                                name="address"
                                                onChange={handleChange}
                                                disabled={!editMode}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Giới tính</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={form.gender || ""}
                                                name="gender"
                                                onChange={handleChange}
                                                disabled={!editMode}
                                            />
                                        </Form.Group>
                                        {editMode ? (
                                            <div className="d-flex gap-2">
                                                <Button type="submit" variant="primary">
                                                    Lưu thay đổi
                                                </Button>
                                                <Button variant="secondary" onClick={() => { setEditMode(false); setForm(user); }}>
                                                    Hủy
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button variant="outline-primary" onClick={() => setEditMode(true)}>
                                                Chỉnh sửa
                                            </Button>
                                        )}
                                    </Form>
                                </>
                            )}
                            {tab === "password" && (
                                <>
                                    <h3 className="mb-4 text-center">Đổi mật khẩu</h3>
                                    {pwSuccess && <Alert variant="success">Đổi mật khẩu thành công!</Alert>}
                                    {pwError && <Alert variant="danger">{pwError}</Alert>}
                                    <Form onSubmit={handlePwSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Mật khẩu cũ</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="oldPassword"
                                                value={pwForm.oldPassword}
                                                onChange={handlePwChange}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Mật khẩu mới</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="newPassword"
                                                value={pwForm.newPassword}
                                                onChange={handlePwChange}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nhập lại mật khẩu mới</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={pwForm.confirmPassword}
                                                onChange={handlePwChange}
                                            />
                                        </Form.Group>
                                        <Button type="submit" variant="primary">
                                            Đổi mật khẩu
                                        </Button>
                                    </Form>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;