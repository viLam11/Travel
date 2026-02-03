# Travel Experience Platform

[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/Frontend-ReactJS-61DAFB?logo=react)](https://reactjs.org/)
[![AWS](https://img.shields.io/badge/Infrastructure-AWS-232F3E?logo=amazon-aws)](https://aws.amazon.com/)
[![TailwindCSS](https://img.shields.io/badge/Style-TailwindCSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

> A comprehensive travel booking platform handling search functionalities, hotel & venue ticketing, and secure payments via Momo & VNPay.
## Demo
https://github.com/user-attachments/assets/faf207d4-7a1f-42a8-989e-489ba6f42d03

## Features
* **Search:** Filter hotels and entertainment venues by location, price, and amenities.
* **Booking System:** End-to-end booking flow with real-time availability checks.
* **Payments:** Integrated **Momo** and **VNPay** payment gateways for secure transactions.
* **Security:** Robust authentication with OAuth2 and Role-Based Access Control (RBAC).
* **Notifications:** Automated email service for registration.
* **Cloud Infrastructure:** Scalable deployment on AWS (EC2, RDS) and S3 for storage.
---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Java Spring Boot, Spring Security (OAuth2), Hibernate, JWT |
| **Frontend** | ReactJS, TailwindCSS, TypeScript, Axios |
| **Database** | MySQL (Amazon RDS) |
| **Cloud (AWS)** | S3 (Object Storage), EC2 (Hosting), RDS (Database) |
| **Payments** | Momo API, VNPay API |
| **Email** | JavaMailSender (SMTP) |

---

## Project Architecture

```text
├── backend/           # Spring Boot Server
│   ├── src/main/java
│   ├── src/main/resources
│   └── pom.xml
├── frontend/          # ReactJS Client
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
````

## Set up 
### 1. Prerequisites
Ensure you have the following installed:
* **Java Development Kit (JDK):** Version 17 or higher.
* **Node.js:** Version 16.x or 18.x recommended.
* **Database:** MySQL 8.0+.
* **Package Manager:** npm (included with Node) or yarn.
---
### 2. Database Setup
Before running the backend, you must create the database schema.
1.  Open your MySQL Client (Workbench, DBeaver, or Terminal).
2.  Run the following command:
    ```sql
    CREATE DATABASE travello;
    ```
    *(Note: You don't need to create tables manually. Spring Boot (Hibernate) will auto-generate them on the first run).*
---
### 3. Backend Setup (Spring Boot)
#### 3.1. Configure Environment Variables
#### 3.2. Run application
```./mvnw spring-boot:run```
### 4. Frontend Setup (ReactJS)
```cd frontend
npm install
# or if using yarn
yarn install
npm start
```
