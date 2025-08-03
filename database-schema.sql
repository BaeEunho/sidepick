-- 사이드픽 데이터베이스 스키마

-- 사용자 테이블
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    birthdate DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    political_type VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 소개팅 일정 테이블
CREATE TABLE meetings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    meeting_date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    orientation ENUM('progressive', 'conservative') NOT NULL,
    max_participants INT DEFAULT 8,
    fee INT DEFAULT 45000,
    status ENUM('open', 'full', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 주문 테이블
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    meeting_id INT NOT NULL,
    amount INT NOT NULL,
    status ENUM('pending', 'paid', 'canceled', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (meeting_id) REFERENCES meetings(id)
);

-- 결제 테이블
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_key VARCHAR(200) UNIQUE NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    method VARCHAR(50) NOT NULL,
    amount INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    approved_at DATETIME,
    raw_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 예약 테이블
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    meeting_id INT NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    participant_name VARCHAR(100) NOT NULL,
    participant_phone VARCHAR(20) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    status ENUM('confirmed', 'canceled', 'completed') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (meeting_id) REFERENCES meetings(id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 환불 테이블
CREATE TABLE refunds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_key VARCHAR(200) NOT NULL,
    cancel_reason TEXT,
    cancel_amount INT NOT NULL,
    canceled_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_key) REFERENCES payments(payment_key)
);

-- 인덱스 추가
CREATE INDEX idx_meetings_date ON meetings(meeting_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_bookings_meeting ON bookings(meeting_id);
CREATE INDEX idx_payments_status ON payments(status);