CREATE TABLE Customers (
  customer_id INT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(15),
  city VARCHAR(50),
  state VARCHAR(50),
  join_date DATE
);
CREATE TABLE categories (
  categories_id INT PRIMARY KEY,
  categories_name VARCHAR(50) NOT NULL
);
CREATE TABLE suppliers (
  supplier_id INT PRIMARY KEY,
  supplier_name VARCHAR(100),
  contact_name VARCHAR(100),
  phone VARCHAR(15),
  city VARCHAR(50)
);
CREATE TABLE products (
  product_id INT PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  categories_id INT,
  supplier_id  INT,
  price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  launch_date DATE,
  FOREIGN KEY (categories_id) 
  REFERENCES  categories(categories_id),
  FOREIGN KEY (supplier_id)
  REFERENCES suppliers(supplier_id)
);
CREATE TABLE inverntory (
  inverntory_id INT PRIMARY KEY,
  product_id INT,
  stock_quantity INT,
  reorder_level INT,
  last_updated DATE,
  FOREIGN KEY (product_id)
  REFERENCES products(product_id)
);
CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT,
  order_date DATE,
  order_status VARCHAR(30),
  shipping_city VARCHAR(50),
  total_amount DECIMAL(10,2),
  FOREIGN KEY (customer_id)
  REFERENCES Customers(customer_id)
);
CREATE TABLE order_item (
  order_item_id INT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  item_price DECIMAL(10,2),
  FOREIGN KEY (order_id) 
  REFERENCES orders(order_id),
  FOREIGN KEY (product_id)
  REFERENCES products(product_id)
);
CREATE TABLE payments(
  payment_id INT PRIMARY KEY,
  order_id INT,
  payment_date DATE,
  payment_methods VARCHAR(30),
  payment_status VARCHAR(30),
  amount DECIMAL (10,2),
  FOREIGN KEY (order_id)
  REFERENCES orders(order_id)
);
INSERT INTO Customers VALUES(1,'Ravi','Yadav','ravi@gmail.com','9870234783','Ghaziabad','UP','2025-01-10'),
(2,'Aman','Sharma','aman@gmail.com','9876903265','Delhi','Delhi','2025-02-15'),
(3,'Mukesh','Verma','mukesh@gmail.com','9876543267','Noida','UP','2025-03-01'),
(4,'Suresh','Singh','suresh@gmail.com','9876908765','Shimal','HP','2024-09-12');
INSERT INTO categories VALUES
(1,'Electronics'),
(2,'Fashion'),
(3,'Home Appliances'),
(4,'Books');
INSERT INTO suppliers VALUES
(1,'Tech Distributors','Raj Malhotra','9876567890','Delhi'),
(2,'Fashion Hub','Sneha Kapoor','9878886654','Mumbai'),
(3,'Home Needs Ltd','Arjun Das','9999786543','Banglore');
INSERT INTO products VALUES
(101,'Laptop',1,1,55000,48000,'2025-01-01'),
(102,'Smartphone',1,1,25000,21000,'2025-01-05'),
(103,'T-Shirt',2,2,800,500,'2025-02-01'),
(104,'Jeans',2,2,1500,1000,'2025-03-01'),
(105,'Microwave',3,3,7000,5500,'2025-03-01'),
(106,'SQL Book',4,3,600,350,'2025-03-10');
INSERT INTO inverntory VALUES
(1,101,20,5,'2026-06-01'),
(2,102,35,10,'2026-06-01'),
(3,103,100,20,'2026-06-01'),
(4,104,60,15,'2026-06-01'),
(5,105,15,5,'2026-06-01'),
(6,106,40,10,'2026-06-01');
INSERT INTO orders VALUES 
(1001,1,'2026-06-01','Delivered','Gaziabad',55800),
(1002,2,'2026-06-02','Pending','Delhi',25000),
(1003,3,'2026-06-03','Delivered','Gaziabad',2300),
(1004,1,'2026-06-04','Cancelled','Lucknow',7000),
(1005,4,'2026-06-05','Delivered','Noida',600);

INSERT INTO order_item VALUES
(1,1001,101,1,55000),
(2,1002,102,1,800),
(3,1003,103,1,25000),
(4,1004,104,1,800),
(5,1005,105,1,85000);
INSERT INTO payments VALUES
(1,1001,'2026-06-01','UPI','Paid',55800),
(2,1002,'2026-06-02','Card','Pending',25000),
(3,1003,'2026-06-03','Cash On Delivery','Paid',2300),
(4,1004,'2026-06-04','UPI','Refunded',7000),
(5,1005,'2026-06-05','Card','Paid',500);

-- QUERIES
SELECT * FROM Customers;
SELECT * FROM Products;
SELECT * FROM orders
WHERE order_status = 'Delivered';
SELECT * FROM orders;
SELECT product_name , price
FROM products
WHERE price > 1000 ;
SELECT first_name, last_name, city
FROM Customers
WHERE state = 'UP';
SELECT product_name , price
FROM Products
ORDER BY price DESC;
SELECT SUM(total_amount) AS 
total_sales
FROM orders
WHERE order_status = "Delivered";
SELECT COUNT(*) AS total_customers
FROM Customers;
SELECT AVG(price) AS avg_price
FROM Products;
SELECT city , COUNT(*) AS 
total_customers FROM Customers
GROUP BY city;
SELECT oi.order_id , p.product_name,
oi.quantity, oi.item_price
FROM order_item oi
JOIN products p ON oi.product_id = 
p.product_id;
SELECT p.product_name,
SUM (oi.quantity) AS total_sold
FROM order_item oi
JOIN products p ON oi.product_id = p.product_id
GROUP BY p.product_name
ORDER BY total_sold DESC;
SELECT p.product_name,
i.stock_quantity, i.reorder_level
FROM inverntory i
JOIN Products p ON i.product_id = 
p.product_id
WHERE i.stock_quantity <= 
i.reorder_level;
SELECT p.payment_id , p.order_id,
p.payment_methods , p.payment_status,
p.amount
FROM payments p
WHERE p.payment_status = 'Pending';
SELECT product_name , price,
cost_price,
      (price - cost_price) AS profit_per_unit
FROM Products;
SELECT p.product_name,
SUM (oi.quantity) AS total_sold
FROM order_item oi
JOIN products p ON oi.product_id = p.product_id
GROUP BY p.product_name
ORDER BY total_sold DESC;
SELECT FORMAT(order_date, 'yyyy-MM') AS [month], 
       SUM(total_amount) AS monthly_sales
FROM orders
WHERE order_status = 'Delivered'
GROUP BY FORMAT(order_date, 'yyyy-MM')
ORDER BY [month];
SELECT product_name , price
FROM Products
WHERE price > (SELECT AVG(price)FROM products);
SELECT 
    p.product_name,
    COUNT(oi.order_id) AS times_ordered,
    SUM(oi.quantity) AS total_quantity_sold
FROM order_item oi
JOIN products p ON oi.product_id = p.product_id
GROUP BY p.product_name
ORDER BY total_quantity_sold DESC;
SELECT product_id, SUM(quantity) AS total_sold
FROM order_item
GROUP BY product_id;

